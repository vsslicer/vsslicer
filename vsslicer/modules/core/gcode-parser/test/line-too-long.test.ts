// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { run } from './support/run.ts';

describe('line-too-long does not depend on how the input is cut', () => {
  const long = `; ${'x'.repeat(1_100_000)}`;
  const text = `G1 X1\n${long}\nG1 X2\n${long}`; // a long line in the middle and one without line break at the end
  const ok = `G1 X1\n; ${'y'.repeat(1_048_000)}\nG1 X2\n`; // under 1 MiB: kept
  it.each([1024, 65536, 100_000, 1 << 30])('piece size %i', async (size) => {
    const r = await run(text, {}, size);
    expect(r.moves.map((m) => m.x)).toEqual([1, 2]);
    expect(r.diagnostics.map((d) => [d.code, d.fileOffset])).toEqual([
      ['line-too-long', 6],
      ['line-too-long', 6 + long.length + 1 + 6],
    ]);
    const k = await run(ok, {}, size);
    expect(k.diagnostics).toEqual([]);
    expect(k.moves.map((m) => m.x)).toEqual([1, 2]);
  });
  it('a long line followed by moves keeps their offsets', async () => {
    const r = await run(`${long}\nG1 X5\n`, {}, 65536);
    expect(r.moves[0]?.fileOffset).toBe(long.length + 1);
  });
});
