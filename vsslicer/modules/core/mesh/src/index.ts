// SPDX-License-Identifier: AGPL-3.0-or-later
export {
  FileTooLargeError,
  MalformedMeshError,
  MeshError,
  NonFiniteCoordinateError,
  ObjIndexOutOfRangeError,
  TriangleCountMismatchError,
  TruncatedMeshError,
} from './domain/errors.ts';
export type { MeshErrorCode } from './domain/errors.ts';
export type { BoundingBox, IndexedMesh, MeshPart } from './domain/indexed-mesh.ts';
export type { MeshStats } from './domain/mesh-stats.ts';
export { fromArrays, weld } from './domain/build-mesh.ts';
export { computeStats } from './domain/stats/compute-stats.ts';
export { buildBvh, deserialiseBvh, serialiseBvh } from './adapters/bvh/bvh.ts';
export type { SerialisedBvh } from './adapters/bvh/bvh.ts';
export { isBinaryStl, parseBinaryStl } from './adapters/stl/binary-stl.ts';
export { parseAsciiStl } from './adapters/stl/ascii-stl.ts';
export { parseObj } from './adapters/obj/obj.ts';
