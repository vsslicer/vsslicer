// SPDX-License-Identifier: AGPL-3.0-or-later
import { entitySchema, str } from './defs.ts';

export const vendorSchema = entitySchema(
  'vendor',
  {
    id: { type: 'string', minLength: 1 },
    name: str,
    version: str,
    license: str,
    update: {
      type: 'object',
      properties: { url: str, channel: str },
      required: ['url', 'channel'],
      additionalProperties: false,
    },
    source: {
      type: 'object',
      properties: {
        format: { enum: ['prusa-ini', 'prusa-yaml', 'orca-json', 'bambu-json', 'cura'] },
        origin: str,
        commit: str,
      },
      required: ['format', 'origin', 'commit'],
      additionalProperties: false,
    },
    attribution: { type: 'array', items: str },
  },
  ['name', 'version', 'license'],
  false,
);
