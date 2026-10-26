// SPDX-License-Identifier: AGPL-3.0-or-later
// One test per Klipper planner rule; each comment names the regression the test catches.
// Expected values are derived by hand from klipper@ee2c6fb (.reference/repos/klipper), cited per test.
import { describe, expect, it } from 'vitest';
import { StateKind } from '@vsslicer/gcode-api';
import type { ParsedFile, StateChange } from '@vsslicer/gcode-api';
import { klipperPlanner, planSync, resolveLimits } from '../src/index.ts';
import type { MachineLimits } from '../src/index.ts';
import { resegmentArc } from '../src/domain/arc.ts';
import type { ArcPoint } from '../src/domain/arc.ts';
import { fixture } from './harness.ts';
import type { FixtureMove } from './harness.ts';

const A = 1000; // mm/s^2
const F = 100; // mm/s

function plan(moves: FixtureMove[], override: Partial<MachineLimits> = {}, states: StateChange[] = []): number {
  const parsed: ParsedFile = fixture(moves, [[0, F]], [], 1000, states);
  const limits = resolveLimits({ flavour: 'klipper', override: { accel: A, maxVelocity: 300, ...override } });
  return planSync(klipperPlanner, parsed, limits).totalTime;
}

/** Time of one straight run of `len` mm entering at `vs`, leaving at `ve`, cruising at `v` (const accel `A`). */
function leg(len: number, vs: number, ve: number, v = F): number {
  const ramp = (v * v - vs * vs) / (2 * A) + (v * v - ve * ve) / (2 * A);
  return (v - vs) / A + (v - ve) / A + (len - ramp) / v;
}

/** `n` moves of `step` mm along a unit direction, continuing from `from`. */
function run(n: number, step: number, dx: number, dy: number, from: [number, number]): FixtureMove[] {
  return Array.from({ length: n }, (_, i) => ({ x: from[0] + dx * step * (i + 1), y: from[1] + dy * step * (i + 1) }));
}

