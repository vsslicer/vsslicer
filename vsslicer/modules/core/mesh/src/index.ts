// SPDX-License-Identifier: AGPL-3.0-or-later
export {
  FileTooLargeError,
  MeshError,
  NonFiniteCoordinateError,
  ObjIndexOutOfRangeError,
  TriangleCountMismatchError,
  TruncatedMeshError,
} from './domain/errors.ts';
export type { MeshErrorCode } from './domain/errors.ts';
export type { BoundingBox, IndexedMesh, MeshPart } from './domain/indexed-mesh.ts';
export type { MeshStats } from './domain/mesh-stats.ts';
