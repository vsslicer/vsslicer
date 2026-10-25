// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { dcoProblems } from '../check-dco.mjs';

const dir = mkdtempSync(join(tmpdir(), 'dco-'));
after(() => rmSync(dir, { recursive: true, force: true }));
const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 'Ann', GIT_AUTHOR_EMAIL: 'Ann@Example.com', GIT_COMMITTER_NAME: 'Ann', GIT_COMMITTER_EMAIL: 'ann@example.com' } }).trim();
let n = 0;
const commit = (msg, f = 'f') => (writeFileSync(join(dir, f), String(n++)), git('add', f), git('commit', '-q', '-m', msg), git('rev-parse', 'HEAD'));
git('init', '-q', '-b', 'main');
const base = commit('base');

test('signed history passes, email case-insensitive', () => {
  commit('one\n\nSigned-off-by: Ann <ann@example.com>');
  assert.deepEqual(dcoProblems(base, 'HEAD', dir), []);
});

test('unsigned commit fails and is named', () => {
  const bad = commit('unsigned');
  const p = dcoProblems(base, 'HEAD', dir);
  assert.equal(p.length, 1);
  assert.ok(p[0].startsWith(bad.slice(0, 12)));
});

test('sign-off by someone else fails', () => {
  const mid = git('rev-parse', 'HEAD');
  const bad = commit('other\n\nSigned-off-by: Bob <bob@example.com>');
  const p = dcoProblems(mid, 'HEAD', dir);
  assert.equal(p.length, 1);
  assert.ok(p[0].startsWith(bad.slice(0, 12)));
});

test('merge commits are skipped', () => {
  git('checkout', '-q', '-b', 'side', base);
  commit('side\n\nSigned-off-by: Ann <ann@example.com>', 'g');
  git('checkout', '-q', 'main');
  const before = git('rev-parse', 'HEAD');
  git('merge', '-q', '--no-ff', '-m', 'merge side', 'side');
  assert.deepEqual(dcoProblems(before, 'HEAD', dir), []);
});
