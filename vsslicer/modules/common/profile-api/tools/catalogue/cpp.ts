// SPDX-License-Identifier: AGPL-3.0-or-later
// A linear-time C++ tokenizer and readers for slicer option definitions (PRF-16). Upstream sources are untrusted
// data (rule 25): every scan moves forward only, nesting is bounded, and nothing upstream is built or run.
import { closeSync, openSync, readSync, realpathSync, statSync } from 'node:fs';
import { relative, sep } from 'node:path';

/** Largest source file the generator reads. */
export const MAX_SOURCE_BYTES = 16 * 1024 * 1024;
/** Deepest `{`/`(` nesting a value may have. */
export const MAX_DEPTH = 64;

/**
 * Reads `file` (under `root`, after resolving links) as UTF-8. Refuses a path that leaves `root` and a file over
 * MAX_SOURCE_BYTES, checking the size before reading.
 */
export const readSource = (root: string, file: string, maxBytes = MAX_SOURCE_BYTES): string => {
  const real = realpathSync(file);
  const rel = relative(realpathSync(root), real);
  if (rel === '' || rel.startsWith(`..${sep}`) || rel === '..' || rel.startsWith(sep))
    throw new Error(`${file}: outside ${root}`);
  const size = statSync(real).size;
  if (size > maxBytes) throw new Error(`${file}: ${size} bytes, over the ${maxBytes}-byte limit`);
  const buf = Buffer.alloc(size);
  const fd = openSync(real, 'r');
  try {
    // A file that grows after the size check is read only up to that size.
    let at = 0;
    while (at < size) {
      const n = readSync(fd, buf, at, size - at, at);
      if (n === 0) break;
      at += n;
    }
  } finally {
    closeSync(fd);
  }
  return buf.toString('utf8');
};

export type Kind = 'id' | 'num' | 'str' | 'p';
export interface Token {
  k: Kind;
  /** Identifier, number text, unescaped string, or punctuation (`->`, `::` or one character). */
  v: string;
  line: number;
}

const isIdStart = (c: number) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95;
const isDigit = (c: number) => c >= 48 && c <= 57;
const isId = (c: number) => isIdStart(c) || isDigit(c);
const ESCAPES: { [c: string]: string } = { n: '\n', t: '\t', r: '\r', '0': '\0', a: '\x07', b: '\b', f: '\f', v: '\v' };

