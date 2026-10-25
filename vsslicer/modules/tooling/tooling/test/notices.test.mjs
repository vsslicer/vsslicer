// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { bundle } from '../bin/vsslicer-bundle.mjs';
import { isAllowed } from '../bin/spdx.mjs';
import { notices } from '../bin/third-party-notices.mjs';

const write = (file, text) => (mkdirSync(dirname(file), { recursive: true }), writeFileSync(file, text));

/** Project in pnpm layout: node_modules/<name> -> node_modules/.pnpm/<flat>@<ver>/node_modules/<name>.
 *  deps: [{name, version, license?, licenses?, files?}]. Returns the project dir with dist/extension.meta.json built. */
const project = async (deps, own = [], base = tmpdir()) => {
  const d = mkdtempSync(join(base, 'notices-'));
  const imports = [];
  for (const [i, dep] of deps.entries()) {
    const flat = dep.name.replace('/', '+');
    const real = join(d, 'node_modules/.pnpm', `${flat}@${dep.version}`, 'node_modules', dep.name);
    const { files = { LICENSE: `Licence of ${dep.name}\n` }, ...rest } = dep;
    write(join(real, 'package.json'), JSON.stringify({ main: 'lib/index.js', ...rest }));
    write(join(real, 'lib/index.js'), `module.exports = ${i};\n`);
    write(join(real, 'lib/package.json'), '{"type":"commonjs"}'); // nameless stub below the real manifest
    for (const [f, t] of Object.entries(files)) write(join(real, f), t);
    mkdirSync(dirname(join(d, 'node_modules', dep.name)), { recursive: true });
    symlinkSync(real, join(d, 'node_modules', dep.name));
    imports.push(`require('${dep.name}')`);
  }
  for (const o of own) imports.push(`require('${o}')`);
  write(join(d, 'src/e.js'), `${imports.join(';\n')};\n`);
  await bundle('./src/e.js', join(d, 'dist/extension.js'), d);
  return d;
};
const run = (d) => notices([join(d, 'dist/extension.meta.json')], d);
const dep = (name, license, extra = {}) => ({ name, version: '1.0.0', license, ...extra });

test('expressions are evaluated against the allow-list', () => {
  for (const [expr, want] of [
    ['MIT', true],
    ['(MIT)', true],
    ['MIT OR GPL-3.0', true],
    ['GPL-2.0-only OR MIT', true],
    ['(MIT AND GPL-2.0-only)', false],
    ['MIT AND (ISC OR BSD-3-Clause)', true],
    ['GPL-2.0-only', false],
    ['GPL-2.0-only WITH Classpath-exception-2.0', false],
    ['GPL-3.0-or-later WITH GCC-exception-3.1', true],
    ['GPL-2.0+', true],
    ['MIT+', true],
    ['mit or gpl-2.0-only', true],
    ['UNLICENSED', false],
    ['Apache-2.0', true],
    ['LicenseRef-Proprietary', false],
  ])
    assert.strictEqual(isAllowed(expr), want, expr);
  for (const bad of ['', 'MIT OR', '(MIT', 'MIT)', 'AND MIT', 'MIT WITH', 'SEE LICENSE IN LICENSE.txt'])
    assert.throws(() => isAllowed(bad), undefined, JSON.stringify(bad));
});

