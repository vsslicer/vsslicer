// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import {
  MOVE_STRIDE,
  MoveFlag,
  MoveOffset,
  STATE_CHANGE_STRIDE,
  StateKind,
  writeStateChange,
} from '@vsslicer/gcode-api';
import type { ParsedFile, StateChange } from '@vsslicer/gcode-api';
import {
  buddyArcSegments,
  buddyPlanner,
  marlinArcSegments,
  marlinPlanner,
  planSync,
  resolveLimits,
} from '../src/index.ts';
import type { MachineLimits, Planner } from '../src/index.ts';
import { checkPlanner, fixture, sampleFile } from './harness.ts';
import type { FixtureMove } from './harness.ts';

/** One-buffer file with the state-change table `changes`; moves with the same `arc` id share a fileOffset. */
function file(moves: (FixtureMove & { arc?: number })[], changes: StateChange[]): ParsedFile {
  const parsed = fixture(moves, [], [], 10_000);
  const v = new DataView(parsed.moves[0]!);
  moves.forEach((m, i) => {
    if (m.arc !== undefined) v.setUint32(i * MOVE_STRIDE + MoveOffset.fileOffset, 1_000_000 + m.arc, true);
  });
  const sorted = [...changes].sort((a, b) => a.moveIndex - b.moveIndex);
  const sc = new ArrayBuffer(sorted.length * STATE_CHANGE_STRIDE);
  sorted.forEach((c, i) => writeStateChange(new DataView(sc), i, c));
  parsed.stateChanges = [sc];
  return parsed;
}

const set = (kind: StateKind, value: number, index = 0): StateChange => ({ moveIndex: 0, kind, index, value });
const F100 = set(StateKind.Feedrate, 100);
const A1000 = { accelPrint: 1000, accelTravel: 1000, accelRetract: 1000 };

function run(parsed: ParsedFile, override: Partial<MachineLimits> = {}, planner: Planner = marlinPlanner) {
  return planSync(planner, parsed, resolveLimits({ flavour: 'marlin', override: { ...A1000, ...override } }));
}

/** Seconds for one trapezoid: vIn -> f -> vOut over d mm at accel a (assumes f is reached). */
const leg = (vIn: number, vOut: number, f: number, a: number, d: number) => {
  const da = (f * f - vIn * vIn) / (2 * a);
  const dd = (f * f - vOut * vOut) / (2 * a);
  return (f - vIn) / a + (d - da - dd) / f + (f - vOut) / a;
};

/** n chords of a CCW arc of `turn` radians, radius r, centred on (r, 0) and starting at the origin. */
function arcMoves(n: number, r: number, turn: number, flags = MoveFlag.Arc): (FixtureMove & { arc: number })[] {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.PI + (turn * (i + 1)) / n;
    return { x: r + r * Math.cos(a), y: -r * Math.sin(a), flags, arc: 1 };
  });
}

