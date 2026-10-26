// SPDX-License-Identifier: AGPL-3.0-or-later
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';
import {
  catalogueEntrySchema,
  catalogueSchema,
  defsSchema,
  GROUPS,
  RESERVED_GROUPS,
  type Catalogue,
  type CatalogueEntry,
  type CatalogueFile,
  type Conversion,
  type ConversionKind,
} from '../src/index.ts';

const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addSchema(defsSchema).addSchema(catalogueEntrySchema);
const validEntry = ajv.compile(catalogueEntrySchema);
const validCatalogue = ajv.compile(catalogueSchema);

const entry = (over: Partial<CatalogueEntry> = {}): CatalogueEntry => ({
  group: 'layers',
  home: 'process',
  type: 'float',
  unit: 'mm',
  min: 0,
  default: 0.2,
  label: 'Layer height',
  native: { orca: { key: 'layer_height' }, prusa: { key: 'layer_height' }, cura: { key: 'layer_height' } },
  override_scope: ['object', 'height_range'],
  ...over,
});
const without = (key: keyof CatalogueEntry) => {
  const e: Partial<CatalogueEntry> = entry();
  delete e[key];
  return e;
};

test('the entry type keys match the schema', () => {
  const keys: Record<keyof CatalogueEntry, true> = {
    group: true,
    home: true,
    type: true,
    list: true,
    per_extruder: true,
    unit: true,
    enum: true,
    min: true,
    max: true,
    default: true,
    label: true,
    tooltip: true,
    native: true,
    overridable_in: true,
    override_scope: true,
    hidden: true,
    native_only: true,
    provenance: true,
  };
  expect(Object.keys(catalogueEntrySchema.properties as object).sort()).toEqual(Object.keys(keys).sort());
});

describe('groups', () => {
  test('the 14 FFF groups of E11, layers first, plate last', () => {
    expect(GROUPS.map((g) => g.id)).toEqual([
      'layers',
      'walls',
      'shells_infill',
      'support',
      'adhesion',
      'speed',
      'extrusion',
      'cooling',
      'material',
      'multi_material',
      'machine',
      'gcode',
      'special',
      'plate',
    ]);
  });
  test.each(RESERVED_GROUPS)('reserved group %s is rejected', (group) => {
    expect(validEntry({ ...entry(), group })).toBe(false);
  });
  test('a home outside its group is rejected', () => {
    expect(validEntry(entry({ home: 'material' }))).toBe(false);
    expect(validEntry(entry({ group: 'extrusion', home: 'printer_model', overridable_in: ['material'] }))).toBe(true);
  });
});

describe('entry validation', () => {
  test('a full entry validates', () => {
    expect(validEntry(entry()), JSON.stringify(validEntry.errors)).toBe(true);
  });
  test.each(['group', 'home', 'type', 'native'] as const)('an entry with no %s is rejected', (key) => {
    expect(validEntry(without(key))).toBe(false);
  });
  test('label is required unless hidden', () => {
    expect(validEntry(without('label'))).toBe(false);
    expect(validEntry({ ...without('label'), hidden: true })).toBe(true);
  });
  test('an enum entry needs its options', () => {
    expect(validEntry(entry({ type: 'enum' }))).toBe(false);
    expect(validEntry(entry({ type: 'enum', enum: [{ value: 'grid', label: 'Grid' }] }))).toBe(true);
  });
  test('unknown fields, dialects and scopes are rejected', () => {
    expect(validEntry({ ...entry(), extra: 1 })).toBe(false);
    expect(validEntry({ ...entry(), native: { kisslicer: { key: 'x' } } })).toBe(false);
    expect(validEntry({ ...entry(), override_scope: ['layer'] })).toBe(false);
  });
});

describe('conversion kinds', () => {
  const cases: Record<ConversionKind, Conversion> = {
    identity: { kind: 'identity' },
    scale: { kind: 'scale', factor: -1, offset: 90 },
    sign_flip: { kind: 'sign_flip' },
    percent_of: { kind: 'percent_of', of: 'speed_inner_wall' },
    enum_map: { kind: 'enum_map', map: { back: 'rear', shortest: 'nearest' } },
    split: { kind: 'split', keys: ['machine_nozzle_offset_x', 'machine_nozzle_offset_y'] },
  };
  const withConversion = (conversion: unknown) =>
    validEntry({
      ...entry(),
      native: {
        cura: conversion && (conversion as Conversion).kind === 'split' ? { conversion } : { key: 'k', conversion },
      },
    });
  test.each(Object.entries(cases))('%s validates', (_, c) => {
    expect(withConversion(c)).toBe(true);
  });
  test('per-surface split validates', () => {
    expect(
      withConversion({ kind: 'split', keys: { cool: 'cool_plate_temp', pei_textured: 'textured_plate_temp' } }),
    ).toBe(true);
  });
  test.each([
    ['an unknown kind', { kind: 'formula', expr: '90-x' }],
    ['scale without factor', { kind: 'scale' }],
    ['percent_of without its key', { kind: 'percent_of' }],
    ['enum_map without map', { kind: 'enum_map' }],
    ['split of one key', { kind: 'split', keys: ['a'] }],
    ['a stray parameter', { kind: 'sign_flip', factor: 2 }],
  ])('%s is rejected', (_, c) => {
    expect(withConversion(c)).toBe(false);
  });
  test('a split carries its keys, not a key', () => {
    expect(validEntry({ ...entry(), native: { cura: { key: 'k', conversion: cases.split } } })).toBe(false);
  });
});

