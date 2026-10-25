// SPDX-License-Identifier: AGPL-3.0-or-later

const SEMICOLON = 0x3b;
const OPEN = 0x28;
const CLOSE = 0x29;
const QUOTE = 0x22;
const STAR = 0x2a;
const SPACE = 0x20;
const TAB = 0x09;
const MINUS = 0x2d;
const PLUS = 0x2b;
const DOT = 0x2e;
const UNDERSCORE = 0x5f;

const isDigit = (c: number): boolean => c >= 0x30 && c <= 0x39;
const isLetter = (c: number): boolean => (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
/** 0..25 for A..Z (either case). */
const letterIndex = (c: number): number => (c | 0x20) - 0x61;

const decoder = new TextDecoder('utf-8');

/**
 * One tokenised line, reused for every line so parsing allocates nothing per command.
 * `letter` is the command word's letter ('G', 'M', 'T', ...) with its `number` (92.1 for `G92.1`);
 * a Klipper-style extended command (`SET_VELOCITY_LIMIT VELOCITY=300`) has `letter` 0, its
 * upper-cased `name` and `args` text. Parameters of a letter command are in `value`, indexed A..Z
 * (`has` is a bit set of the letters seen with a number).
 */
export class Tokens {
  letter = 0;
  number = NaN;
  name = '';
  args = '';
  has = 0;
  readonly value = new Float64Array(26);
  /** Where the last `readNumber` stopped. */
  private end = 0;

  /** Is parameter `letter` ('X') present with a number? */
  hasParam(letter: string): boolean {
    return (this.has & (1 << letterIndex(letter.charCodeAt(0)))) !== 0;
  }
  param(letter: string): number {
    return this.value[letterIndex(letter.charCodeAt(0))] ?? NaN;
  }

  /** Marker name: the command word as written, upper-cased (`M486`, `G92.1`, `EXCLUDE_OBJECT_START`). */
  commandName(): string {
    return this.letter === 0 ? this.name : `${String.fromCharCode(this.letter)}${this.number}`;
  }

  /**
   * Tokenises `buf[start, end)`, one line without its line break. Returns false for a blank line,
   * a comment-only line or text that is not a command. Handles `N<n>` line numbers, `*<sum>`
   * checksums, `;` and `( )` comments and quoted strings.
   */
  tokenise(buf: Uint8Array, start: number, end: number): boolean {
    this.letter = 0;
    this.number = NaN;
    this.name = '';
    this.args = '';
    this.has = 0;
    let i = start;
    while (i < end && (buf[i] === SPACE || buf[i] === TAB)) i++;
    // N<digits> line number
    if (i < end && (buf[i] === 0x4e || buf[i] === 0x6e) && isDigit(buf[i + 1] ?? 0)) {
      i++;
      while (i < end && isDigit(buf[i] ?? 0)) i++;
      while (i < end && (buf[i] === SPACE || buf[i] === TAB)) i++;
    }
    if (i >= end) return false;
    const first = buf[i] ?? 0;
    if (!isLetter(first)) return false;
    const second = buf[i + 1] ?? 0;
    if (isLetter(second) || second === UNDERSCORE) return this.extended(buf, i, end);
    const n = this.readNumber(buf, i + 1, end);
    if (Number.isNaN(n)) return false;
    this.letter = first & ~0x20;
    this.number = n;
    i = this.end;
    while (i < end) {
      const c = buf[i] ?? 0;
      if (c === SEMICOLON || c === STAR) break;
      if (c === OPEN) {
        while (i < end && buf[i] !== CLOSE) i++;
        i++;
      } else if (c === QUOTE) {
        i++;
        while (i < end && buf[i] !== QUOTE) i++;
        i++;
      } else if (isLetter(c)) {
        const v = this.readNumber(buf, i + 1, end);
        if (Number.isNaN(v)) {
          i++;
        } else {
          const k = letterIndex(c);
          this.value[k] = v;
          this.has |= 1 << k;
          i = this.end;
        }
      } else {
        i++;
      }
    }
    return true;
  }

  private extended(buf: Uint8Array, start: number, end: number): boolean {
    let stop = start;
    while (stop < end && buf[stop] !== SEMICOLON && buf[stop] !== STAR) stop++;
    const text = decoder.decode(buf.subarray(start, stop)).trim();
    const space = text.search(/\s/);
    this.name = (space < 0 ? text : text.slice(0, space)).toUpperCase();
    this.args = space < 0 ? '' : text.slice(space + 1).trim();
    return true;
  }

  /** Reads `[+-]digits[.digits]` at `i`; NaN when there is no number. Sets `this.end`. */
  private readNumber(buf: Uint8Array, i: number, end: number): number {
    let neg = false;
    if (i < end && (buf[i] === MINUS || buf[i] === PLUS)) {
      neg = buf[i] === MINUS;
      i++;
    }
    let v = 0;
    let digits = 0;
    let fraction = 0;
    while (i < end && isDigit(buf[i] ?? 0)) {
      v = v * 10 + ((buf[i] ?? 0) - 0x30);
      i++;
      digits++;
    }
    if (i < end && buf[i] === DOT) {
      i++;
      while (i < end && isDigit(buf[i] ?? 0)) {
        v = v * 10 + ((buf[i] ?? 0) - 0x30);
        i++;
        digits++;
        fraction++;
      }
    }
    if (digits === 0) return NaN;
    this.end = i;
    if (fraction > 0) v /= 10 ** fraction;
    return neg ? -v : v;
  }
}
