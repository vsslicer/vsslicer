// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import * as mesh from '../src/index.ts';

test('the module loads', () => {
  expect(mesh).toBeDefined();
});
