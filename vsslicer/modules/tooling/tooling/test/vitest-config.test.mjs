// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import base from '../vitest.config.mjs';

test('shared vitest config uses the v8 coverage provider', () => {
  assert.strictEqual(base.test.coverage.provider, 'v8');
  assert.deepStrictEqual(base.test.include, ['test/**/*.test.ts']);
});
