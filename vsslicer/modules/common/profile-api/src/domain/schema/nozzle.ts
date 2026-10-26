// SPDX-License-Identifier: AGPL-3.0-or-later
import { entitySchema, num, str } from './defs.ts';

export const nozzleSchema = entitySchema(
  'nozzle',
  {
    diameter: { type: 'number', exclusiveMinimum: 0 },
    flow: { enum: ['standard', 'high_flow'] },
    material: str,
    hrc: num,
    extruder_type: { enum: ['direct', 'bowden'] },
    volume_type: str,
  },
  ['diameter'],
);
