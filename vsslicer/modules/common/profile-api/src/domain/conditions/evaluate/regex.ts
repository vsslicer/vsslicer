// SPDX-License-Identifier: AGPL-3.0-or-later
// A backtracking-free full-match regex engine for condition literals: the pattern is compiled to an NFA and
// simulated Thompson-style (all states in step), so the time is O(states x subject length) whatever the pattern.
// Accepts the regular subset of JavaScript `u`-flag syntax. Matches as PrusaSlicer's `boost::regex_match` with default
// flags does (PrusaSlicer-2.9@b028299:src/libslic3r/PlaceholderParser.cpp:681): `.` matches any character, newlines
// included (boostorg/regex@a640597:include/boost/regex/v5/basic_regex_parser.hpp parse_match_any, dont_care mask);
// `^`/`$` match at the ends and at line breaks \n \r \f, never inside \r\n (v5/perl_matcher_common.hpp
// match_start_line/match_end_line, v5/regex_traits_defaults.hpp is_separator<char>). For subjects whose only line
// break is \n, that is exactly `new RegExp('^(?:p)$', 'msu').test`.
// shortcut: Boost matches UTF-8 bytes, we match code points, so `.`/classes differ on one non-ASCII character; upgrade
// if a vendor regex depends on it.

/** Most NFA states a pattern may compile to (counted repeats are expanded). At the cap, 512 chars take ~15 ms (35 ms cold). */
export const MAX_REGEX_STATES = 5000;

/** Thrown when a pattern is invalid or outside the supported subset; the message says why. */
export class RegexRejected extends Error {
  override name = 'RegexRejected';
}

type Node =
  | { t: 'atom'; pred: number }
  | { t: 'assert'; a: '^' | '$' | 'b' | 'B' }
  | { t: 'cat'; xs: Node[] }
  | { t: 'alt'; xs: Node[] }
  | { t: 'rep'; x: Node; lo: number; hi: number };

const SAFE_ESCAPE = /[dDwWsSbBnrtfv^$\\.*+?()[\]{}|/-]/;
const OP_CHAR = 0;
const OP_SPLIT = 1;
const OP_ASSERT = 2;
const OP_MATCH = 3;

const isWord = (cp: number | undefined): boolean =>
  cp !== undefined && ((cp >= 48 && cp <= 57) || (cp >= 65 && cp <= 90) || (cp >= 97 && cp <= 122) || cp === 95);
/** Boost's line separators for `char`: \n \r \f. */
const isBreak = (cp: number | undefined): boolean => cp === 10 || cp === 13 || cp === 12;