// Every native name in the pinned key lists that is not lowercase snake case, from a read-only scan of
// OrcaSlicer@09aa0114 and BambuStudio@79df7ae `src/libslic3r/PrintConfig.cpp`, PrusaSlicer@b028299 `PrintConfig.cpp`,
// PrusaSlicer@30ef591 `Slic3r/Domain/ConfigDefs*.cpp`, `ConfigCommon.cpp` and `Biz/Config/Legacy/PrintConfig.cpp`,
// SuperSlicer@1f3d287 `PrintConfig.cpp` and Cura@5bea2f8 `fdmprinter.def.json`/`fdmextruder.def.json` (the other
// names of the 4 946 per-list names are `[a-z0-9_]+`). Notes: .reference/notes/PRF-12-catalogue-entry.md.
const UNUSUAL_NATIVE_NAMES = [
  'required_nozzle_HRC',
  'machine_max_force_Y',
  'machine_bed_mass_Y',
  'printer-profile',
  'print-profile',
  'material-profile',
  'query-printer-models',
  'query-print-filament-profiles',
  'opengl-aa',
  'opengl-version',
  'opengl-compatibility',
  'opengl-debug',
  'delete-after-load',
];

describe('native names', () => {
  test.each(UNUSUAL_NATIVE_NAMES)('%s is a valid native key and split key', (key) => {
    expect(validEntry(entry({ native: { prusa: { key } } }))).toBe(true);
    expect(validEntry(entry({ native: { prusa: { conversion: { kind: 'split', keys: [key, 'b'] } } } }))).toBe(true);
  });
  test('a name with a space, or starting with a dot or dash, is rejected', () => {
    expect(validEntry(entry({ native: { orca: { key: 'layer height' } } }))).toBe(false);
    expect(validEntry(entry({ native: { orca: { key: '.x' } } }))).toBe(false);
    expect(validEntry(entry({ native: { orca: { key: '-x' } } }))).toBe(false);
  });
  test("a dotted name is valid (PrusaSlicer 3.0's printer.tool_count)", () => {
    expect(validEntry(entry({ native: { prusa3: { key: 'printer.tool_count' } } }))).toBe(true);
  });
  test('legacy and pinned flags (PRF-16)', () => {
    const prusa3 = { key: 'host_type', legacy: true, pinned: 'PrusaSlicer@30ef591' };
    expect(validEntry(entry({ native: { prusa3 } })), JSON.stringify(validEntry.errors)).toBe(true);
    expect(validEntry(entry({ native: { prusa3: { ...prusa3, pinned: '30ef591' } } }))).toBe(false);
    expect(validEntry({ ...entry(), native: { prusa3: { ...prusa3, legacy: 'yes' } } })).toBe(false);
  });
});

describe('catalogue file', () => {
  const NOTICE = 'Labels ported from OrcaSlicer@09aa0114, AGPL-3.0-or-later.';
  const ok = (entries: Catalogue) => validCatalogue({ notice: NOTICE, entries });
  test('a notice and entries, with an optional $schema', () => {
    const file: CatalogueFile = {
      $schema: 'https://vsslicer.dev/schema/profile/catalogue.json',
      notice: NOTICE,
      entries: {},
    };
    expect(validCatalogue(file)).toBe(true);
    expect(validCatalogue({ entries: {} })).toBe(false);
    expect(validCatalogue({ notice: '', entries: {} })).toBe(false);
    expect(validCatalogue({ notice: NOTICE, entries: {}, $comment: 'x' })).toBe(false);
  });
  test('canonical and prefixed keys', () => {
    expect(ok({ layer_height: entry() })).toBe(true);
    expect(ok({ 'prusa.gcode_resolution': entry({ native_only: 'prusa3' }) })).toBe(true);
    expect(ok({ 'cura.magic_spiralize': entry({ native_only: 'cura' }) })).toBe(true);
  });
  test('Orca names keep their case as unified keys; a prefixed key writes - as _', () => {
    for (const key of ['required_nozzle_HRC', 'machine_max_force_Y', 'machine_bed_mass_Y'])
      expect(ok({ [key]: entry({ native: { orca: { key } } }) }), key).toBe(true);
    const cli = entry({ native_only: 'prusa', native: { prusa: { key: 'delete-after-load' } } });
    expect(ok({ 'prusa.delete_after_load': cli })).toBe(true);
    expect(ok({ 'prusa.delete-after-load': cli })).toBe(false);
  });
  test('a prefixed key must be native-only in its own dialect', () => {
    expect(ok({ 'prusa.gcode_resolution': entry() })).toBe(false);
    expect(ok({ 'bambu.thing': entry({ native_only: 'cura' }) })).toBe(false);
  });
  test('unknown prefixes and malformed keys are rejected', () => {
    expect(ok({ 'kiri.x': entry() })).toBe(false);
    expect(ok({ 'Layer Height': entry() })).toBe(false);
  });
  test('an invalid entry fails the catalogue', () => {
    expect(ok({ layer_height: without('group') as CatalogueEntry })).toBe(false);
  });
});
