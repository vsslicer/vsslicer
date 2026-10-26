// SPDX-License-Identifier: AGPL-3.0-or-later
// JSON Schema draft 2020-12 for the profile entities (profiles.md §6). Hand-written; test/schema.test.ts
// checks property and required keys against the TypeScript types so the two cannot drift.
export type JsonSchema = { [key: string]: unknown };

export const SCHEMA_BASE = 'https://vsslicer.dev/schema/profile/';
const DEFS = `${SCHEMA_BASE}defs.json`;
export const ref = (name: string): JsonSchema => ({ $ref: `${DEFS}#/$defs/${name}` });

const str = { type: 'string' };
const num = { type: 'number' };
const bool = { type: 'boolean' };
const stringMap = (value: JsonSchema = str): JsonSchema => ({ type: 'object', additionalProperties: value });

// Per-extruder values are keyed maps, never positional arrays (profiles.md §6 Inheritance); other keys may hold lists.
// shortcut: hand list of the per-extruder keys in the PRF-4/PRF-5 fixtures; derive it from the catalogue's
// `per_extruder` entries once PRF-14 generates the data.
const PER_EXTRUDER_KEYS = [
  'nozzle_diameter',
  'extruder_offset',
  'extruder_colour',
  'extruder_variant_list',
  'printer_extruder_id',
  'printer_extruder_variant',
  'nozzle_volume',
  'hotend_heating_rate',
  'retract_length',
  'retraction_length',
  'retract_length_toolchange',
];

export const defsSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: DEFS,
  $defs: {
    id: { type: 'string', minLength: 1 },
    condition: str,
    // Scalar, null (fall through), a keyed map (per-extruder values, or {expr}), or an array.
    settingValue: {
      anyOf: [
        { type: ['string', 'number', 'boolean', 'null'] },
        { type: 'array', items: { $ref: '#/$defs/settingValue' } },
        { type: 'object', additionalProperties: { $ref: '#/$defs/settingValue' } },
      ],
    },
    perExtruderValue: { $ref: '#/$defs/settingValue', not: { type: 'array' } },
    settings: {
      type: 'object',
      properties: Object.fromEntries(PER_EXTRUDER_KEYS.map((k) => [k, { $ref: '#/$defs/perExtruderValue' }])),
      additionalProperties: { $ref: '#/$defs/settingValue' },
    },
    override: {
      type: 'object',
      properties: {
        when: { $ref: '#/$defs/condition' },
        match: { enum: ['first', 'all'] },
        settings: { $ref: '#/$defs/settings' },
      },
      required: ['when', 'settings'],
      additionalProperties: false,
    },
    meta: {
      type: 'object',
      properties: { created: str, updated: str, base_version: str },
      additionalProperties: false,
    },
  },
};

export const baseProperties: { [key: string]: JsonSchema } = {
  id: ref('id'),
  inherits: { type: 'array', items: ref('id') },
  abstract: bool,
  when: ref('condition'),
  overrides: { type: 'array', items: ref('override') },
  settings: ref('settings'),
  renamed_from: { type: 'array', items: str },
  meta: ref('meta'),
};

/** A closed object schema: `properties` plus the shared entity fields. */
export function entitySchema(
  name: string,
  properties: { [key: string]: JsonSchema },
  required: string[],
  withBase = true,
): JsonSchema {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${SCHEMA_BASE}${name}.json`,
    title: name,
    type: 'object',
    properties: withBase ? { ...baseProperties, ...properties } : properties,
    required: ['id', ...required],
    additionalProperties: false,
  };
}

export { bool, num, str, stringMap };
