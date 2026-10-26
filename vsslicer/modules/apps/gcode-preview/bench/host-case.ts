// SPDX-License-Identifier: AGPL-3.0-or-later
// Host and worker memory for one file, in its own process: `node bench/host-case.ts <file>`. Starts the built worker
// (dist/worker.js) the way workerLoader does and samples every 20 ms until it answers; prints one JSON line.
import { Worker } from 'node:worker_threads';
import type { WorkerJob, WorkerReply } from '../src/adapters/worker-entry.ts';

const MB = 1024 * 1024;
const path = process.argv[2];
if (!path) throw new Error('usage: node bench/host-case.ts <file>');
const worker = new Worker(new URL('../dist/worker.js', import.meta.url), {
  workerData: { path, kind: 'gcode' } satisfies WorkerJob,
  resourceLimits: { maxOldGenerationSizeMb: 1024 }, // workerLoader's default cap
});
const reply = new Promise<WorkerReply>((resolve, reject) => {
  worker.once('message', resolve);
  worker.once('error', reject);
});
const peak = { rss: 0, hostHeap: 0, workerHeap: 0, workerExternal: 0, workerTotal: 0 };
let busy = false;
const sample = async () => {
  if (busy) return;
  busy = true;
  const m = process.memoryUsage();
  peak.rss = Math.max(peak.rss, m.rss);
  peak.hostHeap = Math.max(peak.hostHeap, m.heapUsed);
  try {
    const h = await worker.getHeapStatistics(); // rejects once the worker has stopped
    peak.workerHeap = Math.max(peak.workerHeap, h.used_heap_size);
    peak.workerExternal = Math.max(peak.workerExternal, h.external_memory);
    peak.workerTotal = Math.max(peak.workerTotal, h.used_heap_size + h.external_memory);
  } catch {
    /* worker gone */
  }
  busy = false;
};
const timer = setInterval(() => void sample(), 20);
const r = await reply;
clearInterval(timer);
if (r.type !== 'done') throw new Error(`worker failed: ${r.message}`);
await sample();
const { moves, extrusion, stateChanges } = r.loaded.parsed;
const bytes = (bs: ArrayBuffer[]) => bs.reduce((n, b) => n + b.byteLength, 0);
await worker.terminate();
const after = process.memoryUsage(); // host holding the received buffers, worker gone
console.log(
  JSON.stringify({
    moves: bytes(moves) / 28,
    moveBytes: bytes(moves),
    extrusionBytes: bytes(extrusion),
    stateBytes: bytes(stateChanges),
    peakProcessRssMB: Math.round(peak.rss / MB),
    peakHostHeapMB: Math.round(peak.hostHeap / MB),
    peakWorkerHeapMB: Math.round(peak.workerHeap / MB),
    peakWorkerHeapPlusExternalMB: Math.round(peak.workerTotal / MB),
    hostAfterReceiveRssMB: Math.round(after.rss / MB),
    hostAfterReceiveBuffersMB: Math.round(bytes([...moves, ...extrusion, ...stateChanges]) / MB),
  }),
);
