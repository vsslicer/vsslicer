// SPDX-License-Identifier: AGPL-3.0-or-later
// Orca/Bambu `bundle_structure.json`, the manifest at the root of an `.orca_bundle` zip. A bundle is untrusted input (rule 25).
// Shape from OrcaSlicer@09aa0114b4e1:
//   src/slic3r/GUI/ExportPresetBundleDialog.cpp:374-386,423-425 (writer: version, bundle_id, bundle_type, printer_preset_name, *_config lists)
//   src/libslic3r/PresetBundle.cpp:2210-2230,2349 (reader/writer of `printer_asset`, keyed by a printer_config entry)
//   src/libslic3r/PresetBundle.cpp:2425 (a bundle_id that escapes the bundle directory is refused)
// `printer_vendor` named in the card does not occur in that revision; it is not modelled.
// Only the structure is re-implemented here; no Orca code is copied.

export const BUNDLE_LIMITS = {
  maxBytes: 1024 * 1024,
  maxDepth: 16,
  maxFiles: 10_000,
  maxPathLength: 512,
} as const;

const BUNDLE_TYPE = 'printer config bundle';
const LISTS = ['printer_config', 'filament_config', 'process_config'] as const;

export interface BundleStructure {
  version: string;
  bundleId: string;
  bundleType: typeof BUNDLE_TYPE;
  printerPresetName?: string;
  printerConfig: string[];
  filamentConfig: string[];
  processConfig: string[];
  /** printer_config entry -> option name -> zip entry */
  printerAsset: Record<string, Record<string, string>>;
}

export type BundleErrorCode =
  | 'too-large'
  | 'too-deep'
  | 'invalid-json'
  | 'invalid-structure'
  | 'unsupported-version'
  | 'unknown-bundle-type'
  | 'too-many-files'
  | 'unsafe-path'
  | 'missing-file';

export interface BundleError {
  code: BundleErrorCode;
  message: string;
  /** The manifest key or listed entry concerned. */
  path?: string;
}

export type ParseBundleResult = { ok: true; bundle: BundleStructure } | { ok: false; error: BundleError };

const fail = (code: BundleErrorCode, message: string, path?: string): ParseBundleResult => ({
  ok: false,
  error: path === undefined ? { code, message } : { code, message, path },
});

/** Nesting depth of JSON text in one linear pass; strings are skipped so brackets inside them do not count. */
function jsonDepth(text: string): number {
  let depth = 0;
  let max = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (inString) {
      if (c === 0x5c) i++;
      else if (c === 0x22) inString = false;
    } else if (c === 0x22) inString = true;
    else if (c === 0x7b || c === 0x5b) {
      if (++depth > max) max = depth;
      if (max > BUNDLE_LIMITS.maxDepth) return max;
    } else if (c === 0x7d || c === 0x5d) depth--;
  }
  return max;
}

/** A relative, forward path that stays inside the bundle; also used for the bundle id, which becomes a directory name. */
function unsafePath(p: string, singleComponent = false): boolean {
  if (p.length > BUNDLE_LIMITS.maxPathLength || p.includes('\0')) return true;
  const c0 = p.charCodeAt(0);
  if (c0 === 0x2f || c0 === 0x5c || p.charCodeAt(1) === 0x3a) return true; // /x, \x, C:
  const parts = p.split(/[\\/]/); // single-char class: linear
  // Empty, `.` and `..` segments, also as Windows normalises them (trailing dots and spaces are dropped: `.. `, `...`).
  // Orca replaces an empty bundle_id with a UUID on export (PresetBundle.cpp:2423-2426); on import refusing is the safe choice.
  if (parts.some((s) => /^[. ]*$/.test(s))) return true; // single-class star: linear
  return singleComponent && parts.length > 1;
}

