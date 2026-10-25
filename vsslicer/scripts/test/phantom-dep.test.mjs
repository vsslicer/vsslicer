// SPDX-License-Identifier: AGPL-3.0-or-later
// Backstop for lint: eslint's no-extraneous-dependencies skips imports it cannot resolve, so the build must fail on them.
import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const fixture = join(import.meta.dirname, '..', '..', 'fixtures', 'phantom-dep');
const env = { ...process.env, CI: 'true' };
const pnpm = (...args) => spawnSync('pnpm', args, { cwd: fixture, encoding: 'utf8', env });

test('building a module that imports an undeclared package fails and names the package', () => {
  const install = pnpm('install', '--frozen-lockfile');
  assert.strictEqual(install.status, 0, install.stderr);
  const build = pnpm('build');
  assert.notStrictEqual(build.status, 0, 'phantom-dep fixture built successfully');
  assert.match(build.stdout + build.stderr, /Cannot find module 'eslint'/);
});
