// SPDX-License-Identifier: AGPL-3.0-or-later
export * from './domain/index.ts';
export {
  MAX_EXCLUDED_MATERIALS,
  MAX_REGEX_CLAUSES,
  MAX_VALUE_LENGTH,
  convertExcludeMaterials,
  convertQualityMetadata,
  curaMachineFlags,
  curaQualityDefinition,
  quoteLiteral,
} from './adapters/conditions/quality-conditions.ts';
export type {
  ConditionConversion,
  CuraMachineFlags,
  QualityConversion,
} from './adapters/conditions/quality-conditions.ts';
export {
  CURA_ARCHIVE_LIMITS,
  CuraArchiveError,
  readCuraProfileArchive,
  resolveLimits as resolveCuraArchiveLimits,
  unsafeEntryName,
  writeCuraProfileArchive,
} from './adapters/archive/curaprofile-archive.ts';
export type { CuraArchiveLimits, CuraProfileEntry } from './adapters/archive/curaprofile-archive.ts';
export {
  CURA_RESOURCE_LIMITS,
  MAX_RESOURCE_DIAGNOSTICS,
  curaResourceOf,
  readCuraResources,
  resolveResourceLimits as resolveCuraResourceLimits,
} from './adapters/definitions/read.ts';
export type {
  CuraDefinition,
  CuraResourceKind,
  CuraResourceLimits,
  CuraResources,
  CuraVariant,
} from './adapters/definitions/read.ts';
export { readCuraResourceFolder } from './adapters/definitions/folder.ts';
export { parseInstCfg } from './adapters/definitions/inst-cfg.ts';
export type { CfgSections } from './adapters/definitions/inst-cfg.ts';
export { curaCfgOf, readCuraQualities, readCuraUserChanges } from './adapters/quality/read.ts';
export type { CuraCfgKind } from './adapters/quality/read.ts';
export type { CuraFolder } from './adapters/definitions/folder.ts';
export { CURA_EXPORT_LIMITS, CURA_SETTING_VERSION, curaExporter, writeCuraUserChanges } from './adapters/export/cura/write.ts';
export { readCuraMachineInstances } from './adapters/instances/read.ts';
export type { CuraInstancesImport } from './adapters/instances/read.ts';
