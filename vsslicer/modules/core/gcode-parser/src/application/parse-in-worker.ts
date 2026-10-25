// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Chunk } from '@vsslicer/gcode-api';
import type { ParserOptions } from '../domain/parser.ts';

export interface Progress {
  bytesRead: number;
  /** File size; unknown for a byte stream unless `total` is given. */
  total: number | undefined;
}

export interface WorkerParseSettings extends ParserOptions {
  /** Abort: the worker is terminated at once and the iterator rejects with the reason. */
  signal?: AbortSignal;
  /** Called as chunks arrive, `bytesRead` never decreasing; the last call reaches `total` when it is known. */
  onProgress?: (progress: Progress) => void;
  /** Heap limit of the worker. Default 256 MiB. Exceeding it rejects with `ParseWorkerError('memory-cap')`. */
  memoryCapBytes?: number;
  /** Chunks the worker may produce ahead of the consumer. Default 2. */
  maxPendingChunks?: number;
  /** Size of a byte-stream source, for progress. */
  total?: number;
}

/** Parses a file path (read inside the worker) or a byte stream (forwarded piece by piece) off the calling thread. */
export type ParseInWorker = (
  source: string | AsyncIterable<Uint8Array>,
  opts?: WorkerParseSettings,
) => AsyncIterable<Chunk>;

export type ParseWorkerErrorCode = 'memory-cap' | 'parse-failed' | 'worker-crashed';

/** Why a worker parse failed; `cause` is the worker's error. The host thread is unaffected. */
export class ParseWorkerError extends Error {
  readonly code: ParseWorkerErrorCode;
  constructor(code: ParseWorkerErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ParseWorkerError';
    this.code = code;
  }
}
