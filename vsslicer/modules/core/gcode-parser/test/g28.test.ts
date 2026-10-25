// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { run } from './support/run.ts';

const xyz = (r: { moves: { x: number; y: number; z: number }[] }): number[][] => r.moves.map((m) => [m.x, m.y, m.z]);

describe('G28 homing', () => {
  it('resets the position, so a relative move after homing starts from 0', async () => {
    const r = await run('G1 X50\nG28\nG91\nG1 X10\n');
    expect(r.moves.at(-1)!.x).toBe(10);
  });
  it('G28 X resets only X', async () => {
    const r = await run('G1 X50 Y20 Z5\nG28 X\nG91\nG1 X1 Y1 Z1\n');
    expect(xyz(r).at(-1)).toEqual([1, 21, 6]);
  });
  it('bare G28, and G28 with only non-axis words (Prusa W), reset X, Y and Z', async () => {
    for (const home of ['G28', 'G28 W', 'g28 O']) {
      const r = await run(`G1 X50 Y20 Z5\n${home}\nG91\nG1 X1 Y1 Z1\n`);
      expect(xyz(r).at(-1)).toEqual([1, 1, 1]);
    }
  });
  it('clears the G92 origin of the homed axes only', async () => {
    const r = await run('G1 X10 Y10\nG92 X0 Y0\nG28 X\nG1 X5 Y5\n');
    // X origin cleared: absolute X5 is machine 5; Y keeps its offset (10): machine 15
    expect(xyz(r).at(-1)).toEqual([5, 15, 0]);
    const all = await run('G1 X10 Y10 Z4\nG92 X0 Y0 Z0\nG28\nG1 X5 Y5 Z5\n');
    expect(xyz(all).at(-1)).toEqual([5, 5, 5]);
  });
  it('leaves E alone and still records the marker', async () => {
    const r = await run('M82\nG1 X1 E5\nG28\nG1 X2 E7\n');
    expect(r.e).toEqual([5, 2]);
    expect(r.markers.map((m) => m.name)).toEqual(['G28']);
  });
});
