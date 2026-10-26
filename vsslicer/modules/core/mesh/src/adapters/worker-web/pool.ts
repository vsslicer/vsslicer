// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ModelWorker, WorkerParseResult } from '../../application/model-worker.ts';
import { DEFAULT_MAX_FILE_BYTES } from '../../application/parse-model.ts';
import type { ParseModelOptions } from '../../application/parse-model.ts';
import { FileTooLargeError, WorkerCrashedError } from '../../domain/errors.ts';
import { fromWire } from '../worker-node/errors.ts';
import type { WireError } from '../worker-node/errors.ts';
import { PoolDisposedError, PoolQueueFullError } from './errors.ts';
import { fetchBytes } from './fetch-bytes.ts';

type Reply = { ok: true; result: WorkerParseResult } | { ok: false; error: WireError };

/** The slice of a browser `Worker` the pool uses (a fake in Node tests). */
export interface PoolWorker {
  postMessage(message: unknown, transfer: ArrayBuffer[]): void;
  terminate(): void;
  onmessage: ((e: { data: Reply }) => void) | null;
  onerror: ((e: { message?: string }) => void) | null;
  onmessageerror: (() => void) | null;
}

export interface WebPoolOptions {
  /** Workers in the pool, an integer 1..16. */
  readonly size: number;
  readonly spawn: () => PoolWorker;
  /** Parses running at once, an integer 1..size. Default `size`. */
  readonly maxInFlight?: number;
  /** Requests waiting for a free worker, an integer 0..1024; the next is refused with `PoolQueueFullError`. Default 64. */
  readonly maxQueued?: number;
  /** Input larger than this is refused before it is queued. Default and ceiling: the parser's `DEFAULT_MAX_FILE_BYTES`. */
  readonly maxInputBytes?: number;
}

export const MAX_POOL_SIZE = 16;
export const MAX_QUEUED_LIMIT = 1024;
export const DEFAULT_MAX_QUEUED = 64;

export interface WebModelWorkerPool extends ModelWorker {
  /** Read a file through `fetch` (the `asWebviewUri`, D18) within the input cap, then parse it. */
  parseUrl(url: string, opts?: ParseModelOptions, signal?: AbortSignal): Promise<WorkerParseResult>;
  /** Stop every worker; waiting and running requests reject with `PoolDisposedError`. */
  dispose(): void;
}

function int(name: string, v: number | undefined, fallback: number, min: number, max: number): number {
  const n = v ?? fallback;
  if (!Number.isInteger(n) || n < min || n > max)
    throw new RangeError(`${name} must be an integer ${min}..${max}, got ${n}`);
  return n;
}

interface Job {
  bytes: Uint8Array;
  opts: ParseModelOptions;
  signal: AbortSignal | undefined;
  resolve(r: WorkerParseResult): void;
  reject(e: unknown): void;
  worker?: PoolWorker;
  onQueuedAbort?: () => void;
}

