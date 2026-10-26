// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { MOVE_STRIDE, MoveOffset } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import { constantSpeedPlanner, createKlipperPlanner, planSync, resolveLimits, trapezoidsFor } from '../src/index.ts';
import { checkPlanner } from './harness.ts';
import { randomFile, rng } from './random-file.ts';

function startTimes(parsed: ParsedFile): number[] {
  return parsed.moves.flatMap((b) => {
    const v = new DataView(b);
    return Array.from({ length: b.byteLength / MOVE_STRIDE }, (_, i) =>
      v.getFloat32(i * MOVE_STRIDE + MoveOffset.startTime, true),
    );
  });
}

describe('trapezoidsFor (Klipper)', () => {
  const limits = resolveLimits({ flavour: 'klipper' });

  for (const [seed, interval, chunk] of [
    [1, 256, 1000],
    [2, 1024, 4096],
    [3, 97, 333],
  ] as const) {
    it(`recomputes random windows exactly as the full pass (seed ${seed}, interval ${interval})`, () => {
      const planner = createKlipperPlanner({ checkpointInterval: interval });
      const parsed = randomFile(seed, 12_000, chunk);
      const n = parsed.moveCount;
      const timing = planSync(planner, parsed, limits);
      checkPlanner(planner, randomFile(seed, 12_000, chunk)); // own copy: it plans with other limits
      expect(timing.checkpoints.length).toBeGreaterThan(n / interval / 2);
      expect(timing.checkpoints.every((c) => c.state !== undefined)).toBe(true);

      // The whole file replayed from move 0 agrees bit for bit with what the full pass wrote.
      const full = trapezoidsFor(planner, parsed, timing, 0, n);
      expect(full.map((t) => t.move)).toEqual(Array.from({ length: n }, (_, i) => i));
      expect(full.map((t) => Math.fround(t.start))).toEqual(startTimes(parsed));
      for (const c of timing.checkpoints) {
        expect(full[c.move]!.start).toBe(c.time);
        expect(full[c.move]!.entry).toBe(c.speed);
      }
      for (const t of full) {
        expect(t.cruise).toBeGreaterThanOrEqual(Math.max(t.entry, t.exit) - 1e-9);
        expect(t.accel).toBeGreaterThanOrEqual(0);
      }

      const r = rng(seed * 7919);
      for (let k = 0; k < 60; k++) {
        const start = Math.floor(r() * n);
        const end = Math.min(n, start + 1 + Math.floor(r() * 2 * interval));
        expect(trapezoidsFor(planner, parsed, timing, start, end)).toEqual(full.slice(start, end));
      }
      // The edges: the last move, windows at a checkpoint, past the end.
      expect(trapezoidsFor(planner, parsed, timing, n - 1, n + 10)).toEqual(full.slice(n - 1));
      const cp = timing.checkpoints.at(-1)!.move;
      expect(trapezoidsFor(planner, parsed, timing, cp, cp + 5)).toEqual(full.slice(cp, cp + 5));
      expect(trapezoidsFor(planner, parsed, timing, 5, 5)).toEqual([]);
    });
  }

  it('leaves the checkpoints untouched, so a window can be recomputed twice', () => {
    const planner = createKlipperPlanner({ checkpointInterval: 128 });
    const parsed = randomFile(9, 2000, 500);
    const timing = planSync(planner, parsed, limits);
    const a = trapezoidsFor(planner, parsed, timing, 700, 900);
    expect(trapezoidsFor(planner, parsed, timing, 700, 900)).toEqual(a);
  });

  it('refuses a planner that keeps no snapshots, or another planner than the timing', () => {
    const parsed = randomFile(4, 100);
    const timing = planSync(constantSpeedPlanner, parsed, limits);
    expect(() => trapezoidsFor(constantSpeedPlanner, parsed, timing, 0, 10)).toThrow('cannot resume');
    expect(() => trapezoidsFor(createKlipperPlanner(), parsed, timing, 0, 10)).toThrow('not klipper');
  });
});
