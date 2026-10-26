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

const mod = (pkg, { provenance = false, header = 'AGPL-3.0-only' } = {}) => {
  const d = mkdtempSync(join(tmpdir(), 'licence-'));
  writeFileSync(join(d, 'package.json'), JSON.stringify(pkg));
  writeFileSync(join(d, 'a.mjs'), `// SPDX-License-Identifier: ${header}\n`);
  if (provenance) writeFileSync(join(d, 'PROVENANCE.md'), provenance === 'empty' ? '' : 'x');
  const problems = check(d);
  rmSync(d, { recursive: true, force: true });
  return problems;
};
const only = { name: '@vsslicer/profiles-data-orca', license: 'AGPL-3.0-only', files: ['PROVENANCE.md'] };

test('or-later passes', () =>
  assert.deepStrictEqual(mod({ license: 'AGPL-3.0-or-later' }, { header: 'AGPL-3.0-or-later' }), []));
test('only with PROVENANCE listed and present passes', () =>
  assert.deepStrictEqual(mod(only, { provenance: true }), []));
test('only without PROVENANCE in files fails naming the rule', () => {
  const p = mod({ ...only, files: ['dist'] }, { provenance: true });
  assert.strictEqual(p.length, 1);
  assert.match(p[0], /package-license: .*PROVENANCE\.md/);
});
test('only with PROVENANCE listed but missing fails', () => assert.strictEqual(mod(only).length, 1));
test('any other SPDX id fails', () =>
  assert.strictEqual(mod({ license: 'MIT' }, { header: 'AGPL-3.0-or-later' }).length, 1));
test('an only module needs the only header, an or-later header fails spdx-header', () => {
  const p = mod(only, { provenance: true, header: 'AGPL-3.0-or-later' });
  assert.strictEqual(p.length, 1);
  assert.match(p[0], /spdx-header: .*AGPL-3.0-only/);
});
test('an oversized package.json is refused', () => {
  const p = mod({ license: 'AGPL-3.0-or-later', pad: 'x'.repeat(1024 * 1024) });
  assert.match(p[0], /cannot read package.json/);
});
test('only with an empty PROVENANCE.md fails', () => {
  const p = mod(only, { provenance: 'empty' });
  assert.strictEqual(p.length, 1);
  assert.match(p[0], /non-empty PROVENANCE\.md/);
});
test('only for a package outside the data allowlist fails', () => {
  const p = mod({ ...only, name: 'evil' }, { provenance: true });
  assert.strictEqual(p.length, 1);
  assert.match(p[0], /allowed only for the data packages/);
});
