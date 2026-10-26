// SPDX-License-Identifier: AGPL-3.0-or-later
import { bool, entitySchema, num, ref, str, stringMap } from './defs.ts';

const idsOrCondition = { anyOf: [{ type: 'array', items: str }, ref('condition')] };

export const printerModelSchema = entitySchema(
  'printer-model',
  {
    vendor: str,
    name: str,
    technology: { enum: ['fff'] },
    bed: {
      type: 'object',
      properties: {
        shape: { type: 'array', items: { type: 'array', items: num, minItems: 2, maxItems: 2 }, minItems: 3 },
        max_height: num,
      },
      required: ['shape', 'max_height'],
      additionalProperties: false,
    },
    toolheads: {
      type: 'object',
      properties: { count: { type: 'integer', minimum: 1 }, kinematics: str },
      required: ['count', 'kinematics'],
      additionalProperties: false,
    },
    family: str,
    assets: {
      type: 'object',
      properties: { bed_model: str, bed_texture: str, thumbnail: str },
      additionalProperties: false,
    },
    features: { type: 'object', properties: { input_shaper: bool, chamber: bool }, additionalProperties: bool },
    nozzles: idsOrCondition,
    surfaces: idsOrCondition,
    defaults: {
      type: 'object',
      properties: { process: str, materials: { type: 'array', items: str } },
      additionalProperties: false,
    },
    firmware: {
      type: 'object',
      properties: { flavor: str, gcode_templates: stringMap() },
      additionalProperties: false,
    },
  },
  ['vendor', 'name', 'technology', 'bed', 'toolheads'],
);
