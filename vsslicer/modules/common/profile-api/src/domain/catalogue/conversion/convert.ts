// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure value conversion per catalogue conversion kind. `fromNative` reads native -> unified, `toNative` is its inverse.
import type { SettingValue } from '../../entities/index.ts';
import type { Conversion } from '../entry.ts';
import { ConversionError } from './errors.ts';

/** `lossy` is set, with the reason, when `toNative(fromNative(x))` may differ from `x`. */
export interface Converted {
  value: SettingValue;
  lossy?: string;
}

export interface ConvertOptions {
  /**
   * percent_of, `toNative`: unified value of the key the percentage is relative to. Needed only when the target
   * dialect cannot hold a percentage; without it a `%` value stays relative (`"50%"`).
   */
  base?: number;
  /** percent_of, `toNative`: the target dialect cannot hold a percentage, so resolve it against `base`. */
  resolve?: boolean;
}

const num = (v: SettingValue): number => {
  if (typeof v !== 'number' || !Number.isFinite(v))
    throw new ConversionError('not_a_number', `Not a number: ${JSON.stringify(v)}`);
  return v;
};

const PERCENT = /^\s*(-?\d+(?:\.\d+)?)\s*%\s*$/;
const percentOf = (v: SettingValue): number | undefined => {
  const m = typeof v === 'string' ? PERCENT.exec(v) : null;
  return m ? Number(m[1]) : undefined;
};

/** Drops float noise (-0.07 * 100) at 12 significant digits, far beyond any slicer setting. */
const tidy = (x: number): number => Number(x.toPrecision(12));

/** Multiply by the integer reciprocal where there is one, so factor 0.01 inverts as *100 without float noise. */
const divide = (x: number, factor: number): number => {
  const inv = Math.round(1 / factor);
  return Math.abs(1 / factor - inv) < 1e-9 ? x * inv : x / factor;
};

const invert = (m: { [k: string]: string }): { [k: string]: string } => {
  const out: { [k: string]: string } = {};
  for (const [k, v] of Object.entries(m)) out[v] ??= k;
  return out;
};

const enumOf = (v: SettingValue, table: { [k: string]: string }, side: string): string => {
  if (typeof v === 'string' && Object.hasOwn(table, v)) return table[v] as string;
  throw new ConversionError('unmapped_enum_value', `No ${side} mapping for enum value ${JSON.stringify(v)}`);
};

function checkScale(c: Conversion & { kind: 'scale' }): void {
  if (c.factor === 0 || !Number.isFinite(c.factor))
    throw new ConversionError('zero_factor', 'Scale factor must be non-zero and finite');
}

/** Native -> unified. Throws `ConversionError` when the value has no unified form. */
export function fromNative(c: Conversion | undefined, native: SettingValue): Converted {
  if (!c || c.kind === 'identity') return { value: native };
  switch (c.kind) {
    case 'scale':
      checkScale(c);
      return { value: tidy(num(native) * c.factor + (c.offset ?? 0)) };
    case 'sign_flip':
      return { value: 0 - num(native) };
    case 'percent_of':
      // A percentage stays relative; a plain number is absolute.
      return { value: percentOf(native) !== undefined ? `${percentOf(native)}%` : num(native) };
    case 'enum_map': {
      const value = enumOf(native, c.map, 'unified');
      const back = (c.reverse ?? invert(c.map))[value];
      return back === native
        ? { value }
        : { value, lossy: `native "${String(native)}" and "${String(back)}" both map to "${value}"` };
    }
    case 'split':
      return fromSplit(c.keys, native);
  }
}

/** Unified -> native, the inverse of `fromNative`. */
export function toNative(c: Conversion | undefined, unified: SettingValue, opts: ConvertOptions = {}): Converted {
  if (!c || c.kind === 'identity') return { value: unified };
  switch (c.kind) {
    case 'scale':
      checkScale(c);
      return { value: tidy(divide(num(unified) - (c.offset ?? 0), c.factor)) };
    case 'sign_flip':
      return { value: 0 - num(unified) };
    case 'percent_of': {
      const pct = percentOf(unified);
      if (pct === undefined) return { value: num(unified) };
      if (!opts.resolve) return { value: `${pct}%` };
      if (opts.base === undefined)
        throw new ConversionError(
          'percent_base_missing',
          `"${String(unified)}" is relative to "${c.of}", whose value is needed`,
        );
      return {
        value: (opts.base * pct) / 100,
        lossy: `resolved ${String(unified)} of ${c.of} (${opts.base}); no longer relative`,
      };
    }
    case 'enum_map': {
      const value = enumOf(unified, c.reverse ?? invert(c.map), 'native');
      return { value };
    }
    case 'split':
      return toSplit(c.keys, unified);
  }
}

type Split = Extract<Conversion, { kind: 'split' }>['keys'];
type Rec = { [k: string]: SettingValue };

const names = (keys: Split): string[] => (Array.isArray(keys) ? keys : Object.keys(keys));
const natives = (keys: Split): string[] => (Array.isArray(keys) ? keys : Object.values(keys));

/** Split native -> unified: `native` is `{nativeKey: value}`; the unified form is a list (list keys) or `{surfaceType: value}` (map keys). */
function fromSplit(keys: Split, native: SettingValue): Converted {
  const rec = asRecord(native);
  const need = natives(keys);
  const missing = need.filter((k) => !(k in rec));
  if (missing.length) throw new ConversionError('split_mismatch', `Missing native keys: ${missing.join(', ')}`);
  if (Array.isArray(keys)) return { value: keys.map((k) => rec[k] as SettingValue) };
  return { value: Object.fromEntries(Object.entries(keys).map(([s, k]) => [s, rec[k] as SettingValue])) };
}

function toSplit(keys: Split, unified: SettingValue): Converted {
  if (Array.isArray(keys)) {
    if (!Array.isArray(unified) || unified.length !== keys.length)
      throw new ConversionError('split_mismatch', `Expected a list of ${keys.length} values`);
    return { value: Object.fromEntries(keys.map((k, i) => [k, unified[i] as SettingValue])) };
  }
  const rec = asRecord(unified);
  const missing = names(keys).filter((s) => !(s in rec));
  if (missing.length) throw new ConversionError('split_mismatch', `Missing surface types: ${missing.join(', ')}`);
  return { value: Object.fromEntries(Object.entries(keys).map(([s, k]) => [k, rec[s] as SettingValue])) };
}

function asRecord(v: SettingValue): Rec {
  if (v === null || typeof v !== 'object' || Array.isArray(v) || 'expr' in v)
    throw new ConversionError('split_mismatch', 'Expected an object of values');
  return v as Rec;
}
