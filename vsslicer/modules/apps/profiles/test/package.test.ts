// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { ABOUT_COMMAND } from '../src/domain/about.ts';

test('a workspace containing .vsslicer/profiles/ activates the extension', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    activationEvents: string[];
  };
  assert.ok(pkg.activationEvents.includes('workspaceContains:.vsslicer/profiles/'));
});

test('the about command is contributed and activates the extension', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    activationEvents: string[];
    contributes: { commands: { command: string }[] };
  };
  assert.ok(pkg.contributes.commands.some((c) => c.command === ABOUT_COMMAND));
  assert.ok(pkg.activationEvents.includes(`onCommand:${ABOUT_COMMAND}`));
});