export function createWebModelWorkerPool(options: WebPoolOptions): WebModelWorkerPool {
  const size = int('size', options.size, 0, 1, MAX_POOL_SIZE);
  const maxInFlight = int('maxInFlight', options.maxInFlight, size, 1, size);
  const maxQueued = int('maxQueued', options.maxQueued, DEFAULT_MAX_QUEUED, 0, MAX_QUEUED_LIMIT);
  const maxInput = int('maxInputBytes', options.maxInputBytes, DEFAULT_MAX_FILE_BYTES, 1, DEFAULT_MAX_FILE_BYTES);
  const idle: PoolWorker[] = [];
  const running = new Set<Job>();
  const queue: Job[] = [];
  let disposed = false;
  let fetching = 0; // parseUrl downloads under way: each will need a slot, so they count against the limits

  // A job ends once: its worker is recycled on success and thrown away on any failure, so a crash costs that job only.
  function end(job: Job, ok: boolean, settle: () => void): void {
    if (!running.delete(job)) return;
    job.signal?.removeEventListener('abort', onAbortOf.get(job)!);
    if (job.worker) {
      job.worker.onmessage = job.worker.onerror = job.worker.onmessageerror = null;
      if (ok && !disposed) idle.push(job.worker);
      else job.worker.terminate();
    }
    settle();
    pump();
  }
  const onAbortOf = new WeakMap<Job, () => void>();

  function pump(): void {
    while (!disposed && running.size < maxInFlight && queue.length > 0) {
      const job = queue.shift()!;
      if (job.onQueuedAbort) job.signal?.removeEventListener('abort', job.onQueuedAbort);
      // Its signal may have aborted in the same dispatch, after this job's queued listener was already skipped.
      if (job.signal?.aborted) {
        job.reject(job.signal.reason);
        continue;
      }
      running.add(job);
      const abort = () => end(job, false, () => job.reject(job.signal!.reason));
      onAbortOf.set(job, abort);
      job.signal?.addEventListener('abort', abort);
      try {
        const w = idle.pop() ?? options.spawn();
        job.worker = w;
        w.onmessage = (e) =>
          end(job, true, () => (e.data.ok ? job.resolve(e.data.result) : job.reject(fromWire(e.data.error))));
        w.onerror = (e) => end(job, false, () => job.reject(new WorkerCrashedError(e.message ?? 'the worker crashed')));
        w.onmessageerror = () =>
          end(job, false, () => job.reject(new WorkerCrashedError('the worker sent an unreadable reply')));
        // Transfers the whole underlying buffer; parse() copied any view that does not own its buffer.
        w.postMessage({ bytes: job.bytes, opts: job.opts }, [job.bytes.buffer as ArrayBuffer]);
      } catch (e) {
        end(job, false, () =>
          job.reject(new WorkerCrashedError(`could not start the worker: ${(e as Error).message}`)),
        );
      }
    }
  }

  const pool: WebModelWorkerPool = {
    parse(bytes, opts = {}, signal) {
      return new Promise((resolve, reject) => {
        if (disposed) return reject(new PoolDisposedError());
        if (signal?.aborted) return reject(signal.reason);
        const cap = Math.min(maxInput, opts.maxFileBytes ?? maxInput);
        if (bytes.length > cap) return reject(new FileTooLargeError(bytes.length, cap));
        if (queue.length >= maxQueued && running.size >= maxInFlight) return reject(new PoolQueueFullError(maxQueued));
        const owned = bytes.byteLength === bytes.buffer.byteLength ? bytes : bytes.slice();
        const job: Job = { bytes: owned, opts, signal, resolve, reject };
        queue.push(job);
        if (signal) {
          job.onQueuedAbort = () => {
            const at = queue.indexOf(job);
            if (at >= 0) {
              queue.splice(at, 1);
              reject(signal.reason);
            }
          };
          signal.addEventListener('abort', job.onQueuedAbort, { once: true });
        }
        pump();
      });
    },
    async parseUrl(url, opts = {}, signal) {
      if (disposed) throw new PoolDisposedError();
      if (running.size + queue.length + fetching >= maxInFlight + maxQueued) throw new PoolQueueFullError(maxQueued);
      fetching++;
      let bytes: Uint8Array;
      try {
        bytes = await fetchBytes(url, Math.min(maxInput, opts.maxFileBytes ?? maxInput), signal);
      } finally {
        fetching--;
      }
      return pool.parse(bytes, opts, signal);
    },
    dispose() {
      disposed = true;
      for (const w of idle.splice(0)) w.terminate();
      for (const job of [...running]) end(job, false, () => job.reject(new PoolDisposedError()));
      for (const job of queue.splice(0)) {
        if (job.onQueuedAbort) job.signal?.removeEventListener('abort', job.onQueuedAbort);
        job.reject(new PoolDisposedError());
      }
    },
  };
  return pool;
}

/** D19: fetch the bundled worker script once, wrap it in a `blob:` URL (a webview refuses `new Worker(asWebviewUri)`). */
export async function blobWorkerSpawner(
  workerUrl: string,
  WorkerCtor: new (url: string) => PoolWorker = (globalThis as unknown as { Worker: new (url: string) => PoolWorker })
    .Worker,
): Promise<{ spawn: () => PoolWorker; revoke: () => void }> {
  const script = await fetchBytes(workerUrl, 8 * 1024 * 1024);
  const blobUrl = URL.createObjectURL(new Blob([script as unknown as ArrayBuffer], { type: 'text/javascript' }));
  return { spawn: () => new WorkerCtor(blobUrl), revoke: () => URL.revokeObjectURL(blobUrl) };
}
