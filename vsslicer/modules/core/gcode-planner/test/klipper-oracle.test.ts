// SPDX-License-Identifier: AGPL-3.0-or-later
// Our Klipper planner against outputs recorded from klipper_estimator@dbcff4a (see
// test/fixtures/klipper-estimator/PROVENANCE.md): within 1 minute per 12 hours, scaled to the file's length.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createKlipperPlanner, planSync, resolveLimits } from '../src/index.ts';
import { gcodeToParsed } from './support/gcode-file.ts';
import { SYNTHETIC, syntheticGcode } from './support/synthetic-gcode.ts';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'klipper-estimator');
const BAR_SECONDS = 60;
const PER_SECONDS = 12 * 3600;

interface Printer {
  max_velocity: number;
  max_acceleration: number;
  square_corner_velocity: number;
}
const printer = JSON.parse(readFileSync(join(dir, 'printer.json'), 'utf8')) as Printer;
const recorded = (name: string): number =>
  (
    JSON.parse(readFileSync(join(dir, 'recorded', `${name}.json`), 'utf8')) as { sequences: { total_time: number }[] }
  ).sequences.reduce((t, s) => t + s.total_time, 0);

function ours(gcode: string): number {
  const limits = resolveLimits({
    flavour: 'klipper',
    override: {
      accel: printer.max_acceleration,
      maxVelocity: printer.max_velocity,
      squareCornerVelocity: printer.square_corner_velocity,
    },
  });
  // printer.json stands in for printer.cfg, so the file's M204 still wins, as in klipper_estimator.
  for (const k of ['accel', 'maxVelocity', 'squareCornerVelocity'] as const) limits.sources[k] = 'config';
  // printer.json has no extruder_limiter move checker, so the recordings put no limit on extrude-only moves; match that.
  return planSync(createKlipperPlanner({ maxExtrudeOnlyAccel: 1e9 }), gcodeToParsed(gcode), limits).totalTime;
}

const cases: [string, () => string][] = [
  ['cura-cube-cylinder-4.10.0', () => readFileSync(join(dir, 'inputs', 'cura-cube-cylinder-4.10.0.gcode'), 'utf8')],
  ...SYNTHETIC.map((s): [string, () => string] => [s.name, () => syntheticGcode(s)]),
];

function check(name: string, gcode: string): void {
  const want = recorded(name);
  const got = ours(gcode);
  const allowed = (BAR_SECONDS * want) / PER_SECONDS;
  expect(Math.abs(got - want), `ours ${got}, klipper_estimator ${want}, allowed ${allowed}`).toBeLessThanOrEqual(
    allowed,
  );
}

describe('klipper planner against klipper_estimator@dbcff4a', () => {
  it.each(cases)('%s is within 1 minute per 12 hours', (name, gcode) => check(name, gcode()));

  // Known gap: ours is 7.3 s (0.7%) slower than the oracle's 1011.3 s, against 1.4 s allowed. Cause (GCP-116): all of
  // it is extrude-only time (ours 16.93 s, oracle 9.15 s). Klipper gives every move, extrude-only ones too, the
  // minimum_cruise_ratio pseudo-accel (klipper@ee2c6fb:klippy/toolhead.py:51), which caps a retract's cruise at
  // sqrt(|e| x accel x (1 - mcr)), slow after "M204 S500"; klipper_estimator gives extrude-only moves an unlimited
  // smoothed_dv2 (klipper_estimator@dbcff4a:lib/src/planner.rs:363). Dropping that cap brings ours to 1010.78 s, but
  // ours follows Klipper, so the oracle is the one that is off here. The bar stays; the case flips to a failure once fixed.
  it.fails('orca-cube-marlin is within 1 minute per 12 hours', () =>
    check('orca-cube-marlin', readFileSync(join(dir, 'inputs', 'orca-cube-marlin.gcode'), 'utf8')),
  );
});
