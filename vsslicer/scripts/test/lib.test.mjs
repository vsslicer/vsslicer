// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { changed, fetchRetry, isUnreleased, localDeps, order, unreleasedDepProblems, withDeps } from '../lib.mjs';

const m = (name, deps = []) => ({ name, dir: name.split('/')[1], deps });
const mods = [m('@vsslicer/ext', ['@vsslicer/lib']), m('@vsslicer/lib', ['@vsslicer/api']), m('@vsslicer/api'), m('@vsslicer/tooling')];

test('order puts dependencies first, ties alphabetical', () =>
  assert.deepStrictEqual(order(mods), ['@vsslicer/api', '@vsslicer/lib', '@vsslicer/ext', '@vsslicer/tooling']));

test('order ignores non-module deps', () => assert.deepStrictEqual(order([m('@vsslicer/a', ['left-pad'])]), ['@vsslicer/a']));

test('cycle error names the cycle', () =>
  assert.throws(() => order([m('@vsslicer/a', ['@vsslicer/b']), m('@vsslicer/b', ['@vsslicer/a'])]),
    /dependency cycle: @vsslicer\/a -> @vsslicer\/b -> @vsslicer\/a/));

const dev = (name, deps, devDeps) => ({ ...m(name, [...deps, ...devDeps]), devDeps });

test('a devDependency edge closing a cycle is dropped with one note', () => {
  const notes = [];
  const mm = [dev('@vsslicer/a', [], ['@vsslicer/b']), dev('@vsslicer/b', ['@vsslicer/a'], [])];
  assert.deepStrictEqual(
    order(mm, (x) => notes.push(x)),
    ['@vsslicer/a', '@vsslicer/b']
  );
  assert.deepStrictEqual(notes, ['note: ordering ignores devDependency edge(s) closing a cycle: @vsslicer/a -> @vsslicer/b']);
});

test('a devDependency edge outside any cycle still orders and prints no note', () => {
  const notes = [];
  const mm = [dev('@vsslicer/a', [], ['@vsslicer/b']), dev('@vsslicer/b', [], [])];
  assert.deepStrictEqual(
    order(mm, (x) => notes.push(x)),
    ['@vsslicer/b', '@vsslicer/a']
  );
  assert.deepStrictEqual(notes, []);
});

test('a cycle through runtime dependencies still throws', () => assert.throws(() => order([dev('@vsslicer/a', ['@vsslicer/b'], []), dev('@vsslicer/b', ['@vsslicer/a'], [])], () => {}), /dependency cycle/));

// each module has 10 dev edges in the cycle: re-reading deps per edge would cost ~10n reads
test('a dev cycle of 200 modules reads each module once', () => {
  let visits = 0;
  const n = 200;
  const mm = Array.from({ length: n }, (_, i) => {
    const o = { ...dev(`@vsslicer/m${i}`, [], Array.from({ length: 10 }, (_, k) => `@vsslicer/m${(i + k + 1) % n}`)) };
    const deps = o.deps;
    Object.defineProperty(o, 'deps', { get: () => (visits++, deps) });
    return o;
  });
  assert.strictEqual(order(mm, () => {}).length, n);
  assert.ok(visits <= n, `visits ${visits}`);
});

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

test('fetchRetry retries transient errors, then gives up', async () => {
  let n = 0;
  const flaky = async () => (++n < 3 ? Promise.reject(new Error('socket')) : 'ok');
  assert.strictEqual(await fetchRetry('u', flaky), 'ok');
  assert.strictEqual(n, 3);
  await assert.rejects(fetchRetry('u', async () => Promise.reject(new Error('down'))), /down/);
});

test('isUnreleased is true only for 0.0.0', () => {
  assert.equal(isUnreleased({ version: '0.0.0' }), true);
  assert.equal(isUnreleased({ version: '0.0.1' }), false);
});

test('unreleasedDepProblems names the dependent and the 0.0.0 dependency', () => {
  const mods = [
    { name: '@vsslicer/a', version: '0.0.0', deps: [] },
    { name: '@vsslicer/b', version: '1.0.0', deps: ['@vsslicer/a'] },
    { name: '@vsslicer/c', version: '1.0.0', deps: ['@vsslicer/b'] },
  ];
  assert.deepEqual(unreleasedDepProblems(mods), ['@vsslicer/b depends on @vsslicer/a, which is at unreleased version 0.0.0']);
  assert.deepEqual(unreleasedDepProblems(mods.slice(1)), []);
});

test('a 10,000-deep chain orders without recursion', () => {
  const n = 10000;
  const mm = Array.from({ length: n }, (_, i) => m(`@vsslicer/c${i}`, i + 1 < n ? [`@vsslicer/c${i + 1}`] : []));
  const out = order(mm, () => {});
  assert.strictEqual(out.length, n);
  assert.strictEqual(out[0], `@vsslicer/c${n - 1}`);
});

test('a 10,000-deep runtime cycle throws the cycle error', () => {
  const n = 10000;
  const mm = Array.from({ length: n }, (_, i) => m(`@vsslicer/c${i}`, [`@vsslicer/c${(i + 1) % n}`]));
  assert.throws(() => order(mm, () => {}), /dependency cycle/);
});
