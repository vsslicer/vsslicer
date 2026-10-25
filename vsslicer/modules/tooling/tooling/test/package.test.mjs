// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert';
import { randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { checkManifest, pack } from '../bin/vsslicer-package.mjs';

const write = (file, text) => (mkdirSync(dirname(file), { recursive: true }), writeFileSync(file, text));
const strict = '**\n!dist/*.js\n!media/**\n!LICENSE\n!THIRD-PARTY-NOTICES.md\n!README.md\n!CHANGELOG.md\n';

/** A fake extension module built in tmp; `extra` maps files to add, null removes a default file. */
const extension = (pkg = {}, extra = {}) => {
  const d = mkdtempSync(join(tmpdir(), 'package-'));
  const files = {
    'package.json': JSON.stringify({
      name: '@vsslicer/fake',
      version: '1.2.3',
      publisher: 'vsslicer',
      license: 'AGPL-3.0-or-later',
      repository: 'https://github.com/<owner>/VSSlicer/tree/fake@1.2.3/vsslicer/modules/fake',
      engines: { vscode: '^1.100.0' },
      main: 'dist/extension.js',
      activationEvents: [],
      icon: 'media/icon.png',
      vsslicer: { sizeBudgetKB: 50 },
      ...pkg,
    }),
    '.vscodeignore': strict,
    'dist/extension.js': 'exports.activate = () => {};\n',
    'dist/extension.js.map': '{}',
    'dist/extension.meta.json': '{}',
    'media/icon.png': 'png',
    'src/x.ts': 'export {};\n',
    LICENSE: 'licence\n',
    'THIRD-PARTY-NOTICES.md': 'none\n',
    'README.md': '# Fake\n',
    'CHANGELOG.md': '# Changelog\n',
    ...extra,
  };
  for (const [f, t] of Object.entries(files)) if (t !== null) write(join(d, f), t);
  return d;
};
const run = async (d) => {
  try {
    return await pack(d);
  } finally {
    // the VSIX stays on failure for inspection; tests have no use for it
    rmSync(d, { recursive: true, force: true });
  }
};

test('a clean extension packs with exactly the expected content', async () => {
  const { problems, kb, file } = await run(extension());
  assert.deepStrictEqual(problems, []);
  assert.ok(kb > 0 && file.endsWith('fake-1.2.3.vsix'));
});

test('maps, meta files and sources that slip into the VSIX are reported', async () => {
  const { problems } = await run(extension({}, { '.vscodeignore': '' }));
  for (const f of ['dist/extension.js.map', 'dist/extension.meta.json', 'src/x.ts'])
    assert.ok(problems.includes(`content: unexpected extension/${f}`), f);
});

test('a missing shipped file is reported', async () => {
  const { problems } = await run(extension({}, { 'CHANGELOG.md': null }));
  assert.deepStrictEqual(problems, ['content: missing extension/changelog.md']);
});

test('a bloated bundle exceeds the size budget', async () => {
  const { problems } = await run(extension({}, { 'dist/blob.js': randomBytes(200 * 1024).toString('base64') }));
  assert.strictEqual(problems.length, 1);
  assert.match(problems[0], /^size: \d+\.\d KB exceeds the budget of 50 KB$/);
});

test('manifest: repository tag, licence, publisher and budget', () => {
  const ok = {
    name: '@vsslicer/fake',
    version: '1.2.3',
    publisher: 'p',
    license: 'AGPL-3.0-or-later',
    vsslicer: { sizeBudgetKB: 1 },
  };
  const repo = 'https://github.com/o/VSSlicer/tree/fake@1.2.3/vsslicer/modules/fake';
  assert.deepStrictEqual(checkManifest({ ...ok, repository: repo }), []);
  assert.deepStrictEqual(checkManifest({ ...ok, repository: { type: 'git', url: repo } }), []);
  assert.match(
    checkManifest({ ...ok, repository: repo.replace('1.2.3', '1.2.2') })[0],
    /does not point at the release tag fake@1\.2\.3/,
  );
  assert.deepStrictEqual(checkManifest({ ...ok }), ['manifest: repository is missing']);
  assert.strictEqual(checkManifest({ ...ok, repository: repo, license: 'MIT', publisher: '', vsslicer: {} }).length, 3);
});
