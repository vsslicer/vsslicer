// SPDX-License-Identifier: AGPL-3.0-or-later
// The preview's worker thread (bundled to dist/worker.js): reads the file, parses and plans it, and moves the result to the host.
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { parentPort, workerData } from 'node:worker_threads';
import { readSummaryFile } from '@vsslicer/gcode-parser';
import { loadPlate } from '../application/load-3mf.ts';
import { dropUnusableThumbnails, loadPreview, type Loaded } from '../application/load-preview.ts';

export interface WorkerJob {
  path: string;
  kind: 'gcode' | 'bgcode' | 'gcode.3mf';
  /** Plate of a `.gcode.3mf` (default: the first). */
  plate?: number;
}

export type WorkerReply =
  { type: 'done'; loaded: Awaited<ReturnType<typeof loadPreview>> } | { type: 'error'; message: string; code?: string };

const port = parentPort;
if (!port) throw new Error('worker-entry must run in a worker thread');
const job = workerData as WorkerJob;

const read = async (): Promise<Loaded> => {
  if (job.kind === 'gcode.3mf') return loadPlate(await readFile(job.path), job.plate);
  const loaded = await loadPreview(job.kind, createReadStream(job.path, { highWaterMark: 1 << 20 }));
  // shortcut: a .bgcode keeps its estimate in binary blocks, so only a .gcode gets the slicer's comment estimates
  if (job.kind === 'gcode') loaded.job = await readSummaryFile(job.path);
  return loaded;
};

const load = () => read().then(dropUnusableThumbnails);

// no top-level await: the bundle is CommonJS
load().then(
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
