// SPDX-License-Identifier: AGPL-3.0-or-later
// `pnpm bench [--update] [--sizes 50,200,500]`: memory and throughput on synthetic files (GCP-18).
// Files go to a temp dir that is removed afterwards. Without --update, a result outside bench/budget.json fails the run.
import { spawnSync } from 'node:child_process';
import { createWriteStream, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { cpus, platform, release, tmpdir, totalmem } from 'node:os';
import { join } from 'node:path';
import { generate, type Profile } from './generate.ts';

const BUDGET = new URL('./budget.json', import.meta.url);
const MOVE_STRIDE = 28; // gcode-api's MOVE_STRIDE; bytes per move record, gated
const RSS_MARGIN = 1.25; // budget = measured * margin when --update
const SPEED_MARGIN = 0.6;

interface Result {
  moves: number;
  moveBytes: number;
  extrusionBytes: number;
  seconds: number;
  maxRssMB: number;
}
interface Entry {
  maxRssMB: number;
  minMBps: number;
  measured: { moves: number; bytesPerMove: number; totalBytesPerMove: number; maxRssMB: number; MBps: number };
}
interface Budget {
  machine: Record<string, string | number>;
  parser: string;
  cases: Record<string, Entry>;
}

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i < 0 ? undefined : process.argv[i + 1];
};
const update = process.argv.includes('--update');
const sizes = (arg('--sizes') ?? '50,200,500').split(',').map(Number);
const profiles: Profile[] = ['straight', 'arc-heavy'];
const old: Budget | undefined = update ? undefined : JSON.parse(readFileSync(BUDGET, 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'gcode-bench-'));
const cases: Record<string, Entry> = update ? (JSON.parse(readFileSync(BUDGET, 'utf8')) as Budget).cases : {};
const failures: string[] = [];

try {
  for (const profile of profiles) {
    for (const mb of sizes) {
      const name = `${profile}-${mb}MB`;
      const file = join(dir, `${name}.gcode`);
      const out = createWriteStream(file);
      for (const piece of generate(profile, mb * 1e6)) if (!out.write(piece)) await once(out, 'drain');
      out.end();
      await once(out, 'finish');
      const run = spawnSync(process.execPath, [new URL('./case.ts', import.meta.url).pathname, file], {
        encoding: 'utf8',
        maxBuffer: 1 << 20,
      });
      rmSync(file);
      if (run.status !== 0) throw new Error(`${name} failed: ${run.stderr}`);
      const r = JSON.parse(run.stdout) as Result;
      const m = {
        moves: r.moves,
        bytesPerMove: r.moveBytes / r.moves,
        totalBytesPerMove: (r.moveBytes + r.extrusionBytes) / r.moves,
        maxRssMB: Math.round(r.maxRssMB),
        MBps: Math.round((mb / r.seconds) * 10) / 10,
      };
      console.log(name, JSON.stringify(m));
      if (m.bytesPerMove > MOVE_STRIDE)
        failures.push(`${name}: ${m.bytesPerMove} B per move record, over ${MOVE_STRIDE}`);
      if (update) {
        cases[name] = {
          maxRssMB: Math.ceil(m.maxRssMB * RSS_MARGIN),
          minMBps: Math.floor(m.MBps * SPEED_MARGIN * 10) / 10,
          measured: m,
        };
        continue;
      }
      const b = old?.cases[name];
      if (!b) failures.push(`${name}: no budget (run with --update)`);
      else {
        if (m.maxRssMB > b.maxRssMB) failures.push(`${name}: peak RSS ${m.maxRssMB} MB over budget ${b.maxRssMB} MB`);
        if (m.MBps < b.minMBps) failures.push(`${name}: ${m.MBps} MB/s under budget ${b.minMBps} MB/s`);
      }
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (update) {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
  const budget: Budget = {
    machine: {
      cpu: cpus()[0]?.model ?? 'unknown',
      cores: cpus().length,
      memGB: Math.round(totalmem() / 2 ** 30),
      os: `${platform()} ${release()}`,
      node: process.version,
    },
    parser: `@vsslicer/gcode-parser@${pkg.version} (source)`,
    cases,
  };
  writeFileSync(BUDGET, JSON.stringify(budget, null, 2) + '\n');
  console.log('wrote bench/budget.json');
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
