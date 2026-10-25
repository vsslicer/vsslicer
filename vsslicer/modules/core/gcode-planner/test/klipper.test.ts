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
import { createKlipperPlanner, klipperPlanner, planSync, resolveLimits } from '../src/index.ts';
import type { MachineLimits, Planner } from '../src/index.ts';
import { checkLimitPrecedence, checkPlanner, fixture, sampleFile } from './harness.ts';
import type { FixtureMove } from './harness.ts';

/** One-buffer file whose state-change table is `changes` (sorted by move). */
function file(moves: FixtureMove[], changes: StateChange[]): ParsedFile {
  const parsed = fixture(moves, [], [], 1000);
  const sorted = [...changes].sort((a, b) => a.moveIndex - b.moveIndex);
  const sc = new ArrayBuffer(sorted.length * STATE_CHANGE_STRIDE);
  sorted.forEach((c, i) => writeStateChange(new DataView(sc), i, c));
  parsed.stateChanges = [sc];
  return parsed;
}

const feed = (moveIndex: number, value: number): StateChange => ({
  moveIndex,
  kind: StateKind.Feedrate,
  index: 0,
  value,
});

function run(parsed: ParsedFile, override: Partial<MachineLimits> = {}, planner: Planner = klipperPlanner) {
  const limits = resolveLimits({ flavour: 'klipper', override: { accel: 1000, maxVelocity: 300, ...override } });
  // accel and max_velocity stand in for printer.cfg, so the file's SET_VELOCITY_LIMIT / M204 still win.
  for (const k of ['accel', 'maxVelocity'] as const) if (!(k in override)) limits.sources[k] = 'config';
  return planSync(planner, parsed, limits);
}

function startTimes(parsed: ParsedFile): number[] {
  const v = new DataView(parsed.moves[0]!);
  return Array.from({ length: parsed.moveCount }, (_, i) => v.getFloat32(i * MOVE_STRIDE + MoveOffset.startTime, true));
}

const corner = (): ParsedFile =>
  file(
    [
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ],
    [feed(0, 100)],
  );

