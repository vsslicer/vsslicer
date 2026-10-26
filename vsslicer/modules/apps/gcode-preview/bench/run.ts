// SPDX-License-Identifier: AGPL-3.0-or-later
// `pnpm bench [--update] [--sizes 50,200,500] [--no-webview]`: peak host, worker and webview memory on synthetic files
// (GCP-42). Needs `pnpm build` first (the worker runs from dist/worker.js). Files go to a temp dir removed afterwards.
// Bytes only, never time. Without --update, a peak over bench/budget.json fails the run (exit 1).
import { spawnSync } from 'node:child_process';
import { createWriteStream, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { cpus, platform, release, tmpdir, totalmem } from 'node:os';
import { join } from 'node:path';
import { generate, type Profile } from './generate.ts';

const BUDGET = new URL('./budget.json', import.meta.url);
const MARGIN = 1.25; // budget = measured * margin when --update

interface Peaks {
  hostRssMB: number; // main thread + worker thread + received buffers, one process
  workerHeapPlusExternalMB: number; // the worker's own V8 heap and ArrayBuffers
  webviewTreeRssMB?: number; // Chromium process tree (SwiftShader), the baseline browser included
}
interface Budget {
  machine: Record<string, string | number>;
  budgetMB: Record<string, Peaks>;
  measured: Record<string, Peaks & { moves: number; webviewBaselineMB?: number; sumOfPeaksMB: number }>;
}

const arg = (name: string) => {
  const v = process.argv[process.argv.indexOf(name) + 1];
  if (v === undefined || v.startsWith('--'))
    throw new Error(`usage: pnpm bench [--update] [--sizes 50,200,500] [--no-webview] (${name} needs a value)`);
  return v;
};
const update = process.argv.includes('--update');
const webview = !process.argv.includes('--no-webview');
const sizes = (process.argv.includes('--sizes') ? arg('--sizes')! : '50,200,500').split(',').map(Number);
if (sizes.some((s) => !Number.isFinite(s) || s <= 0 || s > 2000)) throw new Error('--sizes: positive MB list');
const file = JSON.parse(readFileSync(BUDGET, 'utf8')) as { comment: string; platforms: Record<string, Budget> };
const os = platform();
// a budget is valid only on the OS it was measured on
const old = file.platforms[os];
if (!old && !update) throw new Error(`no budget for ${os} (run with --update on ${os})`);
const next: Budget = {
  machine: old?.machine ?? {},
  budgetMB: { ...old?.budgetMB },
  measured: { ...old?.measured },
};
const dir = mkdtempSync(join(tmpdir(), 'gcode-preview-bench-'));
const failures: string[] = [];

const child = (script: string, arg: string): Record<string, number> => {
  const r = spawnSync(process.execPath, [new URL(script, import.meta.url).pathname, arg], {
    encoding: 'utf8',
    maxBuffer: 1 << 20,
    env: { ...process.env, NODE_OPTIONS: '--no-warnings' },
  });
  if (r.status !== 0) throw new Error(`${script} ${arg} failed: ${r.stderr}`);
  return JSON.parse(r.stdout) as Record<string, number>;
};

try {
  for (const profile of ['straight', 'arc-heavy'] as Profile[]) {
    for (const mb of sizes) {
      const name = `${profile}-${mb}MB`;
      const file = join(dir, `${name}.gcode`);
      const out = createWriteStream(file);
      for (const piece of generate(profile, mb * 1e6)) if (!out.write(piece)) await once(out, 'drain');
      out.end();
      await once(out, 'finish');
      const h = child('./host-case.ts', file);
      rmSync(file);
      const w = webview ? child('./webview-case.ts', String(h.moves)) : undefined;
      const got: Peaks = {
        hostRssMB: h.peakProcessRssMB!,
        workerHeapPlusExternalMB: h.peakWorkerHeapPlusExternalMB!,
        ...(w && { webviewTreeRssMB: w.peakTreeRssMB! }),
      };
      const sum = got.hostRssMB + (got.webviewTreeRssMB ?? 0);
      console.log(name, JSON.stringify({ ...got, sumOfPeaksMB: sum }));
      if (update) {
        next.measured[name] = { ...got, moves: h.moves!, webviewBaselineMB: w?.baselineRssMB, sumOfPeaksMB: sum };
        next.budgetMB[name] = Object.fromEntries(
          Object.entries(got).map(([k, v]) => [k, Math.ceil(v * MARGIN)]),
        ) as unknown as Peaks;
        continue;
      }
      const b = old?.budgetMB[name];
      if (!b) failures.push(`${name}: no budget (run with --update)`);
      else
        for (const k of Object.keys(got) as (keyof Peaks)[])
          if (got[k]! > (b[k] ?? 0)) failures.push(`${name}: ${k} ${got[k]} MB over budget ${b[k]} MB`);
    }
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
  console.log('wrote bench/budget.json');
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
