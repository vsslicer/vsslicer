// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (file: string) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const { contributes } = read('package.json');

test('the gcode language covers the four extensions and has a configuration', () => {
  const [language] = contributes.languages;
  assert.equal(language.id, 'gcode');
  assert.deepEqual(language.extensions, ['.gcode', '.g', '.gco', '.nc']);
  assert.ok(existsSync(new URL(`../${language.configuration}`, import.meta.url)));
  assert.equal(read('language-configuration.json').comments.lineComment, ';');
});

test('the grammar is registered under its scope name and no custom editor is contributed', () => {
  const [grammar] = contributes.grammars;
  assert.equal(grammar.language, 'gcode');
  assert.equal(read(grammar.path).scopeName, grammar.scopeName);
  assert.equal(contributes.customEditors, undefined);
});

test('[gcode] keeps large-file optimisations on (tokenisation off past 20 MB)', () => {
  assert.equal(contributes.configurationDefaults['[gcode]']['editor.largeFileOptimizations'], true);
});
