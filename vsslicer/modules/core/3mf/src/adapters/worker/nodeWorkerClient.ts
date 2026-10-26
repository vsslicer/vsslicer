// SPDX-License-Identifier: AGPL-3.0-or-later
import { Worker } from 'node:worker_threads';
import { crashed, outOfMemory, WorkerReadError } from './protocol.ts';
import type { WorkerResponse, WorkerResult } from './protocol.ts';

export interface NodeWorkerOptions {
  /** Heap limit of the worker in MB; running past it is reported as `worker-out-of-memory`. Default 2048. */
  readonly maxOldGenerationSizeMb?: number;
  /** Worker script; defaults to the entry next to this file (`.ts` when this file is run from source, `.js` built). */
  readonly entry?: URL;
}

const defaultEntry = (): URL =>
  new URL(`./nodeWorkerEntry${import.meta.url.endsWith('.ts') ? '.ts' : '.js'}`, import.meta.url);

/**
 * Reads one 3MF in its own `worker_threads` worker, so a crash or out-of-memory kills only that file's read.
 * `bytes` is transferred: the caller's buffer is detached. The result's buffers are transferred back.
 * Rejects with `WorkerReadError` (a 3MF error code, `worker-crashed` or `worker-out-of-memory`).
 */
export function readInNodeWorker(bytes: Uint8Array, options: NodeWorkerOptions = {}): Promise<WorkerResult> {
  const mb = options.maxOldGenerationSizeMb ?? 2048;
  if (!Number.isFinite(mb) || mb <= 0) throw new RangeError('maxOldGenerationSizeMb must be a positive finite number');
  if (!(bytes.buffer instanceof ArrayBuffer)) throw new TypeError('bytes must be backed by an ArrayBuffer');
  // A view into a larger (pooled) buffer is copied, so the transfer detaches only our copy, never the caller's whole buffer.
  const owned = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength ? bytes : new Uint8Array(bytes);
  const buffer = owned.buffer as ArrayBuffer;
  return new Promise((resolve, reject) => {
    const worker = new Worker(options.entry ?? defaultEntry(), { resourceLimits: { maxOldGenerationSizeMb: mb } });
    let settled = false;
    const done = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      void worker.terminate();
      fn();
    };
    worker.on('message', (r: WorkerResponse) =>
      done(() => (r.ok ? resolve(r.result) : reject(new WorkerReadError(r.failure)))),
    );
    worker.on('error', (e: Error & { code?: string }) =>
      done(() =>
        reject(
          new WorkerReadError(e.code === 'ERR_WORKER_OUT_OF_MEMORY' ? outOfMemory : crashed(e.message), { cause: e }),
        ),
      ),
    );
    worker.on('exit', (code) => done(() => reject(new WorkerReadError(crashed(`exit code ${code}`)))));
    try {
      worker.postMessage({ bytes: owned }, [buffer]);
    } catch (e) {
      // e.g. an already detached buffer: settle through done so the worker is terminated and the error is typed
      done(() => reject(new WorkerReadError(crashed(e instanceof Error ? e.message : String(e)), { cause: e })));
    }
  });
}
