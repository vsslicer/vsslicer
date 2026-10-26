// SPDX-License-Identifier: AGPL-3.0-or-later
// Native <-> unified for one mapped key. Both sides are records keyed by native key name, so keys that Cura or Orca
// spread over several native keys (bed size, plate temperatures, ironing) use the same call as single-key ones.
import type { SettingValue } from '../../entities/index.ts';
import { fromNative, toNative, type Converted } from '../conversion/index.ts';
import { orcaCatalogue } from '../orca.ts';
import { familyOf, RULES, type MappedDialect, type Rule } from './rules.ts';
import { format, MappingError, parse, toNum, type Raw } from './values.ts';

export type NativeRecord = { [nativeKey: string]: Raw };
export interface NativeResult {
  native: NativeRecord;
  lossy?: string;
}
export interface ToNativeOptions {
  /** Unified values of the keys a `%` is relative to (`nozzle_diameter`, `layer_height`), for dialects that cannot hold a percentage. */
  bases?: { [unifiedKey: string]: number };
}

const PLATES: { [surface: string]: string } = {
  supertack: 'supertack',
  cool: 'cool',
  textured_cool: 'textured_cool',
  engineering: 'eng',
  hot: 'hot',
  textured: 'textured',
};
const SINGLE_PLATE_ORDER = ['hot', 'textured', 'engineering', 'cool', 'textured_cool', 'supertack'];

const join = (...notes: (string | undefined)[]): string | undefined => {
  const n = notes.filter((x): x is string => !!x);
  return n.length ? n.join('; ') : undefined;
};
const withLossy = <T extends object>(r: T, lossy: string | undefined): T & { lossy?: string } =>
  lossy ? { ...r, lossy } : r;

function ruleOf(dialect: MappedDialect, key: string): Rule {
  const rule = Object.hasOwn(RULES, key) ? RULES[key] : undefined;
  if (!rule) throw new MappingError('unknown_key', `Not one of the mapped keys: ${key}`);
  const fam = familyOf(dialect);
  const native = orcaCatalogue.entries[key]?.native[dialect];
  if (rule.none?.includes(fam) || !native) throw new MappingError('unsupported', `${key} has no ${dialect} equivalent`);
  return rule;
}

/** The native keys one unified key spans in a dialect. */
export function nativeKeys(dialect: MappedDialect, key: string): string[] {
  const rule = ruleOf(dialect, key);
  const fam = familyOf(dialect);
  const suffix = key.endsWith('_initial_layer') ? '_initial_layer' : '';
  if (rule.custom === 'plates' && fam === 'orca') return Object.values(PLATES).map((p) => `${p}_plate_temp${suffix}`);
  if (rule.custom === 'ironing' && fam !== 'orca')
    return fam === 'prusa' ? ['ironing', 'ironing_type'] : ['ironing_enabled', 'ironing_only_highest_layer'];
  if (rule.custom === 'bed' && fam === 'cura')
    return ['machine_width', 'machine_depth', 'machine_center_is_zero', 'machine_shape'];
  if (rule.custom === 'extruder_offset' && fam === 'cura')
    return ['machine_nozzle_offset_x', 'machine_nozzle_offset_y'];
  const n = orcaCatalogue.entries[key]?.native[dialect];
  return [n && 'key' in n ? n.key : ''];
}

const note = (dialect: MappedDialect, key: string, rule: Rule): string | undefined =>
  join(orcaCatalogue.entries[key]?.native[dialect]?.lossy, rule.notes?.[familyOf(dialect)]);

const need = (rec: NativeRecord, k: string): Raw => {
  if (!(k in rec) || rec[k] === undefined) throw new MappingError('invalid_value', `Missing native key ${k}`);
  return rec[k];
};
const style = (d: MappedDialect) => (familyOf(d) === 'prusa' ? 'prusa' : familyOf(d) === 'cura' ? 'cura' : 'orca');
const asMap = (u: SettingValue): { [k: string]: SettingValue } => {
  if (u === null || typeof u !== 'object' || Array.isArray(u) || 'expr' in u)
    throw new MappingError('invalid_value', 'Expected an object of values');
  return u as { [k: string]: SettingValue };
};

