// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseIds } from '../scripts/sync-pack.mjs';

test('parseIds: one id per line, comments and blanks ignored', () => {
  assert.deepEqual(parseIds('# c\n\nvsslicer.gcode # trailing\n  vsslicer.x-y  \n'), [
    'vsslicer.gcode',
    'vsslicer.x-y',
  ]);
});

test('parseIds: rejects malformed and duplicate ids', () => {
  assert.throws(() => parseIds('gcode'), /invalid/);
  assert.throws(() => parseIds('a.b\na.b'), /duplicate/);
});

test('package.json extensionPack matches shipped-extensions.txt', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.deepEqual(
    pkg.extensionPack,
    parseIds(readFileSync(new URL('../shipped-extensions.txt', import.meta.url), 'utf8')),
  );
});
