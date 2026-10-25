// SPDX-License-Identifier: AGPL-3.0-or-later
// Negative fixtures are built in a temp dir at test time, never committed.
import test from 'node:test';
import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkFixtures } from '../check-fixtures.mjs';

const MB = 1024 * 1024;
const repo = (build) => {
  const root = mkdtempSync(join(tmpdir(), 'check-fixtures-'));
  const dir = join(root, 'modules', 'm', 'test', 'fixtures', 'gen');
  mkdirSync(dir, { recursive: true });
  build(dir);
  return { root, done: () => rmSync(root, { recursive: true, force: true }) };
};

test('a folder with PROVENANCE.md and small files passes', () => {
  const r = repo((d) => (writeFileSync(join(d, 'PROVENANCE.md'), 'x'), writeFileSync(join(d, 'a.gcode'), Buffer.alloc(5 * MB))));
  assert.deepStrictEqual(checkFixtures(r.root), []);
  r.done();
});

test('a 6 MB file fails', () => {
  const r = repo((d) => (writeFileSync(join(d, 'PROVENANCE.md'), 'x'), writeFileSync(join(d, 'big.gcode'), Buffer.alloc(6 * MB))));
  const p = checkFixtures(r.root);
  assert.strictEqual(p.length, 1);
  assert.match(p[0], /big\.gcode/);
  r.done();
});

test('a folder without PROVENANCE.md fails', () => {
  const r = repo((d) => writeFileSync(join(d, 'a.gcode'), 'G1'));
  const p = checkFixtures(r.root);
  assert.strictEqual(p.length, 1);
  assert.match(p[0], /gen: missing PROVENANCE\.md/);
  r.done();
});
