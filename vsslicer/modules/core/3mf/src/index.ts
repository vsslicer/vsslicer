// SPDX-License-Identifier: AGPL-3.0-or-later
export {
  CorruptZipError,
  MalformedXmlError,
  MissingProductionPartError,
  MissingRootModelError,
  SizeCapExceededError,
  ThreeMfError,
  UnsupportedRequiredExtensionError,
} from './domain/errors.ts';
export type { ThreeMfErrorCode } from './domain/errors.ts';
export type { Package, Part, Relationship } from './domain/package.ts';
export { createMesh, createProject, IDENTITY } from './domain/project/project.ts';
export type {
  Dialect,
  Instance,
  Material,
  Mesh,
  ModelObject,
  ModelPart,
  Plate,
  Project,
  Transform,
} from './domain/project/project.ts';
export type { ZipArchive, ZipEntry } from './application/zipArchive.ts';
export { DEFAULT_MAX_ENTRY_BYTES, openZip } from './adapters/zip/fflateZip.ts';
export {
  START_PART_TYPE,
  readContentTypes,
  readPackage,
  readRelationships,
  resolveTarget,
} from './adapters/opc/opc.ts';
export type { ContentTypes } from './adapters/opc/opc.ts';
