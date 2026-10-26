// SPDX-License-Identifier: AGPL-3.0-or-later
import type { SourceFile } from '@vsslicer/profile-api';

/**
 * Reads an Orca or Bambu Studio `resources/profiles` tree (vendor indices plus their preset files) and
 * flattens every preset: parent first, then each `include` in order, then the preset's own keys.
 *
 * Ported from OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:7596-7639 (`resolve_vendor_preset`) and
 * :8240-8282 (the entry reader), checked against BambuStudio@79df7ae:src/libslic3r/PresetBundle.cpp:4836-4911.
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0; the file carries no per-file notice).
 *
 * Differences from upstream: presets resolve by name in any order (upstream needs a parent listed before its
 * child), per-extruder variant padding (`extend_default_config_length`) is left to the variant decoder, and an
 * include layers every key its chain states, where upstream layers only the keys that differ from the collection
 * default (OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:7644-7647, BambuStudio@79df7ae:PresetBundle.cpp:4885-4897):
 * there is no default config here, so an include stating a default value still overrides the parent.
 */

export type PresetType = 'machine_model' | 'machine' | 'process' | 'filament';

/** Index list key to the `type` its files must carry (OrcaSlicer@09aa0114:src/libslic3r/Preset.hpp:55-93). */
const LISTS: Readonly<Record<string, PresetType>> = {
  machine_model_list: 'machine_model',
  process_list: 'process',
  filament_list: 'filament',
  machine_list: 'machine',
};

/** The cross-vendor filament library; its filaments are fallback parents for every other vendor (PresetBundle.cpp:666-680, :7600-7604). */
export const LIBRARY_VENDOR = 'OrcaFilamentLibrary';

/** Keys that describe the preset itself; they are lifted out of `settings`. */
const IDENTITY = new Set(['type', 'name', 'inherits', 'include', 'instantiation', 'setting_id', 'filament_id']);

export interface TreeLimits {
  /** Input files, and index entries, per call. */
  maxFiles: number;
  maxFileBytes: number;
  /** Bytes over every file of one call. */
  maxTotalBytes: number;
  /** Nesting of `inherits` and `include` below one preset. */
  maxDepth: number;
  /** `include` names per preset. */
  maxIncludes: number;
  /** Keys each index entry carries plus keys copied while flattening, over the whole call. */
  maxMergeSteps: number;
}

/** The real trees: Orca@09aa0114 has 14420 JSON files, 24.5 MB, the largest 289 KB. */
export const TREE_LIMITS: Readonly<TreeLimits> = {
  maxFiles: 50_000,
  maxFileBytes: 4 * 1024 * 1024,
  maxTotalBytes: 256 * 1024 * 1024,
  maxDepth: 32,
  maxIncludes: 64,
  // Each step is a retained Map entry and an output property, so this caps memory. Smallest budget that imports
  // the whole tree (entry keys plus flatten copies): Orca@09aa0114 2,150,746, Bambu@79df7ae 611,044; 8M is ~3.7x Orca.
  maxMergeSteps: 8_000_000,
};

export type TreeDiagnosticCode =
  | 'invalid-json'
  | 'unknown-type'
  | 'unknown-parent'
  | 'missing-include'
  | 'missing-file'
  | 'cycle'
  | 'duplicate'
  | 'unsafe-path'
  | 'limit'
  | 'name-mismatch';

export interface TreeDiagnostic {
  severity: 'error' | 'warning';
  code: TreeDiagnosticCode;
  /** The file (path as given) the problem belongs to. */
  file: string;
  message: string;
}

export interface OrcaVendor {
  /** The index file's stem, which is also the vendor's folder. */
  id: string;
  name: string;
  version: string;
  description?: string;
  file: string;
}

export interface OrcaPreset {
  vendor: string;
  type: PresetType;
  name: string;
  file: string;
  /** `instantiation: "false"`: a base or include-only template, not offered to the user. */
  abstract: boolean;
  inherits?: string;
  includes: string[];
  /** Flattened keys. `"nil"` is `null`: no override here, the value falls through to the printer's (PresetBundle.cpp:507-516). */
  settings: Record<string, unknown>;
  /** `setting_id` is the preset's own; `filament_id` is inherited when absent (PresetBundle.cpp:7606-7618). */
  external_ids: { setting_id?: string; filament_id?: string };
}

export interface OrcaTree {
  vendors: OrcaVendor[];
  presets: OrcaPreset[];
  diagnostics: TreeDiagnostic[];
}

