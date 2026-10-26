// SPDX-License-Identifier: AGPL-3.0-or-later
import { isDeepStrictEqual } from 'node:util';
import { TREE_LIMITS, type PresetType } from '../../tree/read-tree.ts';
import type { OrcaUserPreset } from '../../user/read-user-presets.ts';
import { encodeVariants } from '../../variants/variants.ts';

/**
 * Writes Orca and Bambu Studio preset JSON: `inherits`, `from`, `null` as `"nil"` (in scalars and inside arrays)
 * and keyed extruder-variant values back to arrays in slot order (`encodeVariants`).
 *
 * A file written from scratch is laid out as the slicers write it: every key sorted (nlohmann's `json` is a
 * `std::map`), Orca with one tab per level (`j.dump(1, '\t')`, OrcaSlicer@09aa0114:src/libslic3r/Config.cpp:1553-1600),
 * Bambu with four spaces (`std::setw(4) << j`, BambuStudio@79df7ae:src/libslic3r/Config.cpp:1522-1571), then a newline.
 * A file written over its native form (`readOrcaJson`) keeps each unchanged member's source text, so key order,
 * spacing and number lexemes (`"0.20"`, or a bare `0.10`) survive; a changed member is re-laid out in the file's
 * own indent and line ending, a removed one is cut, a new one is appended (sorted among the new ones).
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0; the files carry no per-file notice).
 */

export type OrcaDialect = 'orca' | 'bambu';

interface Member {
  key: string;
  /** Text between the previous member's value and this member; '' for the first. */
  lead: string;
  /** `"key": value` as the source spelled it. */
  raw: string;
  /** The parsed source value, `"nil"` kept as it is. */
  value: unknown;
}

/** A preset file's layout: unchanged members are written back from it. */
export interface OrcaJsonNative {
  /** Up to the first member (`{`, whitespace, any BOM). */
  prefix: string;
  members: Member[];
  /** After the last member's value (whitespace, `}`, trailing newline). */
  suffix: string;
  eol: string;
  indent: string;
}

/** Nesting below the top-level object; Orca values are at most an array of strings. */
export const MAX_JSON_DEPTH = 64;

const dec = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const nilToNull = (v: unknown): unknown =>
  v === 'nil' ? null : Array.isArray(v) ? v.map((x) => (x === 'nil' ? null : x)) : v;
const nullToNil = (v: unknown): unknown =>
  v === null ? 'nil' : Array.isArray(v) ? v.map((x) => (x === null ? 'nil' : x)) : v;

/** End of the string token starting at `t[i] === '"'` (index past the closing quote). */
function stringEnd(t: string, i: number): number {
  for (let j = i + 1; j < t.length; j++) {
    if (t[j] === '\\') j++;
    else if (t[j] === '"') return j + 1;
  }
  return t.length;
}

const isWs = (c: string | undefined) => c === ' ' || c === '\t' || c === '\n' || c === '\r';

/**
 * Parses a preset file into its values (`"nil"` as `null`, a null-prototype object) and its native form. One linear
 * pass over text `JSON.parse` has already validated; an error for invalid UTF-8 or JSON, a top level that is not an
 * object, a file over `TREE_LIMITS.maxFileBytes`, or nesting deeper than `MAX_JSON_DEPTH`. A repeated key (Bambu's
 * vendor files have some) takes its last value, as `JSON.parse` and nlohmann do; every occurrence stays a member.
 */