describe('klipper planner', () => {
  it('passes the planner harness', () => {
    expect(checkPlanner(klipperPlanner).estimate).toBe(false);
  });

  it('ranks override > SET_VELOCITY_LIMIT / M204 > config', () => {
    const p = klipperPlanner;
    checkLimitPrecedence(p, { flavour: 'klipper', key: 'maxVelocity', kind: StateKind.MaxVelocity, values: [50, 100] });
    checkLimitPrecedence(p, { flavour: 'klipper', key: 'accel', kind: StateKind.Accel, values: [200, 800] });
  });

  it('times a single move as a constant-accel trapezoid', () => {
    // 0 -> 100 mm/s over 5 mm (0.1 s), 90 mm cruise (0.9 s), 5 mm decel (0.1 s)
    expect(run(file([{ x: 100, y: 0 }], [feed(0, 100)])).totalTime).toBeCloseTo(1.1, 9);
  });

  it('caps the peak of a short move by minimum_cruise_ratio', () => {
    const short = (): ParsedFile => file([{ x: 10, y: 0 }], [feed(0, 200)]);
    expect(run(short(), { minCruiseRatio: 0 }).totalTime).toBeCloseTo(0.2, 9);
    // peak v^2 = d * a * (1 - 0.5) = 5000: 2.5 mm accel, 5 mm cruise, 2.5 mm decel
    const v = Math.sqrt(5000);
    expect(run(short(), { minCruiseRatio: 0.5 }).totalTime).toBeCloseTo((2 * 2.5) / (v / 2) + 5 / v, 9);
  });

  it('takes a 90 degree corner at square_corner_velocity', () => {
    // each leg: 0.1 s up to 100 mm/s, decel 100 -> 5 over 4.9875 mm, cruise the rest
    const leg = 0.1 + 4.9875 / 52.5 + (100 - 5 - 4.9875) / 100;
    expect(run(corner(), { squareCornerVelocity: 5 }).totalTime).toBeCloseTo(2 * leg, 9);
    expect(run(corner(), { squareCornerVelocity: 0 }).totalTime).toBeCloseTo(2.2, 9);
  });

  it('flushes a long run lazily with the same result as one long move', () => {
    const moves = Array.from({ length: 200 }, (_, i) => ({ x: (i + 1) * 0.5, y: 0 }));
    const parsed = fixture(moves, [[0, 100]], [], 7);
    expect(
      planSync(klipperPlanner, parsed, resolveLimits({ flavour: 'klipper', override: { accel: 1000 } })).totalTime,
    ).toBeCloseTo(1.1, 6);
  });

  it('gives the same result whatever the chunking', () => {
    const limits = resolveLimits({ flavour: 'klipper' });
    const a = planSync(klipperPlanner, sampleFile(1), limits);
    const b = planSync(klipperPlanner, sampleFile(100), limits);
    expect(a.totalTime).toBeCloseTo(b.totalTime, 12);
    expect(a.layerTimes).toEqual(b.layerTimes);
  });

  it('applies SET_VELOCITY_LIMIT VELOCITY and ACCEL to later moves', () => {
    const one = (changes: StateChange[]): number => run(file([{ x: 100, y: 0 }], [feed(0, 100), ...changes])).totalTime;
    // 0 -> 50 mm/s over 1.25 mm twice, 97.5 mm at 50 mm/s
    expect(one([{ moveIndex: 0, kind: StateKind.MaxVelocity, index: 0, value: 50 }])).toBeCloseTo(0.1 + 1.95, 9);
    // accel 2000: 2.5 mm, 0.05 s each side
    expect(one([{ moveIndex: 0, kind: StateKind.Accel, index: 0, value: 2000 }])).toBeCloseTo(0.1 + 0.95, 9);
    // M204 P T: Klipper takes the lower one
    expect(
      one([
        { moveIndex: 0, kind: StateKind.AccelPrint, index: 0, value: 2000 },
        { moveIndex: 0, kind: StateKind.AccelTravel, index: 0, value: 5000 },
      ]),
    ).toBeCloseTo(0.1 + 0.95, 9);
  });

  it('ignores M201, M203 and M205 and Marlin limits', () => {
    const base = run(corner()).totalTime;
    const marlin: StateChange[] = [0, 1, 2, 3].flatMap((index) => [
      { moveIndex: 0, kind: StateKind.MaxAccel, index, value: 10 },
      { moveIndex: 0, kind: StateKind.MaxFeedrate, index, value: 1 },
      { moveIndex: 0, kind: StateKind.Jerk, index, value: 0.1 },
    ]);
    marlin.push({ moveIndex: 1, kind: StateKind.JunctionDeviation, index: 0, value: 0.001 });
    expect(
      run(
        file(
          [
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ],
          [feed(0, 100), ...marlin],
        ),
      ).totalTime,
    ).toBe(base);
    expect(
      run(corner(), { maxFeedrateX: 1, maxAccelX: 10, jerkX: 0, junctionDeviation: 0.001, accelPrint: 10 }).totalTime,
    ).toBe(base);
  });

  it('runs G10/G11 as firmware retraction moves', () => {
    const R = MoveFlag.Retract;
    const U = MoveFlag.Unretract;
    const moves = [
      { x: 0, y: 0, flags: R },
      { x: 0, y: 0, flags: R },
      { x: 0, y: 0, flags: U },
    ];
    expect(run(file(moves, [])).totalTime).toBe(0); // retract_length 0 by default
    const fw = createKlipperPlanner({
      retractLength: 1,
      retractSpeed: 20,
      unretractSpeed: 10,
      maxExtrudeOnlyAccel: 400,
    });
    // 1 mm at 20 mm/s, accel 400: 0.5 mm up, 0.5 mm down = 0.1 s; the second G10 is a no-op; 1 mm at 10 mm/s
    const t = run(file(moves, []), {}, fw).totalTime;
    expect(t).toBeCloseTo(0.1 + 2 * (10 / 400) + (1 - 2 * (100 / 800)) / 10, 9);
  });

  it('adds ESTIMATOR_ADD_TIME and stops at it', () => {
    const p = createKlipperPlanner({ addTime: [{ moveIndex: 1, seconds: 30 }] });
    const parsed = file(
      [
        { x: 100, y: 0 },
        { x: 200, y: 0 },
      ],
      [feed(0, 100)],
    );
    const t = run(parsed, {}, p);
    expect(t.totalTime).toBeCloseTo(30 + 2.2, 9);
    expect(startTimes(parsed)[1]).toBeCloseTo(31.1, 4);
  });

  it('stops at G4 and M400', () => {
    const parsed = file(
      [
        { x: 100, y: 0 },
        { x: 200, y: 0 },
      ],
      [feed(0, 100)],
    );
    expect(run(parsed).totalTime).toBeCloseTo(2.1, 9);
    parsed.markers.push({ name: 'G4', fileOffset: 0, moveIndex: 1 });
    expect(run(parsed).totalTime).toBeCloseTo(2.2, 9);
  });
});
