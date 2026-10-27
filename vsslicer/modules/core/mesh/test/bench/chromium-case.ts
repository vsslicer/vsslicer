// SPDX-License-Identifier: AGPL-3.0-or-later
// Chromium host for one file, in its own process: `node test/bench/chromium-case.ts <file.stl>`. The stages run in a
// dedicated Web Worker (as the webview's pool does) on bytes fetched from a local server; Node sums the RSS of the
// browser's process tree every 50 ms (the GCP-42 method) and attributes each sample to the stage running. Needs
// Playwright: PLAYWRIGHT_MODULE (an entry file, e.g. modules/tooling/test-webview's @playwright/test) or @playwright/test.
import { execFileSync, spawnSync } from 'node:child_process';
import { createReadStream, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Stage, StageResult } from './stages.ts';

const MB = 1024 * 1024;
const path = process.argv[2];
if (!path) throw new Error('usage: node test/bench/chromium-case.ts <file.stl>');
const { chromium } = (await import(process.env['PLAYWRIGHT_MODULE'] ?? '@playwright/test')) as {
  chromium: { launch(o: { args: string[] }): Promise<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const tag = `--vss-bench=${process.pid}`;
/** Summed RSS in bytes of the process carrying `tag` and all its descendants (`ps` RSS is KiB). From GCP-42. */
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

const dir = mkdtempSync(join(tmpdir(), 'mesh-bench-'));
const esbuild = fileURLToPath(new URL('../../node_modules/.bin/esbuild', import.meta.url));
execFileSync(esbuild, [
  fileURLToPath(new URL('./browser-worker.ts', import.meta.url)),
  '--bundle',
  '--format=iife',
  `--outfile=${join(dir, 'worker.js')}`,
  '--log-level=error',
]);
const PAGE = `<script>
window.run = () => new Promise(async (resolve, reject) => {
  const buf = await (await fetch('/model.stl')).arrayBuffer();
  const w = new Worker('/worker.js');
  w.onmessage = ({ data: m }) => (m.mark ? __mark(m.mark, m.edge).then(() => w.postMessage('ack')) : m.done ? resolve(m.done) : reject(new Error(m.error)));
  w.onerror = (e) => reject(new Error(e.message));
  w.postMessage(buf, [buf]);
});
</script>`;
const server = createServer((req, res) => {
  if (req.url === '/') return void res.writeHead(200, { 'content-type': 'text/html' }).end(PAGE);
  if (req.url === '/worker.js')
    return void res.writeHead(200, { 'content-type': 'text/javascript' }).end(readFileSync(join(dir, 'worker.js')));
  if (req.url === '/model.stl') {
    res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': statSync(path).size });
    return void createReadStream(path).pipe(res);
  }
  res.writeHead(404).end();
});
await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: [tag] });
try {
  const page = await browser.newPage();
  const startMB: Partial<Record<Stage, number>> = {};
  const peakMB: Partial<Record<Stage, number>> = {};
  let current: Stage | undefined;
  const sample = () => {
    if (current) peakMB[current] = Math.max(peakMB[current] ?? 0, Math.round(treeRss() / MB));
  };
  await page.exposeFunction('__mark', (stage: Stage, edge: 'start' | 'end') => {
    sample();
    current = edge === 'start' ? stage : undefined;
    if (current) peakMB[current] = startMB[current] = Math.round(treeRss() / MB);
  });
  await page.goto(`http://127.0.0.1:${(server.address() as AddressInfo).port}/`);
  const baselineMB = Math.round(treeRss() / MB);
  const timer = setInterval(sample, 50);
  const result = (await page.evaluate('run()')) as StageResult;
  clearInterval(timer);
  console.log(JSON.stringify({ ...result, baselineMB, startMB, peakMB }));
} finally {
  await browser.close();
  server.close();
  rmSync(dir, { recursive: true, force: true });
}
