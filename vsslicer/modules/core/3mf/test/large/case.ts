// SPDX-License-Identifier: AGPL-3.0-or-later
// One open of a large 3MF as the extension host does it, in its own process: `node test/large/case.ts <file.3mf>`.
// The main thread reads the file asynchronously, hands the bytes to readInNodeWorker and waits; meanwhile it records
// event-loop delay (perf_hooks histogram, wall time), setImmediate turns, the most main-thread CPU time spent between
// two turns, and process RSS every 20 ms. Prints one JSON line.
// Wall delay includes time the OS ran other threads (the worker, other processes): on a loaded machine it is noise.
// The CPU time between two turns is what the host thread itself spent without yielding: the blocking this card bounds.
import { readFile } from 'node:fs/promises';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import { readInNodeWorker } from '../../src/adapters/worker/nodeWorkerClient.ts';

const MB = 1024 * 1024;
const path = process.argv[2];
if (!path) throw new Error('usage: node test/large/case.ts <file.3mf>');

let peakRss = 0;
const sample = (): void => void (peakRss = Math.max(peakRss, process.memoryUsage().rss));
const timer = setInterval(sample, 20);
const cpuNow = (): number => {
  const u = process.threadCpuUsage(); // microseconds, this thread only
  return u.user + u.system;
};
let turns = 0;
let spinning = true;
let lastCpu = cpuNow();
let maxTurnCpu = 0;
const spin = (): void => {
  turns++;
  const c = cpuNow();
  maxTurnCpu = Math.max(maxTurnCpu, c - lastCpu);
  lastCpu = c;
  if (spinning) setImmediate(spin);
};

const delay = monitorEventLoopDelay({ resolution: 10 });
delay.enable();
setImmediate(spin);
const file = await readFile(path);
const bytes = new Uint8Array(file.buffer, file.byteOffset, file.byteLength); // a view: no copy on the host thread
const fileBytes = bytes.length;
const result = await readInNodeWorker(bytes);
await new Promise((r) => setImmediate(r)); // count the turn that received the result and resolved, too
spinning = false;
const triangles = result.project.objects.flatMap((o) => o.parts).reduce((n, p) => n + p.mesh.triangles.length / 3, 0);
delay.disable();
clearInterval(timer);
sample();

const ms = (ns: number): number => Math.round(ns / 1e4) / 100;
console.log(
  JSON.stringify({
    fileMB: Math.round(fileBytes / MB),
    triangles,
    maxDelayMs: ms(delay.max),
    p99DelayMs: ms(delay.percentile(99)),
    turns,
    maxTurnCpuMs: Math.round(maxTurnCpu / 10) / 100,
    peakRssMB: Math.round(peakRss / MB),
  }),
);
