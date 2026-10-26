// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { Planner } from './planner.ts';
import { TimingBuilder } from './timing.ts';
import type { Timing, Trapezoid } from './timing.ts';

/**
 * Entry, cruise, exit and accel of moves `start` to `end` (exclusive), recomputed from the last
 * checkpoint at or before `start` by the planner that produced `timing` (same planner, same file).
 * The result equals the full pass: it is the same code resumed from its own snapshot.
 * Throws when the planner keeps no snapshots (only Klipper does so far).
 */
export function trapezoidsFor(
  planner: Planner,
  parsed: ParsedFile,
  timing: Timing,
  start: number,
  end: number,
): Trapezoid[] {
  if (planner.name !== timing.planner) throw new Error(`timing is from ${timing.planner}, not ${planner.name}`);
  end = Math.min(end, parsed.moveCount);
  start = Math.max(0, start);
  if (start >= end) return [];
  const cps = timing.checkpoints;
  let lo = 0;
  let hi = cps.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cps[mid]!.move <= start) lo = mid;
    else hi = mid - 1;
  }
  const from = cps[lo];
  if (from?.state === undefined || from.move > start) throw new Error(`planner ${planner.name} cannot resume`);
  const out = TimingBuilder.replay(parsed, from, start, end);
  const it = planner.plan(parsed, timing.limits, { from, out });
  while (!out.stop && !it.next().done);
  return out.trapezoids;
}
