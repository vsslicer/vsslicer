// SPDX-License-Identifier: AGPL-3.0-or-later
import { StateKind } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { ResolvedLimits } from './limits.ts';
import { MoveCursor } from './move-cursor.ts';
import { TimingBuilder } from './timing.ts';
import type { Timing } from './timing.ts';

/**
 * One planner per firmware. `plan` is a generator so a host can run it in slices: it yields the
 * number of moves done (at least once per move buffer) and returns the {@link Timing}. It writes
 * start times into `parsed.moves` in place. Run it with `runPlanner` (cancellable, progress) or
 * `planSync`.
 */
export interface Planner {
  /** Stable id, copied to `Timing.planner`. */
  readonly name: string;
  /** True when the result approximates rather than models the firmware's motion. */
  readonly estimate: boolean;
  plan(parsed: ParsedFile, limits: ResolvedLimits): Generator<number, Timing, void>;
}

/** Feedrate before the file's first F word. shortcut: a guess at firmware boot feedrates; real planners set their own. */
const START_FEEDRATE = 25;

/**
 * The trivial planner: every move runs its whole length at the commanded feedrate, no accel, no
 * corners. A move without XYZ motion takes |E| / F. It exists to exercise the contract.
 */
export const constantSpeedPlanner: Planner = {
  name: 'constant-speed',
  estimate: true,
  *plan(parsed, limits) {
    const cur = new MoveCursor(parsed);
    const out = new TimingBuilder(parsed);
    while (cur.next()) {
      const f = cur.state(StateKind.Feedrate, 0, START_FEEDRATE);
      const len = cur.length || Math.abs(cur.e);
      out.add(f > 0 ? len / f : 0, f);
      if (cur.bufferEnd) yield out.count;
    }
    return out.finish(this.name, this.estimate, limits);
  },
};
