// SPDX-License-Identifier: AGPL-3.0-or-later
import { entitySchema } from './defs.ts';

export const feederSchema = entitySchema(
  'feeder',
  { slots: { type: 'integer', minimum: 1 }, type: { enum: ['mmu', 'ams', 'toolchanger'] } },
  ['slots'],
);
