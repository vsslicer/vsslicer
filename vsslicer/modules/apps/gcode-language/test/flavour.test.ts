// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { detectFlavour, flavourLabel } from '../src/domain/flavour.ts';
import { registerFlavourStatus, type Api } from '../src/presentation/status.ts';

const fixture = (name: string) => readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8').slice(0, 65536);

test('detects the flavour the head names, last one winning', () => {
  assert.equal(detectFlavour(';FLAVOR:Marlin\nG1 X1'), 'Marlin');
  assert.equal(detectFlavour('; gcode_flavor = klipper\r\n'), 'klipper');
  assert.equal(detectFlavour(';FLAVOR:Marlin\n; gcode_flavor = reprapfirmware'), 'reprapfirmware');
  assert.equal(detectFlavour('G28\n; no flavour here'), undefined);
});

test('a Bambu Lab or Prusa Buddy printer model refines a Marlin or unstated flavour, nothing else', () => {
  assert.equal(detectFlavour('; gcode_flavor = marlin\n; printer_model = Bambu Lab X1 Carbon'), 'bambu');
  assert.equal(detectFlavour('; printer_model = MK4S\n'), 'prusa-buddy');
  assert.equal(detectFlavour('; printer_model = MK3MMU2\n; gcode_flavor = marlin'), 'marlin');
  assert.equal(detectFlavour('; gcode_flavor = klipper\n; printer_model = Bambu Lab X1 Carbon'), 'klipper');
});

test('detects the flavour in real slicer files, Buddy from the printer model when the head states none', () => {
  assert.equal(detectFlavour(fixture('cura.gcode'))?.toLowerCase(), 'reprap');
  assert.equal(detectFlavour(fixture('prusaslicer.gcode')), 'prusa-buddy'); // MK4S, gcode_flavor only at the end
});

test('the label is the override, else the detected name, else generic', () => {
  assert.equal(flavourLabel('marlin', 'klipper'), 'klipper');
  assert.equal(flavourLabel('marlin', undefined), 'marlin');
  assert.equal(flavourLabel(undefined, undefined), 'generic');
});

const fake = (text: string, overrides: Record<string, string> = {}) => {
  const item = {
    text: '',
    tooltip: '',
    shown: false,
    show() {
      this.shown = true;
    },
    hide() {
      this.shown = false;
    },
  };
  const doc = {
    languageId: 'gcode',
    uri: { fsPath: '/w/a.gcode' },
    positionAt: (n: number) => n,
    getText: () => text,
  };
  const host = {
    StatusBarAlignment: { Right: 2 },
    Range: class {},
    window: {
      createStatusBarItem: () => item,
      activeTextEditor: { document: doc },
      onDidChangeActiveTextEditor: () => ({}),
    },
    workspace: {
      getConfiguration: () => ({ get: () => overrides }),
      asRelativePath: () => 'a.gcode',
      onDidChangeTextDocument: () => ({}),
      onDidChangeConfiguration: () => ({}),
    },
  };
  registerFlavourStatus({ subscriptions: [] }, host as unknown as Api);
  return item;
};

test('the status bar item shows generic for an unknown flavour and honours the per-file override', () => {
  assert.equal(fake('G28').text, 'G-code: generic');
  assert.equal(fake(';FLAVOR:Marlin').text, 'G-code: Marlin');
  const overridden = fake(';FLAVOR:Marlin', { 'a.gcode': 'klipper' });
  assert.equal(overridden.text, 'G-code: klipper');
  assert.ok(overridden.shown);
});
