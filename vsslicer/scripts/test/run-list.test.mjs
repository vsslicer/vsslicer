// SPDX-License-Identifier: AGPL-3.0-or-later
// `run.mjs --list` stdout is parsed as JSON by the CI select job: a dropped-edge note must go to stderr.
import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('build --list stdout stays JSON when a dev edge is dropped', () => {
  const dir = mkdtempSync(join(tmpdir(), 'run-list-'));
  try {
    const scripts = join(dir, 'scripts');
    mkdirSync(scripts);
    for (const f of ['run.mjs', 'lib.mjs', 'modules.mjs', 'versioning.mjs']) cpSync(fileURLToPath(new URL(`../${f}`, import.meta.url)), join(scripts, f));
    const mod = (d, deps, devDependencies) => {
      mkdirSync(join(dir, 'modules', d), { recursive: true });
      writeFileSync(join(dir, 'modules', d, 'package.json'), JSON.stringify({ name: `@vsslicer/${d}`, version: '1.0.0', dependencies: deps, devDependencies }));
    };
    mod('a', { '@vsslicer/b': '1.0.0' }, {});
    mod('b', {}, { '@vsslicer/a': '1.0.0' });
    const r = spawnSync(process.execPath, [join(scripts, 'run.mjs'), 'build', '--list'], { encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.deepStrictEqual(JSON.parse(r.stdout), ['@vsslicer/b', '@vsslicer/a']);
    assert.match(r.stderr, /ordering ignores devDependency edge/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
