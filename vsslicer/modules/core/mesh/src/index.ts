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
export { isBinaryStl, parseBinaryStl } from './adapters/stl/binary-stl.ts';
export { parseAsciiStl } from './adapters/stl/ascii-stl.ts';
export { parseObj } from './adapters/obj/obj.ts';
export { TooManyTrianglesError, WorkerCrashedError } from './domain/errors.ts';
export {
  DEFAULT_HARD_TRIANGLE_CAP,
  DEFAULT_MAX_FILE_BYTES,
  DEFAULT_SOFT_TRIANGLE_CAP,
  parseModelWith,
} from './application/parse-model.ts';
export { parseModel } from './adapters/parse-model.ts';
export type { MeshParsers, ParseModelOptions, ParseModelResult } from './application/parse-model.ts';
export type { ModelWorker, SerialisedBvh, WorkerParseResult } from './application/model-worker.ts';
export { nodeModelWorker } from './adapters/worker-node/node-model-worker.ts';
