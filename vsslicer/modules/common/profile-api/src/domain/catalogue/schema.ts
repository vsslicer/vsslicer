// SPDX-License-Identifier: AGPL-3.0-or-later
// JSON Schema draft 2020-12 for catalogue data files. Register `defsSchema` first; test/catalogue.test.ts
// checks the property keys against `CatalogueEntry`.
import { ref, SCHEMA_BASE, type JsonSchema } from '../schema/defs.ts';
import { GROUPS, KEY_PREFIXES, type Dialect, type HomeEntity, type OverrideScope, type SettingType } from './entry.ts';

const str = { type: 'string' };
const num = { type: 'number' };
const bool = { type: 'boolean' };
// `Record<Union, true>` fails to compile when a member is added to or dropped from the type.
const all = <T extends string>(members: Record<T, true>) => Object.keys(members);
const dialects = all<Dialect>({ orca: true, bambu: true, prusa: true, prusa3: true, superslicer: true, cura: true });
const homes = all<HomeEntity>({
  printer_model: true,
  nozzle: true,
  surface: true,
  feeder: true,
  material: true,
  process: true,
  plate: true,
});
const types = all<SettingType>({
  bool: true,
  int: true,
  float: true,
  percent: true,
  float_or_percent: true,
  string: true,
  gcode: true,
  enum: true,
  point: true,
  polygon: true,
});
const scopes = all<OverrideScope>({ plate: true, object: true, part: true, height_range: true });
const closed = (properties: { [key: string]: JsonSchema }, required: string[] = []): JsonSchema => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});
const kind = (k: string, properties: { [key: string]: JsonSchema } = {}, required: string[] = []) =>
  closed({ kind: { const: k }, ...properties }, ['kind', ...required]);
const stringMap = { type: 'object', additionalProperties: str };
// Every name in the pinned key lists of Orca, Bambu, Prusa 2.9/3.0, SuperSlicer and Cura matches (test/catalogue.test.ts).
// `.` for PrusaSlicer 3.0's namespaced hardware names (`printer.tool_count`).
const nativeName = { type: 'string', pattern: '^[A-Za-z0-9_][A-Za-z0-9_.-]*$' };

const valueConversion = {
  oneOf: [
    kind('identity'),
    kind('scale', { factor: num, offset: num }, ['factor']),
    kind('sign_flip'),
    kind('percent_of', { of: str }, ['of']),
    kind('enum_map', { map: stringMap, reverse: stringMap }, ['map']),
  ],
};
const split = kind(
  'split',
  {
    keys: {
      oneOf: [
        { type: 'array', items: nativeName, minItems: 2 },
        { type: 'object', additionalProperties: nativeName, minProperties: 1 },
      ],
    },
  },
  ['keys'],
);
const flags = { lossy: str, legacy: bool, pinned: { type: 'string', pattern: '^[A-Za-z0-9_.-]+@[0-9a-f]{7,40}$' } };
const nativeKey = {
  oneOf: [
    closed({ key: nativeName, conversion: valueConversion, ...flags }, ['key']),
    closed({ conversion: split, ...flags }, ['conversion']),
  ],
};

const ENTRY = `${SCHEMA_BASE}catalogue-entry.json`;
export const catalogueEntrySchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: ENTRY,
  title: 'catalogue entry',
  ...closed(
    {
      group: { enum: GROUPS.map((g) => g.id) },
      home: { enum: homes },
      type: { enum: types },
      list: bool,
      per_extruder: bool,
      unit: str,
      enum: { type: 'array', items: closed({ value: str, label: str }, ['value']), minItems: 1 },
      min: num,
      max: num,
      default: ref('settingValue'),
      label: str,
      tooltip: str,
      native: { ...closed(Object.fromEntries(dialects.map((d) => [d, nativeKey]))), minProperties: 1 },
      overridable_in: { type: 'array', items: { enum: homes }, uniqueItems: true },
      override_scope: { type: 'array', items: { enum: scopes }, uniqueItems: true },
      hidden: bool,
      native_only: { enum: dialects },
      provenance: str,
    },
    ['group', 'home', 'type', 'native'],
  ),
  allOf: [
    // Each group's keys live in one of its home entities.
    ...GROUPS.map((g) => ({
      if: { properties: { group: { const: g.id } }, required: ['group'] },
      then: { properties: { home: { enum: [...g.homes] } } },
    })),
    { if: { properties: { type: { const: 'enum' } }, required: ['type'] }, then: { required: ['enum'] } },
    { if: { not: { properties: { hidden: { const: true } }, required: ['hidden'] } }, then: { required: ['label'] } },
  ],
};

const prefixed = Object.entries(KEY_PREFIXES).map(([prefix, ds]) => [
  `^${prefix.replace('.', '\\.')}`,
  {
    allOf: [{ $ref: ENTRY }, { required: ['native_only'], properties: { native_only: { enum: [...ds] } } }],
  },
]);

/**
 * A catalogue data file: a licence notice and a map of unified key to entry. Unified keys are Orca's names
 * (uppercase kept) or a prefixed key, which must be native-only in its prefix's dialect.
 */
export const catalogueSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `${SCHEMA_BASE}catalogue.json`,
  title: 'catalogue',
  ...closed(
    {
      $schema: str,
      notice: { type: 'string', minLength: 1 },
      entries: {
        type: 'object',
        propertyNames: {
          pattern: `^(${Object.keys(KEY_PREFIXES).join('|').replaceAll('.', '\\.')})?[A-Za-z0-9_]+$`,
        },
        patternProperties: Object.fromEntries(prefixed),
        additionalProperties: { $ref: ENTRY },
      },
    },
    ['notice', 'entries'],
  ),
};