/** Native -> unified. Throws `ConversionError` for an unconvertible value and `MappingError` for a bad key or shape. */
export function nativeToUnified(dialect: MappedDialect, key: string, native: NativeRecord): Converted {
  const rule = ruleOf(dialect, key);
  const fam = familyOf(dialect);
  const custom = rule.custom;
  const lossy = note(dialect, key, rule);
  const k0 = nativeKeys(dialect, key)[0] as string;
  const out = (r: Converted, extra?: string) => withLossy({ value: r.value }, join(lossy, r.lossy, extra));

  if (custom === 'plates') return out(fromPlates(fam, key, native, k0));
  if (custom === 'ironing' && fam !== 'orca') return out(fromIroning(fam, native));
  if (custom === 'bed') return out(fromBed(fam, native, k0));
  if (custom === 'extruder_offset' && fam === 'cura')
    return out({
      value: [toNum(need(native, 'machine_nozzle_offset_x')), toNum(need(native, 'machine_nozzle_offset_y'))],
    });
  if (custom === 'chamber' && dialect === 'bambu') {
    const raw = need(native, k0);
    const first = Array.isArray(raw) ? raw[0] : raw;
    return out(
      { value: parse('int', first as Raw) },
      'Bambu holds one chamber temperature per filament; the first is used',
    );
  }
  if (custom === 'single_list' && fam === 'cura') {
    const n = toNum(need(native, k0));
    return out({ value: [n, n] }, 'Cura has one limit; used for both entries (normal and silent)');
  }
  const u = parse(rule.kind, need(native, k0));
  if (u === null) return { value: null };
  const conv = rule.conv?.[fam];
  return out(conv ? fromNative(conv, u) : { value: u });
}

/** Unified -> native, the inverse of `nativeToUnified`. */
export function unifiedToNative(
  dialect: MappedDialect,
  key: string,
  unified: SettingValue,
  opts: ToNativeOptions = {},
): NativeResult {
  const rule = ruleOf(dialect, key);
  const fam = familyOf(dialect);
  const lossy = note(dialect, key, rule);
  const k0 = nativeKeys(dialect, key)[0] as string;
  const out = (native: NativeRecord, extra?: string, dyn?: string) => withLossy({ native }, join(lossy, dyn, extra));

  if (rule.custom === 'plates') return out(...toPlates(fam, key, unified));
  if (rule.custom === 'ironing' && fam !== 'orca') return out(...toIroning(fam, unified));
  if (rule.custom === 'bed') return out(...toBed(fam, unified));
  if (rule.custom === 'extruder_offset' && fam === 'cura') {
    const [x, y] = format('list', unified, 'cura') as number[];
    return out({ machine_nozzle_offset_x: x as number, machine_nozzle_offset_y: y as number });
  }
  if (rule.custom === 'chamber' && dialect === 'bambu')
    return out({ [k0]: [format('int', unified, 'orca') as number] });
  if (rule.custom === 'single_list' && fam === 'cura') {
    const first = (format('list', unified, 'cura') as number[])[0];
    return out({ [k0]: first as number }, 'Cura has one limit; only the first entry (normal) is kept');
  }

  let v = unified;
  let dyn: string | undefined;
  if (rule.kind === 'float_or_percent' && typeof v === 'string' && !rule.relative?.includes(fam)) {
    const r = toNative({ kind: 'percent_of', of: rule.of as string }, v, {
      resolve: true,
      ...(opts.bases?.[rule.of as string] !== undefined ? { base: opts.bases[rule.of as string] as number } : {}),
    });
    v = r.value;
    dyn = r.lossy;
  }
  const conv = rule.conv?.[fam];
  if (conv && v !== null) v = toNative(conv, v).value;
  return out({ [k0]: format(rule.kind, v, style(dialect)) }, undefined, dyn);
}

function fromPlates(fam: string, key: string, native: NativeRecord, k0: string): Converted {
  if (fam !== 'orca') {
    const n = parse('int', need(native, k0));
    return {
      value: Object.fromEntries(Object.keys(PLATES).map((s) => [s, n])),
      lossy: 'one bed temperature applied to every plate type',
    };
  }
  const suffix = key.endsWith('_initial_layer') ? '_initial_layer' : '';
  const value: { [s: string]: SettingValue } = {};
  for (const [surface, p] of Object.entries(PLATES)) {
    const raw = native[`${p}_plate_temp${suffix}`];
    if (raw !== undefined) value[surface] = parse('int', raw);
  }
  if (!Object.keys(value).length) throw new MappingError('invalid_value', 'No plate temperature key present');
  return { value };
}

