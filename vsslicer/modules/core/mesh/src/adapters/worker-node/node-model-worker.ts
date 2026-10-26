// SPDX-License-Identifier: AGPL-3.0-or-later
import { Worker } from 'node:worker_threads';
import type { ModelWorker, WorkerParseResult } from '../../application/model-worker.ts';
import type { ParseModelOptions } from '../../application/parse-model.ts';
import { WorkerCrashedError } from '../../domain/errors.ts';
import { fromWire } from './errors.ts';
import type { WireError } from './errors.ts';

// Source runs as .ts (Node strips types), the built package as .js.
const WORKER_URL = new URL(import.meta.url.endsWith('.ts') ? './worker.ts' : './worker.js', import.meta.url);

type Reply = { ok: true; result: WorkerParseResult } | { ok: false; error: WireError };

/** One short-lived worker per file: a crash or an abort costs that file only. */
export const nodeModelWorker: ModelWorker = {
  parse(bytes, opts: ParseModelOptions = {}, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(signal.reason);
      const worker = new Worker(WORKER_URL);
      let settled = false;
      const finish = (f: () => void) => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', onAbort);
        void worker.terminate();
        f();
      };
      const onAbort = () => finish(() => reject(signal!.reason));
      signal?.addEventListener('abort', onAbort);
      worker.once('message', (m: Reply) => finish(() => (m.ok ? resolve(m.result) : reject(fromWire(m.error)))));
      worker.once('error', (e) => finish(() => reject(new WorkerCrashedError(e.message))));
      worker.once('exit', (code) =>
        finish(() => reject(new WorkerCrashedError(`the worker stopped with code ${code}`))),
      );
      // Transfers the whole underlying buffer, so a view must own its buffer to avoid detaching neighbours.
      try {
        worker.postMessage({ bytes, opts }, [bytes.buffer as ArrayBuffer]);
      } catch (e) {
        // DataCloneError: the buffer is already detached or opts is not cloneable.
        finish(() => reject(new WorkerCrashedError(`could not send the model to the worker: ${(e as Error).message}`)));
      }
    });
  },
};
