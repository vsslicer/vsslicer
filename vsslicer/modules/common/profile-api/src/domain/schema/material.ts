// SPDX-License-Identifier: AGPL-3.0-or-later
import { entitySchema, num, str } from './defs.ts';

export const materialSchema = entitySchema(
  'material',
  {
    vendor: str,
    name: str,
    type: str,
    diameter: { type: 'number', exclusiveMinimum: 0 },
    brand: str,
    color: str,
    density: num,
    cost: {
      type: 'object',
      properties: { amount: num, currency: str, per: { enum: ['kg'] } },
      required: ['amount', 'currency', 'per'],
      additionalProperties: false,
    },
    spool_weight: num,
    external_ids: {
      type: 'object',
      properties: { cura_guid: str, bambu_filament_id: str, orca_filament_id: str, prusa_name: str },
      additionalProperties: false,
    },
  },
  ['vendor', 'name', 'type', 'diameter'],
);
