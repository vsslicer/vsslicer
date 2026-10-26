// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { flavourFromName } from '../src/index.ts';

test.each([
  ['klipper', 'klipper'],
  [' Klipper ', 'klipper'],
  ['reprapfirmware', 'reprapfirmware'],
  ['RepRap', 'reprapfirmware'],
  ['RepRap (RepRap)', 'reprapfirmware'],
  ['marlin', 'marlin'],
  ['Marlin2', 'marlin'],
  ['MarlinLegacy', 'marlin'],
  ['Marlin(Volumetric)', 'marlin'],
  ['RepRap (Marlin/Sprinter)', 'marlin'],
  ['RepRap (Volumetric)', 'marlin'],
  ['Griffin', 'marlin'],
  ['Cheetah', 'marlin'],
])('%s maps to %s', (name, flavour) => {
  expect(flavourFromName(name)).toBe(flavour);
});

test('unknown names (UltiGCode, empty) are undefined', () => {
  expect(flavourFromName('UltiGCode')).toBeUndefined();
  expect(flavourFromName('')).toBeUndefined();
});