interface Entry {
  vendor: string;
  type: PresetType;
  name: string;
  file: string;
  abstract: boolean;
  inherits?: string;
  includes: string[];
  own: Map<string, unknown>;
  setting_id?: string;
  filament_id?: string;
}

/** Validates caller limits: each a positive safe integer no larger than the default. */
export function treeLimits(limits: Partial<TreeLimits> = {}): TreeLimits {
  const out = { ...TREE_LIMITS, ...limits };
  for (const [k, v] of Object.entries(out))
    if (!Number.isSafeInteger(v) || v <= 0 || v > TREE_LIMITS[k as keyof TreeLimits])
      throw new RangeError(`${k} must be an integer in 1..${TREE_LIMITS[k as keyof TreeLimits]}`);
  return out;
}

/** NFC, forward slashes, relative, no empty, `.` or `..` segments; undefined when unsafe. */
export function safePath(path: string): string | undefined {
  const p = path.normalize('NFC');
  if (p.length === 0 || p.length > 1024 || /[\\\0:]/.test(p) || p.startsWith('/')) return undefined;
  return p.split('/').every((s) => s !== '' && s !== '.' && s !== '..') ? p : undefined;
}

const nil = (v: unknown): unknown =>
  v === 'nil' ? null : Array.isArray(v) ? v.map((x) => (x === 'nil' ? null : x)) : v;
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export const MAX_TREE_DIAGNOSTICS = 1000;

/** Pushes `d`, but at most MAX_TREE_DIAGNOSTICS of them plus one closing "suppressed" line. */
export function pushCapped(diagnostics: TreeDiagnostic[], d: TreeDiagnostic): void {
  if (diagnostics.length > MAX_TREE_DIAGNOSTICS) return;
  diagnostics.push(
    diagnostics.length === MAX_TREE_DIAGNOSTICS ? { ...d, message: 'further diagnostics suppressed' } : d,
  );
}

