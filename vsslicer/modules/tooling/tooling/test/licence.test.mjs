// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

test('generated and downloaded directories are ignored', () => {
  const d = mkdtempSync(join(tmpdir(), 'licence-'));
  writeFileSync(join(d, 'package.json'), '{"license":"AGPL-3.0-or-later"}');
  for (const dir of ['.vscode-test', 'test-results', 'dist-test', '.cache', 'node_modules']) {
    mkdirSync(join(d, dir, 'x'), { recursive: true });
    writeFileSync(join(d, dir, 'x/a.js'), 'no header\n');
  }
  assert.deepStrictEqual(check(d), []);
  rmSync(d, { recursive: true, force: true });
});
