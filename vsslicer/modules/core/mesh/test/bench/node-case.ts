// SPDX-License-Identifier: AGPL-3.0-or-later
// Node worker host for one file, in its own process: `node test/bench/node-case.ts <file.stl>`. The stages run in a
// worker_threads Worker (as nodeModelWorker does); the main thread samples process RSS every 20 ms and attributes each
// sample to the stage running. Prints one JSON line.
import { readFileSync } from 'node:fs';
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';
import { runStages, type Stage, type StageResult } from './stages.ts';

const MB = 1024 * 1024;
type Msg = { mark: Stage; edge: 'start' | 'end' } | { done: StageResult } | { error: string };

if (isMainThread) {
  const path = process.argv[2];
  if (!path) throw new Error('usage: node test/bench/node-case.ts <file.stl>');
  const startMB: Partial<Record<Stage, number>> = {};
  const peakMB: Partial<Record<Stage, number>> = {};
  let current: Stage | undefined;
  const sample = () => {
    if (!current) return;
    const rss = Math.round(process.memoryUsage().rss / MB);
    peakMB[current] = Math.max(peakMB[current] ?? 0, rss);
  };
  const timer = setInterval(sample, 20);
  const worker = new Worker(new URL(import.meta.url), { workerData: path });
  const result = await new Promise<StageResult>((resolve, reject) => {
    worker.on('message', (m: Msg) => {
      if ('mark' in m) {
        sample();
        current = m.edge === 'start' ? m.mark : undefined;
        if (m.edge === 'start') startMB[m.mark] = Math.round(process.memoryUsage().rss / MB);
        sample();
        worker.postMessage('ack'); // the worker waits for this before it goes on
      } else if ('done' in m) resolve(m.done);
      else reject(new Error(m.error));
    });
    worker.once('error', reject);
  });
  clearInterval(timer);
  await worker.terminate();
  console.log(JSON.stringify({ ...result, startMB, peakMB }));
} else {
  const post = (m: Msg) => parentPort!.postMessage(m);
  try {
    const b = readFileSync(workerData as string);
    const bytes = new Uint8Array(b.buffer, b.byteOffset, b.byteLength); // a view: one copy of the file, as a transfer leaves
    const cpu = () => {
      const u = process.threadCpuUsage(); // microseconds, this worker thread only
      return (u.user + u.system) / 1000;
    };
    post({
      done: await runStages(
        bytes,
        (mark, edge) =>
          new Promise<void>((ack) => {
            parentPort!.once('message', () => ack());
            post({ mark, edge });
          }),
        cpu,
      ),
    });
  } catch (e) {
    post({ error: String((e as Error).stack ?? e) });
  }
}
