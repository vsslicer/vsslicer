// SPDX-License-Identifier: AGPL-3.0-or-later
// CI must run test:integration for modules that define it, with the shared VS Code cache, and must not cache unused fixtures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const ci = readFileSync(new URL('../../../.github/workflows/ci.yml', import.meta.url), 'utf8');
const mods = new URL('../../modules/', import.meta.url);
const withIntegration = readdirSync(mods).filter((d) => {
  try {
    return 'test:integration' in JSON.parse(readFileSync(new URL(`${d}/package.json`, mods), 'utf8')).scripts;
  } catch {
    return false;
  }
});

test('some module defines test:integration', () => assert.ok(withIntegration.length > 0));

test('ci.yml runs test:integration on every OS, under xvfb on Linux', () => {
  assert.match(ci, /xvfb-run -a node scripts\/run\.mjs test:integration/);
  assert.match(ci, /runner\.os != 'Linux'\n\s+run: node scripts\/run\.mjs test:integration/);
});

test('every test:integration step shares the VS Code cache dir', () => {
  const steps = ci.split(/\n\s+- /).filter((s) => /run: .*test:integration/.test(s));
  assert.equal(steps.length, 2);
  for (const s of steps) assert.match(s, /VSCODE_TEST_CACHE: \$\{\{ runner\.temp \}\}\/vscode-test/);
});

test('no cache step for fixtures nothing generates', () => assert.doesNotMatch(ci, /large-fixtures/));
