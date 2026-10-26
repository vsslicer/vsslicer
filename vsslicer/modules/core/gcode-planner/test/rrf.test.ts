// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { MOVE_STRIDE, MoveFlag, MoveOffset, StateKind } from '@vsslicer/gcode-api';
import type { ParsedFile, StateChange } from '@vsslicer/gcode-api';
import { FLAVOUR_DEFAULTS, FLAVOUR_FIELDS, planSync, plannerFor, resolveLimits, rrfPlanner } from '../src/index.ts';
import type { MachineLimits } from '../src/index.ts';
import { checkDwell, checkLimitPrecedence, checkPlanner, fixture } from './harness.ts';
import type { FixtureMove } from './harness.ts';

const T = MoveFlag.Travel;
const set = (kind: StateKind, value: number, index = 0): StateChange => ({ moveIndex: 0, kind, index, value });

/** One-buffer file; moves with the same `arc` id share a fileOffset. F is 100 unless `states` sets it. */
function file(moves: (FixtureMove & { arc?: number })[], states: StateChange[] = [], f = 100): ParsedFile {
  const parsed = fixture(moves, [[0, f]], [], 10_000, states);
  const v = new DataView(parsed.moves[0]!);
  moves.forEach((m, i) => {
    if (m.arc !== undefined) v.setUint32(i * MOVE_STRIDE + MoveOffset.fileOffset, 1_000_000 + m.arc, true);
  });
  return parsed;
}

const time = (parsed: ParsedFile, override: Partial<MachineLimits> = {}) =>
  planSync(rrfPlanner, parsed, resolveLimits({ flavour: 'reprapfirmware', override })).totalTime;

/** Seconds for a trapezoid vIn -> f -> vOut over d mm at accel a (f is reached). */
const leg = (vIn: number, vOut: number, f: number, a: number, d: number) =>
  (f - vIn) / a + (f - vOut) / a + (d - (f * f - vIn * vIn) / (2 * a) - (f * f - vOut * vOut) / (2 * a)) / f;

describe('rrfPlanner', () => {
  it('passes the planner contract and dwell', () => {
    checkPlanner(rrfPlanner);
    checkDwell(rrfPlanner);
    checkLimitPrecedence(rrfPlanner, {
      flavour: 'reprapfirmware',
      key: 'maxFeedrateX',
      kind: StateKind.MaxFeedrate,
      values: [20, 40],
    });
  });

  it('has RRF defaults and is the planner for the flavour', () => {
    const d = FLAVOUR_DEFAULTS.reprapfirmware;
    expect([
      d.maxFeedrateX,
      d.maxFeedrateZ,
      d.maxAccelX,
      d.maxAccelE,
      d.jerkX,
      d.jerkE,
      d.accelPrint,
      d.minFeedrate,
    ]).toEqual([100, 20, 1000, 500, 15, 5, 50000, 0.5]);
    expect(FLAVOUR_FIELDS.reprapfirmware).toContain('minFeedrate');
    const limits = resolveLimits({ flavour: 'reprapfirmware' });
    expect(plannerFor(file([{ x: 1, y: 0 }]), limits)).toBe(rrfPlanner);
    expect(rrfPlanner.estimate).toBe(true);
  });

  it('times a trapezoid and a triangle', () => {
    expect(time(file([{ x: 100, y: 0, flags: T }]))).toBeCloseTo(1.1, 9);
    expect(time(file([{ x: 4, y: 0, flags: T }]))).toBeCloseTo((2 * Math.sqrt(4000)) / 1000, 9);
  });

  it('honours M201, M203 and M204 (P, T, S)', () => {
    const travel = [{ x: 100, y: 0, flags: T }];
    const print = [{ x: 100, y: 0, e: 1 }];
    expect(time(file(travel, [set(StateKind.MaxAccel, 500)]))).toBeCloseTo(1.2, 9);
    expect(time(file(travel, [set(StateKind.MaxFeedrate, 50)]))).toBeCloseTo(2.05, 9);
    expect(time(file(print, [set(StateKind.AccelPrint, 500)]))).toBeCloseTo(1.2, 9);
    expect(time(file(travel, [set(StateKind.AccelPrint, 500)]))).toBeCloseTo(1.1, 9);
    expect(time(file(travel, [set(StateKind.AccelTravel, 500)]))).toBeCloseTo(1.2, 9);
    expect(time(file(travel, [set(StateKind.Accel, 500)]))).toBeCloseTo(1.2, 9);
    expect(time(file(print, [set(StateKind.Accel, 500), set(StateKind.AccelPrint, 2000)]))).toBeCloseTo(1.1, 9);
  });

  it('raises a feedrate below the minimum to minFeedrate', () => {
    const a = 1000;
    const v = 0.5;
    const expected = leg(0, 0, v, a, 1);
    expect(time(file([{ x: 1, y: 0, flags: T }], [], 0.1))).toBeCloseTo(expected, 9);
  });

  it('stops at a print/travel boundary and cruises through collinear moves', () => {
    expect(
      time(
        file([
          { x: 50, y: 0, e: 1 },
          { x: 100, y: 0, flags: T },
        ]),
      ),
    ).toBeCloseTo(1.2, 9);
    expect(
      time(
        file([
          { x: 50, y: 0, e: 1 },
          { x: 100, y: 0, e: 1 },
        ]),
      ),
    ).toBeCloseTo(1.1, 9);
  });

  it('limits a corner by the per-drive jerk (M566 X900 Y900 = 15 mm/s)', () => {
    const corner = file(
      [
        { x: 50, y: 0, e: 1 },
        { x: 50, y: 50, e: 1 },
      ],
      [set(StateKind.Jerk, 15, 0), set(StateKind.Jerk, 15, 1)],
    );
    expect(time(corner)).toBeCloseTo(2 * leg(0, 15, 100, 1000, 50), 9);
  });

  it('caps extruder accel at jerkE / PA on XY moves', () => {
    const print = [{ x: 100, y: 0, e: 50 }];
    expect(time(file(print))).toBeCloseTo(1.1, 9);
    // E accel 5 / 0.05 = 100, u_E = 0.5, so the move accelerates at 200.
    expect(time(file(print, [set(StateKind.PressureAdvance, 0.05)]))).toBeCloseTo(1.5, 6);
  });

  it('commits moves past the 40-move window without changing a straight run', () => {
    const moves = Array.from({ length: 100 }, (_, i) => ({ x: i + 1, y: 0, e: 0.1 }));
    expect(time(file(moves))).toBeCloseTo(1.1, 6);
  });

  it('scales an arc chord turn to RRF segments (r=5, F=100: not capped by jerk)', () => {
    const c = 2 * 5 * Math.sin(Math.PI / 24);
    const h = Math.PI / 24; // half of a 15 degree chord turn
    const chords = (flags: number) => {
      const p1 = { x: c * Math.cos(h), y: c * Math.sin(h) };
      return [
        { ...p1, e: 0.1, flags, arc: 1 },
        { x: p1.x + c * Math.cos(h), y: p1.y - c * Math.sin(h), e: 0.1, flags, arc: 1 },
      ];
    };
    const big = { maxAccelX: 100000, maxAccelY: 100000, maxAccelE: 1e6, accelPrint: 100000 };
    const a = 100000 / Math.cos(h);
    expect(time(file(chords(MoveFlag.Arc)), big)).toBeCloseTo(2 * leg(0, 100, 100, a, c), 4);
    expect(time(file(chords(0)), big)).toBeCloseTo(2 * leg(0, 15 / (2 * Math.sin(h)), 100, a, c), 4);
  });
});