function toPlates(fam: string, key: string, u: SettingValue): [NativeRecord, string?] {
  const m = asMap(u);
  for (const s of Object.keys(m))
    if (!Object.hasOwn(PLATES, s)) throw new MappingError('invalid_value', `Unknown plate type ${s}`);
  if (fam === 'orca') {
    const suffix = key.endsWith('_initial_layer') ? '_initial_layer' : '';
    return [
      Object.fromEntries(
        Object.entries(m).map(([s, v]) => [`${PLATES[s]}_plate_temp${suffix}`, format('int', v, 'orca')]),
      ),
    ];
  }
  const s = SINGLE_PLATE_ORDER.find((x) => x in m);
  if (!s) throw new MappingError('invalid_value', 'No plate temperature given');
  const k =
    fam === 'prusa'
      ? key.endsWith('_initial_layer')
        ? 'first_layer_bed_temperature'
        : 'bed_temperature'
      : key.endsWith('_initial_layer')
        ? 'material_bed_temperature_layer_0'
        : 'material_bed_temperature';
  return [
    { [k]: format('int', m[s] as SettingValue, 'cura') },
    `plate types collapse to one temperature (${s} plate used)`,
  ];
}

const IRON = ['top', 'topmost', 'solid'];
function fromIroning(fam: string, rec: NativeRecord): Converted {
  if (fam === 'prusa') {
    if (!parse('bool', need(rec, 'ironing'))) return { value: 'no ironing' };
    const t = rec.ironing_type === undefined ? 'top' : (parse('enum', rec.ironing_type) as string);
    if (!IRON.includes(t)) throw new MappingError('invalid_value', `Unknown ironing_type ${t}`);
    return { value: t };
  }
  if (!parse('bool', need(rec, 'ironing_enabled'))) return { value: 'no ironing' };
  const only = rec.ironing_only_highest_layer !== undefined && parse('bool', rec.ironing_only_highest_layer);
  return { value: only ? 'topmost' : 'top' };
}

function toIroning(fam: string, u: SettingValue): [NativeRecord, string?] {
  if (u !== 'no ironing' && !IRON.includes(u as string))
    throw new MappingError('invalid_value', `Unknown ironing type ${JSON.stringify(u)}`);
  const on = u !== 'no ironing';
  if (fam === 'prusa') return [on ? { ironing: true, ironing_type: u as string } : { ironing: false }];
  return [
    on ? { ironing_enabled: true, ironing_only_highest_layer: u === 'topmost' } : { ironing_enabled: false },
    u === 'solid' ? 'Cura has no solid ironing; written as top surface ironing' : undefined,
  ];
}

type Pt = [number, number];
function fromBed(fam: string, rec: NativeRecord, k0: string): Converted {
  if (fam !== 'cura') return { value: parse('polygon', need(rec, k0)) };
  const w = toNum(need(rec, 'machine_width'));
  const d = toNum(need(rec, 'machine_depth'));
  if (w <= 0 || d <= 0) throw new MappingError('invalid_value', 'Bed width and depth must be positive');
  // machine_center_is_zero: g-code (0,0) is the bed centre, so the polygon is centred (Orca then also has its origin there).
  const centred = rec.machine_center_is_zero !== undefined && parse('bool', rec.machine_center_is_zero);
  const [x0, y0] = centred ? [-w / 2, -d / 2] : [0, 0];
  const elliptic = rec.machine_shape === 'elliptic';
  return {
    value: [
      [x0, y0],
      [x0 + w, y0],
      [x0 + w, y0 + d],
      [x0, y0 + d],
    ],
    ...(elliptic ? { lossy: 'elliptic Cura bed approximated by its bounding rectangle' } : {}),
  };
}

function toBed(fam: string, u: SettingValue): [NativeRecord, string?] {
  const pts = parse('polygon', u as Raw) as Pt[];
  if (fam !== 'cura')
    return [
      {
        [fam === 'prusa' ? 'bed_shape' : 'printable_area']: format(
          'polygon',
          u,
          style(fam === 'prusa' ? 'prusa' : 'orca'),
        ),
      },
    ];
  if (!pts.length) throw new MappingError('invalid_value', 'Empty bed polygon');
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const w = x1 - x0;
  const d = y1 - y0;
  const eps = 1e-9;
  const centred = Math.abs(x0 + w / 2) < eps && Math.abs(y0 + d / 2) < eps;
  const corner = Math.abs(x0) < eps && Math.abs(y0) < eps;
  const rect = pts.length === 4 && pts.every((p) => (p[0] === x0 || p[0] === x1) && (p[1] === y0 || p[1] === y1));
  const notes = [
    rect ? undefined : 'non-rectangular bed reduced to its bounding rectangle',
    centred || corner ? undefined : 'bed origin offset has no Cura equivalent (machine_center_is_zero is a bool)',
  ].filter((x) => x);
  return [
    { machine_width: w, machine_depth: d, machine_center_is_zero: centred && !corner },
    notes.length ? notes.join('; ') : undefined,
  ];
}
