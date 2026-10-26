// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  nativeKeys,
  orcaCatalogue,
  unifiedToNative,
  type Diagnostic,
  type EntityBase,
  type DiagnosticCode,
  type Exporter,
  type ExportResult,
  type ImportedEntity,
  type ImportResult,
  type Settings,
  type SettingValue,
  type Severity,
  type SourceFile,
} from '@vsslicer/profile-api';
import { isDeepStrictEqual } from 'node:util';
import { importPrusaIni, type PrusaNative } from '../../import/import.ts';
import { MAX_DIAGNOSTICS, MAX_KEYS_PER_SECTION, MAX_LINE_LENGTH } from '../../ini/index.ts';
import { canon } from './serialize.ts';
import { OPTION_TYPES } from './types.ts';

/** Entities in one call; the pinned bundle imports 6 976. Later ones are not written. */
export const MAX_EXPORT_ENTITIES = 100_000;
/** UTF-8 bytes written over one call. */
export const MAX_EXPORT_BYTES = 256 * 1024 * 1024;

type PresetKind = 'print' | 'filament' | 'printer';
type Diag = (severity: Severity, code: DiagnosticCode, message: string) => void;

/** A `PrusaNative` as the importer builds it, checked, since the caller's data is untrusted. */
function nativeOf(n: unknown): PrusaNative | undefined {
  if (typeof n !== 'object' || n === null) return undefined;
  const p = n as Partial<PrusaNative>;
  if (p.format !== 'prusa-ini' || typeof p.kind !== 'string' || typeof p.name !== 'string') return undefined;
  if (typeof p.values !== 'object' || p.values === null) return undefined;
  return p as PrusaNative;
}

/** The preset kind of an entity that has no native form, by its shape. */
function kindOf(e: ImportedEntity): PresetKind | undefined {
  if ('layer_height' in e) return 'print';
  if ('bed' in e && 'toolheads' in e && !Array.isArray(e.toolheads)) return 'printer';
  if ('type' in e && 'diameter' in e && 'vendor' in e) return 'filament';
  return undefined;
}

/** A section name usable as one file name in `print/`, `filament/` or `printer/`. */
const safeName = (s: string) =>
  s.length > 0 &&
  s.length <= 200 &&
  s !== '.' &&
  s !== '..' &&
  ![...s].some((c) => c === '/' || c === '\\' || c < ' ' || c === '\x7f');
