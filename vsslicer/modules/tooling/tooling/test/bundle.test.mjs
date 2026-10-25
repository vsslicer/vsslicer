// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bundle } from '../bin/vsslicer-bundle.mjs';

test('base config turns the strict flags on', () => {
  const { compilerOptions: o } = JSON.parse(readFileSync(new URL('../tsconfig.base.json', import.meta.url), 'utf8'));
  for (const k of ['strict', 'noUncheckedIndexedAccess', 'verbatimModuleSyntax']) assert.strictEqual(o[k], true, k);
});

test('bundle inlines local code, keeps vscode external, emits cjs', async () => {
  const d = mkdtempSync(join(tmpdir(), 'bundle-'));
  mkdirSync(join(d, 'src'));
  writeFileSync(join(d, 'src', 'dep.ts'), 'export const x: number = 42;\n');
  writeFileSync(
    join(d, 'src', 'e.ts'),
    "import * as vscode from 'vscode';\nimport { x } from './dep.ts';\nexport const activate = () => vscode.window.showInformationMessage(String(x));\n",
  );
  await bundle(join(d, 'src', 'e.ts'), join(d, 'dist', 'extension.js'));
  const out = readFileSync(join(d, 'dist', 'extension.js'), 'utf8');
  assert.match(out, /require\("vscode"\)/);
  assert.match(out, /42/);
  assert.doesNotMatch(out, /require\("\.\/dep/);
});

test('runs as a bin through a symlink', async () => {
  const { execFileSync } = await import('node:child_process');
  const { symlinkSync } = await import('node:fs');
  const d = mkdtempSync(join(tmpdir(), 'bin-'));
  mkdirSync(join(d, 'src'));
  writeFileSync(join(d, 'src', 'e.ts'), 'export const a: number = 1;\n');
  const link = join(d, 'vsslicer-bundle');
  symlinkSync(new URL('../bin/vsslicer-bundle.mjs', import.meta.url).pathname, link);
  execFileSync(process.execPath, [link, 'src/e.ts', 'dist/extension.js'], { cwd: d, stdio: 'ignore' });
  assert.match(readFileSync(join(d, 'dist', 'extension.js'), 'utf8'), /a = 1/);
});

test('bundle writes the metafile under cwd, not the caller folder', async () => {
  const d = mkdtempSync(join(tmpdir(), 'bundle-cwd-'));
  mkdirSync(join(d, 'src'));
  writeFileSync(join(d, 'src', 'e.ts'), 'export const a: number = 1;\n');
  await bundle('src/e.ts', 'dist/extension.js', d);
  assert.ok(readFileSync(join(d, 'dist', 'extension.meta.json'), 'utf8'));
});

test('a missing entry prints one line and exits 1, no stack', async () => {
  const { spawnSync } = await import('node:child_process');
  const d = mkdtempSync(join(tmpdir(), 'bin-missing-'));
  const bin = new URL('../bin/vsslicer-bundle.mjs', import.meta.url).pathname;
  const r = spawnSync(process.execPath, [bin, 'src/nope.ts', 'dist/extension.js'], { cwd: d, encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
  assert.strictEqual(r.stderr.trim().split('\n').length, 1, r.stderr);
  assert.match(r.stderr, /^vsslicer-bundle: /);
});

test('a warning is printed and the build still exits 0', async () => {
  const { spawnSync } = await import('node:child_process');
  const d = mkdtempSync(join(tmpdir(), 'bin-warn-'));
  mkdirSync(join(d, 'src'));
  writeFileSync(join(d, 'src', 'e.ts'), 'export const u: string = import.meta.url;\n');
  const bin = new URL('../bin/vsslicer-bundle.mjs', import.meta.url).pathname;
  const r = spawnSync(process.execPath, [bin, 'src/e.ts', 'dist/extension.js'], { cwd: d, encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stderr, /import\.meta/);
});
