// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { MoveRole } from '@vsslicer/gcode-api';
import { constantSpeedPlanner, planSync, resolveLimits, runPlanner, TimingBuilder } from '../src/index.ts';
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
