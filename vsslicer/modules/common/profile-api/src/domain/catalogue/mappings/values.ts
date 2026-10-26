// SPDX-License-Identifier: AGPL-3.0-or-later
// Parsing and formatting of native values with the rule 25 bounds. No regex runs over the input: every scan is a
// single pass with indexOf or a character loop.
import type { SettingValue } from '../../entities/index.ts';
import { ConversionError } from '../conversion/index.ts';

/** A scalar native value is at most this many characters (rule 25). */
export const MAX_SCALAR = 64;
/** Text (G-code) and a whole polygon string; each point of a polygon still obeys MAX_SCALAR. */
export const MAX_TEXT = 1 << 20;
export const MAX_POINTS = 4096;
export const MAX_LIST = 16;

export type Raw = string | number | boolean | null | readonly (string | number)[];

export type MappingErrorCode = 'value_too_long' | 'invalid_value' | 'unsupported' | 'unknown_key';

/** A value or key the mappings reject; conversion arithmetic errors stay `ConversionError`. */
export class MappingError extends Error {
  readonly code: MappingErrorCode;
  constructor(code: MappingErrorCode, message: string) {
    super(message);
    this.name = 'MappingError';
    this.code = code;
  }
}

export type Kind =
  'int' | 'float' | 'bool' | 'string' | 'enum' | 'text' | 'percent' | 'float_or_percent' | 'point' | 'polygon' | 'list';

const NUM_CHARS = '0123456789.-+eE';

function scalarString(s: string, max = MAX_SCALAR): string {
  if (s.length > max) throw new MappingError('value_too_long', `Value of ${s.length} characters exceeds ${max}`);
  return s;
}

/** A finite number from a number or a short numeric string; never NaN. */
export function toNum(v: unknown): number {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new ConversionError('not_a_number', 'Not a finite number');
    return v;
  }
  if (typeof v !== 'string') throw new ConversionError('not_a_number', `Not a number: ${JSON.stringify(v)}`);
  const s = scalarString(v).trim();
  for (const ch of s)
    if (!NUM_CHARS.includes(ch)) throw new ConversionError('not_a_number', `Not a number: ${JSON.stringify(v)}`);
  const n = s === '' ? NaN : Number(s);
  if (!Number.isFinite(n)) throw new ConversionError('not_a_number', `Not a number: ${JSON.stringify(v)}`);
  return n;
}

const toBool = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  const s = typeof v === 'string' ? scalarString(v).trim().toLowerCase() : v;
  if (s === '1' || s === 1 || s === 'true') return true;
  if (s === '0' || s === 0 || s === 'false') return false;
  throw new MappingError('invalid_value', `Not a boolean: ${JSON.stringify(v)}`);
};

const toStr = (v: unknown, max: number): string => {
  if (typeof v !== 'string') throw new MappingError('invalid_value', `Not a string: ${JSON.stringify(v)}`);
  return scalarString(v, max);
};

/** "N%" or N; the percent keeps its form unless `strip`. */
function toPercentOrNum(v: unknown, strip: boolean): SettingValue {
  if (typeof v === 'string') {
    const s = scalarString(v).trim();
    if (s.endsWith('%')) {
      const n = toNum(s.slice(0, -1));
      return strip ? n : `${n}%`;
    }
  }
  return toNum(v);
}

const pointOf = (v: unknown): [number, number] => {
  if (Array.isArray(v) && v.length === 2) return [toNum(v[0]), toNum(v[1])];
  const s = toStr(v, MAX_SCALAR);
  const i = s.indexOf('x');
  if (i < 0 || s.indexOf('x', i + 1) >= 0) throw new MappingError('invalid_value', `Not a point "AxB": ${s}`);
  return [toNum(s.slice(0, i)), toNum(s.slice(i + 1))];
};

const items = (v: unknown, max: number, whole: number): unknown[] => {
  const a = Array.isArray(v) ? (v as unknown[]) : toStr(v, whole).split(',');
  if (a.length > max) throw new MappingError('value_too_long', `More than ${max} entries`);
  return a;
};

/** Native -> unified value of one kind. `nil` (Orca's "not set") is null. */
export function parse(kind: Kind, raw: Raw): SettingValue {
  if (raw === null || raw === 'nil') return null;
  switch (kind) {
    case 'int': {
      const n = toNum(raw);
      if (!Number.isInteger(n)) throw new MappingError('invalid_value', `Not an integer: ${n}`);
      return n;
    }
    case 'float':
      return toNum(raw);
    case 'bool':
      return toBool(raw);
    case 'string':
    case 'enum':
      return toStr(raw, MAX_SCALAR);
    case 'text':
      return toStr(raw, MAX_TEXT);
    case 'percent':
      return toPercentOrNum(raw, true);
    case 'float_or_percent':
      return toPercentOrNum(raw, false);
    case 'point':
      return pointOf(raw);
    case 'polygon':
      return items(raw, MAX_POINTS, MAX_TEXT).map(pointOf);
    case 'list':
      return items(raw, MAX_LIST, MAX_SCALAR * MAX_LIST).map(toNum);
  }
}

/** Unified -> a native-typed value; `prusa` writes lists as one comma string, Orca as arrays. */
export function format(kind: Kind, u: SettingValue, style: 'prusa' | 'orca' | 'cura'): Raw {
  if (u === null) return style === 'cura' ? null : 'nil';
  switch (kind) {
    case 'int':
    case 'float':
      return toNum(u);
    case 'bool':
      return toBool(u);
    case 'string':
    case 'enum':
      return toStr(u, MAX_SCALAR);
    case 'text':
      return toStr(u, MAX_TEXT);
    case 'percent': {
      const n = toNum(u);
      return style === 'cura' ? n : `${n}%`;
    }
    case 'float_or_percent':
      return typeof u === 'string' ? (parse(kind, u) as string) : toNum(u);
    case 'point': {
      const [x, y] = pointOf(u);
      return `${x}x${y}`;
    }
    case 'polygon': {
      const pts = items(u, MAX_POINTS, MAX_TEXT).map((p) => {
        const [x, y] = pointOf(p);
        return `${x}x${y}`;
      });
      return style === 'prusa' ? pts.join(',') : pts;
    }
    case 'list': {
      const ns = items(u, MAX_LIST, MAX_SCALAR * MAX_LIST).map(toNum);
      return style === 'prusa' ? ns.join(',') : ns;
    }
  }
}
