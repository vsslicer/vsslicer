// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert';
import { randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import test, { after } from 'node:test';
import { checkManifest, extensionName, pack, packAll } from '../bin/vsslicer-package.mjs';

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

test('declared targets give one VSIX per target, each with its TargetPlatform, each asserted', async () => {
  const d = extension({ vsslicer: { sizeBudgetKB: 50, targets: ['linux-x64', 'win32-x64'] } });
  try {
    const results = await packAll(d);
    assert.deepStrictEqual(
      results.map((r) => basename(r.file)),
      ['fake-linux-x64-1.2.3.vsix', 'fake-win32-x64-1.2.3.vsix'],
    );
    for (const [i, t] of ['linux-x64', 'win32-x64'].entries()) {
      assert.deepStrictEqual(results[i].problems, []);
      const dir = mkdtempSync(join(tmpdir(), 'unzip-'));
      execFileSync('unzip', ['-q', results[i].file, 'extension.vsixmanifest', '-d', dir]);
      assert.match(readFileSync(join(dir, 'extension.vsixmanifest'), 'utf8'), new RegExp(`TargetPlatform="${t}"`));
      rmSync(dir, { recursive: true, force: true });
    }
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});

test('the content assertion runs for every target file', async () => {
  const d = extension({ vsslicer: { sizeBudgetKB: 50, targets: ['linux-x64', 'win32-x64'] } }, { '.vscodeignore': '' });
  try {
    const results = await packAll(d);
    assert.strictEqual(results.length, 2);
    for (const r of results) assert.ok(r.problems.includes('content: unexpected extension/src/x.ts'), r.file);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});

test('without targets there is one universal VSIX', async () => {
  const d = extension();
  try {
    assert.deepStrictEqual(
      (await packAll(d)).map((r) => basename(r.file)),
      ['fake-1.2.3.vsix'],
    );
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});

test('an extension pack without main packages cleanly', async () => {
  const d = extension(
    { main: undefined, icon: undefined, activationEvents: undefined, extensionPack: [] },
    { 'dist/extension.js': null, 'media/icon.png': null },
  );
  assert.deepStrictEqual((await run(d)).problems, []);
});

test('the bin reports a user error as one line, without a stack trace', () => {
  const d = extension({ vsslicer: { sizeBudgetKB: 50, targets: ['nope-x64'] } });
  try {
    const bin = join(import.meta.dirname, '../bin/vsslicer-package.mjs');
    const r = spawnSync(process.execPath, [bin], { cwd: d, encoding: 'utf8' });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /^vsslicer-package: .+\n$/);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});

test('extensionName: unscoped npm name by default, a valid override wins', () => {
  assert.strictEqual(extensionName({ name: '@vsslicer/fake' }), 'fake');
  assert.strictEqual(extensionName({ name: '@vsslicer/fake', vsslicer: { sizeBudgetKB: 1 } }), 'fake');
  assert.strictEqual(extensionName({ name: '@vsslicer/fake', vsslicer: { extensionName: 'p-1' } }), 'p-1');
  assert.strictEqual(extensionName({ vsslicer: { extensionName: 'a'.repeat(214) } }).length, 214);
});

test('extensionName: invalid overrides fail with a named error', () => {
  for (const bad of ['Fake', 'a/b', '@x/y', '', '-a', 'a'.repeat(215), 5, null, ['a']])
    assert.throws(() => extensionName({ vsslicer: { extensionName: bad } }), /vsslicer\.extensionName/, String(bad));
});

test('the override names the VSIX and the id; an invalid one stops before vsce', async () => {
  const d = extension({ vsslicer: { sizeBudgetKB: 50, extensionName: 'short' } });
  try {
    const { file, problems } = await pack(d);
    assert.deepStrictEqual(problems, []);
    assert.strictEqual(basename(file), 'short-1.2.3.vsix');
    const dir = mkdtempSync(join(tmpdir(), 'unzip-'));
    execFileSync('unzip', ['-q', file, 'extension.vsixmanifest', '-d', dir]);
    assert.match(readFileSync(join(dir, 'extension.vsixmanifest'), 'utf8'), /Identity Language="en-US" Id="short"/);
    rmSync(dir, { recursive: true, force: true });
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
  const bad = extension({ vsslicer: { sizeBudgetKB: 50, extensionName: 'Bad/Name' } });
  try {
    await assert.rejects(pack(bad), /vsslicer\.extensionName/);
  } finally {
    rmSync(bad, { recursive: true, force: true });
  }
});

const schemaExt = (schema, extra = {}) =>
  extension(
    { contributes: { jsonValidation: [{ fileMatch: '*.x', url: './schemas/a.json' }] } },
    { 'schemas/a.json': JSON.stringify(schema), 'schemas/defs.json': '{"$defs":{}}', ...extra },
  );

test('a file reached by a relative $ref from a contributed schema packs; an unreferenced file does not', async () => {
  const ok = await run(
    schemaExt(
      { properties: { x: { $ref: './defs.json#/$defs/x' } } },
      {
        '.vscodeignore':
          '**\n!dist/*.js\n!schemas/**\n!media/**\n!LICENSE\n!THIRD-PARTY-NOTICES.md\n!README.md\n!CHANGELOG.md\n',
      },
    ),
  );
  assert.deepStrictEqual(ok.problems, []);
  const extra = await run(
    schemaExt(
      { type: 'object' },
      {
        '.vscodeignore':
          '**\n!dist/*.js\n!schemas/**\n!media/**\n!LICENSE\n!THIRD-PARTY-NOTICES.md\n!README.md\n!CHANGELOG.md\n',
      },
    ),
  );
  assert.deepStrictEqual(extra.problems, ['content: unexpected extension/schemas/defs.json']);
});

test('a $ref that escapes the folder, is absolute or names a missing file fails', async () => {
  const outside = `outside-${randomBytes(6).toString('hex')}.json`;
  writeFileSync(join(tmpdir(), outside), '{}'); // exists, so only the folder check can reject it
  after(() => rmSync(join(tmpdir(), outside), { force: true }));
  for (const [ref, msg] of [
    [`../../${outside}`, /leaves the extension folder/],
    ['/etc/passwd', /absolute/],
    ['https://x.test/s.json', /absolute/],
    ['./nope.json', /missing/],
  ]) {
    const { problems } = await run(schemaExt({ $ref: ref }));
    assert.ok(
      problems.some((p) => msg.test(p)),
      `${ref}: ${problems}`,
    );
  }
});

test('$ref scanning is capped by file size, ref count and depth', async () => {
  const big = await run(schemaExt({ pad: 'x'.repeat(1024 * 1024) }));
  assert.ok(big.problems.some((p) => /larger than/.test(p)));
  const many = await run(schemaExt({ a: Array.from({ length: 10001 }, () => ({ $ref: '#/x' })) }));
  assert.ok(many.problems.some((p) => /more than 10000/.test(p)));
  // a.json -> d1 -> d2 -> d3 -> d4: d3 is reached, its own refs are not followed, so d4 is unexpected
  const all = '**\n!dist/*.js\n!schemas/**\n!media/**\n!LICENSE\n!THIRD-PARTY-NOTICES.md\n!README.md\n!CHANGELOG.md\n';
  const chain = await run(
    schemaExt(
      { $ref: './d1.json' },
      {
        '.vscodeignore': all,
        'schemas/d1.json': '{"$ref":"./d2.json"}',
        'schemas/d2.json': '{"$ref":"./d3.json"}',
        'schemas/d3.json': '{"$ref":"./d4.json"}',
        'schemas/d4.json': '{}',
        'schemas/defs.json': null,
      },
    ),
  );
  assert.deepStrictEqual(chain.problems, ['content: unexpected extension/schemas/d4.json']);
});