/** Compiles `pattern` to a full-match tester, or throws {@link RegexRejected}. */
export function compileRegex(pattern: string): (subject: string) => boolean {
  try {
    new RegExp(`^(?:${pattern})$`, 'u'); // syntax check only, never executed
  } catch (e) {
    throw new RegexRejected(`Invalid regex: ${(e as Error).message}`);
  }
  const fail = (why: string): never => {
    throw new RegexRejected(`Regex rejected (unsupported syntax): ${why}`);
  };
  // Predicates: a literal code point (number) or a single-character RegExp ('.', '\d', '[...]').
  const preds: (number | RegExp)[] = [];
  const predIndex = new Map<string, number>();
  const pred = (key: string, p: () => number | RegExp): number => {
    let k = predIndex.get(key);
    if (k === undefined) predIndex.set(key, (k = preds.push(p()) - 1));
    return k;
  };
  const charRe = (src: string): number => pred(src, () => new RegExp(`^${src}$`, 'u'));

  let i = 0;
  const escape = (): void => {
    const c = pattern[i + 1];
    if (c === undefined || !SAFE_ESCAPE.test(c)) fail(`escape '\\${c ?? ''}'`);
    i += 2;
  };
  const alt = (): Node => {
    const xs = [seq()];
    while (pattern[i] === '|') {
      i++;
      xs.push(seq());
    }
    return xs.length === 1 ? xs[0]! : { t: 'alt', xs };
  };
  const seq = (): Node => {
    const xs: Node[] = [];
    while (i < pattern.length && pattern[i] !== '|' && pattern[i] !== ')') xs.push(term());
    return { t: 'cat', xs };
  };
  const term = (): Node => {
    const c = pattern[i]!;
    const start = i;
    let x: Node;
    if (c === '^' || c === '$') {
      i++;
      x = { t: 'assert', a: c };
    } else if (c === '(') {
      if (pattern[i + 1] === '?' && pattern[i + 2] !== ':') fail('lookarounds and named groups');
      i += pattern[i + 1] === '?' ? 3 : 1;
      x = alt();
      if (pattern[i] !== ')') fail('unbalanced parenthesis');
      i++;
    } else if (c === '[') {
      i++;
      while (i < pattern.length && pattern[i] !== ']')
        if (pattern[i] === '\\') escape();
        else i++;
      if (pattern[i] !== ']') fail('unterminated character class');
      i++;
      x = { t: 'atom', pred: charRe(pattern.slice(start, i)) };
    } else if (c === '\\') {
      escape();
      const e = pattern[start + 1]!;
      x = e === 'b' || e === 'B' ? { t: 'assert', a: e } : { t: 'atom', pred: charRe(pattern.slice(start, i)) };
    } else if (c === '.') {
      i++;
      x = { t: 'atom', pred: charRe('[^]') };
    } else if (c === '*' || c === '+' || c === '?' || c === '{') return fail(`'${c}' has nothing to repeat`);
    else {
      const cp = pattern.codePointAt(i)!;
      i += cp > 0xffff ? 2 : 1;
      x = { t: 'atom', pred: pred(`#${cp}`, () => cp) };
    }
    const q = pattern[i];
    if (q !== '?' && q !== '*' && q !== '+' && q !== '{') return x;
    if (x.t === 'assert') fail('a quantified assertion');
    let lo = 0;
    let hi = Infinity;
    if (q === '?') hi = 1;
    else if (q === '+') lo = 1;
    else if (q === '{') {
      const m = /^\{(\d+)(,(\d*))?\}/.exec(pattern.slice(i)) ?? fail("malformed '{m,n}'");
      lo = Number(m[1]);
      hi = m[2] === undefined ? lo : m[3] === '' ? Infinity : Number(m[3]);
      i += m[0].length - 1;
    }
    i++;
    if (pattern[i] === '?') i++; // lazy: same language, and a full match only asks membership
    return { t: 'rep', x, lo, hi };
  };
  const ast = alt();
  if (i < pattern.length) fail('unbalanced parenthesis');

  // States each node expands to; every repeat copy costs at least one, so `(){1e9}` is counted, not built.
  const size = (n: Node): number => {
    if (n.t === 'atom' || n.t === 'assert') return 1;
    if (n.t === 'cat') return n.xs.reduce((s, x) => s + size(x), 0);
    if (n.t === 'alt') return n.xs.reduce((s, x) => s + size(x) + 1, 0);
    const copies = n.hi === Infinity ? n.lo + 1 : n.hi;
    return copies * (size(n.x) + 1);
  };
  if (size(ast) > MAX_REGEX_STATES)
    throw new RegexRejected(`Regex rejected: expands to more than ${MAX_REGEX_STATES} NFA states`);

  const op: number[] = [];
  const arg: number[] = []; // predicate index, or assertion code
  const out: number[] = [];
  const out2: number[] = [];
  const state = (o: number, a: number, next: number, next2 = -1): number => {
    op.push(o);
    arg.push(a);
    out.push(next);
    return out2.push(next2) - 1;
  };
  const ASSERTS = ['^', '$', 'b', 'B'];
  // Builds right to left: returns the entry state of `n` followed by `next`.
  const build = (n: Node, next: number): number => {
    switch (n.t) {
      case 'atom':
        return state(OP_CHAR, n.pred, next);
      case 'assert':
        return state(OP_ASSERT, ASSERTS.indexOf(n.a), next);
      case 'cat':
        for (let k = n.xs.length - 1; k >= 0; k--) next = build(n.xs[k]!, next);
        return next;
      case 'alt': {
        let s = build(n.xs[n.xs.length - 1]!, next);
        for (let k = n.xs.length - 2; k >= 0; k--) s = state(OP_SPLIT, 0, build(n.xs[k]!, next), s);
        return s;
      }
      case 'rep': {
        let tail = next;
        if (n.hi === Infinity) {
          tail = state(OP_SPLIT, 0, -1, next);
          out[tail] = build(n.x, tail);
        } else for (let k = n.lo; k < n.hi; k++) tail = state(OP_SPLIT, 0, build(n.x, tail), next);
        for (let k = 0; k < n.lo; k++) tail = build(n.x, tail);
        return tail;
      }
    }
  };
  const MATCH = state(OP_MATCH, 0, -1);
  const start = build(ast, MATCH);
  const mark = new Int32Array(op.length).fill(-1);
  const predGen = new Int32Array(preds.length).fill(-1);
  const predVal = new Uint8Array(preds.length);

  return (subject: string): boolean => {
    const cps = Array.from(subject, (ch) => ch.codePointAt(0)!);
    mark.fill(-1);
    predGen.fill(-1);
    const stack: number[] = [];
    // Adds the epsilon closure of `s` at position `pos` to `list` (char states only), stamping with `gen`.
    const add = (list: number[], s: number, pos: number, gen: number): void => {
      stack.push(s);
      while (stack.length) {
        const t = stack.pop()!;
        if (mark[t] === gen) continue;
        mark[t] = gen;
        const o = op[t];
        if (o === OP_CHAR) list.push(t);
        else if (o === OP_SPLIT) stack.push(out[t]!, out2[t]!);
        else if (o === OP_ASSERT) {
          const a = arg[t]!;
          const prev = cps[pos - 1];
          const cur = cps[pos];
          const crlf = prev === 13 && cur === 10;
          const ok =
            a === 0
              ? pos === 0 || (isBreak(prev) && !crlf)
              : a === 1
                ? pos === cps.length || (isBreak(cur) && !crlf)
                : (isWord(prev) !== isWord(cur)) === (a === 2);
          if (ok) stack.push(out[t]!);
        }
      }
    };
    let list: number[] = [];
    add(list, start, 0, 0);
    for (let pos = 0; pos < cps.length && list.length; pos++) {
      const cp = cps[pos]!;
      const ch = String.fromCodePoint(cp);
      const next: number[] = [];
      for (const s of list) {
        const k = arg[s]!;
        if (predGen[k] !== pos) {
          const p = preds[k]!;
          predGen[k] = pos;
          predVal[k] = (typeof p === 'number' ? p === cp : p.test(ch)) ? 1 : 0;
        }
        if (predVal[k]) add(next, out[s]!, pos + 1, pos + 1);
      }
      list = next;
    }
    return mark[MATCH] === cps.length;
  };
}
