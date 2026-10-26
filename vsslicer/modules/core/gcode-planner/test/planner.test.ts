// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { MoveRole } from '@vsslicer/gcode-api';
import {
  bambuPlanner,
  buddyPlanner,
  constantSpeedPlanner,
  klipperPlanner,
  marlinPlanner,
  planSync,
  rrfPlanner,
  resolveLimits,
  runPlanner,
  TimingBuilder,
} from '../src/index.ts';
import type { PlanProgress } from '../src/index.ts';
import { checkPlanner, fixture, sampleFile } from './harness.ts';

describe('constant-speed planner', () => {
  it('passes the planner harness', () => {
    checkPlanner(constantSpeedPlanner);
  });

  it('times each move at its feedrate and fills the tables', () => {
    const t = checkPlanner(constantSpeedPlanner);
    expect(t.estimate).toBe(true);
    expect(t.totalTime).toBeCloseTo(1.65, 6);
    expect(t.travelTime).toBeCloseTo(0.11, 6);
    expect(t.roleTimes[MoveRole.Perimeter]).toBeCloseTo(0.79, 6);
    expect(t.roleTimes[MoveRole.InternalInfill]).toBeCloseTo(0.75, 6);
    expect(Array.from(t.layerTimes)).toEqual([expect.closeTo(1.04, 6), expect.closeTo(0.51, 6)]);
    expect(t.checkpoints).toEqual([{ move: 0, time: 0, speed: 100 }]);
  });

  it('gives the same result whatever the chunking', () => {
    const a = planSync(constantSpeedPlanner, sampleFile(1), resolveLimits({}));
    const b = planSync(constantSpeedPlanner, sampleFile(100), resolveLimits({}));
    expect(a.totalTime).toBeCloseTo(b.totalTime, 12);
    expect(a.layerTimes).toEqual(b.layerTimes);
  });
});

describe('TimingBuilder checkpoints', () => {
  it('takes one every interval moves with the f64 start time', () => {
    const parsed = sampleFile();
    const b = new TimingBuilder(parsed, 3);
    for (let i = 0; i < parsed.moveCount; i++) b.add(0.1, i);
    const t = b.finish('test', false, resolveLimits({}));
    expect(t.checkpoints.map((c) => [c.move, c.speed])).toEqual([
      [0, 0],
      [3, 3],
      [6, 6],
    ]);
    expect(t.checkpoints[2]!.time).toBeCloseTo(0.6, 12);
  });
});

describe('runPlanner', () => {
  const many = () =>
    fixture(
      Array.from({ length: 20 }, (_, i) => ({ x: i + 1, y: 0, e: 0.1 })),
      [[0, 10]],
      [{ z: 0, firstMove: 0 }],
      4,
    );

  it('reports progress per buffer and resolves to the same Timing as planSync', async () => {
    const seen: PlanProgress[] = [];
    const t = await runPlanner(constantSpeedPlanner, many(), resolveLimits({}), { onProgress: (p) => seen.push(p) });
    expect(seen.map((p) => p.movesDone)).toEqual([4, 8, 12, 16, 20, 20]);
    expect(seen.every((p) => p.moveCount === 20)).toBe(true);
    expect(t.totalTime).toBeCloseTo(planSync(constantSpeedPlanner, many(), resolveLimits({})).totalTime, 12);
  });

  it('stops when aborted mid-run', async () => {
    const ac = new AbortController();
    const run = runPlanner(constantSpeedPlanner, many(), resolveLimits({}), {
      signal: ac.signal,
      onProgress: (p) => p.movesDone >= 8 && ac.abort(new Error('cancelled')),
    });
    await expect(run).rejects.toThrow('cancelled');
  });

  it('rejects at once on an aborted signal', async () => {
    await expect(
      runPlanner(constantSpeedPlanner, many(), resolveLimits({}), { signal: AbortSignal.abort() }),
    ).rejects.toThrow();
  });
});

describe('G4 in a file with no moves', () => {
  it('counts in totalTime for every planner', () => {
    const parsed = fixture([], [], []);
    parsed.markers = [{ name: 'G4', fileOffset: 0, moveIndex: 0, seconds: 30 }];
    const planners = [klipperPlanner, marlinPlanner, rrfPlanner, buddyPlanner, constantSpeedPlanner, bambuPlanner];
    for (const p of planners)
      expect([p.name, planSync(p, parsed, resolveLimits({ flavour: 'marlin' })).totalTime]).toEqual([p.name, 30]);
  });
});

describe('constant-speed G4 lookup', () => {
  const build = (n: number, dwells: number) => {
    const parsed = fixture(
      Array.from({ length: n }, (_, i) => ({ x: i % 100, y: 0 })),
      [],
      [],
      1000,
    );
    const list = Array.from({ length: dwells }, (_, i) => ({
      name: 'G4',
      fileOffset: i,
      moveIndex: i * 15,
      seconds: 1,
    }));
    let reads = 0; // element reads of the markers array: a per-move scan makes this moves x markers
    parsed.markers = new Proxy(list, {
      get(t, k, r) {
        if (typeof k === 'string' && /^\d+$/.test(k)) reads++;
        return Reflect.get(t, k, r);
      },
    });
    const timing = planSync(constantSpeedPlanner, parsed, resolveLimits({ flavour: 'marlin' }));
    return { reads, timing };
  };

  it('reads each marker a bounded number of times, and scales with the input (operation count)', () => {
    const small = build(3_000, 200);
    const big = build(6_000, 400); // both inputs doubled: linear work doubles, quadratic work quadruples
    expect(small.reads).toBeLessThanOrEqual(4 * 200);
    expect(big.reads).toBeLessThanOrEqual(4 * 400);
    expect(big.reads / small.reads).toBeLessThanOrEqual(2.5);
    expect(big.timing.totalTime).toBeGreaterThan(400);
  });

  // Hang guard only: the timeout fails a planner that never returns; nothing here asserts how long it took.
  it('finishes a 300k-move file with 20k dwells', { timeout: 60_000 }, () => {
    const { timing } = build(300_000, 20_000);
    expect(timing.totalTime).toBeGreaterThan(20_000);
  });
});
