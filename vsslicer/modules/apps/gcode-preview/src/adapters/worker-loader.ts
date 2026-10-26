// SPDX-License-Identifier: AGPL-3.0-or-later
// LoadPort over a worker thread: one worker per file, terminated when it answers, fails or is aborted.
import { Worker } from 'node:worker_threads';
import type { LoadPort } from '../application/preview-session.ts';
import type { WorkerJob, WorkerReply } from './worker-entry.ts';

const MB = 1024 * 1024;

const coded = (code: string, message: string, cause?: unknown) =>
  Object.assign(new Error(message, { cause }), { code });

/**
 * `script` is the worker file (dist/worker.js once built). `memoryCapBytes` caps the worker's JS heap
 * (default 1 GiB; move buffers are ArrayBuffers outside it): exceeding it rejects with code `memory-cap`.
 */
export const workerLoader =
  (script: string | URL, { memoryCapBytes = 1024 * MB }: { memoryCapBytes?: number } = {}): LoadPort =>
  (path, kind, signal, plate) =>
    new Promise((resolve, reject) => {
      signal.throwIfAborted();
      const worker = new Worker(script, {
        workerData: { path, kind, plate } satisfies WorkerJob,
        resourceLimits: { maxOldGenerationSizeMb: Math.ceil(memoryCapBytes / MB) },
      });
      // the first settle wins; the later 'exit' of a worker that answered is a no-op
      const settle = (f: () => void) => {
        signal.removeEventListener('abort', onAbort);
        void worker.terminate();
        f();
      };
      const onAbort = () => settle(() => reject(signal.reason));
      signal.addEventListener('abort', onAbort, { once: true });
      worker.once('message', (m: WorkerReply) =>
        settle(() => (m.type === 'done' ? resolve(m.loaded) : reject(coded(m.code ?? 'parse-failed', m.message)))),
      );
      worker.once('error', (e: Error & { code?: string }) =>
        settle(() =>
          reject(
            e.code === 'ERR_WORKER_OUT_OF_MEMORY'
              ? coded('memory-cap', `preview worker exceeded ${memoryCapBytes} bytes of memory`, e)
              : coded('worker-crashed', e.message, e),
          ),
        ),
      );
      worker.once('exit', (exitCode) =>
        settle(() => reject(coded('worker-crashed', `preview worker exited with code ${exitCode}`))),
      );
    });
