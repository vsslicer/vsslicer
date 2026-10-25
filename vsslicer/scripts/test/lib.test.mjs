// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { changed, localDeps, order, withDeps } from '../lib.mjs';

const m = (name, deps = []) => ({ name, dir: name.split('/')[1], deps });
const mods = [m('@vsslicer/ext', ['@vsslicer/lib']), m('@vsslicer/lib', ['@vsslicer/api']), m('@vsslicer/api'), m('@vsslicer/tooling')];

test('order puts dependencies first, ties alphabetical', () =>
  assert.deepStrictEqual(order(mods), ['@vsslicer/api', '@vsslicer/lib', '@vsslicer/ext', '@vsslicer/tooling']));

test('order ignores non-module deps', () => assert.deepStrictEqual(order([m('@vsslicer/a', ['left-pad'])]), ['@vsslicer/a']));

test('cycle error names the cycle', () =>
  assert.throws(() => order([m('@vsslicer/a', ['@vsslicer/b']), m('@vsslicer/b', ['@vsslicer/a'])]),
    /dependency cycle: @vsslicer\/a -> @vsslicer\/b -> @vsslicer\/a/));

test('changed = touched modules plus transitive dependents', () => {
  assert.deepStrictEqual([...changed(mods, ['modules/api/src/x.js'])].sort(), ['@vsslicer/api', '@vsslicer/ext', '@vsslicer/lib']);
  assert.deepStrictEqual([...changed(mods, ['modules/ext/a'])], ['@vsslicer/ext']);
  assert.strictEqual(changed(mods, ['README.md', 'modules/apix/a']).size, 0);
});

test('localDeps reads all three dependency kinds', () =>
  assert.deepStrictEqual(
    localDeps({ dependencies: { '@vsslicer/a': '^1', x: '1' }, devDependencies: { '@vsslicer/b': '^1' }, peerDependencies: { '@vsslicer/c': '^1' } }).sort(),
    ['@vsslicer/a', '@vsslicer/b', '@vsslicer/c']));

test('a change under scripts/ selects every module', () =>
  assert.strictEqual(changed(mods, ['scripts/run.mjs']).size, mods.length));

test('withDeps adds transitive dependencies', () => {
  assert.deepStrictEqual([...withDeps(mods, ['@vsslicer/ext'])].sort(), ['@vsslicer/api', '@vsslicer/ext', '@vsslicer/lib']);
  assert.deepStrictEqual([...withDeps(mods, ['@vsslicer/tooling'])], ['@vsslicer/tooling']);
});
