// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadCatalogue } from '../src/adapters/catalogue.ts';
import { parseEntries, validateEntry } from '../src/domain/catalogue.ts';

const good = {
  code: 'G1',
  flavours: ['marlin'],
  description: 'Moves.',
  parameters: [{ name: 'X', description: 'Position.' }],
  source: 'https://reprap.org/wiki/G-code#G0_.26_G1:_Move',
};

test('the shipped catalogue loads and validates (the lint)', () => {
  const entries = loadCatalogue(fileURLToPath(new URL('../catalogue', import.meta.url)));
  const codes = entries.map((e) => e.code);
  assert.ok(codes.includes('G1') && codes.includes('M104'));
});

test('a good entry passes', () => assert.deepEqual(validateEntry(good), []));

test('an entry without a source link fails', () => {
  const bad = { ...good, source: undefined };
  assert.deepEqual(validateEntry(bad), ['missing source link']);
  assert.throws(() => parseEntries([bad], 'bad.json'), /bad\.json\[0\] G1: missing source link/);
});

test('an entry without a flavour list fails', () => {
  const bad = { ...good, flavours: undefined };
  assert.deepEqual(validateEntry(bad), ['missing flavour list']);
  assert.deepEqual(validateEntry({ ...good, flavours: [] }), ['missing flavour list']);
});

test('a source outside the allowed references, and duplicates, fail', () => {
  assert.equal(validateEntry({ ...good, source: 'https://example.com/G1' }).length, 1);
  assert.throws(() => parseEntries([good, good], 'dup.json'), /duplicate G1 for flavour marlin/);
});

test('new allowed sources pass, lookalikes fail', () => {
  const src = (source: string) => validateEntry({ ...good, source });
  assert.deepEqual(src('https://docs.duet3d.com/User_manual/Reference/Gcodes#g1'), []);
  assert.deepEqual(src('https://marlinfw.org/docs/gcode/G000-G001.html'), []);
  assert.deepEqual(src('https://github.com/SoftFever/OrcaSlicer/blob/main/x'), []);
  assert.deepEqual(src('https://github.com/prusa3d/Prusa-Firmware-Buddy'), []);
  assert.equal(src('https://github.com/prusa3d/Prusa-Firmware-Buddy-evil/x').length, 1);
  assert.deepEqual(src('https://github.com/Klipper3d/klipper/blob/abc/klippy/extras/gcode_move.py#L166'), []);
  assert.deepEqual(src('https://help.prusa3d.com/article/prusa-firmware-specific-g-code-commands_112173'), []);
  assert.equal(src('http://docs.duet3d.com/x').length, 1);
});

test('extended commands pass, lowercase and garbage codes fail', () => {
  assert.deepEqual(validateEntry({ ...good, code: 'SET_PRESSURE_ADVANCE' }), []);
  for (const code of ['g1', 'set_pressure', 'G', '1G', 'G1 X', ''])
    assert.deepEqual(validateEntry({ ...good, code }), [`invalid code: ${code}`]);
});

test('flavour typos and leading-zero codes fail', () => {
  assert.deepEqual(validateEntry({ ...good, flavours: ['klippper'] }), ['unknown flavour: klippper']);
  for (const f of ['bambu', 'prusa-buddy']) assert.deepEqual(validateEntry({ ...good, flavours: [f] }), []);
  assert.deepEqual(validateEntry({ ...good, code: 'G01' }), ['invalid code: G01']);
  assert.deepEqual(validateEntry({ ...good, code: 'G0' }), []);
});

test('a flavour:code pair in two files fails when the files share a seen set', () => {
  const seen = new Set<string>();
  parseEntries([good], 'a.json', seen);
  assert.throws(() => parseEntries([good], 'b.json', seen), /b\.json\[0\] G1: duplicate G1 for flavour marlin/);
});
