// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { MODULE } from '../src/index.ts';

test('names itself', () => {
  expect(MODULE).toBe('slicer-cura');
});
