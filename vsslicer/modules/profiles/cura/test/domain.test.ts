// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { FORMAT } from '../src/index.ts';

test('names its native format', () => {
  expect(FORMAT).toBe('cura-inst-cfg');
});
