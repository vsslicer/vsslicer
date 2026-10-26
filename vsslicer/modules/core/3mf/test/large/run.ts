// SPDX-License-Identifier: AGPL-3.0-or-later
// `node --no-warnings test/large/run.ts [--update] [--fixture <file.3mf>]` (VWR-32): opens the 500 MB 3MF through
// readInNodeWorker in a fresh process (case.ts) and checks the host thread and the memory against budget.json.
// The fixture is test/large/generate.ts --size 500 --seed 1, kept in .cache/large-fixtures/ (git-ignored; CI caches it
// keyed by generate.ts's hash) and regenerated when missing. Gates, exit 1 on a miss:
//   - the file opened (every generated triangle came back: budget.json triangles, fixed by size, seed and generator);
//   - host-thread CPU between two event-loop turns stays under 50 ms (CPU time, so not noise: rule 26);
//   - process peak RSS stays under budget.json capMB.
// Wall event-loop delay is recorded, never gated: it counts time the OS ran other threads. --update records the
// measurements for this OS in budget.json.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus, platform, release, totalmem } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUDGET = new URL('./budget.json', import.meta.url);
const MAX_TURN_CPU_MS = 50;
const SIZE_MB = 500;
const SEED = 1;

const at = process.argv.indexOf('--fixture');
const given = at < 0 ? undefined : process.argv[at + 1];
if (at >= 0 && (!given || given.startsWith('--'))) throw new Error('usage: run.ts [--update] [--fixture <file.3mf>]');
const update = process.argv.includes('--update');
const moduleDir = fileURLToPath(new URL('../../', import.meta.url));
const fixture = resolve(given ?? `${moduleDir}.cache/large-fixtures/3mf-${SIZE_MB}mb-seed${SEED}.3mf`);
const generator = fileURLToPath(new URL('./generate.ts', import.meta.url));

if (!existsSync(fixture)) {
  mkdirSync(dirname(fixture), { recursive: true });
  execFileSync(process.execPath, [generator, '--size', `${SIZE_MB}`, '--seed', `${SEED}`, '--out', fixture]);
}

const r = spawnSync(
  process.execPath,
  ['--no-warnings', fileURLToPath(new URL('./case.ts', import.meta.url)), fixture],
  {
    encoding: 'utf8',
    maxBuffer: 1 << 20,
  },
);
if (r.status !== 0) throw new Error(`case.ts failed: ${r.stderr}`);
const got = JSON.parse(r.stdout) as { triangles: number; maxTurnCpuMs: number; peakRssMB: number } & Record<
  string,
  number
>;
console.log(JSON.stringify(got));

const file = JSON.parse(readFileSync(BUDGET, 'utf8')) as {
  capMB: number;
  triangles: number;
  platforms: Record<string, unknown>;
};
const failures: string[] = [];
if (got.triangles !== file.triangles) failures.push(`opened ${got.triangles} of ${file.triangles} triangles`);
if (!(got.maxTurnCpuMs < MAX_TURN_CPU_MS))
  failures.push(`host thread ran ${got.maxTurnCpuMs} ms of CPU without yielding (limit ${MAX_TURN_CPU_MS} ms)`);
if (!(got.peakRssMB <= file.capMB)) failures.push(`peak RSS ${got.peakRssMB} MB over the ${file.capMB} MB cap`);

if (update) {
  const machine = { cpu: cpus()[0]?.model ?? '?', cores: cpus().length, memGB: Math.round(totalmem() / 2 ** 30) };
  file.platforms[platform()] = { machine: { ...machine, os: release(), node: process.version }, measured: got };
  writeFileSync(BUDGET, `${JSON.stringify(file, null, 2)}\n`);
}
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
