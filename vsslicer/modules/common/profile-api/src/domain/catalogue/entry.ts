// SPDX-License-Identifier: AGPL-3.0-or-later
// The settings catalogue (E11): one entry per unified key, under Orca's key names (D9).
import type { SettingValue } from '../entities/index.ts';

/** Where a value is stored. `plate` is stored by the viewer (VWR), not by a profile entity. */
export type HomeEntity = 'printer_model' | 'nozzle' | 'surface' | 'feeder' | 'material' | 'process' | 'plate';

/** The 14 FFF groups of E11's table, with the entities each group's keys may live in. */
export const GROUPS = [
  { id: 'layers', label: 'Layers, slicing precision, resolution', homes: ['process'] },
  { id: 'walls', label: 'Walls, perimeters, seams, bridging, overhangs', homes: ['process'] },
  { id: 'shells_infill', label: 'Top/bottom shells, infill, ironing', homes: ['process'] },
  { id: 'support', label: 'Supports and raft', homes: ['process'] },
  { id: 'adhesion', label: 'Skirt, brim, adhesion', homes: ['process'] },
  { id: 'speed', label: 'Speed, acceleration, jerk', homes: ['process'] },
  // Retraction keys live in the printer, with a material override.
  { id: 'extrusion', label: 'Extrusion width, flow, retraction, travel', homes: ['process', 'printer_model'] },
  { id: 'cooling', label: 'Cooling', homes: ['material'] },
  { id: 'material', label: 'Filament material, temperatures, overrides, pressure advance', homes: ['material'] },
  {
    id: 'multi_material',
    label: 'Multi-material, wipe or prime tower, tool change',
    homes: ['process', 'material', 'printer_model'],
  },
  // PrusaSlicer 3.0 hardware features of the bed sheet and the filament feeder live in those entities.
  {
    id: 'machine',
    label: 'Printer definition and machine limits',
    homes: ['printer_model', 'nozzle', 'surface', 'feeder'],
  },
  {
    id: 'gcode',
    label: 'Custom G-code, output options, post-processing',
    homes: ['printer_model', 'material', 'process'],
  },
  { id: 'special', label: 'Special modes, fuzzy skin, mesh fixes, experimental', homes: ['process'] },
  { id: 'plate', label: 'Plate-level settings', homes: ['plate'] },
] as const satisfies readonly { id: string; label: string; homes: readonly HomeEntity[] }[];

export type Group = (typeof GROUPS)[number]['id'];

/** Reserved for E58 and rejected until then. */
export const RESERVED_GROUPS = ['sla', 'milling'] as const;

/** A native dialect. `prusa` is the 2.9 INI, `prusa3` the 3.0 YAML. */
export type Dialect = 'orca' | 'bambu' | 'prusa' | 'prusa3' | 'superslicer' | 'cura';

/** Keys with no Orca equivalent carry their dialect's prefix (`prusa.foo`) and are `native_only` in one of these dialects. */
export const KEY_PREFIXES = {
  'bambu.': ['bambu'],
  'prusa.': ['prusa', 'prusa3'],
  'superslicer.': ['superslicer'],
  'cura.': ['cura'],
} as const satisfies { [prefix: string]: readonly Dialect[] };

export type KeyPrefix = keyof typeof KEY_PREFIXES;

/** Value kinds. Orca's plural types (`coFloats`) are the scalar kind plus `per_extruder`; other vectors set `list`. */
export type SettingType =
  'bool' | 'int' | 'float' | 'percent' | 'float_or_percent' | 'string' | 'gcode' | 'enum' | 'point' | 'polygon';

export type OverrideScope = 'plate' | 'object' | 'part' | 'height_range';

export interface EnumOption {
  value: string;
  label?: string;
}

