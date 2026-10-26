// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadCatalogue } from '../src/adapters/catalogue.ts';
import { completionsAt, hoverAt, unknownCommands } from '../src/application/features.ts';
import { buildIndex, commandWord, lookup, resolveFlavour } from '../src/domain/lookup.ts';
import { featuresAvailable, MAX_FEATURE_BYTES } from '../src/domain/size.ts';

const entries = loadCatalogue(fileURLToPath(new URL('../catalogue', import.meta.url)));
const index = buildIndex(entries);

test('resolves flavour names to catalogue flavours, unknown ones to undefined', () => {
  assert.equal(resolveFlavour(index, 'Marlin'), 'marlin');
  assert.equal(resolveFlavour(index, 'Marlin Legacy'), 'marlin');
  assert.equal(resolveFlavour(index, 'klipper'), 'klipper');
  assert.equal(resolveFlavour(index, 'RepRap'), 'reprapfirmware'); // Cura's `;FLAVOR:RepRap`
  assert.equal(lookup(index, resolveFlavour(index, 'RepRap'), 'M550')?.flavours[0], 'reprapfirmware');
  assert.equal(resolveFlavour(index, 'UltiGCode'), undefined);
  assert.equal(resolveFlavour(index, undefined), undefined);
});

test('bambu and prusa-buddy fall back to marlin for codes their own catalogue lacks', () => {
  assert.equal(lookup(index, 'bambu', 'G28')?.code, 'G28');
  assert.equal(lookup(index, 'prusa-buddy', 'M400')?.code, 'M400');
  assert.equal(lookup(index, 'bambu', 'M862.5'), undefined); // Buddy-only
  assert.equal(resolveFlavour(index, 'bambu'), 'bambu');
});

test('finds the command word, skipping line numbers and comments, normalising case and zeros', () => {
  assert.deepEqual(commandWord('  N12 g01 X1'), { code: 'G1', start: 6, end: 9 });
  assert.equal(commandWord('; G1 in a comment'), undefined);
  assert.equal(commandWord('SET_PRESSURE_ADVANCE ADVANCE=0.04')?.code, 'SET_PRESSURE_ADVANCE');
});

test('every catalogued command has a hover with description, flavours and source, in each of its flavours', () => {
  for (const e of entries)
    for (const f of e.flavours) {
      const h = hoverAt(index, f, e.code, 1);
      const shown = lookup(index, f, e.code); // the catalogue shares a few codes across files; the most specific entry shows
      assert.ok(h && shown, `${f} ${e.code}`);
      assert.ok(
        h.markdown.includes(shown.description) && h.markdown.includes(shown.source) && h.markdown.includes(f),
        `${f} ${e.code}`,
      );
    }
});

test('Bambu entries say undocumented and unverified', () => {
  const h = hoverAt(index, 'bambu', 'M620 M', 2);
  assert.match(h?.markdown ?? '', /UNDOCUMENTED/i);
  assert.match(h?.markdown ?? '', /UNVERIFIED/i);
});

test('lookup is per flavour; without a flavour any entry will do', () => {
  assert.ok(lookup(index, 'klipper', 'SET_PRESSURE_ADVANCE'));
  assert.equal(lookup(index, 'marlin', 'SET_PRESSURE_ADVANCE'), undefined);
  assert.ok(lookup(index, undefined, 'SET_PRESSURE_ADVANCE'));
});

test('slicer tag comments have hovers; plain comments and the code part do not', () => {
  assert.match(hoverAt(index, 'marlin', ';LAYER_CHANGE', 3)?.markdown ?? '', /layer/i);
  assert.match(hoverAt(index, undefined, ';TYPE:Outer wall', 2)?.markdown ?? '', /extrusion/i);
  assert.equal(hoverAt(index, 'marlin', '; just a note', 4), undefined);
  assert.equal(hoverAt(index, 'marlin', 'G1 X10 Y10', 7), undefined);
});

test('completes commands at the start of a line, filtered by flavour', () => {
  const labels = (f: string | undefined, line: string, col = line.length) =>
    completionsAt(index, f, line, col).map((c) => c.label);
  assert.ok(labels('klipper', 'SET_').includes('SET_PRESSURE_ADVANCE'));
  assert.ok(!labels('marlin', 'S').includes('SET_PRESSURE_ADVANCE'));
  assert.ok(labels(undefined, '').includes('SET_PRESSURE_ADVANCE') && labels(undefined, '').includes('G1'));
  assert.deepEqual(labels('marlin', 'G1 X1 ; M'), []);
});

test('completes the parameters of the line command that are not yet used', () => {
  const g1 = completionsAt(index, 'marlin', 'G1 X10 ', 7);
  assert.ok(g1.every((c) => c.kind === 'parameter'));
  const names = g1.map((c) => c.label);
  assert.ok(names.includes('Y') && !names.includes('X'));
});

test('unknown commands are found only when the flavour is known, and only G, M and T codes', () => {
  const text = 'G1 X1\nM9999\nSTART_PRINT\n; M8888\nT0';
  assert.deepEqual(
    unknownCommands(index, 'marlin', text).map((u) => [u.line, u.code]),
    [[1, 'M9999'], ...(lookup(index, 'marlin', 'T0') ? [] : [[4, 'T0']])],
  );
  assert.deepEqual(unknownCommands(index, undefined, text), []);
});

test('the size gate switches features off above 50 MB', () => {
  assert.ok(featuresAvailable(MAX_FEATURE_BYTES));
  assert.ok(!featuresAvailable(MAX_FEATURE_BYTES + 1));
});