/** Tokens of a C++ source. Comments and preprocessor lines are dropped; unterminated strings throw. */
export const tokenize = (src: string): Token[] => {
  const out: Token[] = [];
  let line = 1;
  let i = 0;
  let lineStart = true;
  const n = src.length;
  while (i < n) {
    const c = src.charCodeAt(i);
    if (c === 10) {
      line++;
      i++;
      lineStart = true;
      continue;
    }
    if (c === 32 || c === 9 || c === 13 || c === 12 || c === 11) {
      i++;
      continue;
    }
    if (c === 47 && src.charCodeAt(i + 1) === 47) {
      const end = src.indexOf('\n', i);
      i = end < 0 ? n : end;
      continue;
    }
    if (c === 47 && src.charCodeAt(i + 1) === 42) {
      const end = src.indexOf('*/', i + 2);
      const stop = end < 0 ? n : end + 2;
      for (let j = i; j < stop; j++) if (src.charCodeAt(j) === 10) line++;
      i = stop;
      continue;
    }
    if (c === 35 && lineStart) {
      // A preprocessor line, with backslash continuations.
      while (i < n && src.charCodeAt(i) !== 10) {
        if (src.charCodeAt(i) === 92 && src.charCodeAt(i + 1) === 10) {
          line++;
          i++;
        }
        i++;
      }
      continue;
    }
    lineStart = false;
    if (c === 34 || c === 39) {
      const start = line;
      let s = '';
      let j = i + 1;
      for (;;) {
        if (j >= n || src.charCodeAt(j) === 10) throw new Error(`line ${start}: unterminated literal`);
        const d = src.charCodeAt(j);
        if (d === c) break;
        if (d === 92) {
          const e = src[j + 1] ?? '';
          if (e === 'x') {
            let k = j + 2;
            while (k < j + 4 && /[0-9a-fA-F]/.test(src[k] ?? '')) k++;
            s += String.fromCharCode(parseInt(src.slice(j + 2, k) || '0', 16));
            j = k;
            continue;
          }
          if (e === 'u') {
            s += String.fromCharCode(parseInt(src.slice(j + 2, j + 6), 16) || 0);
            j += 6;
            continue;
          }
          if (e === '\n') line++;
          s += ESCAPES[e] ?? e;
          j += 2;
          continue;
        }
        s += src[j];
        j++;
      }
      if (c === 34) out.push({ k: 'str', v: s, line: start });
      i = j + 1;
      continue;
    }
    if (isIdStart(c)) {
      let j = i + 1;
      while (j < n && isId(src.charCodeAt(j))) j++;
      const id = src.slice(i, j);
      if (src.charCodeAt(j) === 34 && /^(?:u8|u|U|L)?R$/.test(id)) {
        // Raw string R"delim( ... )delim".
        const open = src.indexOf('(', j);
        if (open < 0 || open - j > 17) throw new Error(`line ${line}: bad raw string`);
        const close = src.indexOf(`)${src.slice(j + 1, open)}"`, open);
        if (close < 0) throw new Error(`line ${line}: unterminated raw string`);
        const body = src.slice(open + 1, close);
        out.push({ k: 'str', v: body, line });
        for (let k = j; k < close; k++) if (src.charCodeAt(k) === 10) line++;
        i = close + open - j + 1;
        continue;
      }
      if (src.charCodeAt(j) === 34 && /^(?:u8|u|U|L)$/.test(id)) {
        i = j; // An encoding prefix: the literal follows.
        continue;
      }
      out.push({ k: 'id', v: id, line });
      i = j;
      continue;
    }
    if (isDigit(c) || (c === 46 && isDigit(src.charCodeAt(i + 1)))) {
      let j = i + 1;
      while (j < n) {
        const d = src.charCodeAt(j);
        const prev = src.charCodeAt(j - 1) | 32;
        if (
          isId(d) ||
          d === 46 ||
          d === 39 ||
          ((d === 43 || d === 45) && prev === 101 && !/^0x/i.test(src.slice(i, i + 2)))
        )
          j++;
        else break;
      }
      out.push({ k: 'num', v: src.slice(i, j).replaceAll("'", ''), line });
      i = j;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (two === '->' || two === '::') {
      out.push({ k: 'p', v: two, line });
      i += 2;
      continue;
    }
    out.push({ k: 'p', v: src[i]!, line });
    i++;
  }
  return out;
};

const OPEN: { [c: string]: string } = { '(': ')', '{': '}', '[': ']' };

const pairCache = new WeakMap<Token[], Int32Array>();
/** The index of each bracket's partner (-1 when unmatched), from one pass with a stack. */
const pairsOf = (t: Token[]): Int32Array => {
  let pairs = pairCache.get(t);
  if (pairs) return pairs;
  pairs = new Int32Array(t.length).fill(-1);
  const stack: number[] = [];
  for (let i = 0; i < t.length; i++) {
    const v = t[i]!.k === 'p' ? t[i]!.v : '';
    if (OPEN[v]) stack.push(i);
    else if ((v === ')' || v === '}' || v === ']') && stack.length) {
      const o = stack.pop()!;
      pairs[o] = i;
      pairs[i] = o;
    }
  }
  pairCache.set(t, pairs);
  return pairs;
};

/** Index of the token closing the bracket at `open` (or `end` when it closes at or after `end`, or never). */
export const closing = (t: Token[], open: number, end = t.length): number => {
  const c = pairsOf(t)[open] ?? -1;
  return c > open && c < end ? c : end;
};

/** Splits `t[from, to)` at top-level commas. */
export const args = (t: Token[], from: number, to: number): [number, number][] => {
  const out: [number, number][] = [];
  let depth = 0;
  let start = from;
  for (let i = from; i < to; i++) {
    const v = t[i]!.k === 'p' ? t[i]!.v : '';
    if (OPEN[v]) depth++;
    else if (v === ')' || v === '}' || v === ']') depth--;
    else if (v === ',' && depth === 0) {
      out.push([start, i]);
      start = i + 1;
    }
  }
  if (start < to) out.push([start, to]);
  return out;
};

const isP = (t: Token | undefined, v: string) => t?.k === 'p' && t.v === v;
const isId_ = (t: Token | undefined, v?: string) => t?.k === 'id' && (v === undefined || t.v === v);

/** Concatenated string literals of `t[from, to)`, optionally wrapped in `L(...)`, `_L(...)`, `_u8L(...)`. */
export const literal = (t: Token[], from: number, to: number): string | undefined => {
  let i = from;
  let j = to;
  if (isId_(t[i]) && /^(?:L|_L|_u8L|L_CONTEXT|_CTX)$/.test(t[i]!.v) && isP(t[i + 1], '(')) {
    const c = closing(t, i + 1, to);
    if (c !== to - 1) return undefined;
    i += 2;
    j = c;
    // L_CONTEXT("text", "context"): the text only.
    const parts = args(t, i, j);
    if (parts.length > 1) j = parts[0]![1];
  }
  if (i >= j) return undefined;
  let s = '';
  for (let k = i; k < j; k++) {
    if (t[k]!.k !== 'str') return undefined;
    s += t[k]!.v;
  }
  return s;
};

/** A number literal (`-1`, `0.5f`, `1e-3`) spanning `t[from, to)`. */
export const number = (t: Token[], from: number, to: number): number | undefined => {
  let sign = 1;
  let i = from;
  if (isP(t[i], '-') || isP(t[i], '+')) {
    sign = t[i]!.v === '-' ? -1 : 1;
    i++;
  }
  if (i !== to - 1 || t[i]!.k !== 'num') return undefined;
  let text = t[i]!.v;
  while (text && 'fFlLuU'.includes(text.at(-1)!)) text = text.slice(0, -1);
  // One character class, so the test is linear; Number() rejects malformed forms such as `1e`.
  if (!/^[0-9.eE+-]+$/.test(text)) return undefined;
  const x = Number(text);
  return Number.isFinite(x) ? sign * x : undefined;
};

export type Value = string | number | boolean | null | Value[];

/**
 * A C++ initialiser as a JSON value: numbers, bools, string literals, `{...}` lists, `Vec2d(x, y)`, casts and
 * enumerators (through `enumMap`). Undefined when it is anything else.
 */
export const value = (
  t: Token[],
  from: number,
  to: number,
  enumMap?: Map<string, string>,
  depth = 0,
): Value | undefined => {
  if (depth > MAX_DEPTH) throw new Error(`line ${t[from]?.line}: nesting deeper than ${MAX_DEPTH}`);
  if (from >= to) return undefined;
  // Casts: `(int)X`, `int(X)`, `(X)`, `static_cast<int>(X)`.
  if (isP(t[from], '(') && isId_(t[from + 1]) && isP(t[from + 2], ')') && from + 3 < to)
    return value(t, from + 3, to, enumMap, depth + 1);
  if (isP(t[from], '(') && closing(t, from, to) === to - 1) return value(t, from + 1, to - 1, enumMap, depth + 1);
  if (isId_(t[from], 'int') && isP(t[from + 1], '(') && closing(t, from + 1, to) === to - 1)
    return value(t, from + 2, to - 1, enumMap, depth + 1);
  const n = number(t, from, to);
  if (n !== undefined) return n;
  if (to - from === 1 && isId_(t[from], 'true')) return true;
  if (to - from === 1 && isId_(t[from], 'false')) return false;
  const s = literal(t, from, to);
  if (s !== undefined) return s;
  // `T::nil_value()`
  if (to - from >= 3 && isId_(t[to - 3], 'nil_value') && isP(t[to - 2], '(') && isP(t[to - 1], ')')) return null;
  // `Type{...}`, `Type<...>{...}`, `{...}`, `Vec2d(x, y)`.
  let i = from;
  while (i < to && (t[i]!.k === 'id' || isP(t[i], '::'))) i++;
  if (isP(t[i], '<')) {
    let d = 0;
    for (; i < to; i++) {
      if (isP(t[i], '<')) d++;
      else if (isP(t[i], '>') && --d === 0) {
        i++;
        break;
      }
    }
  }
  if ((isP(t[i], '{') || (i > from && isP(t[i], '('))) && closing(t, i, to) === to - 1) {
    const xs = args(t, i + 1, to - 1).map(([a, b]) => value(t, a, b, enumMap, depth + 1));
    if (!xs.every((x) => x !== undefined)) return undefined;
    // PrusaSlicer 3.0 wrappers: `Percentage{90}` is "90%", `FloatOrPercentage(x)` is x.
    const type = t[i - 1]?.v;
    if (type === 'Percentage' && xs.length === 1 && typeof xs[0] === 'number') return `${xs[0]}%`;
    if (type === 'FloatOrPercentage' && xs.length === 1) return xs[0];
    return xs as Value[];
  }
  // An enumerator, possibly qualified: `InfillPattern::ipRectilinear`, `gcfMarlinLegacy`.
  if (i === to && t[to - 1]!.k === 'id') {
    const name = t[to - 1]!.v;
    if (enumMap?.has(name)) return enumMap.get(name);
  }
  return undefined;
};

/** Indexes of every `name(` or `name =` at statement level whose name token is `id`. */
export const find = (t: Token[], id: string, from = 0, to = t.length): number[] => {
  const out: number[] = [];
  for (let i = from; i < to; i++) if (t[i]!.k === 'id' && t[i]!.v === id) out.push(i);
  return out;
};

/** The index of the token sequence `void <cls> :: <fn> (` (a function definition), or -1. */
export const functionAt = (t: Token[], cls: string, fn: string): number => {
  for (let i = 0; i + 3 < t.length; i++)
    if (isId_(t[i], cls) && isP(t[i + 1], '::') && isId_(t[i + 2], fn) && isP(t[i + 3], '(')) return i;
  return -1;
};

/** `name = { "a", "b" }`, `name { ... }` or `name = std::vector<...>{...}` string lists in `t`. */
export const stringList = (t: Token[], name: string): string[] => {
  for (const at of find(t, name)) {
    let i = at + 1;
    if (isP(t[i], '=')) i++;
    while (t[i] && t[i]!.k === 'id') i++;
    if (!isP(t[i], '{')) continue;
    const end = closing(t, i);
    const out: string[] = [];
    for (let k = i + 1; k < end; k++) if (t[k]!.k === 'str') out.push(t[k]!.v);
    return out;
  }
  throw new Error(`list ${name} not found`);
};

const listCache = new WeakMap<Token[], Map<string, string[]>>();
/** `stringList`, once per token array and name. */
const lists = (t: Token[], name: string): string[] => {
  const cache = listCache.get(t) ?? new Map<string, string[]>();
  listCache.set(t, cache);
  if (!cache.has(name)) cache.set(name, stringList(t, name));
  return cache.get(name)!;
};

/** `s_keys_map_<Enum>` tables: C++ enumerator to the string the slicer stores. */
export const enumMaps = (t: Token[]): Map<string, Map<string, string>> => {
  const maps = new Map<string, Map<string, string>>();
  for (let i = 0; i < t.length; i++) {
    const tok = t[i]!;
    if (tok.k !== 'id' || !tok.v.startsWith('s_keys_map_')) continue;
    let j = i + 1;
    if (isP(t[j], '=')) j++;
    if (!isP(t[j], '{')) continue;
    const end = closing(t, j);
    const map = new Map<string, string>();
    for (const [a, b] of args(t, j + 1, end)) {
      if (!isP(t[a], '{')) continue;
      const pair = args(t, a + 1, b - 1);
      if (pair.length !== 2) continue;
      const key = literal(t, pair[0]![0], pair[0]![1]);
      const last = t[pair[1]![1] - 1];
      const enumerator = last?.k === 'id' ? last.v : isP(last, ')') ? t[pair[1]![1] - 2]?.v : undefined;
      if (key !== undefined && enumerator) map.set(enumerator, key);
    }
    maps.set(tok.v.slice('s_keys_map_'.length), map);
    i = end;
  }
  return maps;
};

export { isP, isId_ as isId };

// ---- PrintConfigDef (PrusaSlicer 2.x layout: PrusaSlicer 2.9, its 3.0 legacy copy, SuperSlicer) ----

/** One option definition, as written in the source. */
export interface Def {
  key: string;
  co: string;
  nullable: boolean;
  line: number;
  label?: string;
  fullLabel?: string;
  tooltip?: string;
  sidetext?: string;
  category?: string;
  min?: number;
  max?: number;
  mode?: string;
  enumValues?: string[];
  enumLabels?: string[];
  enumType?: string;
  /** The `set_default_value(...)` argument, parsed; absent when it is not a constant. */
  value?: Value;
}

/** Index of the `;` ending the statement at `from` (or `to`). */
const statementEnd = (t: Token[], from: number, to: number): number => {
  let depth = 0;
  for (let i = from; i < to; i++) {
    const v = t[i]!.k === 'p' ? t[i]!.v : '';
    if (OPEN[v]) depth++;
    else if (v === ')' || v === '}' || v === ']') depth--;
    else if (v === ';' && depth <= 0) return i;
  }
  return to;
};

/** `{ "a", L("b") }` or `{ {"a", L("A")}, ... }` at `t[from, to)`: values and labels. */
const enumList = (t: Token[], from: number, to: number): { values: string[]; labels: string[] } | undefined => {
  if (!isP(t[from], '{')) return undefined;
  const values: string[] = [];
  const labels: string[] = [];
  for (const [a, b] of args(t, from + 1, closing(t, from, to))) {
    if (isP(t[a], '{')) {
      const pair = args(t, a + 1, closing(t, a, b));
      values.push(literal(t, pair[0]![0], pair[0]![1]) ?? '');
      labels.push(pair[1] ? (literal(t, pair[1][0], pair[1][1]) ?? '') : '');
    } else {
      values.push(literal(t, a, b) ?? '');
      labels.push('');
    }
  }
  return { values, labels };
};

/** `(boost::format("Maximum feedrate %1%") % axis_upper).str()`: the format string. */
const formatString = (t: Token[], from: number, to: number): string | undefined => {
  for (let i = from; i + 3 < to; i++)
    if (isId_(t[i], 'format') && isP(t[i + 1], '(') && t[i + 2]!.k === 'str') return t[i + 2]!.v;
  return undefined;
};

/** `new ConfigOption<Name>[Nullable][<T>](args)` or `{args}` at `t[from, to)` as a JSON value. */
export const defaultOf = (
  t: Token[],
  from: number,
  to: number,
  co: string,
  maps: Map<string, Map<string, string>>,
  enumType?: string,
  fields?: Map<string, Value>,
): Value | undefined => {
  if (!isId_(t[from], 'new') || !isId_(t[from + 1]) || !t[from + 1]!.v.startsWith('ConfigOption')) return undefined;
  const name = t[from + 1]!.v.slice('ConfigOption'.length).replace(/Nullable$/, '');
  let i = from + 2;
  let type = enumType;
  if (isP(t[i], '<')) {
    type = t[i + 1]?.v;
    while (i < to && !isP(t[i], '>')) i++;
    i++;
  }
  if (!isP(t[i], '(') && !isP(t[i], '{')) return undefined;
  const brace = isP(t[i], '{');
  const end = closing(t, i, to);
  const map = maps.get(type ?? '');
  const parts = args(t, i + 1, end);
  // `ConfigOptionFloats(axis.max_feedrate)`: a field of the loop's table row.
  if (fields && parts.length === 1) {
    const [a, b] = parts[0]!;
    if (b - a === 3 && isP(t[a + 1], '.') && fields.has(t[a + 2]!.v)) return fields.get(t[a + 2]!.v);
  }
  if (parts.length === 0) return /s$|Groups$|Generic$/.test(name) ? [] : name === 'String' ? '' : undefined;
  if (co === 'coFloatOrPercent') {
    const v = number(t, parts[0]![0], parts[0]![1]);
    const pct = parts[1] && isId_(t[parts[1][0]], 'true');
    return v === undefined ? undefined : pct ? `${v}%` : v;
  }
  if (co === 'coFloatsOrPercents') {
    const out: Value[] = [];
    for (let k = i + 1; k + 2 < end; k++)
      if (t[k]!.k === 'num' && isP(t[k + 1], ',') && (isId_(t[k + 2], 'true') || isId_(t[k + 2], 'false'))) {
        const n = number(t, isP(t[k - 1], '-') ? k - 1 : k, k + 1)!;
        out.push(t[k + 2]!.v === 'true' ? `${n}%` : n);
      }
    return out.length ? out : undefined;
  }
  if (!brace && parts.length === 1) return value(t, parts[0]![0], parts[0]![1], map);
  const xs = parts.map(([a, b]) => value(t, a, b, map));
  return xs.every((x) => x !== undefined) ? (xs as Value[]) : undefined;
};

/** Reads one definition's statements, `t[from, to)`, into `d` (a later block for the same key overrides). */
const readStatements = (
  t: Token[],
  from: number,
  to: number,
  d: Def,
  maps: Map<string, Map<string, string>>,
  others: Map<string, Def>,
  fields?: Map<string, Value>,
  axis?: string,
): void => {
  for (let i = from; i < to; i++) {
    if (!(isId_(t[i], 'def') && isP(t[i + 1], '->') && isId_(t[i + 2]))) continue;
    const field = t[i + 2]!.v;
    const end = statementEnd(t, i, to);
    const at = i + 3;
    if (isP(t[at], '=')) {
      const [a, b] = [at + 1, end];
      const text = () => {
        const s = literal(t, a, b);
        const f = axis ? formatString(t, a, b) : undefined;
        return s ?? f?.replace('%1%', axis!.toUpperCase());
      };
      if (field === 'label') d.label = text() ?? d.label;
      else if (field === 'full_label') d.fullLabel = text() ?? d.fullLabel;
      else if (field === 'tooltip') d.tooltip = text() ?? d.tooltip;
      else if (field === 'sidetext') d.sidetext = text() ?? d.sidetext;
      else if (field === 'category') {
        // `L("Infill")` (2.9) or `OptionCategory::infill` (SuperSlicer).
        d.category = literal(t, a, b) ?? (t[b - 1]?.k === 'id' ? t[b - 1]!.v : d.category);
      } else if (field === 'min') d.min = number(t, a, b) ?? d.min;
      else if (field === 'max') d.max = number(t, a, b) ?? d.max;
      else if (field === 'mode') {
        for (let k = a; k < b; k++)
          if (t[k]!.k === 'id' && t[k]!.v.startsWith('com')) {
            d.mode = t[k]!.v;
            break;
          }
      } else if (field === 'enum_keys_map') {
        for (let k = a; k < b; k++)
          if (isId_(t[k], 'ConfigOptionEnum') && isP(t[k + 1], '<')) d.enumType = t[k + 2]?.v;
          else if (t[k]!.k === 'id' && t[k]!.v.startsWith('s_keys_map_')) d.enumType = t[k]!.v.slice(11);
      } else if (field === 'enum_def') {
        // `clonable_ptr<...>(def_top_fill_pattern->enum_def->clone())`: the enum of another definition.
        for (let k = a; k < b; k++) {
          const from = t[k]!.k === 'id' && t[k]!.v.startsWith('def_') ? others.get(t[k]!.v.slice(4)) : undefined;
          if (!from) continue;
          d.enumType = from.enumType;
          d.enumValues = from.enumValues;
          d.enumLabels = from.enumLabels;
          break;
        }
      } else if (field === 'enum_values') d.enumValues = enumList(t, a, b)?.values ?? d.enumValues;
      else if (field === 'enum_labels') d.enumLabels = enumList(t, a, b)?.values ?? d.enumLabels;
    } else if (field === 'set_default_value' && isP(t[at], '(')) {
      // Also `disable_default_option(new ...)` and `(new ...)->set_phony(true)` (SuperSlicer).
      const c = closing(t, at, end);
      let k = at + 1;
      while (k < c && !isId_(t[k], 'new')) k++;
      d.value = defaultOf(t, k, c, d.co, maps, d.enumType, fields);
    } else if (field === 'set_enum' || field === 'set_enum_values' || field === 'set_enum_labels') {
      let k = at;
      if (isP(t[k], '<')) {
        d.enumType = t[k + 1]?.v === 'la' ? t[k + 3]?.v : t[k + 1]?.v;
        while (k < end && !isP(t[k], '>')) k++;
        k++;
      }
      // An optional GUI type first: `set_enum_values(ConfigOptionDef::GUIType::select_open, {...})`.
      const lists = isP(t[k], '(')
        ? args(t, k + 1, closing(t, k, end))
            .map(([a, b]) => enumList(t, a, b))
            .filter((x) => x !== undefined)
        : [];
      if (field === 'set_enum_labels') d.enumLabels = lists[0]?.values ?? d.enumLabels;
      else if (lists.length === 2) {
        d.enumValues = lists[0]!.values;
        d.enumLabels = lists[1]!.values;
      } else if (lists[0]) {
        d.enumValues = lists[0].values;
        if (lists[0].labels.some(Boolean)) d.enumLabels = lists[0].labels;
      }
    } else if ((field === 'enum_values' || field === 'enum_labels') && isP(t[at], '.')) {
      // `def->enum_values.push_back("x")`
      const s = literal(t, at + 3, end - 1);
      if (s !== undefined && field === 'enum_values') d.enumValues = [...(d.enumValues ?? []), s];
      else if (s !== undefined) d.enumLabels = [...(d.enumLabels ?? []), s];
    }
    i = end;
  }
};

interface Hit {
  at: number;
  nullable: boolean;
  key: [number, number];
  co: [number, number];
}

/** `def = this->add(key, co)` and `add_nullable` calls in `t[from, to)`. */
const hitsOf = (t: Token[], from: number, to: number): Hit[] => {
  const hits: Hit[] = [];
  for (let i = from; i + 3 < to; i++) {
    if (!(isId_(t[i], 'this') && isP(t[i + 1], '->') && isP(t[i + 3], '('))) continue;
    const fn = t[i + 2]!.v;
    if (fn !== 'add' && fn !== 'add_nullable') continue;
    if (!isP(t[i - 1], '=') || !isId_(t[i - 2], 'def')) continue;
    const c = closing(t, i + 3, to);
    const parts = args(t, i + 4, c);
    if (parts.length === 2) hits.push({ at: i - 2, nullable: fn === 'add_nullable', key: parts[0]!, co: parts[1]! });
    i = c;
  }
  return hits;
};

/** A `for (... <name> : list)` loop or an `auto <name> = [...](params) { ... }` lambda: a body that defines keys. */
interface Scope {
  open: number;
  close: number;
  line: number;
  /** The loop variable, or the lambda's parameter names. */
  names: string[];
  /** A loop's keys: a `{ "a", ... }` range, or a list's name. */
  list?: [number, number] | string;
  /** A lambda's name. */
  lambda?: string;
  /** A loop's keys, once read. */
  keys?: string[];
}

/** The scopes that define keys and the `axes` tables of `t[from, to)`, found in one forward pass. */
const scopesOf = (t: Token[], from: number, to: number) => {
  const scopes: Scope[] = [];
  const tables: { at: number; struct: number }[] = [];
  let struct = -1;
  for (let i = from; i < to; i++) {
    const tok = t[i]!;
    if (tok.k !== 'id') continue;
    if (tok.v === 'struct' && isId_(t[i + 1]) && isP(t[i + 2], '{')) struct = i + 2;
    else if (tok.v === 'axes' && isP(t[i + 1], '{')) tables.push({ at: i + 1, struct });
    else if (tok.v === 'for' && isP(t[i + 1], '(')) {
      const c = closing(t, i + 1, to);
      if (!isP(t[c + 1], '{')) continue;
      // The loop variable is the identifier before the top-level `:`.
      for (let k = i + 2; k < c; k++)
        if (isP(t[k], ':') && isId_(t[k - 1])) {
          const list: Scope['list'] = isP(t[k + 1], '{') ? [k + 1, closing(t, k + 1, c)] : t[k + 1]?.v;
          scopes.push({ open: c + 1, close: closing(t, c + 1, to), line: tok.line, names: [t[k - 1]!.v], list });
          break;
        }
      i = c;
    } else if (tok.v === 'auto' && isId_(t[i + 1]) && isP(t[i + 2], '=') && isP(t[i + 3], '[')) {
      const params = closing(t, i + 3, to) + 1;
      if (!isP(t[params], '(')) continue;
      const body = closing(t, params, to) + 1;
      if (!isP(t[body], '{')) continue;
      const names = args(t, params + 1, closing(t, params, to)).map(([, b]) => t[b - 1]!.v);
      scopes.push({ open: body, close: closing(t, body, to), line: tok.line, names, lambda: t[i + 1]!.v });
      i = body;
    }
  }
  // Calls of each lambda after its body: `add_belt_remap("gcode_remap_x", L("..."), ...)`.
  const calls = new Map<string, number[]>();
  const lambdas = new Map(scopes.filter((s) => s.lambda).map((s) => [s.lambda!, s]));
  for (let i = from; i + 1 < to; i++) {
    const s = t[i]!.k === 'id' ? lambdas.get(t[i]!.v) : undefined;
    if (!s || i <= s.close || !isP(t[i + 1], '(')) continue;
    const at = calls.get(s.lambda!) ?? [];
    calls.set(s.lambda!, at);
    // One past the cap is kept, so a lambda with too many calls is refused where its keys are read.
    if (at.length <= MAX_CALLS) at.push(i + 1);
  }
  return { scopes, tables, calls };
};

/** The rows of an `axes { {"x", {..}, ...}, ... }` table, keyed by its Row struct's field names. */
const axisRows = (t: Token[], table: { at: number; struct: number }): Map<string, Value>[] => {
  // struct AxisDefault { std::string name; std::vector<double> max_feedrate; ... };
  const names: string[] = [];
  if (table.struct >= 0)
    for (let i = table.struct + 1, end = closing(t, table.struct, table.at); i < end; i++)
      if (isP(t[i + 1], ';')) names.push(t[i]!.v);
  const rows = args(t, table.at + 1, closing(t, table.at));
  if (rows.length > 16) throw new Error(`line ${t[table.at]!.line}: more than 16 axes`);
  return rows.map(([a, b]) => {
    const row = value(t, a, b);
    if (!Array.isArray(row)) throw new Error(`line ${t[a]!.line}: bad axes row`);
    return new Map(row.map((v, i) => [names[i] ?? String(i), v]));
  });
};

/** At most this many enclosing scopes are searched for a loop variable; keeps hostile nesting linear. */
const SCOPE_DEPTH = 4;
/** At most this many calls of one lambda are expanded, and this many keys of one loop. */
export const MAX_CALLS = 64;
export const MAX_LOOP_KEYS = 1024;
/** Most tokens one expanded lambda body may have, arguments substituted. */
export const MAX_BODY_TOKENS = 1 << 16;
/** Most tokens a source may have after `#define` substitution. */
export const MAX_EXPANDED_TOKENS = 1 << 22;

/** A source that exceeds one of the scanner's bounds (rule 25). */
export class SourceLimitError extends Error {
  override name = 'SourceLimitError';
}

/** Every FFF definition in `init_common_params` and `init_fff_params`, in source order. */
export const extractDefs = (t: Token[], cls = 'PrintConfigDef'): Map<string, Def> => {
  const from = functionAt(t, cls, 'init_common_params');
  const to = functionAt(t, cls, 'init_extruder_option_keys');
  if (from < 0 || to < 0 || to < from) throw new Error(`${cls}::init_* not found`);
  const maps = enumMaps(t);
  const defs = new Map<string, Def>();
  const hits = hitsOf(t, from, to);
  const { scopes, tables, calls } = scopesOf(t, from, to);
  const rowsCache = new Map<number, Map<string, Value>[]>();
  const define = (
    key: string,
    co: string,
    nullable: boolean,
    line: number,
    src: Token[],
    [a, b]: [number, number],
    fields?: Map<string, Value>,
    axis?: string,
  ) => {
    const d = defs.get(key) ?? { key, co, nullable, line };
    d.co = co;
    readStatements(src, a, b, d, maps, defs, fields, axis);
    defs.set(key, d);
    return d;
  };
  // Scopes and tables open in source order and nest, so a stack and a pointer follow the hits.
  const open: Scope[] = [];
  let nextScope = 0;
  let table = -1;
  for (const [n, h] of hits.entries()) {
    const end = hits[n + 1]?.at ?? to;
    while (open.length && open.at(-1)!.close < h.at) open.pop();
    while (nextScope < scopes.length && scopes[nextScope]!.open < h.at) {
      const s = scopes[nextScope++]!;
      while (open.length && open.at(-1)!.close < s.open) open.pop();
      if (s.close > h.at) open.push(s);
    }
    while (table + 1 < tables.length && tables[table + 1]!.at < h.at) table++;
    const [ka, kb] = h.key;
    const co = t[h.co[0]]!.v;
    const line = t[h.at]!.line;
    if (kb - ka === 1 && t[ka]!.k === 'str') {
      define(t[ka]!.v, co, h.nullable, line, t, [h.at, end]);
      continue;
    }
    // "machine_max_feedrate_" + axis.name: one key per row of the `axes` table.
    if (kb - ka === 5 && t[ka]!.k === 'str' && isP(t[ka + 1], '+') && isId_(t[ka + 2]) && t[ka + 4]!.v === 'name') {
      if (table < 0) throw new Error(`line ${line}: axes table not found`);
      const at = tables[table]!.at;
      if (!rowsCache.has(at)) rowsCache.set(at, axisRows(t, tables[table]!));
      for (const row of rowsCache.get(at)!) {
        const axis = row.get('name') as string;
        define(t[ka]!.v + axis, co, h.nullable, line, t, [h.at, end], row, axis);
      }
      continue;
    }
    // The key is a loop variable (`opt_key`, possibly `std::string("filament_") + opt_key`) or a lambda parameter.
    if (!isId_(t[kb - 1])) continue;
    const name = t[kb - 1]!.v;
    const prefix = isP(t[kb - 2], '+') ? t.slice(ka, kb).find((x) => x.k === 'str')?.v : '';
    const scope = open.slice(-SCOPE_DEPTH).findLast((s) => s.names.includes(name));
    if (!scope || prefix === undefined) continue;
    if (scope.lambda) {
      // add_belt_remap("gcode_remap_x", L("label"), L("tooltip"), RemapAxis::PosX, comDevelop): the body, with each
      // parameter replaced by the call's argument.
      const at = calls.get(scope.lambda) ?? [];
      if (at.length > MAX_CALLS) throw new SourceLimitError(`${scope.lambda}: more than ${MAX_CALLS} calls`);
      for (const c of at) {
        const given = args(t, c + 1, closing(t, c, to));
        const keyArg = given[scope.names.indexOf(name)];
        const key = keyArg && literal(t, keyArg[0], keyArg[1]);
        if (!key) continue;
        const body: Token[] = [];
        for (let i = h.at; i < scope.close; i++) {
          // A parameter, not a member of the same name (`def->label = label`).
          const member = isP(t[i - 1], '->') || isP(t[i - 1], '.');
          const p = t[i]!.k === 'id' && !member ? scope.names.indexOf(t[i]!.v) : -1;
          const [a, b] = p >= 0 && given[p] ? given[p] : [i, i + 1];
          if (body.length + b - a > MAX_BODY_TOKENS)
            throw new SourceLimitError(`line ${t[c]!.line}: ${scope.lambda} expands past ${MAX_BODY_TOKENS} tokens`);
          for (let k = a; k < b; k++) body.push(t[k]!);
        }
        define(key, co, h.nullable, t[c]!.line, body, [0, body.length]);
      }
      continue;
    }
    if (!scope.keys) {
      scope.keys = Array.isArray(scope.list)
        ? t.slice(scope.list[0], scope.list[1]).flatMap((x) => (x.k === 'str' ? [x.v] : []))
        : scope.list
          ? lists(t, scope.list)
          : [];
      if (scope.keys.length > MAX_LOOP_KEYS)
        throw new SourceLimitError(`line ${scope.line}: more than ${MAX_LOOP_KEYS} loop keys`);
    }
    const keys = scope.keys;
    if (co.startsWith('co') && !prefix) {
      // for (const char* key : {"a", "b"}) { def = this->add(key, coString); ... }: the body's statements are read
      // once, up to the loop's close, and copied onto each key.
      const read: Def = { key: '', co, nullable: h.nullable, line };
      readStatements(t, h.at, Math.min(end, scope.close), read, maps, defs);
      const set = Object.fromEntries(Object.entries(read).filter(([f, v]) => v !== undefined && f !== 'key'));
      for (const key of keys) {
        const d = defs.get(key);
        defs.set(key, d ? { ...d, ...set, key, nullable: d.nullable, line: d.line } : { ...read, key });
      }
      continue;
    }
    // A copy of each listed extruder key for the filament: Prusa adds "filament_" to `opt_key`, Orca's list already
    // holds `filament_*` names. A mode chosen by `opt_key == "..."` tests applies to the keys tested (Orca).
    const tested = new Set<string>();
    const modes: string[] = [];
    for (let i = h.at; i < end; i++) {
      if (isId_(t[i], name) && isP(t[i + 1], '=') && isP(t[i + 2], '=') && t[i + 3]?.k === 'str')
        tested.add(t[i + 3]!.v);
      if (isId_(t[i], 'def') && isP(t[i + 1], '->') && isId_(t[i + 2], 'mode') && isP(t[i + 3], '=')) {
        const m = t[i + 4];
        if (m?.k === 'id' && m.v.startsWith('com')) modes.push(m.v);
      }
    }
    const explicit = co.startsWith('co') ? co : undefined;
    for (const listed of keys) {
      const key = prefix + listed;
      const baseKey = prefix ? listed : listed.replace(/^filament_/, '');
      const base = defs.get(baseKey);
      if (!base) throw new Error(`${key}: no ${baseKey} to copy`);
      const d: Def = { ...base, key, nullable: h.nullable, line: scope.line, co: explicit ?? base.co };
      if (explicit && explicit !== base.co) delete d.value;
      if (modes.length) d.mode = tested.has(key) ? modes[0] : modes.at(-1);
      defs.set(key, d);
    }
  }
  return defs;
};

/** `#define NAME value` lines of a header, as tokens to substitute. */
export const defines = (header: string): Map<string, Token[]> => {
  const out = new Map<string, Token[]>();
  for (const raw of header.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('#define')) continue;
    const parts = line.slice(7).trim().split(/\s+/);
    if (parts.length >= 2 && /^\w+$/.test(parts[0]!)) out.set(parts[0]!, tokenize(parts.slice(1).join(' ')));
  }
  return out;
};