export function readOrcaTree(files: readonly SourceFile[], limits?: Partial<TreeLimits>): OrcaTree {
  const lim = treeLimits(limits);
  const diagnostics: TreeDiagnostic[] = [];
  const report = (code: TreeDiagnosticCode, file: string, message: string, severity: 'error' | 'warning' = 'error') =>
    pushCapped(diagnostics, { severity, code, file, message });

  // Accept files: safe path, no case or Unicode alias of another, within the size caps.
  const byPath = new Map<string, Uint8Array>();
  const folded = new Set<string>();
  let total = 0;
  if (files.length > lim.maxFiles) report('limit', '', `more than ${lim.maxFiles} files; the rest are ignored`);
  for (const f of files.slice(0, lim.maxFiles)) {
    const p = safePath(f.path);
    if (p === undefined) {
      report('unsafe-path', f.path, 'path is absolute, has empty, . or .. segments, or backslashes');
      continue;
    }
    const fold = p.toLowerCase();
    if (folded.has(fold)) {
      report('duplicate', f.path, 'another file has the same path up to case or Unicode normalisation');
      continue;
    }
    folded.add(fold);
    if (f.bytes.length > lim.maxFileBytes) {
      report('limit', f.path, `larger than ${lim.maxFileBytes} bytes`);
      continue;
    }
    if (total + f.bytes.length > lim.maxTotalBytes) {
      report('limit', f.path, `files total more than ${lim.maxTotalBytes} bytes; this one and later ones are ignored`);
      break;
    }
    total += f.bytes.length;
    byPath.set(p, f.bytes);
  }

  const decoder = new TextDecoder('utf-8', { fatal: true });
  const parse = (path: string): unknown => {
    try {
      return JSON.parse(decoder.decode(byPath.get(path)));
    } catch (e) {
      report('invalid-json', path, `not valid JSON: ${String((e as Error).message).slice(0, 200)}`);
      return undefined;
    }
  };

  const vendors: OrcaVendor[] = [];
  const entries: Entry[] = [];
  const byName = new Map<string, Entry>();
  const parsed = new Map<string, unknown>(); // an index may list one file twice; it is parsed once
  const ownByPath = new Map<string, Map<string, unknown>>(); // and its keys are copied once, shared by every entry
  // Every key an entry carries, flattened or not, is charged to maxMergeSteps: listing one big file many times
  // costs work per listing, not per input byte (review of PRF-27).
  let steps = 0;
  let exhausted = false;
  let entryCount = 0;
  const indexPaths = [...byPath.keys()].filter(
    (p) => !p.includes('/') && p.endsWith('.json') && p !== 'blacklist.json',
  );
  for (const indexPath of indexPaths.sort()) {
    const index = parse(indexPath);
    if (!isObject(index)) {
      if (index !== undefined) report('invalid-json', indexPath, 'vendor index is not an object');
      continue;
    }
    const id = indexPath.slice(0, -'.json'.length);
    vendors.push({
      id,
      name: typeof index.name === 'string' ? index.name : id,
      version: typeof index.version === 'string' ? index.version : '',
      ...(typeof index.description === 'string' ? { description: index.description } : {}),
      file: indexPath,
    });
    for (const [list, type] of Object.entries(LISTS)) {
      const items = index[list];
      if (items === undefined) continue;
      if (!Array.isArray(items)) {
        report('invalid-json', indexPath, `${list} is not an array`);
        continue;
      }
      for (const item of items) {
        if (exhausted) break;
        if (++entryCount > lim.maxFiles) {
          if (entryCount === lim.maxFiles + 1) report('limit', indexPath, `more than ${lim.maxFiles} index entries`);
          continue;
        }
        if (!isObject(item) || typeof item.name !== 'string' || typeof item.sub_path !== 'string') {
          report('invalid-json', indexPath, `${list} entry is not {name, sub_path}`);
          continue;
        }
        const path = safePath(`${id}/${item.sub_path}`);
        if (path === undefined) {
          report('unsafe-path', indexPath, `${list} entry '${item.name.slice(0, 80)}' has an unsafe sub_path`);
          continue;
        }
        if (!byPath.has(path)) {
          report('missing-file', indexPath, `${list} entry '${item.name.slice(0, 80)}': ${path} is not in the tree`);
          continue;
        }
        if (!parsed.has(path)) parsed.set(path, parse(path));
        const entry = readEntry(path, parsed.get(path), id, type, item.name);
        if (entry === undefined) continue;
        steps += entry.own.size;
        if (steps > lim.maxMergeSteps) {
          exhausted = true;
          report('limit', path, `index entries carry more than ${lim.maxMergeSteps} keys; later entries are not read`);
          break;
        }
        const key = `${id}\0${type}\0${entry.name}`;
        if (byName.has(key)) {
          report(
            'duplicate',
            path,
            `${type} '${entry.name.slice(0, 80)}' is already defined; this one is ignored`,
            'warning',
          );
          continue;
        }
        byName.set(key, entry);
        entries.push(entry);
      }
    }
  }

  function readEntry(
    file: string,
    json: unknown,
    vendor: string,
    type: PresetType,
    indexName: string,
  ): Entry | undefined {
    if (json === undefined) return undefined; // invalid JSON, already reported
    if (!isObject(json)) {
      report('invalid-json', file, 'preset is not an object');
      return undefined;
    }
    // Bambu's g-code templates carry no type; the list they are in gives it.
    if (json.type !== undefined && json.type !== type) {
      report('unknown-type', file, `type '${String(json.type).slice(0, 40)}' where the index lists a ${type}`);
      return undefined;
    }
    let name = typeof json.name === 'string' ? json.name : '';
    let instantiation = json.instantiation;
    // No instantiation and no name, or "gcode" in the name: an include-only template named by its index entry
    // (OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:8240-8249).
    if ((instantiation === undefined || instantiation === '') && (name === '' || name.includes('gcode'))) {
      instantiation = 'false';
      if (name === '') name = indexName;
    }
    if (json.inherits === '') {
      report('unknown-parent', file, 'inherits is empty'); // PresetBundle.cpp:8261-8270
      return undefined;
    }
    const raw = json.include === undefined ? [] : Array.isArray(json.include) ? json.include : [json.include];
    const includes = raw.filter((n): n is string => typeof n === 'string');
    if (includes.length < raw.length) report('missing-include', file, 'include has a name that is not a string'); // :8276-8281
    if (includes.length > lim.maxIncludes) {
      report('limit', file, `more than ${lim.maxIncludes} includes`);
      return undefined;
    }
    let own = ownByPath.get(file);
    if (own === undefined) {
      own = new Map<string, unknown>();
      for (const [k, v] of Object.entries(json)) if (!IDENTITY.has(k)) own.set(k, nil(v));
      ownByPath.set(file, own);
    }
    return {
      vendor,
      type,
      name,
      file,
      abstract: instantiation === 'false',
      ...(typeof json.inherits === 'string' ? { inherits: json.inherits } : {}),
      includes,
      own,
      ...(typeof json.setting_id === 'string' ? { setting_id: json.setting_id } : {}),
      ...(typeof json.filament_id === 'string' ? { filament_id: json.filament_id } : {}),
    };
  }

  // Flatten. A result is memoised (a failure as null, so it is reported once) with its height, the longest
  // inherits/include chain below it, so the depth cap holds whatever order the presets come in.
  type Flat = { settings: Map<string, unknown>; filament_id?: string; height: number };
  const memo = new Map<Entry, Flat | null>();
  const lookup = (e: Entry, name: string): Entry | undefined =>
    byName.get(`${e.vendor}\0${e.type}\0${name}`) ??
    (e.vendor === LIBRARY_VENDOR ? undefined : byName.get(`${LIBRARY_VENDOR}\0${e.type}\0${name}`));
  const copy = (into: Map<string, unknown>, from: Map<string, unknown>): boolean => {
    steps += from.size;
    if (steps > lim.maxMergeSteps) return false;
    for (const [k, v] of from) into.set(k, v);
    return true;
  };
  const fail = (e: Entry, code: TreeDiagnosticCode, message: string): null => {
    report(code, e.file, message);
    memo.set(e, null);
    return null;
  };

  /** 'deep': the recursion reached maxDepth; nothing on that path is memoised and the top-level preset fails. */
  function flatten(e: Entry, stack: Entry[]): Flat | null | 'deep' {
    const done = memo.get(e);
    if (done !== undefined) return done;
    if (exhausted) return null;
    if (stack.length >= lim.maxDepth) return 'deep';
    const below = [...stack, e];
    const settings = new Map<string, unknown>();
    let filament_id = e.filament_id;
    let height = 1;
    if (e.inherits !== undefined) {
      const p = lookup(e, e.inherits);
      if (p === undefined) return fail(e, 'unknown-parent', `parent '${e.inherits.slice(0, 80)}' not found`);
      if (below.includes(p)) return fail(e, 'cycle', `inherits '${e.inherits.slice(0, 80)}' leads back to itself`);
      const parent = flatten(p, below);
      if (parent === 'deep') return parent;
      if (parent === null)
        return exhausted
          ? null
          : fail(e, 'unknown-parent', `parent '${e.inherits.slice(0, 80)}' could not be resolved`);
      if (!copy(settings, parent.settings)) return budget(e);
      if (filament_id === undefined && e.type === 'filament') filament_id = parent.filament_id;
      height = parent.height + 1;
    }
    // A missing include is reported and skipped; the preset still imports (PresetBundle.cpp:7632-7636).
    for (const name of e.includes) {
      const t = lookup(e, name);
      if (t === undefined || below.includes(t)) {
        if (t === undefined) report('missing-include', e.file, `include '${name.slice(0, 80)}' not found`, 'warning');
        else report('cycle', e.file, `include '${name.slice(0, 80)}' leads back to itself`);
        continue;
      }
      const inc = flatten(t, below);
      if (inc === 'deep' || exhausted) return inc === 'deep' ? inc : null;
      if (inc === null) continue;
      if (!copy(settings, inc.settings)) return budget(e);
      height = Math.max(height, inc.height + 1);
    }
    if (height > lim.maxDepth) return fail(e, 'limit', `inherits and include nest deeper than ${lim.maxDepth}`);
    if (!copy(settings, e.own)) return budget(e);
    const out = { settings, height, ...(filament_id === undefined ? {} : { filament_id }) };
    memo.set(e, out);
    return out;
  }
  function budget(e: Entry): null {
    exhausted = true;
    report('limit', e.file, `flattening copied more than ${lim.maxMergeSteps} keys; later presets are not imported`);
    return null;
  }

  const presets: OrcaPreset[] = [];
  for (const e of entries) {
    const r = flatten(e, []);
    if (r === 'deep') fail(e, 'limit', `inherits and include nest deeper than ${lim.maxDepth}`);
    if (r === null || r === 'deep') continue;
    presets.push({
      vendor: e.vendor,
      type: e.type,
      name: e.name,
      file: e.file,
      abstract: e.abstract,
      ...(e.inherits === undefined ? {} : { inherits: e.inherits }),
      includes: e.includes,
      // fromEntries defines own properties, so a JSON key named __proto__ stays data.
      settings: Object.fromEntries(r.settings),
      external_ids: {
        ...(e.setting_id === undefined ? {} : { setting_id: e.setting_id }),
        ...(r.filament_id === undefined ? {} : { filament_id: r.filament_id }),
      },
    });
  }
  return { vendors, presets, diagnostics };
}
