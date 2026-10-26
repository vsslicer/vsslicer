// SPDX-License-Identifier: AGPL-3.0-or-later
import { entitySchema, str } from './defs.ts';

export const surfaceSchema = entitySchema('surface', { type: str }, ['type']);