/** `t` with each defined identifier replaced by its value's tokens, on the identifier's line. */
export const substitute = (t: Token[], defs: Map<string, Token[]>, max = MAX_EXPANDED_TOKENS): Token[] => {
  if (defs.size === 0) return t;
  // Counted before anything is allocated, so a define used many times is refused at once.
  let size = 0;
  for (const x of t) size += x.k === 'id' ? (defs.get(x.v)?.length ?? 1) : 1;
  if (size > max) throw new SourceLimitError(`#define substitution makes ${size} tokens, over ${max}`);
  return t.flatMap((x) => (x.k === 'id' && defs.has(x.v) ? defs.get(x.v)!.map((y) => ({ ...y, line: x.line })) : [x]));
};

// ---- PrusaSlicer 3.0 domain definitions (`def = defs.add("key", typeid(T))`) ----

/** One 3.0 definition: the 2.x fields it shares, plus its C++ type and its config location. */
export interface DomainDef extends Def {
  /** `double`, `std::vector<double>`, `EnumWrapper`, ... */
  cppType: string;
  /** `Print`, `Filament`, `Printer`, `Tool`, `Object`, `Volume`, `Project`. */
  location?: string;
}

/** `{ int(E::x), "x", L("X") }` triples in `t[from, to)`: enumerator to value, and the labels. */
const enumTriples = (t: Token[], from: number, to: number) => {
  const map = new Map<string, string>();
  const labels: string[] = [];
  for (let i = from; i + 1 < to; i++) {
    if (!(isP(t[i], '{') && isId_(t[i + 1], 'int'))) continue;
    const c = closing(t, i, to);
    const parts = args(t, i + 1, c);
    if (parts.length >= 2) {
      const enumerator = t[parts[0]![1] - 2];
      const v = literal(t, parts[1]![0], parts[1]![1]);
      if (enumerator?.k === 'id' && v !== undefined) {
        map.set(enumerator.v, v);
        labels.push(parts[2] ? (literal(t, parts[2][0], parts[2][1]) ?? '') : '');
      }
    }
    i = c;
  }
  return { map, labels };
};

