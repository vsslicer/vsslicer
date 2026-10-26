// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Diagnostic } from '@vsslicer/profile-api';

/** Input cap in bytes; the pinned PrusaResearch.ini is 1.5 MB, so this leaves ample headroom. */
export const MAX_INI_BYTES = 64 * 1024 * 1024;
/** Longest line read (UTF-16 units); the longest pinned line is 12 102. A longer line is skipped with a diagnostic. */
export const MAX_LINE_LENGTH = 64 * 1024;
/** Sections read; the pinned bundle has about 7 000. Reaching the cap stops the parse. */
export const MAX_SECTIONS = 50_000;
/** Keys kept per section; extra keys are dropped with one diagnostic. */
export const MAX_KEYS_PER_SECTION = 10_000;
/** Diagnostics kept, so a hostile file cannot make the report itself unbounded. */
export const MAX_DIAGNOSTICS = 1_000;

export type IniSectionKind = 'vendor' | 'printer_model' | 'printer' | 'print' | 'filament' | 'root' | 'other';

export interface IniEntry {
  key: string;
  /** Verbatim after trimming blanks around it, e.g. `0.20` stays `0.20`. */
  value: string;
  line: number;
}

export interface IniSection {
  kind: IniSectionKind;
  /** Text after `kind:`; the whole header text for `other`; empty for `vendor` and `root`. */
  name: string;
  /** Name starts with `*`: an intermediate preset that is never offered, only inherited. */
  abstract: boolean;
  /** 1-based line of the header; 1 for the header-less `root` section of a user preset file. */
  line: number;
  /** In file order, duplicates kept (each gets a warning). Empty sections are kept too; boost drops them, so the flattener must not treat an empty one as a preset. */
  entries: IniEntry[];
}

/**
 * The native section tree. Diagnostics reuse profile-api's `Diagnostic`; the tree itself is not an
 * `ImportResult` because that holds mapped entities, which a later card builds from this.
 */
export interface IniDocument {
  sections: IniSection[];
  diagnostics: Diagnostic[];
}

const KINDS = new Set<string>(['printer_model', 'printer', 'print', 'filament']);
const isBlank = (c: number) => c === 32 || c === 9;

function trimmed(s: string, from: number, to: number): string {
  while (from < to && isBlank(s.charCodeAt(from))) from++;
  while (to > from && isBlank(s.charCodeAt(to - 1))) to--;
  return s.slice(from, to);
}

function classify(header: string): Pick<IniSection, 'kind' | 'name' | 'abstract'> {
  if (header === 'vendor') return { kind: 'vendor', name: '', abstract: false };
  const colon = header.indexOf(':');
  const kind = colon < 0 ? '' : header.slice(0, colon);
  if (!KINDS.has(kind)) return { kind: 'other', name: header, abstract: false };
  const name = header.slice(colon + 1);
  return { kind: kind as IniSectionKind, name, abstract: name.startsWith('*') };
}

/**
 * Reads PrusaSlicer INI text (vendor bundle, config bundle or a single user preset) in one linear pass.
 * Follows boost's ini_parser as PrusaSlicer uses it: `;` and `#` start a comment line, `[x]` opens a
 * section, `key = value` splits at the first `=`. Keys before any header (a user preset file) go to a
 * `root` section. A bad line gets a diagnostic and parsing continues.
 */
export function parseIni(input: string | Uint8Array, file: string): IniDocument {
  const sections: IniSection[] = [];
  const diagnostics: Diagnostic[] = [];
  const diag = (severity: Diagnostic['severity'], line: number | undefined, message: string) => {
    if (diagnostics.length > MAX_DIAGNOSTICS) return;
    if (diagnostics.length === MAX_DIAGNOSTICS) message = 'further diagnostics suppressed';
    diagnostics.push({ severity, code: 'malformed-line', file, ...(line === undefined ? {} : { line }), message });
  };

  const bytes = typeof input === 'string' ? Buffer.byteLength(input) : input.byteLength;
  if (bytes > MAX_INI_BYTES) {
    diag('error', undefined, `input is ${bytes} bytes, over the ${MAX_INI_BYTES} byte limit; not read`);
    return { sections, diagnostics };
  }
  let text: string;
  try {
    // Invalid UTF-8 would silently become U+FFFD and change a value, so the file is refused whole.
    text = typeof input === 'string' ? input : new TextDecoder('utf-8', { fatal: true }).decode(input);
  } catch {
    diag('error', undefined, 'input is not valid UTF-8; not read');
    return { sections, diagnostics };
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  let current: IniSection | undefined;
  let keyCapReported = false;
  let dropping = false; // after a rejected header: keys are dropped until the next valid header
  const headers = new Map<string, IniSection>();
  let keys = new Set<string>();
  let lineNo = 0;
  for (let pos = 0; pos <= text.length;) {
    let end = text.indexOf('\n', pos);
    if (end < 0) end = text.length;
    lineNo++;
    const lineStart = pos;
    pos = end + 1;
    if (end - lineStart > MAX_LINE_LENGTH) {
      diag('error', lineNo, `line longer than ${MAX_LINE_LENGTH} characters; skipped`);
      continue;
    }
    if (end > lineStart && text.charCodeAt(end - 1) === 13) end--; // CRLF
    let a = lineStart;
    while (a < end && isBlank(text.charCodeAt(a))) a++;
    if (a === end) continue;
    const c = text.charCodeAt(a);
    if (c === 35 || c === 59) continue; // # ;

    if (c === 91) {
      const body = trimmed(text, a, end);
      const close = body.indexOf(']'); // boost: the name ends at the first ], the rest of the line is ignored
      if (close < 0) {
        diag('error', lineNo, 'section header without a closing ]; its keys are dropped');
        dropping = true;
        continue;
      }
      if (sections.length >= MAX_SECTIONS) {
        diag('error', lineNo, `more than ${MAX_SECTIONS} sections; rest of the file not read`);
        break;
      }
      const header = trimmed(body, 1, close);
      // boost pops an empty section before its duplicate check, so only an earlier non-empty one is rejected
      if (headers.get(header)?.entries.length) {
        diag(
          'warning',
          lineNo,
          `duplicate section [${header}]; both kept, but boost read_ini (PrusaSlicer) would reject the file`,
        );
      }
      current = { ...classify(header), line: lineNo, entries: [] };
      headers.set(header, current);
      sections.push(current);
      keys = new Set();
      dropping = false;
      keyCapReported = false;
      continue;
    }

    let eq = a; // bounded by the line: indexOf would rescan the rest of the file on every =-less line
    while (eq < end && text.charCodeAt(eq) !== 61) eq++;
    if (eq === end) {
      diag('error', lineNo, 'line is neither a comment, a [section] nor key = value');
      continue;
    }
    const key = trimmed(text, a, eq);
    if (key === '') {
      diag('error', lineNo, 'empty key');
      continue;
    }
    if (dropping) continue;
    if (!current) {
      current = { kind: 'root', name: '', abstract: false, line: 1, entries: [] };
      sections.push(current);
    }
    if (current.entries.length >= MAX_KEYS_PER_SECTION) {
      if (!keyCapReported) diag('error', lineNo, `more than ${MAX_KEYS_PER_SECTION} keys in one section; rest dropped`);
      keyCapReported = true;
      continue;
    }
    if (keys.has(key)) {
      diag(
        'warning',
        lineNo,
        `duplicate key "${key}"; both kept, but boost read_ini (PrusaSlicer) would reject the file`,
      );
    }
    keys.add(key);
    current.entries.push({ key, value: trimmed(text, eq + 1, end), line: lineNo });
  }
  return { sections, diagnostics };
}
