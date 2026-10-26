// SPDX-License-Identifier: AGPL-3.0-or-later
export { GROUPS, KEY_PREFIXES, RESERVED_GROUPS } from './entry.ts';
export type {
  Catalogue,
  CatalogueEntry,
  CatalogueFile,
  Conversion,
  ConversionKind,
  Dialect,
  EnumMapConversion,
  EnumOption,
  Group,
  HomeEntity,
  IdentityConversion,
  KeyPrefix,
  NativeKey,
  OverrideScope,
  PercentOfConversion,
  ScaleConversion,
  SettingType,
  SignFlipConversion,
  SplitConversion,
  ValueConversion,
} from './entry.ts';
export { catalogueEntrySchema, catalogueSchema } from './schema.ts';
export { prusaCatalogue } from './prusa.ts';
export { superslicerCatalogue } from './superslicer.ts';
export type { CuraCatalogueFile, CuraMaterialKey } from './cura.ts';
