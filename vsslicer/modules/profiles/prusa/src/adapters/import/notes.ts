// SPDX-License-Identifier: AGPL-3.0-or-later
import { PRUSA_NOTE_TAGS } from '../conditions/index.ts';

const KNOWN = new Set(PRUSA_NOTE_TAGS);
/** A line holding one upper-case word: how PrusaResearch.ini writes its keywords under the "Don't remove" prose. */
const KEYWORD = /^[A-Z][A-Z0-9_.]*$/;

/**
 * Keywords of a `printer_notes` value, read as PrusaSlicer reads the string (`unescape_string_cstyle`,
 * PrusaSlicer@b028299:src/libslic3r/Config.cpp:128-150: `\n` and `\r` unescape, `\x` -> `x`; a trailing lone
 * backslash, which upstream rejects as a bad value, is dropped here). Known keywords
 * (the condition converter's tag table) become tags in note order; other keyword lines are returned as unknown.
 */
export function noteTags(notes: string): { tags: string[]; unknown: string[] } {
  const text = notes.replace(/\\(.?)/gs, (_, c: string) => (c === 'n' ? '\n' : c === 'r' ? '\r' : c));
  const tags = new Set<string>();
  const unknown = new Set<string>();
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const line = raw.trim();
    if (!KEYWORD.test(line)) continue; // prose
    (KNOWN.has(line) ? tags : unknown).add(line);
  }
  return { tags: [...tags], unknown: [...unknown] };
}
