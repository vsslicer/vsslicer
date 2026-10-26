// SPDX-License-Identifier: AGPL-3.0-or-later
import { evaluate } from '@vsslicer/profile-api';

/**
 * Keywords that PrusaResearch printer profiles write into `printer_notes` and that
 * `printer_notes =~` conditions test. Collected from PrusaResearch.ini@b028299
 * (PrusaSlicer-2.9 resources/profiles; AGPL-3.0). Each becomes a unified tag in `printer.tags`.
 */
export const PRUSA_NOTE_TAGS: readonly string[] = [
  'HF_NOZZLE',
  'INPUT_SHAPER',
  'MMU3',
  'NO_TEMPLATES',
  'PG',
  'PRINTER_HAS_BOWDEN',
  'PRINTER_MODEL_COREONE',
  'PRINTER_MODEL_MINI',
  'PRINTER_MODEL_MINIIS',
  'PRINTER_MODEL_MK2',
  'PRINTER_MODEL_MK2.5',
  'PRINTER_MODEL_MK3',
  'PRINTER_MODEL_MK3.5',
  'PRINTER_MODEL_MK3.5MMU',
  'PRINTER_MODEL_MK4',
  'PRINTER_MODEL_MK4IS',
  'PRINTER_MODEL_MK4MMU3',
  'PRINTER_MODEL_MK4S',
  'PRINTER_MODEL_MK4SMMU3',
  'PRINTER_MODEL_XL',
  'PRINTER_MODEL_XLIS',
  'PRINTER_VENDOR_PRUSA3D',
  'RAMMING_EXTRA',
  'SEQ_ARRANGE_MODEL_COREONEL',
];

/**
 * Tags that have a first-class unified field instead of a tag test. Empty on purpose: PRINTER_VENDOR_PRUSA3D
 * is not a vendor test, since PrusaResearch.ini:41869 (MK3.5) and :40968 / :40995 (MK4IS, MK4ISMMU3) notes lack it.
 */
export const PRUSA_TAG_FIELDS: Readonly<Record<string, string>> = {};

/** Character set of a notes regex core we expand; it is matched by profile-api's non-backtracking engine, never by V8. */
const SAFE_CORE = /^[A-Za-z0-9_.|()[\]^\\*+?]{1,150}$/;

export interface TagResult {
  expression: string;
  lossy: boolean;
  /** Set when the keyword matches no known tag. */
  unknown: boolean;
  /** Why the result is lossy when that is not the unknown keyword. */
  diagnostic?: string;
}

/**
 * Converts the body of a `printer_notes` regex into a unified expression over `printer.tags`.
 * PrusaSlicer full-matches `=~`, so only `.*core.*` ("contains") is equivalent to a tag set; `/PG/` or
 * `/.*PG/` still convert but are lossy with a diagnostic. A core equal to one known keyword is exact; a core
 * matching several keywords expands to their `or` (lossy); a core matching none, or unsupported by the
 * linear-time matcher, is kept as `printer.notes =~ /re/` and flagged unknown. Tags are tested with
 * profile-api's NFA matcher through `evaluate`, so cost is linear in pattern x tags.
 */
export function notesRegexToTags(pattern: string): TagResult {
  const anchored = pattern.startsWith('.*') && pattern.endsWith('.*') && pattern.length >= 4;
  const core = pattern.replace(/^\.\*/, '').replace(/\.\*$/, '');
  const fallback = { expression: `printer.notes =~ /${pattern}/`, lossy: true, unknown: true };
  if (!SAFE_CORE.test(core)) return fallback;
  const src = `printer.notes =~ /.*(${core}).*/`;
  const hits: string[] = [];
  for (const t of PRUSA_NOTE_TAGS) {
    // The trailing newline mimics the keyword's position inside the notes text.
    const r = evaluate(src, { printer: { notes: `${t}\n` } });
    if (r.diagnostic) return fallback;
    if (r.compatible) hits.push(t);
  }
  if (hits.length === 0) return fallback;
  const one = (t: string) => PRUSA_TAG_FIELDS[t] ?? `'${t}' in printer.tags`;
  const expression = hits.length === 1 ? one(hits[0]!) : `(${hits.map(one).join(' or ')})`;
  const exact = anchored && hits.length === 1 && hits[0] === core;
  return {
    expression,
    lossy: !exact,
    unknown: false,
    ...(anchored ? {} : { diagnostic: `printer_notes /${pattern}/ is a whole-string match; converted as "contains"` }),
  };
}