test('lists bundled packages with licence text, skipping @vsslicer/* and own sources', async () => {
  const d = await project([
    dep('zeta', 'MIT', { files: { LICENSE: 'Zeta MIT\r\n', NOTICE: 'Zeta notice\n' } }),
    dep('@scope/alpha', 'ISC'),
    dep('@vsslicer/own', 'AGPL-3.0-or-later'),
  ]);
  const { markdown, problems } = run(d);
  assert.deepStrictEqual(problems, []);
  assert.ok(markdown.indexOf('## @scope/alpha@1.0.0') < markdown.indexOf('## zeta@1.0.0'));
  assert.match(markdown, /Licence: ISC/);
  assert.match(markdown, /### LICENSE\n\n```text\nZeta MIT\n```/);
  assert.match(markdown, /### NOTICE\n\n```text\nZeta notice\n```/);
  assert.doesNotMatch(markdown, /@vsslicer\/own|src\/e\.js/);
});

test('legacy licenses array and object forms are read', async () => {
  const d = await project([
    dep('old-array', undefined, { licenses: [{ type: 'GPL-2.0-only' }, { type: 'MIT' }] }),
    dep('old-object', { type: 'BSD-3-Clause' }),
  ]);
  const { markdown, problems } = run(d);
  assert.deepStrictEqual(problems, []);
  assert.match(markdown, /Licence: GPL-2.0-only OR MIT/);
  assert.match(markdown, /Licence: BSD-3-Clause/);
});

for (const [name, spec, why] of [
  [
    'unlicensed',
    dep('bad-unlicensed', 'UNLICENSED'),
    /bad-unlicensed@1\.0\.0: licence "UNLICENSED" is not on the allow-list/,
  ],
  ['gpl-2-only', dep('bad-gpl2', 'GPL-2.0-only'), /bad-gpl2@1\.0\.0: .*"GPL-2\.0-only"/],
  ['and-expression', dep('bad-and', '(MIT AND GPL-2.0-only)'), /bad-and@1\.0\.0: .*not on the allow-list/],
  ['no licence', dep('bad-none', undefined), /bad-none@1\.0\.0: licence missing/],
  ['see licence in', dep('bad-see', 'SEE LICENSE IN LICENSE.txt'), /bad-see@1\.0\.0: /],
  ['unparsable', dep('bad-syntax', 'MIT OR'), /bad-syntax@1\.0\.0: cannot parse/],
  ['no licence file', dep('bad-nofile', 'MIT', { files: {} }), /bad-nofile@1\.0\.0: no LICENSE/],
])
  test(`fails: ${name}`, async () => {
    const { problems } = run(await project([dep('fine', 'MIT'), spec]));
    assert.strictEqual(problems.length, 1);
    assert.match(problems[0], why);
  });

test('dual licences that include an allowed branch pass', async () => {
  const d = await project([dep('dual-a', 'MIT OR GPL-3.0'), dep('dual-b', 'GPL-2.0-only OR MIT')]);
  assert.deepStrictEqual(run(d).problems, []);
});

test('no third-party packages is a valid, stable output', async () => {
  const d = await project([dep('@vsslicer/own', 'AGPL-3.0-or-later')]);
  const { markdown, problems } = run(d);
  assert.deepStrictEqual(problems, []);
  assert.match(markdown, /No third-party packages are bundled\.\n$/);
});

test('the bin writes byte-identical output on two runs and fails without writing', async () => {
  const d = await project([dep('b', 'MIT'), dep('a', 'Apache-2.0', { files: { 'LICENSE.md': 'has ``` fence\n' } })]);
  const bin = new URL('../bin/third-party-notices.mjs', import.meta.url).pathname;
  const go = () => {
    execFileSync(process.execPath, [bin, 'dist/extension.meta.json'], { cwd: d });
    return readFileSync(join(d, 'THIRD-PARTY-NOTICES.md'), 'utf8');
  };
  const first = go();
  assert.strictEqual(go(), first);
  assert.match(first, /````text\nhas ``` fence\n````/);

  const bad = await project([dep('x', 'UNLICENSED')]);
  const r = spawnSync(process.execPath, [bin, 'dist/extension.meta.json'], { cwd: bad, encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /x@1\.0\.0/);
  assert.throws(() => readFileSync(join(bad, 'THIRD-PARTY-NOTICES.md')));
});

test('works when the module lives under a symlinked directory', async () => {
  const link = join(mkdtempSync(join(tmpdir(), 'link-')), 'via');
  const target = mkdtempSync(join(tmpdir(), 'target-'));
  symlinkSync(target, link);
  const d = await project([dep('a', 'MIT')], [], link);
  const { markdown, problems } = run(d);
  assert.deepStrictEqual(problems, []);
  assert.match(markdown, /## a@1\.0\.0/);
});
