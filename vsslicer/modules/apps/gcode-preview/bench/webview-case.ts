// SPDX-License-Identifier: AGPL-3.0-or-later
// Webview memory for `<moves>` moves, in its own process: `node bench/webview-case.ts <moves>`. Chromium on SwiftShader
// (software GL, so the "GPU" copy of the data counts in its process tree); prints one JSON line. Peak = sum of RSS
// over the browser's process tree, sampled every 50 ms; a real GPU keeps the upload in video memory instead.
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';

const MB = 1024 * 1024;
const moves = Number(process.argv[2]);
if (!Number.isSafeInteger(moves) || moves < 1 || moves > 1e8)
  throw new Error('usage: node bench/webview-case.ts <moves>');

const tag = `--vss-bench=${process.pid}`;
/** Summed RSS in bytes of the process carrying `tag` and all its descendants (`ps` RSS is KiB). */
const treeRss = (): number => {
  const rows = spawnSync('ps', ['-A', '-o', 'pid=,ppid=,rss=,command='], { encoding: 'utf8', maxBuffer: 1 << 26 })
    .stdout.split('\n')
    .map((l) => /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/.exec(l))
    .filter((m) => m !== null)
    .map((m) => ({ pid: +m[1]!, ppid: +m[2]!, rss: +m[3]! * 1024, cmd: m[4]! }));
  const inTree = new Set(rows.filter((r) => r.cmd.includes(tag)).map((r) => r.pid));
  for (let grew = true; grew;) {
    grew = false;
    for (const r of rows)
      if (!inTree.has(r.pid) && inTree.has(r.ppid)) {
        inTree.add(r.pid);
        grew = true;
      }
  }
  return rows.filter((r) => inTree.has(r.pid)).reduce((n, r) => n + r.rss, 0);
};

const { outputFiles } = await build({
  entryPoints: [new URL('./webview.page.ts', import.meta.url).pathname],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
});
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', tag] });
try {
  const page = await browser.newPage({ viewport: { width: 480, height: 360 } });
  await page.setContent('<body><canvas width="480" height="360"></canvas></body>');
  await page.addScriptTag({ content: outputFiles[0]!.text });
  const baseline = treeRss();
  let peak = baseline;
  const timer = setInterval(() => (peak = Math.max(peak, treeRss())), 50);
  const { glError } = await page.evaluate(
    (n) => (globalThis as unknown as { run(n: number): Promise<{ glError: number }> }).run(n),
    moves,
  );
  clearInterval(timer);
  peak = Math.max(peak, treeRss());
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const { metrics } = await cdp.send('Performance.getMetrics');
  const heap = metrics.find((m) => m.name === 'JSHeapUsedSize')?.value ?? 0;
  if (glError !== 0) throw new Error(`GL error ${glError}`);
  console.log(
    JSON.stringify({
      moves,
      moveBytes: moves * 28,
      baselineRssMB: Math.round(baseline / MB),
      peakTreeRssMB: Math.round(peak / MB),
      afterTreeRssMB: Math.round(treeRss() / MB),
      jsHeapUsedMB: Math.round(heap / MB),
    }),
  );
} finally {
  await browser.close();
}
