// SPDX-License-Identifier: AGPL-3.0-or-later
import { stat } from 'node:fs/promises';
import { Worker } from 'node:worker_threads';
import type { Chunk } from '@vsslicer/gcode-api';
import { ParseWorkerError } from '../application/parse-in-worker.ts';
import type { ParseInWorker } from '../application/parse-in-worker.ts';
import type { WorkerInit } from './worker-entry.ts';

type Message =
  | { type: 'chunk'; chunk: Chunk }
  | { type: 'pull' }
  | { type: 'done' }
  | { type: 'error'; name: string; message: string; code?: unknown; stack?: string };

const MB = 1024 * 1024;
// the same file runs as .ts under vitest / type stripping and as .js once built
const entry = new URL(`./worker-entry${import.meta.url.endsWith('.ts') ? '.ts' : '.js'}`, import.meta.url);

export const parseInWorker: ParseInWorker = async function* (source, opts = {}) {
  const { signal, onProgress, memoryCapBytes = 256 * MB, maxPendingChunks = 2, total: given, ...options } = opts;
  signal?.throwIfAborted();
  const isPath = typeof source === 'string';
  const total = isPath
    ? await stat(source).then(
        (s) => s.size,
        (e: Error) => {
          throw new ParseWorkerError('parse-failed', e.message, e);
        },
      )
    : given;
  const init: WorkerInit = { path: isPath ? source : undefined, options, credits: maxPendingChunks };
  const worker = new Worker(entry, {
    workerData: init,
    resourceLimits: { maxOldGenerationSizeMb: Math.max(16, Math.ceil(memoryCapBytes / MB)) },
  });
  const queue: Message[] = [];
  let failure: Error | undefined;
  let exited = false;
  let wake: (() => void) | undefined;
  const notify = (): void => wake?.();
  worker.on('message', (m: Message) => {
    queue.push(m);
    notify();
  });
  worker.on('error', (e: Error & { code?: string }) => {
    failure = e;
    notify();
  });
  worker.on('exit', () => {
    exited = true;
    notify();
  });
  const onAbort = (): void => {
    void worker.terminate();
    notify();
  };
  signal?.addEventListener('abort', onAbort);
  // shortcut: a byte-stream source blocked inside its own next() delays abort until it yields; upgrade with a race if streams can stall
  const input = isPath ? undefined : source[Symbol.asyncIterator]();
  let bytesRead = 0;
  try {
    for (;;) {
      while (queue.length === 0 && !failure && !exited && !signal?.aborted) await new Promise<void>((r) => (wake = r));
      signal?.throwIfAborted();
      const m = queue.shift();
      if (!m) {
        if (failure) {
          const oom = (failure as { code?: string }).code === 'ERR_WORKER_OUT_OF_MEMORY';
          throw new ParseWorkerError(
            oom ? 'memory-cap' : 'worker-crashed',
            oom ? `parser worker exceeded ${memoryCapBytes} bytes of memory` : failure.message,
            failure,
          );
        }
        throw new ParseWorkerError('worker-crashed', 'parser worker exited without finishing');
      }
      if (m.type === 'pull') {
        const r = await input?.next();
        if (!r || r.done) worker.postMessage({ type: 'end' });
        else {
          const bytes = new Uint8Array(r.value); // copy: the caller keeps its buffer
          worker.postMessage({ type: 'data', bytes }, [bytes.buffer]);
        }
      } else if (m.type === 'chunk') {
        bytesRead = Math.max(bytesRead, m.chunk.bytesRead);
        onProgress?.({ bytesRead: total === undefined ? bytesRead : Math.min(bytesRead, total), total });
        yield m.chunk;
        worker.postMessage({ type: 'credit' });
      } else if (m.type === 'done') {
        // the last chunk's bytesRead can be below the size; end of stream is 100%
        if (total !== undefined) onProgress?.({ bytesRead: total, total });
        return;
      } else {
        const cause = Object.assign(new Error(m.message), { name: m.name, code: m.code, stack: m.stack });
        throw new ParseWorkerError('parse-failed', m.message, cause);
      }
    }
  } finally {
    signal?.removeEventListener('abort', onAbort);
    await input?.return?.();
    await worker.terminate();
  }
};