/** A key the INI reader takes back unchanged: no `=`, no line break, not a comment or section, not padded. */
const safeKey = (k: string) => k.trim() === k && /^[^#;[=\r\n][^=\r\n]*$/.test(k);

const text = (lines: Map<string, string>, sorted: boolean) => {
  const keys = [...lines.keys()];
  // PrusaSlicer writes keys byte-sorted (Config.cpp:1119-1126, a std::map); a stored order that is not is kept
  if (sorted) keys.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return keys.map((k) => `${k} = ${lines.get(k)}\n`).join('');
};
const isSorted = (keys: string[]) => keys.every((k, i) => i === 0 || keys[i - 1]! <= k);

/** The settings and parents the importer reads from these lines: what the entity held before any edit. */
function baseline(kind: PresetKind, body: string): { settings: Settings; inherits?: string[]; when?: string } {
  const r = importPrusaIni([{ path: `${kind}/baseline.ini`, bytes: new TextEncoder().encode(body) }], {
    splitVariants: false,
  });
  const e = r.entities[0] as EntityBase | undefined;
  return {
    settings: e?.settings ?? {},
    ...(e?.inherits ? { inherits: e.inherits } : {}),
    ...(e?.when ? { when: e.when } : {}),
  };
}

/** A unified value as `unifiedToNative` takes it: the importer keys per-extruder values by extruder (`{'0': v}`). */
function unwrap(key: string, v: SettingValue, diag: Diag): SettingValue {
  if (!orcaCatalogue.entries[key]?.per_extruder || typeof v !== 'object' || v === null || Array.isArray(v)) return v;
  const m = v as { [k: string]: SettingValue };
  if (Object.keys(m).some((k) => k !== '0')) diag('warning', 'malformed-line', `${key}: only extruder 0 is written`);
  return m['0'] ?? null;
}

/** One native value of an edited key, formatted by PrusaSlicer's rules for its option type. */
function format(key: string, raw: unknown): string | undefined {
  const type = OPTION_TYPES.get(key);
  if (!type) return undefined;
  const s =
    raw === null
      ? 'nil'
      : typeof raw === 'boolean'
        ? raw
          ? '1'
          : '0'
        : Array.isArray(raw)
          ? raw.map((x: unknown) => (typeof x === 'boolean' ? (x ? '1' : '0') : String(x))).join(',')
          : String(raw);
  return canon(type, s);
}

/** Writes the settings that differ from `base` into `lines`; untouched keys keep their stored text. */
function applyEdits(settings: Settings, base: Settings, lines: Map<string, string>, diag: Diag) {
  const natives = (k: string) => {
    try {
      return nativeKeys('prusa', k);
    } catch {
      return undefined; // not mapped, or no Prusa equivalent
    }
  };
  for (const k of Object.keys(base)) if (!Object.hasOwn(settings, k)) for (const n of natives(k) ?? []) lines.delete(n);
  for (const [k, v] of Object.entries(settings)) {
    const ns = natives(k);
    if (Object.hasOwn(base, k) && isDeepStrictEqual(v, base[k]) && (!ns || ns.every((n) => lines.has(n)))) continue;
    if (!ns) {
      diag('warning', 'unknown-type', `${k.slice(0, 200)}: no PrusaSlicer key; left out`);
      continue;
    }
    let out: Record<string, unknown>;
    try {
      const r = unifiedToNative('prusa', k, unwrap(k, v, diag));
      out = r.native;
      if (r.lossy) diag('info', 'malformed-line', `${k}: ${r.lossy.slice(0, 300)}`);
    } catch (e) {
      diag('error', 'malformed-line', `${k}: ${(e as Error).message.slice(0, 200)}; stored value kept`);
      continue;
    }
    for (const [n, raw] of Object.entries(out)) {
      const s = format(n, raw);
      if (s === undefined) diag('error', 'malformed-line', `${k}: invalid ${n} value; stored value kept`);
      else lines.set(n, s);
    }
  }
}

/** `inherits` as PrusaSlicer stores a user preset: one parent, or none when flattened. */
function applyInherits(inherits: string[] | undefined, lines: Map<string, string>, diag: Diag) {
  if (!inherits?.length) {
    lines.delete('inherits');
    return;
  }
  if (inherits.length > 1) diag('warning', 'malformed-line', `${inherits.length} parents; only the first is written`);
  lines.set('inherits', canon('coString', inherits[0]!)!);
}

/**
 * Writes entities as PrusaSlicer 2.9 user preset files (`print/<name>.ini`, `filament/`, `printer/`): `key = value`
 * lines, LF, no header. An entity with a Prusa native form starts from its stored values verbatim, so an unedited
 * entity gives back its stored form byte for byte; settings that differ from what the importer reads from that form
 * are re-written by PrusaSlicer's rules, and removed ones dropped. An entity without one is written from its
 * settings alone (no defaults, no keys outside PrusaSlicer's options), keys byte-sorted. `inherits` holds one parent,
 * or is left out (flattened). Vendor and `[printer_model]` sections are not presets and are not written; a nozzle
 * (its settings live on its model) is written from its stored form. Never throws on bad input.
 */
export function exportPrusaIni(input: Pick<ImportResult, 'entities' | 'native'>): ExportResult {
  const result: ExportResult = { files: [], diagnostics: [] };
  const push = (d: Diagnostic) => {
    const n = result.diagnostics.length;
    if (n > MAX_DIAGNOSTICS) return;
    result.diagnostics.push(
      n === MAX_DIAGNOSTICS ? { ...d, severity: 'warning', message: 'further diagnostics suppressed' } : d,
    );
  };
  const entities = Array.isArray(input?.entities) ? input.entities : [];
  const natives = typeof input?.native === 'object' && input.native !== null ? input.native : {};
  if (entities.length > MAX_EXPORT_ENTITIES)
    push({
      severity: 'error',
      code: 'malformed-line',
      file: '',
      message: `${entities.length} entities, over ${MAX_EXPORT_ENTITIES}; the rest not written`,
    });
  const paths = new Set<string>();
  let bytes = 0;
  for (const entity of entities.slice(0, MAX_EXPORT_ENTITIES)) {
    if (typeof entity !== 'object' || entity === null || typeof entity.id !== 'string') continue;
    const native = Object.hasOwn(natives, entity.id) ? nativeOf(natives[entity.id]) : undefined;
    const kind = native ? native.kind : kindOf(entity);
    const name = native ? native.name : 'name' in entity ? entity.name : undefined;
    const id = entity.id.slice(0, 200);
    if (kind !== 'print' && kind !== 'filament' && kind !== 'printer') {
      push({
        severity: 'info',
        code: 'unknown-type',
        file: '',
        message: `${id}: not a PrusaSlicer preset; not written`,
      });
      continue;
    }
    if (typeof name !== 'string' || !safeName(name)) {
      push({ severity: 'error', code: 'malformed-line', file: '', message: `${id}: name unusable as a file name` });
      continue;
    }
    const path = `${kind}/${name}.ini`;
    const diag: Diag = (severity, code, message) => push({ severity, code, file: path, message });
    if (paths.has(path)) {
      diag('warning', 'malformed-line', `${id}: ${path} already written; this one skipped`);
      continue;
    }
    const lines = new Map<string, string>();
    for (const [k, v] of Object.entries(native?.values ?? {})) {
      if (lines.size >= MAX_KEYS_PER_SECTION) {
        diag('error', 'malformed-line', `more than ${MAX_KEYS_PER_SECTION} keys; rest dropped`);
        break;
      }
      if (typeof v === 'string' && safeKey(k) && !/[\r\n]/.test(v)) lines.set(k, v);
      else diag('error', 'malformed-line', `${k.slice(0, 200)}: unwritable stored key or value; left out`);
    }
    const sorted = !native || isSorted([...lines.keys()]);
    const e = entity as EntityBase;
    const settings = e.settings;
    if (settings !== undefined) {
      if (typeof settings !== 'object' || settings === null || Object.keys(settings).length > MAX_KEYS_PER_SECTION) {
        diag('error', 'malformed-line', `${id}: settings unusable; not written`);
        continue;
      }
      let base: ReturnType<typeof baseline> = { settings: {} };
      if (native) {
        // the re-read is bounded by the reader's own cap (MAX_INI_BYTES); over it, every setting counts as edited
        base = baseline(kind, text(lines, false));
      }
      applyEdits(settings, base.settings, lines, diag);
      if (!isDeepStrictEqual(e.inherits, base.inherits)) applyInherits(e.inherits, lines, diag);
      if (e.when !== base.when)
        diag(
          'warning',
          'malformed-line',
          'when is not converted back to compatible_printers_condition; stored one kept',
        );
    }
    // stored values with a line break were refused above; edited ones cannot hold one (canon escapes every string)
    for (const [k, v] of lines)
      if (k.length + v.length + 4 > MAX_LINE_LENGTH) {
        diag('error', 'malformed-line', `${k.slice(0, 200)}: value unwritable on one line; left out`);
        lines.delete(k);
      }
    const encoded = new TextEncoder().encode(text(lines, sorted));
    bytes += encoded.byteLength;
    if (bytes > MAX_EXPORT_BYTES) {
      diag('error', 'malformed-line', `export over ${MAX_EXPORT_BYTES} bytes; this and later entities not written`);
      break;
    }
    paths.add(path);
    result.files.push({ path, bytes: encoded } satisfies SourceFile);
  }
  return result;
}

export const prusaIniExporter: Exporter = {
  formats: ['prusa-ini'],
  canHandle: (e) => {
    try {
      return kindOf(e) !== undefined || 'diameter' in e; // a nozzle: written from its stored form
    } catch {
      return false;
    }
  },
  export: async (input) => exportPrusaIni(input),
};
