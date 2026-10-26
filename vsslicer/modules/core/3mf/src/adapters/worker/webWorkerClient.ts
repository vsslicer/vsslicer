// SPDX-License-Identifier: AGPL-3.0-or-later
import { crashed, WorkerReadError } from './protocol.ts';
import type { WorkerRequest, WorkerResponse, WorkerResult } from './protocol.ts';

/** The slice of a Web `Worker` the client uses. */
export interface WebWorkerLike {
  postMessage(message: WorkerRequest, transfer: ArrayBuffer[]): void;
  addEventListener(type: 'message', listener: (event: { data: WorkerResponse }) => void): void;
  addEventListener(type: 'error' | 'messageerror', listener: (event: { message?: string }) => void): void;
  terminate(): void;
}

/**
 * Reads one 3MF in a fresh Web Worker from `create` (in a webview: `() => new Worker(url)`), then terminates it.
 * `bytes` is transferred (the caller's buffer is detached) and so are the result's buffers.
 * A webview cannot tell out-of-memory from another crash, so both are `worker-crashed`.
 * No timeout: a worker that dies without an `error` event leaves the promise pending.
 */
export function readInWebWorker(bytes: Uint8Array, create: () => WebWorkerLike): Promise<WorkerResult> {
  if (!(bytes.buffer instanceof ArrayBuffer)) throw new TypeError('bytes must be backed by an ArrayBuffer');
  // A view into a larger (pooled) buffer is copied, so the transfer detaches only our copy, never the caller's whole buffer.
  const owned = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength ? bytes : new Uint8Array(bytes);
  const buffer = owned.buffer as ArrayBuffer;
  return new Promise((resolve, reject) => {
    const worker = create();
    let settled = false;
    const done = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      worker.terminate();
      fn();
    };
    worker.addEventListener('message', (e) =>
      done(() => (e.data.ok ? resolve(e.data.result) : reject(new WorkerReadError(e.data.failure)))),
    );
    for (const type of ['error', 'messageerror'] as const) {
      worker.addEventListener(type, (e) => done(() => reject(new WorkerReadError(crashed(e.message ?? type)))));
    }
    try {
      worker.postMessage({ bytes: owned }, [buffer]);
    } catch (e) {
      // e.g. an already detached buffer: settle through done so the worker is terminated and the error is typed
      done(() => reject(new WorkerReadError(crashed(e instanceof Error ? e.message : String(e)), { cause: e })));
    }
  });
}
