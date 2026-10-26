// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { bambuPlanner, buddyPlanner, marlinPlanner, plannerFor, planSync, resolveLimits } from '../src/index.ts';
import type { BambuTiming } from '../src/index.ts';
import { checkPlanner, sampleFile } from './harness.ts';

const withMarkers = (names: [string, number][]) => ({
  ...sampleFile(),
  slicer: 'bambustudio' as const,
  markers: names.map(([name, moveIndex]) => ({ name, moveIndex, fileOffset: 0 })),
});

describe('bambu planner', () => {
  it('passes the planner harness and is an estimate', () => {
    expect(checkPlanner(bambuPlanner).estimate).toBe(true);
  });

  it('times like Marlin, labelled bambu', () => {
    const f = sampleFile();
    const a = planSync(marlinPlanner, f, resolveLimits({}));
    const b = planSync(bambuPlanner, sampleFile(), resolveLimits({})) as BambuTiming;
    expect(b.totalTime).toBeCloseTo(a.totalTime, 9);
    expect(a.estimate).toBe(false);
    expect([b.planner, b.estimate]).toEqual(['bambu', true]);
  });

  it('treats M622/M623 blocks as executed and flags them', () => {
    const f = withMarkers([
      ['M622', 1],
      ['M623', 3],
      ['M622', 4],
    ]);
    const t = planSync(bambuPlanner, f, resolveLimits({})) as BambuTiming;
    expect(t.conditionalBlocks).toEqual([
      { firstMove: 1, endMove: 3 },
      { firstMove: 4, endMove: f.moveCount },
    ]);
    expect(planSync(bambuPlanner, sampleFile(), resolveLimits({})).totalTime).toBeCloseTo(t.totalTime, 9);
  });

  it('records where the limits came from', () => {
    const src = (config: Record<string, string>) =>
      (planSync(bambuPlanner, sampleFile(), resolveLimits({ config })) as BambuTiming).limitsSource;
    expect(src({})).toBe('default');
    expect(src({ machine_max_acceleration_x: '20000' })).toBe('mixed');
    const all = Object.fromEntries(
      ['x', 'y', 'z', 'e']
        .flatMap((a) => [
          [`machine_max_feedrate_${a}`, '300'],
          [`machine_max_acceleration_${a}`, '5000'],
          [`machine_max_jerk_${a}`, '9'],
        ])
        .concat([
          ['machine_max_acceleration_extruding', '5000'],
          ['machine_max_acceleration_retracting', '5000'],
          ['machine_max_acceleration_travel', '5000'],
          ['machine_max_junction_deviation', '0'],
          ['machine_min_extruding_rate', '0'],
          ['machine_min_travel_rate', '0'],
        ]),
    );
    expect(src(all)).toBe('profile');
  });
});

describe('plannerFor', () => {
  it('routes Bambu files to the estimate, others by flavour', () => {
    const l = resolveLimits({});
    expect(plannerFor(withMarkers([]), l)).toBe(bambuPlanner);
    expect(plannerFor(withMarkers([]), resolveLimits({ flavour: 'klipper' })).name).toBe(bambuPlanner.name);
    expect(plannerFor({ ...sampleFile(), markers: [{ name: 'M622', moveIndex: 0, fileOffset: 0 }] }, l)).toBe(
      bambuPlanner,
    );
    expect(plannerFor(sampleFile(), l)).toBe(marlinPlanner);
    expect(plannerFor(sampleFile(), resolveLimits({ flavour: 'klipper' })).name).toBe('klipper');
    expect(plannerFor(sampleFile(), l)).not.toBe(buddyPlanner);
  });
});
