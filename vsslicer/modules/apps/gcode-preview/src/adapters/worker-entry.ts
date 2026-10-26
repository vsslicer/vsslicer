// SPDX-License-Identifier: AGPL-3.0-or-later
// The preview's worker thread (bundled to dist/worker.js): reads the file, parses and plans it, and moves the result to the host.
import { createReadStream } from 'node:fs';
import { parentPort, workerData } from 'node:worker_threads';
import { deflateCodec, heatshrink11Codec, heatshrink12Codec } from '@vsslicer/gcode-bgcode';
import { loadPreview } from '../application/load-preview.ts';

export interface WorkerJob {
  path: string;
  kind: 'gcode' | 'bgcode';
}

export type WorkerReply =
  { type: 'done'; loaded: Awaited<ReturnType<typeof loadPreview>> } | { type: 'error'; message: string; code?: string };

const port = parentPort;
if (!port) throw new Error('worker-entry must run in a worker thread');
const job = workerData as WorkerJob;

// no top-level await: the bundle is CommonJS
loadPreview(job.kind, createReadStream(job.path, { highWaterMark: 1 << 20 }), {
  codecs: [deflateCodec, heatshrink11Codec, heatshrink12Codec],
}).then(
  (loaded) => {
    const { moves, extrusion, stateChanges } = loaded.parsed;
    port.postMessage({ type: 'done', loaded } satisfies WorkerReply, [...moves, ...extrusion, ...stateChanges]);
  },
  (e: unknown) => {
    const err = e instanceof Error ? e : new Error(String(e));
    const code = (err as { code?: unknown }).code;
    port.postMessage({
      type: 'error',
      message: err.message,
      code: typeof code === 'string' ? code : 'parse-failed',
    } satisfies WorkerReply);
  },
);
