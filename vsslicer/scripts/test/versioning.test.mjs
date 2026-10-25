// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { changelogSection, integrityProblems, stalePinProblems, isPublishedChange, lockfileIntegrities, registryProblems, releaseTag, versionProblems } from '../versioning.mjs';

const scripts = join(import.meta.dirname, '..');
const files = ['dist', '!dist/*.meta.json', 'LICENSE', 'bin'];

test('isPublishedChange: src, shipped files and package.json count; tests, fixtures, docs do not', () => {
  for (const f of ['src/a.ts', 'package.json', 'bin/x.mjs', 'LICENSE']) assert.ok(isPublishedChange(f, files), f);
  for (const f of ['test/a.test.ts', 'test/fixtures/x', 'docs/a.md', 'CHANGELOG.md', 'README.md', 'src/a.test.ts', 'dist/a.meta.json', 'eslint.config.mjs'])
    assert.ok(!isPublishedChange(f, files), f);
});

const base = { dir: 'm', changed: ['src/a.ts'], files, baseVersion: '1.0.0', version: '1.0.0', changelog: '# Changelog\n\n## 1.0.0\n\n- x\n' };
test('versionProblems', () => {
  assert.match(versionProblems(base)[0], /^m: .*still 1\.0\.0/);
  assert.match(versionProblems({ ...base, version: '1.1.0' })[0], /no "## 1\.1\.0" entry/);
  assert.deepStrictEqual(versionProblems({ ...base, version: '1.1.0', changelog: '## 1.1.0\n- y' }), []);
  assert.deepStrictEqual(versionProblems({ ...base, changed: ['test/a.ts', 'CHANGELOG.md'] }), []);
  assert.match(versionProblems({ ...base, baseVersion: null, changelog: '' })[0], /new module.*no "## 1\.0\.0" entry/);
  assert.deepStrictEqual(versionProblems({ ...base, baseVersion: null, changed: [] }), []); // 1.0.0 has an entry
});

test('changelogSection and releaseTag', () => {
  const c = '# C\n\n## 0.4.0\n\n- a\n- b\n\n## 0.3.0\n\n- c\n';
  assert.strictEqual(changelogSection(c, '0.4.0'), '## 0.4.0\n\n- a\n- b');
  assert.strictEqual(changelogSection(c, '0.5.0'), null);
  assert.strictEqual(releaseTag('example-extension', '0.4.0'), 'example-extension@0.4.0');
});

