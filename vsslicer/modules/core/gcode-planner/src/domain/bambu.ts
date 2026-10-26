// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ParsedFile } from '@vsslicer/gcode-api';
import { klipperPlanner } from './klipper.ts';
import { FLAVOUR_FIELDS } from './limits.ts';
import type { ResolvedLimits } from './limits.ts';
import { marlinPlanner } from './marlin.ts';
import { rrfPlanner } from './rrf-planner.ts';
import type { Planner } from './planner.ts';
import type { Timing } from './timing.ts';

/** Moves `[firstMove, endMove)` between an M622 and its M623. */
export interface ConditionalBlock {
  firstMove: number;
  endMove: number;
}

/**
 * Where the Marlin-model limits came from. `profile`: every one from the file's config block or a
 * user override; `default`: none (Marlin's stock values); `mixed`: both. The file's own M201/M203/
 * M204/M205 still apply on top, as for Marlin.
 */
export type BambuLimitsSource = 'profile' | 'default' | 'mixed';

/** A {@link Timing} for a Bambu file: always an estimate, with what that estimate assumed. */
export interface BambuTiming extends Timing {
  estimate: true;
  limitsSource: BambuLimitsSource;
  /**
   * M622 ... M623 blocks, which the firmware runs only if its condition holds at print time
   * (meaning unverified, no public dictionary). They are timed as executed. Empty if none.
   */
  conditionalBlocks: ConditionalBlock[];
}

const BAMBU_MARKERS = new Set(['M620', 'M621', 'M622', 'M623', 'M1002']);

/** Bambu Studio output, or any file using Bambu's M62x/M1002 commands (Orca writes them for Bambu printers too). */
export function isBambuFile(parsed: ParsedFile): boolean {
  return parsed.slicer === 'bambustudio' || parsed.markers.some((m) => BAMBU_MARKERS.has(m.name));
}

export function conditionalBlocks(parsed: ParsedFile): ConditionalBlock[] {
  const blocks: ConditionalBlock[] = [];
  let open: number | undefined;
  for (const m of parsed.markers) {
    if (m.name === 'M622') open ??= m.moveIndex;
    else if (m.name === 'M623' && open !== undefined) {
      if (m.moveIndex > open) blocks.push({ firstMove: open, endMove: m.moveIndex });
      open = undefined;
    }
  }
  // An unclosed block runs to the end of the file.
  if (open !== undefined && parsed.moveCount > open) blocks.push({ firstMove: open, endMove: parsed.moveCount });
  return blocks;
}

function limitsSource({ sources }: ResolvedLimits): BambuLimitsSource {
  const fromDefault = FLAVOUR_FIELDS.marlin.filter((k) => sources[k] === 'default').length;
  return fromDefault === 0 ? 'profile' : fromDefault === FLAVOUR_FIELDS.marlin.length ? 'default' : 'mixed';
}

/** Bambu firmware is closed: the Marlin model with the profile's jerk and accel and the file's M204/M205, labelled an estimate. */
export const bambuPlanner: Planner = {
  name: 'bambu',
  estimate: true,
  *plan(parsed, limits) {
    const t = yield* marlinPlanner.plan(parsed, limits);
    return {
      ...t,
      planner: this.name,
      estimate: true,
      limitsSource: limitsSource(limits),
      conditionalBlocks: conditionalBlocks(parsed),
    } satisfies BambuTiming;
  },
};

/** The planner for a file: Bambu's estimate, Klipper, RepRapFirmware, else Marlin. */
export function plannerFor(parsed: ParsedFile, limits: ResolvedLimits): Planner {
  if (isBambuFile(parsed)) return bambuPlanner;
  if (limits.flavour === 'klipper') return klipperPlanner;
  return limits.flavour === 'reprapfirmware' ? rrfPlanner : marlinPlanner;
}
