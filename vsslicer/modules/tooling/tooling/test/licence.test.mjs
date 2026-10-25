// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert';
import { join } from 'node:path';
import test from 'node:test';
import { check } from '../bin/check-licence.mjs';

const fixture = (name) => check(join(import.meta.dirname, 'fixtures/licence', name));

test('passes a compliant module', () => assert.deepStrictEqual(fixture('ok'), []));
for (const [name, rule] of [
  ['no-license', 'package-license'],
  ['no-spdx', 'spdx-header'],
  ['ported-no-copyright', 'ported-copyright'],
])
  test(`fails ${name} with ${rule}`, () => {
    const problems = fixture(name);
    assert.strictEqual(problems.length, 1);
    assert.match(problems[0], new RegExp(`${name}/.*: ${rule}: `));
  });
