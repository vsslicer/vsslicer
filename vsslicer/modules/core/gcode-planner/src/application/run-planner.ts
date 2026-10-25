// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { ResolvedLimits } from '../domain/limits.ts';
import type { Planner } from '../domain/planner.ts';
import type { Timing } from '../domain/timing.ts';

export interface PlanProgress {
  movesDone: number;
  moveCount: number;
}

export interface RunPlannerOptions {
  /** Aborting stops the plan between slices; the promise then rejects with the signal's reason. */
  signal?: AbortSignal;
  onProgress?: (p: PlanProgress) => void;
}

/** Runs the planner to the end without yielding to the event loop. */
export function planSync(planner: Planner, parsed: ParsedFile, limits: ResolvedLimits): Timing {
  const it = planner.plan(parsed, limits);
  for (let r = it.next(); ; r = it.next()) if (r.done) return r.value;
}

/**
 * Runs the planner a slice at a time (one move buffer per slice), reporting progress and giving
 * the event loop a turn between slices so a worker can receive an abort while it plans.
 * Start times are written into `parsed.moves` as it goes, so an aborted run leaves some filled.
 */
export async function runPlanner(
  planner: Planner,
  parsed: ParsedFile,
  limits: ResolvedLimits,
  { signal, onProgress }: RunPlannerOptions = {},
): Promise<Timing> {
  signal?.throwIfAborted();
  const it = planner.plan(parsed, limits);
  for (;;) {
    const r = it.next();
    if (r.done) {
      onProgress?.({ movesDone: parsed.moveCount, moveCount: parsed.moveCount });
      return r.value;
    }
    onProgress?.({ movesDone: r.value, moveCount: parsed.moveCount });
    await new Promise((resolve) => setTimeout(resolve, 0));
    signal?.throwIfAborted();
  }
}
