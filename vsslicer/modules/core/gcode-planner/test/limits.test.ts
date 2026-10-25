// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { FLAVOUR_DEFAULTS, FLAVOUR_FIELDS, resolveLimits } from '../src/index.ts';

// Keys and values as PrusaSlicer writes them (gcode-parser test/fixtures/prusaslicer/mini_cube_ps2.8.1.gcode).
const prusaConfig = {
  gcode_flavor: 'marlin2',
  machine_max_feedrate_x: '300,160',
  machine_max_feedrate_y: '300,160',
  machine_max_feedrate_z: '40,40',
  machine_max_feedrate_e: '100,100',
  machine_max_acceleration_x: '4000,2500',
  machine_max_acceleration_y: '4000,2500',
  machine_max_acceleration_z: '200,200',
  machine_max_acceleration_e: '5000,5000',
  machine_max_jerk_x: '8,8',
  machine_max_jerk_y: '8,8',
  machine_max_jerk_z: '2,2',
  machine_max_jerk_e: '10,10',
  machine_max_acceleration_extruding: '4000,2500',
  machine_max_acceleration_retracting: '1200,1200',
  machine_max_acceleration_travel: '4000,2500',
  machine_max_junction_deviation: '0,0',
  machine_min_extruding_rate: '0,0',
  machine_min_travel_rate: '0,0',
};

describe('resolveLimits', () => {
  it('takes flavour defaults when nothing is stated, and says the limits are assumed', () => {
    const r = resolveLimits({ flavour: 'marlin' });
    expect(r.limits).toEqual(FLAVOUR_DEFAULTS.marlin);
    expect(Object.values(r.sources).every((s) => s === 'default')).toBe(true);
    expect(r.assumed).toBe(true);
    expect(r.flavourAssumed).toBe(false);
  });

  it("reads the file's config block (first value of normal,silent) and records the source", () => {
    const r = resolveLimits({ config: prusaConfig });
    expect(r.flavour).toBe('marlin');
    expect(r.flavourName).toBe('marlin2');
    expect(r.limits.maxFeedrateX).toBe(300);
    expect(r.limits.accelRetract).toBe(1200);
    expect(r.limits.junctionDeviation).toBe(0); // 0 is real: classic jerk
    expect(r.sources.maxFeedrateX).toBe('config');
    expect(r.sources.junctionDeviation).toBe('config');
    expect(r.assumed).toBe(false); // every field Marlin reads is in the file
  });

  it('reads Orca / Bambu speed keys and treats 0 travel accel as unset', () => {
    const r = resolveLimits({
      config: { gcode_flavor: 'marlin', machine_max_speed_x: '500,500', machine_max_acceleration_travel: '0,0' },
    });
    expect(r.limits.maxFeedrateX).toBe(500);
    expect(r.sources.maxFeedrateX).toBe('config');
    expect(r.sources.accelTravel).toBe('default');
    expect(r.assumed).toBe(true);
  });

  it('lets an override beat the config block', () => {
    const r = resolveLimits({ config: prusaConfig, override: { maxFeedrateX: 123, maxVelocity: 250 } });
    expect(r.limits.maxFeedrateX).toBe(123);
    expect(r.sources.maxFeedrateX).toBe('override');
    expect(r.sources.maxFeedrateY).toBe('config');
    expect(r.sources.maxVelocity).toBe('override');
  });

  it('rejects an invalid override', () => {
    expect(() => resolveLimits({ override: { accel: -1 } })).toThrow(RangeError);
    expect(() => resolveLimits({ override: { accel: NaN } })).toThrow(RangeError);
  });

  it('judges assumed on the fields the flavour reads', () => {
    const k = FLAVOUR_FIELDS.klipper;
    const all = Object.fromEntries(k.map((f) => [f, 1]));
    const r = resolveLimits({ flavour: 'klipper', config: prusaConfig, override: all });
    expect(r.flavour).toBe('klipper');
    expect(r.assumed).toBe(false);
    expect(resolveLimits({ flavour: 'Klipper', config: prusaConfig }).assumed).toBe(true); // printer.cfg is not in the file
  });

  it('prefers the given flavour name to the config block', () => {
    expect(resolveLimits({ flavour: 'reprapfirmware', config: prusaConfig }).flavour).toBe('reprapfirmware');
  });

  it('falls back to Marlin for an unknown flavour and says so', () => {
    const r = resolveLimits({ flavour: 'smoothie' });
    expect(r).toMatchObject({ flavour: 'marlin', flavourAssumed: true, flavourName: 'smoothie' });
  });

  it('falls back to Marlin when no flavour is named', () => {
    const r = resolveLimits({});
    expect(r.flavour).toBe('marlin');
    expect(r.flavourAssumed).toBe(true);
    expect(r.flavourName).toBeUndefined();
  });
});
