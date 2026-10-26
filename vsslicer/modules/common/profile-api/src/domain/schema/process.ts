// SPDX-License-Identifier: AGPL-3.0-or-later
import { entitySchema, str } from './defs.ts';

export const processSchema = entitySchema(
  'process',
  {
    name: str,
    layer_height: { type: 'number', exclusiveMinimum: 0 },
    intent: { enum: ['standard', 'quality', 'speed', 'engineering'] },
  },
  ['name', 'layer_height'],
);
