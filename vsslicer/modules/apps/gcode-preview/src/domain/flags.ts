// SPDX-License-Identifier: AGPL-3.0-or-later
// E4 flags: what the timing assumes or cannot see, so the panel never shows a number without its caveat.
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { Timing } from '@vsslicer/gcode-planner';

export interface Flag {
  code: 'assumed-limits' | 'estimate' | 'assumed-flavour' | 'invisible-macros';
  text: string;
}

/** Most distinct command names looked at and listed for the invisible-macros flag. */
export const MAX_MACRO_NAMES = 8;
const MAX_TRACKED = 1000;
/** Markers that do carry their time. */
const TIMED = new Set(['G4', 'ESTIMATOR_ADD_TIME']);
/** Object-exclusion commands take no time of their own. */
const NO_TIME = (name: string) => name === 'M486' || name.startsWith('EXCLUDE_OBJECT');

export const flagsOf = (parsed: Pick<ParsedFile, 'markers'>, timing: Timing): Flag[] => {
  const flags: Flag[] = [];
  if (timing.limits.assumed)
    flags.push({
      code: 'assumed-limits',
      text: 'Machine limits are assumed from defaults, not from the file or settings.',
    });
  if (timing.limits.flavourAssumed)
    flags.push({ code: 'assumed-flavour', text: 'The firmware flavour is not stated; Marlin is assumed.' });
  if (timing.estimate)
    flags.push({ code: 'estimate', text: `The ${timing.planner} time is an estimate, not a model of the firmware.` });
  // commands the parser keeps by name but cannot time (macros, pauses): their duration is missing from the total
  const counts = new Map<string, number>();
  let total = 0;
  for (const m of parsed.markers) {
    if ((TIMED.has(m.name) && m.seconds !== undefined) || NO_TIME(m.name)) continue;
    total++;
    if (counts.has(m.name) || counts.size < MAX_TRACKED) counts.set(m.name, (counts.get(m.name) ?? 0) + 1);
  }
  if (total > 0) {
    const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, MAX_MACRO_NAMES);
    flags.push({
      code: 'invisible-macros',
      text: `${total} commands are not timed (${top.map(([n, c]) => `${n.slice(0, 32)} x${c}`).join(', ')}); their time is missing from the total.`,
    });
  }
  return flags;
};
