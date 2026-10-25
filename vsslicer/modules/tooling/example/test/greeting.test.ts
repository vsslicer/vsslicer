// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { greet } from '../src/index.ts';

test('greet', () => expect(greet('VSSlicer')).toBe('Hello, VSSlicer!'));