/** Version is empty (offline export) or dotted digits such as `02.03.00.62`; checked by a linear scan. */
function supportedVersion(v: unknown): v is string {
  if (typeof v !== 'string' || v.length > 64) return false;
  let digits = 0;
  for (const ch of v) {
    if (ch >= '0' && ch <= '9') digits++;
    else if (ch === '.' && digits > 0) digits = 0;
    else return false;
  }
  return v === '' || digits > 0;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * @param entries zip entry names; when given, every listed file must be among them.
 */
export function parseBundleStructure(text: string, entries?: ReadonlySet<string>): ParseBundleResult {
  // UTF-16 length undercounts bytes by at most 3x: over the limit in units is refused without a copy; the exact
  // byte count is checked only when near the limit.
  const max = BUNDLE_LIMITS.maxBytes;
  if (text.length > max || (text.length * 3 > max && new TextEncoder().encode(text).length > max))
    return fail('too-large', `bundle_structure.json is over ${BUNDLE_LIMITS.maxBytes} bytes`);
  if (jsonDepth(text) > BUNDLE_LIMITS.maxDepth)
    return fail('too-deep', `bundle_structure.json nests deeper than ${BUNDLE_LIMITS.maxDepth}`);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return fail('invalid-json', (e as Error).message);
  }
  if (!isObject(raw)) return fail('invalid-structure', 'bundle_structure.json is not an object');

  if (!supportedVersion(raw.version)) return fail('unsupported-version', `Unsupported version`, 'version');
  if (raw.bundle_type !== BUNDLE_TYPE) return fail('unknown-bundle-type', 'Unknown bundle_type', 'bundle_type');
  if (typeof raw.bundle_id !== 'string') return fail('invalid-structure', 'bundle_id is not a string', 'bundle_id');
  if (unsafePath(raw.bundle_id, true)) return fail('unsafe-path', 'Unsafe bundle_id', 'bundle_id');
  if (raw.printer_preset_name !== undefined && typeof raw.printer_preset_name !== 'string')
    return fail('invalid-structure', 'printer_preset_name is not a string', 'printer_preset_name');

  const lists: Record<(typeof LISTS)[number], string[]> = {
    printer_config: [],
    filament_config: [],
    process_config: [],
  };
  let count = 0;
  const check = (file: string, key: string): ParseBundleResult | undefined => {
    if (unsafePath(file)) return fail('unsafe-path', 'Unsafe path', key);
    if (entries && !entries.has(file)) return fail('missing-file', `Listed file ${file} is not in the bundle`, key);
    return undefined;
  };
  for (const key of LISTS) {
    const list = raw[key];
    if (list === undefined) continue;
    if (!Array.isArray(list) || list.some((f) => typeof f !== 'string'))
      return fail('invalid-structure', `${key} is not a list of strings`, key);
    count += list.length;
    if (count > BUNDLE_LIMITS.maxFiles)
      return fail('too-many-files', `More than ${BUNDLE_LIMITS.maxFiles} listed files`, key);
    for (const f of list as string[]) {
      const bad = check(f, key);
      if (bad) return bad;
    }
    lists[key] = list as string[];
  }

  // Null-prototype maps: a hostile `__proto__` key is then plain data, not the prototype.
  const printerAsset: Record<string, Record<string, string>> = Object.create(null);
  if (raw.printer_asset !== undefined) {
    if (!isObject(raw.printer_asset))
      return fail('invalid-structure', 'printer_asset is not an object', 'printer_asset');
    for (const [printer, assets] of Object.entries(raw.printer_asset)) {
      if (unsafePath(printer)) return fail('unsafe-path', 'Unsafe path', 'printer_asset');
      if (!isObject(assets)) return fail('invalid-structure', 'printer_asset entry is not an object', printer);
      const out: Record<string, string> = Object.create(null);
      for (const [option, file] of Object.entries(assets)) {
        if (typeof file !== 'string') return fail('invalid-structure', 'printer_asset value is not a string', option);
        if (++count > BUNDLE_LIMITS.maxFiles)
          return fail('too-many-files', `More than ${BUNDLE_LIMITS.maxFiles} listed files`, 'printer_asset');
        const bad = check(file, 'printer_asset');
        if (bad) return bad;
        out[option] = file;
      }
      printerAsset[printer] = out;
    }
  }

  return {
    ok: true,
    bundle: {
      version: raw.version,
      bundleId: raw.bundle_id,
      bundleType: BUNDLE_TYPE,
      ...(raw.printer_preset_name !== undefined && { printerPresetName: raw.printer_preset_name }),
      printerConfig: lists.printer_config,
      filamentConfig: lists.filament_config,
      processConfig: lists.process_config,
      printerAsset,
    },
  };
}

/** `offline_<name>_<clock>`: a bundle exported without a signed-in account. Name characters outside [A-Za-z0-9-] become `-`. */
export function offlineBundleId(name: string, clock: string): string {
  const clean = (s: string) => Array.from(s, (c) => (/^[A-Za-z0-9-]$/.test(c) ? c : '-')).join('');
  return `offline_${clean(name).slice(0, 100)}_${clean(clock).slice(0, 40)}`;
}

/**
 * The manifest to write for an export. It takes no user id: Orca writes `<user_id>_<name>_<clock>` when signed in,
 * we always write the `offline_` form and an empty version, so an account id never reaches a shared file.
 */
export function buildBundleStructure(input: {
  name: string;
  clock: string;
  printerConfig: string[];
  filamentConfig: string[];
  processConfig: string[];
}): Record<string, unknown> {
  return {
    version: '',
    bundle_id: offlineBundleId(input.name, input.clock),
    bundle_type: BUNDLE_TYPE,
    printer_preset_name: 'export',
    printer_config: input.printerConfig,
    filament_config: input.filamentConfig,
    process_config: input.processConfig,
  };
}