export function readOrcaJson(
  bytes: Uint8Array,
): { values: Record<string, unknown>; native: OrcaJsonNative } | { error: string } {
  if (bytes.byteLength > TREE_LIMITS.maxFileBytes) return { error: `larger than ${TREE_LIMITS.maxFileBytes} bytes` };
  let t: string;
  let parsed: unknown;
  try {
    t = dec.decode(bytes);
    parsed = JSON.parse(t.startsWith('\uFEFF') ? t.slice(1) : t);
  } catch (e) {
    return { error: `not valid JSON: ${String((e as Error).message).slice(0, 200)}` };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return { error: 'not a JSON object' };

  let i = t.indexOf('{') + 1;
  const skipWs = () => {
    while (isWs(t[i])) i++;
  };
  skipWs();
  const members: Member[] = [];
  const values: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  let prefix = t.slice(0, i);
  let last = i;
  while (t[i] === '"') {
    const start = i;
    i = stringEnd(t, i);
    const key = JSON.parse(t.slice(start, i)) as string;
    skipWs();
    i++; // ':'
    skipWs();
    const valueStart = i;
    if (t[i] === '"') i = stringEnd(t, i);
    else if (t[i] === '[' || t[i] === '{') {
      let depth = 0;
      for (; i < t.length; i++) {
        const c = t[i];
        if (c === '"') i = stringEnd(t, i) - 1;
        else if (c === '[' || c === '{') {
          if (++depth > MAX_JSON_DEPTH) return { error: `nested deeper than ${MAX_JSON_DEPTH}` };
        } else if ((c === ']' || c === '}') && --depth === 0) {
          i++;
          break;
        }
      }
    } else while (i < t.length && !isWs(t[i]) && t[i] !== ',' && t[i] !== '}') i++;
    const value = JSON.parse(t.slice(valueStart, i)) as unknown;
    values[key] = nilToNull(value);
    members.push({ key, lead: members.length ? t.slice(last, start) : '', raw: t.slice(start, i), value });
    if (members.length === 1) prefix = t.slice(0, start);
    last = i;
    skipWs();
    if (t[i] === ',') i++;
    skipWs();
  }
  const eol = t.includes('\r\n') ? '\r\n' : '\n';
  const indent = /\n([ \t]*)$/.exec(prefix)?.[1] ?? '';
  return { values, native: { prefix, members, suffix: t.slice(last), eol, indent } };
}

// shortcut: UTF-16 order, which matches nlohmann's byte order for every key below U+E000; keys are ASCII option names
const byKey = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export interface WriteOptions {
  /** The file's native form; unchanged members are copied from it. */
  native?: OrcaJsonNative;
  /** Layout of a file written from scratch. Default `orca`. */
  dialect?: OrcaDialect;
  /**
   * Settings that hold the slot lists (`printer_extruder_id`/`_variant`, `print_extruder_id`/`_variant`) when
   * `values` does not, as a child preset that inherits them: the flattened preset.
   */
  slots?: Readonly<Record<string, unknown>>;
}

/**
 * Writes one preset's top-level keys (identity keys such as `name`, `inherits` and `from` included). `null` is
 * written `"nil"`; keyed variant values are encoded to arrays first. Throws a RangeError where `encodeVariants`
 * does, or for values nested too deep to serialise.
 */
export function writeOrcaJson(
  type: PresetType,
  values: Readonly<Record<string, unknown>>,
  options: WriteOptions = {},
): Uint8Array {
  const keys = Object.keys(values);
  const encoded = encodeVariants(type, options.slots ? { ...options.slots, ...values } : values);
  const out = new Map(keys.map((k) => [k, nullToNil(encoded[k])]));
  const n = options.native?.members.length ? options.native : undefined;
  const eol = n?.eol ?? '\n';
  const indent = n?.indent ?? (options.dialect === 'bambu' ? '    ' : '\t');
  const fresh = (k: string, v: unknown) =>
    `${JSON.stringify(k)}: ${JSON.stringify(v, null, indent).replaceAll('\n', eol + indent)}`;

  const parts: string[] = [];
  const put = (lead: string, text: string) => parts.push((parts.length ? lead : '') + text);
  const members = n?.members ?? [];
  const lastAt = new Map(members.map((m, i) => [m.key, i]));
  members.forEach((m, i) => {
    if (!out.has(m.key)) return;
    const v = out.get(m.key);
    // an earlier occurrence of a repeated key carries no value; it is kept as written
    const keep = lastAt.get(m.key) !== i || isDeepStrictEqual(v, m.value);
    put(m.lead, keep ? m.raw : fresh(m.key, v));
  });
  for (const m of members) out.delete(m.key);
  for (const k of [...out.keys()].sort(byKey)) put(`,${eol}${indent}`, fresh(k, out.get(k)));

  const text = n
    ? n.prefix + parts.join('') + n.suffix
    : parts.length
      ? `{${eol}${indent}${parts.join('')}${eol}}${eol}`
      : `{}${eol}`;
  return new TextEncoder().encode(text);
}

/**
 * Writes a user preset (`readOrcaUserPresets`) as the slicer saves one: its own keys plus `name`, `inherits` (`""`
 * when standalone, as the full config Orca writes then carries it) and `from` (`"User"` when absent,
 * OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:754-826). `type` and `setting_id` are written only where the native
 * form has them; the `.info` sidecar is not written here.
 */
export function writeOrcaUserPreset(p: OrcaUserPreset, options: Omit<WriteOptions, 'slots'> = {}): Uint8Array {
  const values: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const m of options.native?.members ?? [])
    if (m.key === 'type' || m.key === 'setting_id') values[m.key] = m.key === 'type' ? p.type : m.value;
  Object.assign(values, p.settings);
  values.name = p.name;
  values.inherits = p.inherits ?? '';
  values.from ??= 'User';
  return writeOrcaJson(p.type, values, options);
}
