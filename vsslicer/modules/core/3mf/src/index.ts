// SPDX-License-Identifier: AGPL-3.0-or-later
export {
  CorruptZipError,
  InvalidPartEditError,
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
export { DEFAULT_MAX_ENTRY_BYTES, DEFAULT_MAX_TOTAL_BYTES, openZip } from './adapters/zip/fflateZip.ts';
export { writeZip } from './adapters/zip/zipWriter.ts';
export {
  START_PART_TYPE,
  readContentTypes,
  readPackage,
  readRelationships,
  resolveTarget,
} from './adapters/opc/opc.ts';
export type { ContentTypes } from './adapters/opc/opc.ts';
export { openPackage } from './openPackage.ts';
export { DETECTED_EXTENSIONS, SUPPORTED_EXTENSIONS, createOpenPackage } from './application/openPackage.ts';
export type { OpenedPackage, OpenPackageDeps } from './application/openPackage.ts';
export type { EditablePackage, EditPackageDeps } from './application/editPackage.ts';
export { CORE_NS, readModel } from './adapters/model/readModel.ts';
export { detectDialect } from './domain/detectDialect.ts';
export type { DialectGuess } from './domain/detectDialect.ts';
export { composeTransforms, readProject, resolveProject } from './adapters/model/resolveProject.ts';
export type { BuildItem, Component, CoreModel, CoreObject } from './domain/coreModel.ts';
export { addContentType, dropRelationshipsTo, removeContentType } from './adapters/opc/opcEdit.ts';
