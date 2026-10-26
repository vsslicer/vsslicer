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
