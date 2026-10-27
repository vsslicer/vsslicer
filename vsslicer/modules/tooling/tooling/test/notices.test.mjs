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
  const bin = join(import.meta.dirname, '../bin/third-party-notices.mjs');
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

test('a missing metafile prints one line and exits 1, no stack', () => {
  const d = mkdtempSync(join(tmpdir(), 'nometa-'));
  const bin = join(import.meta.dirname, '../bin/third-party-notices.mjs');
  const r = spawnSync(process.execPath, [bin], { cwd: d, encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
  assert.strictEqual(r.stderr.trim().split('\n').length, 1, r.stderr);
  assert.match(r.stderr, /^third-party-notices: /);
});

test('vendored licence text covers a package that ships none; stale, missing and wrong texts fail', async () => {
  const d = await project([dep('nolic', 'ISC', { files: {} })]);
  const pkg = (texts) => write(join(d, 'package.json'), JSON.stringify({ vsslicer: { licenceTexts: texts } }));
  assert.match(run(d).problems[0], /nolic@1\.0\.0: no LICENSE/);
  write(join(d, 'licences/nolic.txt'), 'ISC License\n\nCopyright (c) Someone\n');
  pkg({ 'nolic@1.0.0': 'licences/nolic.txt' });
  const ok = run(d);
  assert.deepStrictEqual(ok.problems, []);
  assert.match(ok.markdown, /### licences\/nolic\.txt \(vendored\)\n\n```text\nISC License/);
  pkg({ 'nolic@1.0.0': 'licences/nolic.txt', 'nolic@0.9.0': 'licences/nolic.txt' });
  assert.match(run(d).problems[0], /nolic@0\.9\.0: stale/);
  pkg({ 'nolic@1.0.0': 'licences/missing.txt' });
  assert.match(run(d).problems[0], /not found/);
  write(join(d, 'licences/mit.txt'), 'MIT License\n');
  pkg({ 'nolic@1.0.0': 'licences/mit.txt' });
  assert.match(run(d).problems[0], /does not name the licence "ISC"/);
  // substrings are not names: "isc" is inside "Disclaimer", "mit" inside "permitted"
  write(join(d, 'licences/apache.txt'), 'Apache License\nVersion 2.0\n\n7. Disclaimer of Warranty. Not permitted.\n');
  pkg({ 'nolic@1.0.0': 'licences/apache.txt' });
  assert.match(run(d).problems[0], /does not name the licence "ISC"/);
  write(
    join(d, 'licences/isc.txt'),
    'Permission to use, copy, modify, and/or distribute this software for any purpose\n',
  );
  pkg({ 'nolic@1.0.0': 'licences/isc.txt' });
  assert.deepStrictEqual(run(d).problems, []);
});

test('BSD-2 and BSD-3 texts are told apart by the no-endorsement clause', async () => {
  const bsd2 =
    'Redistribution and use of this software in source and binary forms, with or without modification, are permitted.\n';
  const bsd3 = `${bsd2}Neither the name of the copyright holder nor its contributors may be used to endorse.\n`;
  for (const [id, text, ok] of [
    ['BSD-3-Clause', bsd3, true],
    ['BSD-3-Clause', bsd2, false],
    ['BSD-2-Clause', bsd2, true],
    ['BSD-2-Clause', bsd3, false],
  ]) {
    const d = await project([dep('nolic', id, { files: {} })]);
    write(join(d, 'licences/t.txt'), text);
    write(join(d, 'package.json'), JSON.stringify({ vsslicer: { licenceTexts: { 'nolic@1.0.0': 'licences/t.txt' } } }));
    const p = run(d).problems;
    if (ok) assert.deepStrictEqual(p, [], `${id} own text`);
    else assert.match(p[0], /does not name the licence/, `${id} wrong text`);
  }
});

test('a licenceTexts path outside the module directory is refused', async () => {
  const d = await project([dep('nolic', 'ISC', { files: {} })]);
  write(join(d, '../outside-isc.txt'), 'ISC License\n');
  write(
    join(d, 'package.json'),
    JSON.stringify({ vsslicer: { licenceTexts: { 'nolic@1.0.0': '../outside-isc.txt' } } }),
  );
  assert.match(run(d).problems[0], /outside the module directory/);
});

test('bundled @vsslicer packages: PROVENANCE.md and NOTICE are copied, no licence check, nothing added without them', async () => {
  const d = await project([
    dep('@vsslicer/with', 'UNLICENSED', { files: { 'PROVENANCE.md': 'Derived from Orca\n', NOTICE: 'Orca notice\n' } }),
    dep('@vsslicer/without', 'UNLICENSED', { files: {} }),
  ]);
  const { markdown, problems } = run(d);
  assert.deepStrictEqual(problems, []);
  assert.match(
    markdown,
    /## @vsslicer\/with@1\.0\.0[\s\S]*### NOTICE[\s\S]*Orca notice[\s\S]*### PROVENANCE\.md[\s\S]*Derived from Orca/,
  );
  assert.doesNotMatch(markdown, /@vsslicer\/without/);
});

test('a bundled @vsslicer notice file over 1 MiB is refused by name', async () => {
  const d = await project([dep('@vsslicer/big', 'MIT', { files: { 'PROVENANCE.md': 'x'.repeat(1024 * 1024 + 1) } })]);
  const { markdown, problems } = run(d);
  assert.strictEqual(problems.length, 1);
  assert.match(problems[0], /@vsslicer\/big@1\.0\.0: PROVENANCE\.md is larger than 1048576 bytes/);
  assert.doesNotMatch(markdown, /xxxxxxxx/);
});