/** Every definition added with `defs.add` in `t`, in source order. */
export const extractDomain = (t: Token[]): Map<string, DomainDef> => {
  const hits: { at: number; key: [number, number]; type: [number, number] }[] = [];
  for (let i = 2; i + 3 < t.length; i++) {
    if (!(isId_(t[i], 'defs') && isP(t[i + 1], '.') && isId_(t[i + 2], 'add') && isP(t[i + 3], '('))) continue;
    if (!(isP(t[i - 1], '=') && isId_(t[i - 2]))) continue;
    const c = closing(t, i + 3);
    const parts = args(t, i + 4, c);
    if (parts.length === 2 && isId_(t[parts[1]![0]], 'typeid'))
      hits.push({ at: i - 2, key: parts[0]!, type: [parts[1]![0] + 2, parts[1]![1] - 1] });
    i = c;
  }
  const defs = new Map<string, DomainDef>();
  const { tables } = scopesOf(t, 0, t.length);
  let table = -1;
  for (const [n, h] of hits.entries()) {
    const end = hits[n + 1]?.at ?? t.length;
    while (table + 1 < tables.length && tables[table + 1]!.at < h.at) table++;
    const cppType = t
      .slice(h.type[0], h.type[1])
      .map((x) => x.v)
      .join('');
    const [ka, kb] = h.key;
    let keys: { key: string; axis?: string; fields?: Map<string, Value> }[];
    if (kb - ka === 1 && t[ka]!.k === 'str') keys = [{ key: t[ka]!.v }];
    else if (kb - ka === 5 && t[ka]!.k === 'str' && t[ka + 4]!.v === 'name')
      keys = (table < 0 ? [] : axisRows(t, tables[table]!)).map((row) => ({
        key: t[ka]!.v + String(row.get('name')),
        axis: String(row.get('name')),
        fields: row,
      }));
    else throw new Error(`line ${t[h.at]!.line}: unsupported key expression`);
    const { map, labels } = enumTriples(t, h.at, end);
    for (const k of keys) {
      const d: DomainDef = defs.get(k.key) ?? { key: k.key, co: '', cppType, nullable: false, line: t[h.at]!.line };
      d.cppType = cppType;
      readStatements(t, h.at, end, d, new Map(), defs, k.fields, k.axis);
      for (let i = h.at; i + 3 < end; i++) {
        if (!(isId_(t[i], 'def') && isP(t[i + 1], '->') && isId_(t[i + 2]) && isP(t[i + 3], '='))) continue;
        const field = t[i + 2]!.v;
        const e = statementEnd(t, i, end);
        // ConfigCommon.cpp names its locations `printer` and `print`.
        if (field === 'location' && t[e - 1]?.k === 'id')
          d.location = t[e - 1]!.v.replace(/^./, (c) => c.toUpperCase());
        else if (field === 'units') d.sidetext = enumList(t, i + 4, e)?.values[0] ?? d.sidetext;
        else if (field === 'init_fn' && (isId_(t[i + 4], 'init_with') || isId_(t[i + 4], 'SET_DEFAULT'))) {
          const c = closing(t, i + 5, e);
          const first = args(t, i + 6, c)[0];
          if (first) {
            const [a, b] = first;
            // `init_with(max_feedrate)` names the loop row's field; `new ConfigOption...` is the 2.x form.
            d.value = isId_(t[a], 'new')
              ? defaultOf(t, a, b, d.co, new Map())
              : b - a === 1 && k.fields?.has(t[a]!.v)
                ? k.fields.get(t[a]!.v)
                : value(t, a, b, map);
          }
        }
        i = e;
      }
      if (map.size) {
        d.enumValues = [...map.values()];
        d.enumLabels = labels;
      }
      defs.set(k.key, d);
    }
  }
  return defs;
};
