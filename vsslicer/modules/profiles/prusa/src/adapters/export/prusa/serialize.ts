// SPDX-License-Identifier: AGPL-3.0-or-later
// PrusaSlicer's value serializer, as the PRF-43 spike measured it (docs/spikes/flatten-export.md, "What PrusaSlicer
// writes"): ported from `.reference/notes/PRF-43-probe/probe.mjs` (`g()`, `canon()`), which reimplements the
// behaviour of PrusaSlicer@b028299c:src/libslic3r/Config.hpp:715-730 (floats), :848-857 (`nil`), :1166-1176
// (percents), Config.cpp:54-149 (string escapers). Behaviour read from AGPL-3.0 source; no PrusaSlicer code copied.
import { splitList } from '../../import/flatten.ts';
import type { OptionType } from './types.ts';

/** `std::ostream << double` with default flags and precision 6, which is printf `%g`. */
export function g(v: number): string {
  if (v === 0) return Object.is(v, -0) ? '-0' : '0';
  const e = Math.floor(Math.log10(Math.abs(Number(v.toPrecision(6)))));
  if (e < -4 || e >= 6) {
    const [m, x] = v.toExponential(5).split('e') as [string, string];
    const man = m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m;
    const n = Number(x);
    return `${man}e${n < 0 ? '-' : '+'}${String(Math.abs(n)).padStart(2, '0')}`;
  }
  const s = v.toFixed(Math.max(0, 5 - e));
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}

const num = (s: string): string | undefined => {
  const t = s.trim();
  if (t === '' || t === 'nil') return t;
  const v = Number.parseFloat(t);
  return Number.isFinite(v) ? g(v) : undefined;
};
const int = (s: string): string | undefined => {
  const t = s.trim();
  if (t === 'nil') return t;
  const v = Number.parseInt(t, 10);
  return Number.isFinite(v) ? String(v) : undefined;
};
const pct = (s: string): string | undefined => {
  const t = s.trim();
  if (t === 'nil') return t;
  const n = num(t.endsWith('%') ? t.slice(0, -1) : t);
  return n === undefined ? undefined : n + (t.endsWith('%') ? '%' : '');
};
const percent = (s: string): string | undefined => {
  const t = s.trim();
  if (t === 'nil') return t;
  const n = num(t.endsWith('%') ? t.slice(0, -1) : t);
  return n === undefined ? undefined : `${n}%`;
};
/** Every element formatted, or undefined when one fails. */
const each = (parts: string[], f: (s: string) => string | undefined, sep: string): string | undefined => {
  const out: string[] = [];
  for (const p of parts) {
    const v = f(p);
    if (v === undefined) return undefined;
    out.push(v);
  }
  return out.join(sep);
};

/** `escape_string_cstyle` (Config.cpp:54-75): unified strings hold decoded text (the importer unescapes them). */
const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r');

const escapeStrings = (a: string[]) =>
  a
    .map((s) =>
      (a.length === 1 && s === '') || /[ ;\t\\"\r\n]/.test(s)
        ? `"${s
            .replace(/[\\"]/g, (c) => `\\${c}`)
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')}"`
        : s,
    )
    .join(';');

/** A value as PrusaSlicer would write it for an option of this type; undefined when it is not a valid value. */
export function canon(type: OptionType, raw: string): string | undefined {
  switch (type) {
    case 'coFloat':
      return num(raw);
    case 'coFloats':
      return each(raw.split(','), num, ',');
    case 'coInt':
      return int(raw);
    case 'coInts':
      return each(raw.split(','), int, ',');
    case 'coPercent':
      return percent(raw);
    case 'coPercents':
      return each(raw.split(','), percent, ',');
    case 'coFloatOrPercent':
      return pct(raw);
    case 'coFloatsOrPercents':
      return each(raw.split(','), pct, ',');
    case 'coBool':
    case 'coBools':
    case 'coEnum':
    case 'coEnums':
      return raw; // 0/1 and enum names, written as stored
    case 'coString':
      return escape(raw);
    case 'coStrings': {
      const a = splitList(raw);
      return a && escapeStrings(a);
    }
    case 'coPoint':
    case 'coPoint3':
      return each(raw.split(/[,x]/), num, ',');
    case 'coPoints':
      return each(raw.split(','), (p) => each(p.split('x'), num, 'x'), ',');
  }
}
