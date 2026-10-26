// SPDX-License-Identifier: AGPL-3.0-or-later

/** Names are untrusted: input longer than this many UTF-16 units is cut before any work (linear scan). */
export const MAX_INPUT_LENGTH = 1024;
/** Longest name on a long-filename target (UTF-16 units). */
export const MAX_LONG_NAME = 255;
/** Most names one directory batch may hold; keeps collision resolution bounded (linear: each candidate family resumes at its next free `~n`). */
export const MAX_ENTRIES = 4096;
/** Highest `~n` tried; above MAX_ENTRIES so a batch within the bound always resolves. */
export const MAX_SUFFIX = 9999;

export interface NameOptions {
  /** The connection's `longFilenames` setting: 255-character names instead of 8.3. */
  readonly longFilenames?: boolean;
}

// Win32 devices, including COM0/LPT0 and the superscript digits it also treats as device numbers.
const RESERVED = /^(CON|PRN|AUX|NUL|(COM|LPT)[0-9\u00b9\u00b2\u00b3])$/;

const LONE_SURROGATE = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g;
const COMBINING = /\p{M}/gu;
const FAT_BAD = /[^A-Z0-9!#$%&'()\-@^_`{}~]/g;
const LONG_BAD = /[<>:"/\\|?*\p{Cc}]/gu;

/** Cut to `max` UTF-16 units without splitting a surrogate pair. */
function cut(s: string, max: number): string {
  if (s.length <= max) return s;
  const code = s.charCodeAt(max - 1);
  return s.slice(0, code >= 0xd800 && code <= 0xdbff ? max - 1 : max);
}

function prepare(name: string): string {
  return cut(name, MAX_INPUT_LENGTH).replace(LONE_SURROGATE, '_').normalize('NFC');
}

/** Index of the extension dot, or -1 (a leading dot is not an extension separator). */
function extDot(s: string): number {
  const i = s.lastIndexOf('.');
  return i > 0 ? i : -1;
}

function fatName(name: string): string {
  // Fold: NFD, drop combining marks, anything left non-ASCII becomes `_`.
  const folded = prepare(name).normalize('NFD').replace(COMBINING, '').toUpperCase();
  const trimmed = folded.replace(/^[. ]+/, '').replace(/[. ]+$/, '');
  const dot = extDot(trimmed);
  let base = (dot < 0 ? trimmed : trimmed.slice(0, dot)).replace(FAT_BAD, '_').slice(0, 8);
  const ext =
    dot < 0
      ? ''
      : trimmed
          .slice(dot + 1)
          .replace(FAT_BAD, '_')
          .slice(0, 3);
  if (base === '') base = 'FILE';
  if (RESERVED.test(base)) base = `${base.slice(0, 7)}_`;
  return ext ? `${base}.${ext}` : base;
}

function longName(name: string): string {
  let s = prepare(name)
    .replace(LONG_BAD, '_')
    .replace(/^ +/, '')
    .replace(/[. ]+$/, '');
  if (s === '') return 'file';
  // Win32 ignores spaces before the dot, so `con .gcode` is the device too.
  if (RESERVED.test(s.split('.')[0]!.replace(/ +$/, '').toUpperCase())) s = `_${s}`;
  if (s.length > MAX_LONG_NAME) {
    const d = extDot(s);
    const ext = d < 0 || s.length - d > 64 ? '' : s.slice(d);
    s = (cut(s.slice(0, d < 0 || ext === '' ? s.length : d), MAX_LONG_NAME - ext.length) + ext).replace(/[. ]+$/, '');
  }
  return s === '' ? 'file' : s;
}

/** One safe name for the target: 8.3 (uppercase ASCII) by default, long names with `longFilenames`. */
export function sanitiseName(name: string, options: NameOptions = {}): string {
  return options.longFilenames ? longName(name) : fatName(name);
}

function withSuffix(name: string, n: number, long: boolean): string {
  const suffix = `~${n}`;
  const dot = extDot(name);
  const base = dot < 0 ? name : name.slice(0, dot);
  let ext = dot < 0 ? '' : name.slice(dot);
  const max = long ? MAX_LONG_NAME : 8;
  // Long mode: when base + suffix + ext cannot fit, the extension goes (as `longName` does) so the cap holds.
  if (long && max - suffix.length - ext.length < 1) ext = '';
  const room = max - suffix.length - (long ? ext.length : 0);
  return cut(base, Math.max(room, 1)).replace(/[. ]+$/, '') + suffix + ext;
}

// FAT/NTFS upcase before comparing: `ς` and `σ` both become `Σ`; over-matching only costs a `~n`.
const key = (s: string): string => s.toUpperCase().toLowerCase();

/**
 * `next` (per batch) maps a candidate family to the first `~n` not yet tried in it. A family is every
 * candidate that differs only in its digits (same truncated base and extension, same digit width), so
 * distinct stems that produce the same candidates share one counter and each probe is paid once.
 */
function pick(name: string, used: Set<string>, long: boolean, next = new Map<string, number>()): string {
  const stem = key(name);
  let candidate = name;
  if (used.has(stem)) {
    let n = 1;
    let width = 0;
    let family = '';
    for (; ; n++) {
      if (String(n).length !== width) {
        width = String(n).length;
        family = `${width}|${key(withSuffix(name, 10 ** (width - 1), long))}`;
      }
      const start = next.get(family) ?? 0;
      if (start > n) {
        // Every `~n` below `start` in this family is taken; jump (a jump past the width recomputes the family).
        n = start - 1;
        continue;
      }
      if (n > MAX_SUFFIX) throw new RangeError(`no free name for "${name}"`);
      candidate = withSuffix(name, n, long);
      if (!used.has(key(candidate))) {
        next.set(family, n + 1);
        break;
      }
    }
  }
  used.add(key(candidate));
  return candidate;
}

/** Sanitise every name of one directory so the results are distinct (case-insensitive). */
export function sanitiseAll(names: readonly string[], options: NameOptions = {}): string[] {
  if (names.length > MAX_ENTRIES) throw new RangeError(`more than ${MAX_ENTRIES} names`);
  const used = new Set<string>();
  const long = options.longFilenames === true;
  const next = new Map<string, number>();
  return names.map((n) => pick(sanitiseName(n, options), used, long, next));
}

/** A sanitised name for `name` that is not in `existing` (names already on the target). */
export function uniqueName(name: string, existing: readonly string[], options: NameOptions = {}): string {
  if (existing.length > MAX_ENTRIES) throw new RangeError(`more than ${MAX_ENTRIES} names`);
  return pick(sanitiseName(name, options), new Set(existing.map(key)), options.longFilenames === true);
}
