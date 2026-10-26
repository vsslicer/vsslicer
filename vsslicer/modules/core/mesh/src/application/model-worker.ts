// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ParseModelOptions, ParseModelResult } from './parse-model.ts';

/** A built BVH as plain buffers: post it with `transfer` as the transfer list, no `SharedArrayBuffer` needed. */
export interface SerialisedBvh {
  readonly roots: ArrayBuffer[];
  /** Uint16 below 65,536 triangles, Uint32 above (three-mesh-bvh's choice). */
  readonly indirectBuffer: Uint16Array | Uint32Array;
}

export type WorkerParseResult =
  | (Extract<ParseModelResult, { kind: 'parsed' }> & { readonly bvh: SerialisedBvh })
  | Extract<ParseModelResult, { kind: 'confirm-needed' }>;

/**
 * Port: parse a model (and build its BVH) away from the caller's thread.
 * `bytes` is handed over, not copied: its buffer is detached in the caller afterwards.
 * Rejects with a `MeshError` for a bad file, or the signal's reason when aborted.
 */
export interface ModelWorker {
  parse(bytes: Uint8Array, opts?: ParseModelOptions, signal?: AbortSignal): Promise<WorkerParseResult>;
}
