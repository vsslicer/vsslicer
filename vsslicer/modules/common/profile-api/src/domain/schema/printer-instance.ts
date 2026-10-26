// SPDX-License-Identifier: AGPL-3.0-or-later
import { entitySchema, str } from './defs.ts';

export const printerInstanceSchema = entitySchema(
  'printer-instance',
  {
    model: str,
    toolheads: {
      type: 'array',
      items: {
        type: 'object',
        properties: { slot: { type: 'integer', minimum: 0 }, nozzle: str },
        required: ['slot', 'nozzle'],
        additionalProperties: false,
      },
    },
    surface: str,
    feeder: {
      type: 'object',
      properties: { type: { enum: ['mmu', 'ams', 'toolchanger'] }, slots: { type: 'integer', minimum: 1 } },
      required: ['type', 'slots'],
      additionalProperties: false,
    },
    // Only a reference into SecretStorage: any credential property is rejected by additionalProperties.
    connection: {
      type: 'object',
      properties: { host_type: str, url: str, secret_ref: str },
      required: ['host_type', 'url', 'secret_ref'],
      additionalProperties: false,
    },
  },
  ['model', 'toolheads'],
);
