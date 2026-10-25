// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const mod = join(import.meta.dirname, '..', '..', 'modules', 'tooling');

test('packing a module twice gives the same tarball hash', () => {
  const sha = () => {
    const out = mkdtempSync(join(tmpdir(), 'pack-'));
    execFileSync('pnpm', ['pack', '--pack-destination', out], { cwd: mod, stdio: 'pipe' });
    return createHash('sha256').update(readFileSync(join(out, readdirSync(out)[0]))).digest('hex');
  };
  assert.strictEqual(sha(), sha());
});
