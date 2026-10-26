// SPDX-License-Identifier: AGPL-3.0-or-later
import * as errors from '../../domain/errors.ts';

/** What crosses the thread boundary: structured clone drops custom error classes, so send code and fields. */
export interface WireError {
  readonly message: string;
  readonly fields: Record<string, unknown>;
  readonly meshError: boolean;
}

export function toWire(e: unknown): WireError {
  if (e instanceof errors.MeshError) return { message: e.message, fields: { ...e }, meshError: true };
  return { message: e instanceof Error ? e.message : String(e), fields: {}, meshError: false };
}

const classes: Record<string, { prototype: object }> = {
  truncated: errors.TruncatedMeshError,
  'count-mismatch': errors.TriangleCountMismatchError,
  'non-finite': errors.NonFiniteCoordinateError,
  'obj-index-out-of-range': errors.ObjIndexOutOfRangeError,
  'file-too-large': errors.FileTooLargeError,
  malformed: errors.MalformedMeshError,
  'too-many-triangles': errors.TooManyTrianglesError,
  'worker-crashed': errors.WorkerCrashedError,
};

/** Rebuild the typed error (instanceof works; the worker's stack is not carried). */
export function fromWire(w: WireError): Error {
  const proto = classes[String(w.fields['code'])]?.prototype;
  if (!w.meshError || !proto) return new errors.WorkerCrashedError(w.message);
  return Object.assign(Object.create(proto) as Error, w.fields, { message: w.message });
}
