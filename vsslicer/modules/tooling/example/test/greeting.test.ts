// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { greet } from '../src/index.ts';

test('greet', () => assert.strictEqual(greet('VSSlicer'), 'Hello, VSSlicer!'));
