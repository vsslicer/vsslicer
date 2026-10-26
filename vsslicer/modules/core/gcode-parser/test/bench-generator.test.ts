// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { generate, type Profile } from '../bench/generate.ts';
import { collect, parse } from '../src/index.ts';

const bytes = (p: Profile, n: number, seed?: number): Buffer => Buffer.concat([...generate(p, n, seed)]);

describe('bench generator', () => {
  it.each(['straight', 'arc-heavy'] as const)('%s is deterministic, exact in size and arc-clean', async (p) => {
    const a = bytes(p, 2_500_000);
    expect(a.length).toBe(2_500_000);
    expect(a.equals(bytes(p, 2_500_000))).toBe(true);
    expect(a.equals(bytes(p, 2_500_000, 2))).toBe(false);
    const file = await collect(
      parse(
        (async function* () {
          yield a;
        })(),
      ),
    );
    expect(file.diagnostics.filter((d) => d.code === 'arc-invalid')).toEqual([]);
    // GCP-17 profiles: ~33k and ~57k moves per MB
    const perMB = file.moveCount / 2.5;
    expect(perMB).toBeGreaterThan(p === 'straight' ? 30_000 : 52_000);
    expect(perMB).toBeLessThan(p === 'straight' ? 37_000 : 63_000);
  });
});
