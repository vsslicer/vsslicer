// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { computeStats, weld } from '../src/index.ts';

test('generate-large-fixture writes a closed, outward-wound mesh', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mesh-fixture-'));
  try {
    const out = join(dir, 'a.stl');
    execFileSync(process.execPath, ['scripts/generate-large-fixture.mjs', '10000', out, '1']);
    const b = await readFile(out);
    const n = b.readUInt32LE(80);
    expect(n).toBeGreaterThan(9000);
    expect(b.length).toBe(84 + 50 * n);
    const soup = new Float32Array(n * 9);
    for (let t = 0; t < n; t++) for (let k = 0; k < 9; k++) soup[t * 9 + k] = b.readFloatLE(84 + 50 * t + 12 + 4 * k);
    const st = computeStats(weld(soup));
    expect(st.openEdges).toBe(0);
    expect(st.nonManifoldEdges).toBe(0);
    expect(st.volume).toBeGreaterThan(0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
