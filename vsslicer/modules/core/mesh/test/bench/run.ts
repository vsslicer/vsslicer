// SPDX-License-Identifier: AGPL-3.0-or-later
// `node --no-warnings test/bench/run.ts [--update] [--sizes 1,5,20] [--no-chromium]` (VWR-50): time and peak memory of
// parse, dedup and BVH at 1, 5 and 20 M triangles, in a Node worker and in a Chromium Web Worker, one fresh process per
// host and size. Fixtures come from scripts/generate-large-fixture.mjs into a temp dir removed afterwards. Results go
// to test/bench/budget.json, per OS (the E10 budget card reads it). Only memory is gated: without --update, a stage
// peak over its budget fails the run (exit 1). Time is recorded, never gated (rule 26: CI wall time is noise).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus, platform, release, tmpdir, totalmem } from 'node:os';
import { join } from 'node:path';
import { STAGES, type Stage } from './stages.ts';

const BUDGET = new URL('./budget.json', import.meta.url);
const MARGIN = 1.25; // budget = measured peak * margin when --update
const HOSTS = { node: './node-case.ts', chromium: './chromium-case.ts' } as const;
type Host = keyof typeof HOSTS;
type Case = { peakMB: Record<Stage, number> } & Record<string, unknown>;
interface Platform {
  machine: Record<string, string | number>;
  budgetMB: Record<string, Partial<Record<Host, Record<Stage, number>>>>;
  measured: Record<string, Partial<Record<Host, Case>>>;
}

const usage = 'usage: run.ts [--update] [--sizes 1,5,20] [--no-chromium]';
const at = process.argv.indexOf('--sizes');
const sizesArg = at < 0 ? '1,5,20' : process.argv[at + 1];
if (sizesArg === undefined || sizesArg.startsWith('--')) throw new Error(`${usage} (--sizes needs a value)`);
const sizes = sizesArg.split(',').map(Number);
// 30 M triangles is a 1.5 GB file: past that the run is a stress test, not a benchmark
if (sizes.some((s) => !Number.isFinite(s) || s <= 0 || s > 30)) throw new Error('--sizes: millions of triangles, 0-30');
const update = process.argv.includes('--update');
const hosts: Host[] = process.argv.includes('--no-chromium') ? ['node'] : ['node', 'chromium'];

const file = JSON.parse(readFileSync(BUDGET, 'utf8')) as { comment: string; platforms: Record<string, Platform> };
const os = platform();
const old = file.platforms[os]; // a budget is valid only on the OS it was measured on
if (!old && !update) throw new Error(`no budget for ${os} (run with --update on ${os})`);
const next: Platform = { machine: old?.machine ?? {}, budgetMB: { ...old?.budgetMB }, measured: { ...old?.measured } };
const dir = mkdtempSync(join(tmpdir(), 'mesh-bench-'));
const failures: string[] = [];

const child = (script: string, arg: string): Case => {
  const r = spawnSync(process.execPath, [new URL(script, import.meta.url).pathname, arg], {
    encoding: 'utf8',
    maxBuffer: 1 << 20,
    env: { ...process.env, NODE_OPTIONS: '--no-warnings' },
  });
  if (r.status !== 0) throw new Error(`${script} ${arg} failed: ${r.stderr}`);
  return JSON.parse(r.stdout) as Case;
};

try {
  for (const m of sizes) {
    const name = `${m}M`;
    const stl = join(dir, `${name}.stl`);
    const generator = new URL('../../scripts/generate-large-fixture.mjs', import.meta.url).pathname;
    execFileSync(process.execPath, [generator, String(Math.round(m * 1e6)), stl, '1']);
    for (const host of hosts) {
      const got = child(HOSTS[host], stl);
      console.log(name, host, JSON.stringify(got));
      if (update) {
        next.measured[name] = { ...next.measured[name], [host]: got };
        const b = Object.fromEntries(STAGES.map((s) => [s, Math.ceil(got.peakMB[s] * MARGIN)]));
        next.budgetMB[name] = { ...next.budgetMB[name], [host]: b as Record<Stage, number> };
        continue;
      }
      const b = old?.budgetMB[name]?.[host];
      if (!b) failures.push(`${name} ${host}: no budget (run with --update)`);
      else
        for (const s of STAGES)
          if (!(got.peakMB[s] <= b[s]))
            failures.push(`${name} ${host} ${s}: ${got.peakMB[s]} MB over budget ${b[s]} MB`);
    }
    rmSync(stl);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (update) {
  next.machine = {
    cpu: cpus()[0]?.model ?? 'unknown',
    cores: cpus().length,
    memGB: Math.round(totalmem() / 2 ** 30),
    os: `${platform()} ${release()}`,
    node: process.version,
  };
  file.platforms[os] = next;
  writeFileSync(BUDGET, JSON.stringify(file, null, 2) + '\n');
  console.log('wrote test/bench/budget.json');
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