// Conversions read native -> unified; the reverse is implied (PRF-13). Absent means identity.
export interface IdentityConversion {
  kind: 'identity';
}
/** unified = native * factor + offset. `factor: -1, offset: 90` is the 90-x support angle; `factor: 0.01` Cura's flow percent. */
export interface ScaleConversion {
  kind: 'scale';
  factor: number;
  offset?: number;
}
/** unified = -native (Cura's negative `xy_offset_layer_0` as elephant-foot compensation). */
export interface SignFlipConversion {
  kind: 'sign_flip';
}
/** The native value may be a percentage of another unified key (Prusa `external_perimeter_speed = 50%`). */
export interface PercentOfConversion {
  kind: 'percent_of';
  of: string;
}
/** `map`: native value -> unified value. `reverse` gives unified -> native where `map` is not one-to-one. */
export interface EnumMapConversion {
  kind: 'enum_map';
  map: { [native: string]: string };
  reverse?: { [unified: string]: string };
}
/**
 * One unified value and several native keys. A list: element i of the unified value is native key i
 * (Cura `machine_nozzle_offset_x`/`_y`). A map: one native key per surface type, the unified value
 * held in surface overrides (Orca's per-plate bed temperatures).
 */
export interface SplitConversion {
  kind: 'split';
  keys: string[] | { [surfaceType: string]: string };
}

export type ValueConversion =
  IdentityConversion | ScaleConversion | SignFlipConversion | PercentOfConversion | EnumMapConversion;
export type Conversion = ValueConversion | SplitConversion;
export type ConversionKind = Conversion['kind'];

/**
 * Flags on one dialect's name. `legacy`: the dialect only reads it from old configs (Prusa 3.0's
 * `Biz/Config/Legacy/PrintConfig.cpp`). `pinned`: the upstream commit the name was checked against
 * (`PrusaSlicer@30ef591`), so a pinned test fails when upstream renames it.
 */
interface NativeKeyFlags {
  lossy?: string;
  legacy?: boolean;
  pinned?: string;
}

/**
 * How one dialect names a setting. `lossy` says what the round trip loses. Native names are upstream's verbatim:
 * Orca has `machine_max_force_Y`, Prusa 2.9 CLI keys `delete-after-load`.
 */
export type NativeKey = ({ key: string; conversion?: ValueConversion } | { conversion: SplitConversion }) &
  NativeKeyFlags;

export interface CatalogueEntry {
  group: Group;
  home: HomeEntity;
  type: SettingType;
  /** The value is a list of `type` (not per extruder): `polygon` + `list` is Cura's `polygons`, `enum` + `list` Orca's `coEnums`. */
  list?: boolean;
  /** Stored as a keyed map (`{"0": .., "1": ..}`), one value per extruder. */
  per_extruder?: boolean;
  /** mm, mm/s, °C, %, s, ... */
  unit?: string;
  enum?: EnumOption[];
  min?: number;
  max?: number;
  default?: SettingValue;
  /** Required unless `hidden`. */
  label?: string;
  tooltip?: string;
  native: { [D in Dialect]?: NativeKey };
  /** Other entities that may override it, as the native slicer allows (a material overriding retraction). */
  overridable_in?: HomeEntity[];
  /** Where in a project it may be overridden; empty means nowhere (global only). Every generated entry has it (PRF-18). */
  override_scope?: OverrideScope[];
  /** On no GUI page of the native slicer. */
  hidden?: boolean;
  /** The dialect that owns a prefixed key (its prefix's dialect); other dialects may still name it (a `prusa.` key SuperSlicer shares). */
  native_only?: Dialect;
  /** Source of the label and tooltip text and of the metadata (`OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:1134`, D2). */
  provenance?: string;
}

/**
 * Unified key to entry. Unified keys are Orca's names (uppercase kept: `required_nozzle_HRC`); a prefixed key
 * writes a native `-` as `_` (`prusa.delete_after_load`).
 */
export type Catalogue = { [key: string]: CatalogueEntry };

/** A catalogue data file. `notice` carries the licence of the ported text (AGPL-3.0 for Orca, PRF-14). */
export interface CatalogueFile {
  $schema?: string;
  notice: string;
  entries: Catalogue;
}