describe('klipper rules', () => {
  // toolhead.py:66-97 (calc_junction): v^2 = R_jd * junction_deviation * accel, jd = scv^2 (sqrt2 - 1) / accel,
  // R_jd = sin(t/2) / (1 - sin(t/2)); at 90 degrees R_jd * (sqrt2 - 1) = 1 so the corner speed is exactly scv.
  it('junction at 90 degrees is taken at square_corner_velocity', () => {
    // Regression: a wrong half-angle or jd factor takes the corner at some other speed than scv.
    for (const scv of [5, 10]) {
      const t = plan(
        [
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        { squareCornerVelocity: scv },
      );
      expect(t).toBeCloseTo(leg(100, 0, scv) + leg(100, scv, 0), 9);
    }
  });

  // toolhead.py:82-86: at 180 degrees cos_theta = 1, sin_theta_d2 = 0, R_jd = 0, so max_start_v2 = 0.
  it('junction at 180 degrees is a full stop, a straight junction is not', () => {
    // Regression: a reversal that keeps scv speed (or a straight line that stops) breaks both of these.
    const stop = plan(
      [
        { x: 100, y: 0 },
        { x: 0, y: 0 },
      ],
      { squareCornerVelocity: 5 },
    );
    expect(stop).toBeCloseTo(leg(100, 0, 0) * 2, 9);
    // 0 degrees: cos_theta = -1, cos_theta_d2 = 0 skips the limit entirely (toolhead.py:85), full speed through.
    const straight = plan(
      [
        { x: 100, y: 0 },
        { x: 200, y: 0 },
      ],
      { squareCornerVelocity: 5 },
    );
    expect(straight).toBeCloseTo(leg(200, 0, 0), 9);
    expect(straight).toBeLessThan(stop);
  });

  // toolhead.py:534-537: mcr_pseudo_accel = max_accel * (1 - min_cruise_ratio); toolhead.py:149-166 caps the cruise
  // at the peak that pseudo-accel reaches: v^2 = d * a * (1 - mcr) for a lone move.
  it('minimum_cruise_ratio caps the peak of every short move of a zig-zag', () => {
    // Regression: dropping the mcr cap (or applying it to accel instead of the peak) leaves the 0.2 s triangles.
    // scv 0 makes each of the six 90 degree corners a stop, so every 10 mm leg is a lone move.
    const stairs: FixtureMove[] = [];
    for (let i = 0, x = 0, y = 0; i < 6; i++) stairs.push(i % 2 ? { x, y: (y += 10) } : { x: (x += 10), y });
    const lone = (mcr: number): number => {
      const v = Math.sqrt(10 * A * (1 - mcr));
      return (2 * v) / A + (10 - (v * v) / A) / v;
    };
    for (const mcr of [0, 0.5, 0.8]) {
      expect(plan(stairs, { squareCornerVelocity: 0, minCruiseRatio: mcr })).toBeCloseTo(6 * lone(mcr), 9);
    }
    // With corners that are not stops the cap still bites, and a higher ratio never plans faster.
    const t = [0, 0.5, 0.9].map((minCruiseRatio) => plan(stairs, { squareCornerVelocity: 20, minCruiseRatio }));
    expect(t[0]!).toBeLessThan(t[1]!);
    expect(t[1]!).toBeLessThan(t[2]!);
  });

  // toolhead.py:116 (LOOKAHEAD_FLUSH_TIME), 135-185 (lazy flush): moves are only finalised up to the point the rest
  // of the queue can no longer change, so a long straight in 1 mm moves must plan like one long move.
  it('lookahead flush on a long straight neither stops at nor speeds past a flush', () => {
    // Regression: finalising the queue as if the toolhead stopped (eager flush) adds a decel/accel per flush
    // (about every 0.15 s of moves), so 1000 moves would come out far slower than 10.1 s.
    expect(plan(run(1000, 1, 1, 0, [0, 0]))).toBeCloseTo(leg(1000, 0, 0), 6);
    // The same straight, then a 90 degree corner at scv 5, then another: both flush-spanning legs keep full speed.
    const corner = [...run(600, 1, 1, 0, [0, 0]), ...run(600, 1, 0, 1, [600, 0])];
    expect(plan(corner, { squareCornerVelocity: 5 })).toBeCloseTo(leg(600, 0, 5) + leg(600, 5, 0), 6);
  });

  // gcode_arcs.py:132-140: segments = max(1, floor(mm_of_travel / resolution)), mm_of_travel = hypot(r * angle, dz).
  describe('arc segmentation count', () => {
    /** The parser's `n` chords of a half circle of radius 10, rising `dz`, as arc.ts takes them. */
    const half = (n: number, dz = 0): ArcPoint[] =>
      Array.from({ length: n + 1 }, (_, i) => {
        const a = (Math.PI * i) / n;
        return [10 - 10 * Math.cos(a), 10 * Math.sin(a), (dz * i) / n, (i / n) * 3];
      });

    it('cuts floor(length / resolution) segments, at least one', () => {
      // Regression: ceil/round instead of floor, or a count that follows the parser's chords, changes these.
      const len = 10 * Math.PI; // 31.4159 mm
      for (const [res, count] of [
        [1, 31],
        [0.5, 62],
        [4, 7],
        [len + 1, 1],
      ] as const) {
        expect(resegmentArc(half(24), res)).toHaveLength(count);
        expect(resegmentArc(half(60), res)).toHaveLength(count); // same count at another parser tolerance
      }
    });

    it('counts the helix by hypot(arc, dz) and spreads Z and E evenly, ending on the target', () => {
      // Regression: ignoring dz in the length (flat arc length only) gives 31 instead of 50 segments.
      const pts = half(24, 40);
      const out = resegmentArc(pts, 1)!;
      expect(out).toHaveLength(Math.floor(Math.hypot(10 * Math.PI, 40)));
      expect(out.at(-1)).toBe(pts.at(-1));
      expect(out[9]![2]).toBeCloseTo((40 * 10) / out.length, 9);
      expect(out[9]![3]).toBeCloseTo((3 * 10) / out.length, 9);
    });
  });

  // Klipper has no M201/M203/M205 (grep of klippy/ finds none); only SET_VELOCITY_LIMIT / M204 set its limits.
  it('ignores M201, M203 and M205', () => {
    // Regression: a Marlin limit leaking into the Klipper path slows the corner and the straight alike.
    const moves = [
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 100, y: 100, z: 5 },
    ];
    const base = plan(moves);
    const marlin: StateChange[] = [0, 1, 2, 3].flatMap((index) => [
      { moveIndex: 0, kind: StateKind.MaxAccel, index, value: 10 },
      { moveIndex: 0, kind: StateKind.MaxFeedrate, index, value: 1 },
      { moveIndex: 0, kind: StateKind.Jerk, index, value: 0.1 },
    ]);
    marlin.push({ moveIndex: 1, kind: StateKind.JunctionDeviation, index: 0, value: 0.001 });
    expect(plan(moves, {}, marlin)).toBe(base);
    expect(plan(moves, { maxFeedrateX: 1, maxAccelX: 10, jerkX: 0, junctionDeviation: 0.001 })).toBe(base);
  });
});
