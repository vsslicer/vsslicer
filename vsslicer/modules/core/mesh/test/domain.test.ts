// SPDX-License-Identifier: AGPL-3.0-or-later
// Checked by `tsc -p tsconfig.test.json`: a field added, removed or retyped fails to compile.
import { expect, expectTypeOf, test } from 'vitest';
import {
  FileTooLargeError,
  MeshError,
  NonFiniteCoordinateError,
  ObjIndexOutOfRangeError,
  TriangleCountMismatchError,
  TruncatedMeshError,
} from '../src/index.ts';
import type { BoundingBox, IndexedMesh, MeshPart, MeshStats } from '../src/index.ts';

test('IndexedMesh shape', () => {
  expectTypeOf<IndexedMesh>().toEqualTypeOf<{
    readonly positions: Float32Array;
    readonly indices: Uint32Array;
    readonly parts: readonly MeshPart[];
    readonly bounds: BoundingBox;
  }>();
});

test('MeshStats shape', () => {
  expectTypeOf<MeshStats>().toEqualTypeOf<{
    readonly triangleCount: number;
    readonly vertexCount: number;
    readonly bounds: BoundingBox;
    readonly volume: number;
    readonly openEdges: number;
    readonly nonManifoldEdges: number;
    readonly degenerateTriangles: number;
  }>();
});

test.each([
  [new TruncatedMeshError(184, 100), 'truncated', /184.*100/],
  [new TriangleCountMismatchError(12, 10), 'count-mismatch', /12.*10/],
  [new NonFiniteCoordinateError(2), 'non-finite', /Vertex 3/],
  [new ObjIndexOutOfRangeError(7, -9, 4), 'obj-index-out-of-range', /Line 7.*-9.*4/],
  [new FileTooLargeError(300, 200), 'file-too-large', /300.*200/],
])('%s has a code and a user message', (err, code, message) => {
  expect(err).toBeInstanceOf(MeshError);
  expect(err).toBeInstanceOf(Error);
  expect(err.code).toBe(code);
  expect(err.message).toMatch(message);
  expect(err.name).toBe(err.constructor.name);
});