test('lockfile integrity: a doctored lockfile names both modules', () => {
  const lock = readFileSync(join(scripts, '..', 'modules', 'example-extension', 'pnpm-lock.yaml'), 'utf8');
  const entries = lockfileIntegrities(lock);
  assert.ok(entries.has('@vsslicer/example@0.3.1'));
  const served = new Map(entries);
  const lookup = (n, v) => served.get(`${n}@${v}`);
  assert.deepStrictEqual(integrityProblems('@vsslicer/example-extension', entries, lookup), []);
  const doctored = lockfileIntegrities(lock.replace(/(@vsslicer\/example@0\.3\.1':\n\s+resolution: \{integrity: sha512-)\w{4}/, '$1AAAA'));
  const [p, ...rest] = integrityProblems('@vsslicer/example-extension', doctored, lookup);
  assert.deepStrictEqual(rest, []);
  assert.match(p, /@vsslicer\/example-extension and @vsslicer\/example:/);
  assert.match(integrityProblems('d', entries, () => undefined)[0], /does not serve/);
});

test('stalePinProblems: a lockfile pinning a non-current @vsslicer version names both modules', () => {
  const current = new Map([['@vsslicer/tooling', '0.8.1']]);
  const pins = (v) => new Map([[`@vsslicer/tooling@${v}`, 'sha512-x']]);
  assert.deepStrictEqual(stalePinProblems('@vsslicer/example', pins('0.8.1'), current), []);
  const [p, ...rest] = stalePinProblems('@vsslicer/example', pins('0.5.0'), current);
  assert.deepStrictEqual(rest, []);
  assert.match(p, /@vsslicer\/example and @vsslicer\/tooling:.*0\.5\.0.*current is 0\.8\.1/);
});

test('registryProblems', () => {
  const ok = { dir: 'm', pkg: { publishConfig: { registry: 'http://localhost:4873/' } }, texts: { '.npmrc': '@vsslicer:registry=http://localhost:4873/\n' } };
  assert.deepStrictEqual(registryProblems(ok), []);
  assert.strictEqual(registryProblems({ ...ok, pkg: { publishConfig: { registry: 'https://registry.npmjs.org/' } } }).length, 1);
  assert.match(registryProblems({ ...ok, texts: { '.npmrc': '@vsslicer:registry=https://registry.npmjs.org/\n' } }).join(), /\.npmrc must contain/);
  assert.match(registryProblems({ ...ok, texts: { ...ok.texts, 'pnpm-lock.yaml': "tarball: https://registry.npmjs.org/@vsslicer/x" } }).join(), /references registry\.npmjs\.org/);
});

// scratch git repo: a vsslicer/ subfolder like the real layout; run.mjs is copied in
function scratch() {
  const repo = mkdtempSync(join(tmpdir(), 'ver-'));
  const g = (...a) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: repo, stdio: 'pipe', encoding: 'utf8' });
  const v = join(repo, 'vsslicer');
  mkdirSync(join(v, 'modules', 'alpha', 'src'), { recursive: true });
  mkdirSync(join(v, 'modules', 'pending'), { recursive: true }); // no package.json yet
  cpSync(scripts, join(v, 'scripts'), { recursive: true, filter: (s) => !s.includes('node_modules') });
  const pkg = (version) => JSON.stringify({ name: '@vsslicer/alpha', version, files: ['dist'] });
  writeFileSync(join(v, 'modules', 'alpha', 'package.json'), pkg('0.1.0'));
  writeFileSync(join(v, 'modules', 'alpha', 'CHANGELOG.md'), '# Changelog\n\n## 0.1.0\n\n- first\n');
  writeFileSync(join(v, 'modules', 'alpha', 'src', 'a.ts'), 'a');
  g('init', '-q'); g('add', '-A'); g('commit', '-qm', 'base');
  const run = (...a) => spawnSync(process.execPath, ['scripts/run.mjs', ...a], { cwd: v, encoding: 'utf8' });
  return { v, g, run, pkg, alpha: join(v, 'modules', 'alpha') };
}

test('version-check and release --dry-run in a scratch git repo; a module without package.json is skipped', () => {
  const { v, run, pkg, alpha } = scratch();
  const ok = run('version-check', '--base', 'HEAD');
  assert.strictEqual(ok.status, 0, ok.stderr);
  assert.match(ok.stderr + ok.stdout, /pending.*no package\.json/);
  writeFileSync(join(alpha, 'src', 'a.ts'), 'changed');
  const bad = run('version-check', '--base', 'HEAD');
  assert.strictEqual(bad.status, 1);
  assert.match(bad.stderr, /alpha: .*version is still 0\.1\.0/);
  writeFileSync(join(alpha, 'package.json'), pkg('0.2.0'));
  assert.match(run('version-check', '--base', 'HEAD').stderr, /alpha: .*no "## 0\.2\.0" entry/);
  writeFileSync(join(alpha, 'CHANGELOG.md'), '# Changelog\n\n## 0.2.0\n\n- second\n\n## 0.1.0\n\n- first\n');
  assert.strictEqual(run('version-check', '--base', 'HEAD').status, 0);
  const rel = run('release', '--dry-run', 'alpha');
  assert.strictEqual(rel.status, 0, rel.stderr);
  assert.match(rel.stdout, /## 0\.2\.0\n\n- second/);
  assert.match(rel.stdout, /tag: alpha@0\.2\.0/);
  assert.ok(!execFileSync('git', ['tag'], { cwd: v, encoding: 'utf8' }).includes('alpha@'));
});

test('ci stops before any install when published files changed without a bump (uncommitted or untracked); --allow-unbumped skips the guard', () => {
  const { run, pkg, alpha } = scratch();
  const reachedInstall = (r) => /pnpm install/.test(r.stdout);
  writeFileSync(join(alpha, 'src', 'a.ts'), 'changed'); // uncommitted edit, no bump
  let r = run('ci');
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /alpha: .*version is still 0\.1\.0/);
  assert.match(r.stderr, /bump .*CHANGELOG\.md.*--allow-unbumped/s);
  assert.ok(!reachedInstall(r), r.stdout);
  writeFileSync(join(alpha, 'src', 'new.ts'), 'x'); // untracked counts too
  assert.match(run('ci').stderr, /alpha: /);
  assert.ok(reachedInstall(run('ci', '--allow-unbumped')));
  writeFileSync(join(alpha, 'package.json'), pkg('0.2.0'));
  writeFileSync(join(alpha, 'CHANGELOG.md'), '# Changelog\n\n## 0.2.0\n\n- second\n\n## 0.1.0\n\n- first\n');
  r = run('ci');
  assert.doesNotMatch(r.stderr, /version-check/);
  assert.ok(reachedInstall(r), r.stdout);
});