describe('marlin planner', () => {
  it('passes the planner harness, both variants', () => {
    expect(checkPlanner(marlinPlanner).estimate).toBe(false);
    expect(checkPlanner(buddyPlanner).planner).toBe('prusa-buddy');
  });

  it('gives the same result whatever the chunking', () => {
    const limits = resolveLimits({ flavour: 'marlin' });
    const a = planSync(marlinPlanner, sampleFile(1), limits);
    expect(a.totalTime).toBeCloseTo(planSync(marlinPlanner, sampleFile(100), limits).totalTime, 12);
  });

  it('times a single move as a trapezoid', () => {
    expect(run(file([{ x: 100, y: 0 }], [F100])).totalTime).toBeCloseTo(1.1, 6);
  });

  describe('junctions', () => {
    const two = (x: number, y: number) =>
      file(
        [
          { x: 100, y: 0 },
          { x, y },
        ],
        [F100],
      );

    it('runs a straight continuation without slowing', () => {
      expect(run(two(200, 0)).totalTime).toBeCloseTo(2.1, 6);
    });

    it('stops at a reversal', () => {
      expect(run(two(0, 0)).totalTime).toBeCloseTo(2.2, 6);
    });

    it('takes a 90 degree corner at the junction-deviation speed', () => {
      // v^2 = a * jd * sin(theta/2) / (1 - sin(theta/2)), theta/2 = 45 deg (planner.cpp:2550)
      const s = Math.SQRT1_2;
      const v = Math.sqrt((1000 * 0.013 * s) / (1 - s));
      expect(run(two(100, 100)).totalTime).toBeCloseTo(2 * leg(0, v, 100, 1000, 100), 5);
    });

    it('takes a 90 degree corner at the classic-jerk speed when JD is 0', () => {
      // Starts, corners and stops at the 10 mm/s jerk speed.
      const t = run(two(100, 100), { junctionDeviation: 0, jerkX: 10, jerkY: 10 }).totalTime;
      expect(t).toBeCloseTo(2 * leg(10, 10, 100, 1000, 100), 5);
    });

    it('reads M205 J from the file', () => {
      const slow = run(
        file(
          [
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ],
          [F100, set(StateKind.JunctionDeviation, 0.001)],
        ),
      );
      expect(slow.totalTime).toBeGreaterThan(run(two(100, 100)).totalTime);
    });
  });

  describe('lookahead', () => {
    const line = (n: number, step: number) =>
      file(
        Array.from({ length: n }, (_, i) => ({ x: (i + 1) * step, y: 0 })),
        [F100],
      );

    it('plans long segments like one move', () => {
      // 10 x 10 mm: a 160 mm window is enough to reach 100 mm/s at 100 mm/s^2 and stop again.
      const a = { accelTravel: 100 };
      expect(run(line(10, 10), a).totalTime).toBeCloseTo(run(line(1, 100), a).totalTime, 4);
    });

    it('caps speed to what the 16-block window can stop from', () => {
      // 100 x 1 mm at 100 mm/s^2: the window is 16 mm, so v <= sqrt(2 * 100 * 16) = 56.6 mm/s.
      const t = run(line(100, 1), { accelTravel: 100 }).totalTime;
      expect(t).toBeGreaterThan(100 / Math.sqrt(2 * 100 * 16));
      expect(t).toBeGreaterThan(run(line(1, 100), { accelTravel: 100 }).totalTime + 0.1);
    });
  });

  describe('linear advance accel cap', () => {
    const print = (e: number, k?: number) =>
      file([{ x: 100, y: 0, e }], [F100, ...(k === undefined ? [] : [set(StateKind.PressureAdvance, k)])]);

    it('leaves accel alone without M900 K', () => {
      expect(run(print(4)).totalTime).toBeCloseTo(1.1, 6);
    });

    it('caps accel to max_e_jerk / (K * e/D)', () => {
      // max_e_jerk = sqrt(jd * sqrt(.5) / (1 - sqrt(.5)) * max_accel_e) (planner.h:1155-1159)
      const s = Math.SQRT1_2;
      const accel = Math.sqrt(((0.013 * s) / (1 - s)) * 10_000) / (1 * 0.04);
      expect(accel).toBeLessThan(1000);
      expect(run(print(4, 1)).totalTime).toBeCloseTo(leg(0, 0, 100, accel, 100), 5);
    });

    it('skips moves with e/D above 3', () => {
      expect(run(print(400, 1), { maxFeedrateE: 0 }).totalTime).toBeCloseTo(1.1, 6);
    });
  });

  describe('arc segmentation', () => {
    it('counts Marlin segments: 1 mm long, at least 72 per circle, at least 0.1 mm', () => {
      expect(marlinArcSegments((Math.PI / 2) * 10, 10, Math.PI / 2, 100)).toBe(18);
      expect(marlinArcSegments(2 * Math.PI * 10, 10, 2 * Math.PI, 100)).toBe(72);
      expect(marlinArcSegments((Math.PI / 2) * 100, 100, Math.PI / 2, 100)).toBe(158);
      expect(marlinArcSegments(2 * Math.PI * 0.5, 0.5, 2 * Math.PI, 100)).toBe(31);
    });

    it('counts Buddy segments from deviation and feedrate', () => {
      // segment = clamp(min(sqrt(8 * 10 * 0.02), 100 / 50), 0.1, 2) = 1.265 mm
      expect(buddyArcSegments((Math.PI / 2) * 10, 10, Math.PI / 2, 100)).toBe(13);
      expect(buddyArcSegments((Math.PI / 2) * 10, 10, Math.PI / 2, 20)).toBe(40);
    });

    it("re-segments the parser's chords the firmware's way", () => {
      for (const planner of [marlinPlanner, buddyPlanner]) {
        const coarse = run(file(arcMoves(8, 10, Math.PI / 2), [F100]), {}, planner);
        const fine = run(file(arcMoves(32, 10, Math.PI / 2), [F100]), {}, planner);
        expect(coarse.totalTime).toBeCloseTo(fine.totalTime, 4);
        const lines = run(file(arcMoves(8, 10, Math.PI / 2, 0), [F100]), {}, planner);
        expect(Math.abs(lines.totalTime - coarse.totalTime)).toBeGreaterThan(1e-3);
      }
    });

    it('keeps chord start times in order inside an arc', () => {
      const parsed = file([{ x: -5, y: 0 }, ...arcMoves(12, 10, Math.PI * 1.5), { x: 0, y: 30 }], [F100]);
      checkPlanner(marlinPlanner, parsed);
    });
  });
});
