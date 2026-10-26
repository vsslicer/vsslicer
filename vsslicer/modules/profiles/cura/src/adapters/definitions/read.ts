// SPDX-License-Identifier: AGPL-3.0-or-later
// Cura `definitions/`, `extruders/` (`.def.json`) and `variants/` (`.inst.cfg`), read with Uranium's inheritance.
// Behaviour re-implemented from Uranium@e65ccc1 and Cura@5bea2f8 (both LGPL-3.0; no code copied):
//   UM/Resources.py:118-130 dot files and folders are skipped; the first file of a name wins.
//   UM/MimeTypeDatabase.py:110-114 suffixes match case-insensitively (Cura ships `.def.JSON` extruders);
//   plugins/LocalContainerProvider/LocalContainerProvider.py:395 the id is the basename without suffix, unquote_plus'd.
//   UM/Settings/DefinitionContainer.py:271-273, :481-491, :513-534 a definition is its parent chain deep-merged,
//     child last; :292-303 the merged `overrides` then update the settings they name, an unknown name is dropped;
//     :203-205 a setting's value is `value` (a formula) when not None, else `default_value`;
//     :418-438 metadata is shallow: the parent's, then the file's own keys; :430-435 `name` and `version` are required;
//     :50, :500-501 version 2.
//   UM/Settings/InstanceContainer.py:535-547 `[general]` needs `version` and `definition`; :54, :618-622 version 4;
//     :632 the name defaults to the id. UM/Settings/SettingInstance.py:172-173 `=x` is the formula `x`.
// Formulas are kept as `{ expr }` and never evaluated here.
import type { Diagnostic, DiagnosticCode, Settings, SettingValue, SourceFile } from '@vsslicer/profile-api';
import { parseInstCfg } from './inst-cfg.ts';

/** Caps over every file of one call (rule 25). */
export interface CuraResourceLimits {
  /** Most files passed in (or, for the folder reader, directory entries seen). */
  maxFiles: number;
  /** Most bytes in one file. */
  maxFileBytes: number;
  /** Most bytes over all files. */
  maxTotalBytes: number;
  /** Deepest `{`/`[` nesting in one `.def.json`. */
  maxJsonDepth: number;
  /** Longest `inherits` chain above a definition. */
  maxInheritsDepth: number;
  /** Most setting and metadata entries written while resolving all definitions (a definition copies its parent's). */
  maxResolvedEntries: number;
  /** Deepest folder below a resource folder (folder reader only). */
  maxFolderDepth: number;
}

// Cura@5bea2f8: 2 991 files, largest 581 KiB (fdmprinter), JSON depth 11, inherits depth 6, about 0.6 M resolved entries.
export const CURA_RESOURCE_LIMITS: Readonly<CuraResourceLimits> = Object.freeze({
  maxFiles: 20_000,
  maxFileBytes: 8 * 1024 * 1024,
  maxTotalBytes: 256 * 1024 * 1024,
  maxJsonDepth: 64,
  maxInheritsDepth: 32,
  maxResolvedEntries: 4_000_000,
  maxFolderDepth: 8,
});

export const MAX_RESOURCE_DIAGNOSTICS = 1000;

/** Validates caller limits: each a positive safe integer; throws RangeError. */
export function resolveResourceLimits(limits: Partial<CuraResourceLimits> = {}): CuraResourceLimits {
  const out = { ...CURA_RESOURCE_LIMITS };
  for (const k of Object.keys(CURA_RESOURCE_LIMITS) as (keyof CuraResourceLimits)[]) {
    const v = limits[k];
    if (v === undefined) continue;
    if (!Number.isSafeInteger(v) || v <= 0) throw new RangeError(`${k} must be a positive integer, got ${v}`);
    out[k] = v;
  }
  return out;
}

export interface CuraDefinition {
  id: string;
  file: string;
  name: string;
  inherits?: string;
  /** The parent's metadata with this file's own keys over it. */
  metadata: Record<string, unknown>;
  /** Every setting at this definition: `value` as `{ expr }`, else `default_value`. */
  settings: Settings;
}

export interface CuraVariant {
  id: string;
  file: string;
  name: string;
  /** The machine definition id from `[general] definition`. */
  definition: string;
  metadata: Record<string, string>;
  /** `[values]`: `=x` as `{ expr: 'x' }`, anything else the string as written. */
  settings: Settings;
}

export interface CuraResources {
  /** By id, from `definitions/`. */
  definitions: ReadonlyMap<string, CuraDefinition>;
  /** By id, from `extruders/`; one id namespace with `definitions`. */
  extruders: ReadonlyMap<string, CuraDefinition>;
  /** By id, from `variants/` at any depth. */
  variants: ReadonlyMap<string, CuraVariant>;
  diagnostics: Diagnostic[];
}

export type CuraResourceKind = 'definitions' | 'extruders' | 'variants';

/** The resource folder a path (relative to Cura's `resources/`) belongs to, and its id; undefined when not one. */
export function curaResourceOf(path: string): { kind: CuraResourceKind; id: string } | undefined {
  const parts = path.split('/');
  const top = parts[0];
  const base = parts.at(-1)!;
  if (parts.some((p) => p.startsWith('.'))) return undefined;
  const suffix = top === 'variants' ? '.inst.cfg' : top === 'definitions' || top === 'extruders' ? '.def.json' : '';
  if (!suffix || parts.length < 2 || base.length <= suffix.length || !base.toLowerCase().endsWith(suffix)) {
    return undefined;
  }
  if (top !== 'variants' && parts.length !== 2) return undefined;
  return { kind: top as CuraResourceKind, id: unquotePlus(base.slice(0, -suffix.length)) };
}

/** Python's `urllib.parse.unquote_plus`, leaving a malformed escape as written. */
function unquotePlus(s: string): string {
  const spaced = s.replaceAll('+', ' ');
  try {
    return decodeURIComponent(spaced);
  } catch {
    return spaced;
  }
}

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
type JsonObject = { [k: string]: Json };
const isObject = (v: unknown): v is JsonObject => typeof v === 'object' && v !== null && !Array.isArray(v);

/** A setting's two value properties; `value` present means a formula (unless null). */
interface Pair {
  value?: Json;
  default?: Json;
}

interface Raw {
  id: string;
  file: string;
  kind: 'definitions' | 'extruders';
  json: JsonObject;
}

interface Resolved {
  def: CuraDefinition;
  tree: ReadonlyMap<string, Pair>;
  overrides: ReadonlyMap<string, Pair>;
  /** Ancestors above it. */
  depth: number;
}

const utf8 = new TextDecoder('utf-8', { fatal: true });

/** Deepest bracket nesting outside strings, stopping once over `max`; linear. */
function jsonDepthOver(text: string, max: number): boolean {
  let depth = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (inString) {
      if (c === 0x5c) i++;
      else if (c === 0x22) inString = false;
    } else if (c === 0x22) inString = true;
    else if (c === 0x7b || c === 0x5b) {
      if (++depth > max) return true;
    } else if (c === 0x7d || c === 0x5d) depth--;
  }
  return false;
}

/** The settings tree's leaves (nodes with `value` or `default_value`), at any depth under `children`. */
function flattenSettings(tree: JsonObject, into: Map<string, Pair>): void {
  for (const [key, node] of Object.entries(tree)) {
    if (!isObject(node)) continue;
    if (Object.hasOwn(node, 'value') || Object.hasOwn(node, 'default_value')) {
      into.set(key, { ...into.get(key), ...pairOf(node) });
    }
    if (isObject(node['children'])) flattenSettings(node['children'], into);
  }
}

function pairOf(node: JsonObject): Pair {
  const p: Pair = {};
  if (Object.hasOwn(node, 'value')) p.value = node['value']!;
  if (Object.hasOwn(node, 'default_value')) p.default = node['default_value']!;
  return p;
}

/**
 * A JSON value as the formula SettingFunction compiles from `str(value)` (SettingDefinition.py:729): same Python value,
 * not always the same text (`1.0` reads as `1`, lists lose Python's spacing).
 */
function formula(v: Json): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  return JSON.stringify(v);
}

function effective(p: Pair | undefined): SettingValue {
  if (p?.value !== undefined && p.value !== null) return { expr: formula(p.value) };
  return (p?.default ?? null) as SettingValue;
}

export function readCuraResources(
  files: readonly SourceFile[],
  limits: Partial<CuraResourceLimits> = {},
): CuraResources {
  const lim = resolveResourceLimits(limits);
  const diagnostics: Diagnostic[] = [];
  const diag = (severity: Diagnostic['severity'], code: DiagnosticCode, file: string, message: string) => {
    if (diagnostics.length > MAX_RESOURCE_DIAGNOSTICS) return;
    if (diagnostics.length === MAX_RESOURCE_DIAGNOSTICS) message = 'further diagnostics suppressed';
    diagnostics.push({ severity, code, file, message });
  };

  const raws = new Map<string, Raw>();
  const variants = new Map<string, CuraVariant>();
  // Case and Unicode-normalisation aliases of one id are one resource: the first wins (Resources.py:124-130).
  const seen = { def: new Map<string, string>(), variant: new Map<string, string>() };
  let total = 0;

  for (const [n, file] of files.entries()) {
    if (n >= lim.maxFiles) {
      diag('error', 'unreadable-folder', file.path, `more than ${lim.maxFiles} files; the rest are not read`);
      break;
    }
    const size = file.bytes.length;
    if (size > lim.maxFileBytes) {
      diag('error', 'unreadable-folder', file.path, `${size} bytes, over the ${lim.maxFileBytes} byte limit; not read`);
      continue;
    }
    total += size;
    if (total > lim.maxTotalBytes) {
      diag('error', 'unreadable-folder', file.path, `over ${lim.maxTotalBytes} bytes in all; the rest are not read`);
      break;
    }
    const res = curaResourceOf(file.path);
    if (!res) continue;
    const aliases = res.kind === 'variants' ? seen.variant : seen.def;
    const alias = res.id.normalize('NFC').toLowerCase();
    const first = aliases.get(alias);
    if (first !== undefined) {
      diag('warning', 'unreadable-folder', file.path, `same id as ${first}; not read`);
      continue;
    }
    aliases.set(alias, file.path);

    let text: string;
    try {
      text = utf8.decode(file.bytes);
    } catch {
      diag('error', res.kind === 'variants' ? 'malformed-line' : 'invalid-json', file.path, 'not UTF-8');
      continue;
    }
    if (res.kind === 'variants') {
      const v = readVariant(res.id, file.path, text);
      if (typeof v === 'string') diag('error', 'malformed-line', file.path, v);
      else variants.set(v.id, v);
      continue;
    }
    if (jsonDepthOver(text, lim.maxJsonDepth)) {
      diag('error', 'invalid-json', file.path, `nested deeper than ${lim.maxJsonDepth}; not read`);
      continue;
    }
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (e) {
      diag('error', 'invalid-json', file.path, (e as Error).message);
      continue;
    }
    const bad = shapeError(json);
    if (bad) diag('error', 'invalid-json', file.path, bad);
    else raws.set(res.id, { id: res.id, file: file.path, kind: res.kind, json: json as JsonObject });
  }

  const done = new Map<string, Resolved | undefined>();
  let budget = lim.maxResolvedEntries;
  let budgetReported = false;
  const charge = (n: number, file: string): boolean => {
    budget -= n;
    if (budget >= 0) return true;
    if (!budgetReported) diag('error', 'unreadable-folder', file, `over ${lim.maxResolvedEntries} resolved entries`);
    budgetReported = true;
    return false;
  };

  const fail = (raw: Raw, code: DiagnosticCode, message: string): undefined => {
    diag('error', code, raw.file, message);
    done.set(raw.id, undefined);
    return undefined;
  };

  // Walks up without recursion, then builds the chain top-down; every definition is built once, so the work is
  // linear and the result (depth checked in the build) does not depend on the input order.
  const resolve = (start: Raw): Resolved | undefined => {
    const chain: Raw[] = [];
    const onChain = new Set<string>();
    let cur: Raw | undefined = start;
    let unknown: string | undefined;
    while (cur && !done.has(cur.id)) {
      if (onChain.has(cur.id)) {
        const loop = [...chain.slice(chain.indexOf(cur)), cur].map((r) => r.id);
        const shown = loop.length > 8 ? [...loop.slice(0, 8), '…'] : loop;
        return fail(start, 'cycle', `inherits loop: ${shown.join(' → ')}`);
      }
      chain.push(cur);
      onChain.add(cur.id);
      const parentId = cur.json['inherits'] as string | undefined;
      if (parentId === undefined) break;
      cur = raws.get(parentId);
      if (!cur) unknown = parentId;
    }
    let parent = cur && chain.at(-1) !== cur ? done.get(cur.id) : undefined;
    for (let i = chain.length - 1; i >= 0; i--) {
      const raw = chain[i]!;
      const parentId = raw.json['inherits'] as string | undefined;
      if (parentId === undefined) parent = build(raw, undefined, undefined);
      else if (i === chain.length - 1 && unknown !== undefined) {
        parent = fail(raw, 'unknown-parent', `inherits unknown definition ${unknown}`);
      } else if (!parent) parent = fail(raw, 'unknown-parent', `parent ${parentId} could not be read`);
      else if (parent.depth >= lim.maxInheritsDepth) {
        parent = fail(raw, 'cycle', `inherits chain longer than ${lim.maxInheritsDepth}`);
      } else parent = build(raw, parentId, parent);
    }
    return parent;
  };

  const build = (raw: Raw, parentId: string | undefined, parent: Resolved | undefined): Resolved | undefined => {
    const { json } = raw;
    const ownOverrides = isObject(json['overrides']) ? Object.entries(json['overrides']) : [];
    const ownMetadata = isObject(json['metadata']) ? json['metadata'] : {};
    // Charged before copying: each definition copies its parent's maps and metadata.
    const copied = parent ? parent.tree.size * 2 + parent.overrides.size + Object.keys(parent.def.metadata).length : 0;
    if (!charge(copied + ownOverrides.length + Object.keys(ownMetadata).length, raw.file)) {
      done.set(raw.id, undefined);
      return undefined;
    }
    let tree = parent?.tree ?? new Map<string, Pair>();
    if (isObject(json['settings'])) {
      const own = new Map(tree);
      flattenSettings(json['settings'], own);
      tree = own;
    }
    let overrides = parent?.overrides ?? new Map<string, Pair>();
    if (ownOverrides.length > 0) {
      const merged = new Map(overrides);
      for (const [key, props] of ownOverrides) {
        if (!isObject(props)) continue;
        merged.set(key, { ...merged.get(key), ...pairOf(props) });
      }
      overrides = merged;
    }
    const metadata = { ...parent?.def.metadata, ...ownMetadata };
    for (const [key] of ownOverrides) {
      if (!tree.has(key)) diag('info', 'unknown-type', raw.file, `override of unknown setting ${key} ignored`);
    }
    const settings = Object.fromEntries(
      [...tree].map(([key, pair]) => [key, effective({ ...pair, ...overrides.get(key) })]),
    ) as Settings;
    const def: CuraDefinition = {
      id: raw.id,
      file: raw.file,
      name: json['name'] as string,
      ...(parentId === undefined ? {} : { inherits: parentId }),
      metadata,
      settings,
    };
    const out = { def, tree, overrides, depth: parent ? parent.depth + 1 : 0 };
    done.set(raw.id, out);
    return out;
  };

  const definitions = new Map<string, CuraDefinition>();
  const extruders = new Map<string, CuraDefinition>();
  for (const raw of raws.values()) {
    const r = done.has(raw.id) ? done.get(raw.id) : resolve(raw);
    if (r) (raw.kind === 'extruders' ? extruders : definitions).set(raw.id, r.def);
  }
  return { definitions, extruders, variants, diagnostics };
}

function shapeError(json: unknown): string | undefined {
  if (!isObject(json)) return 'not a JSON object';
  if (json['version'] !== 2) return `version ${JSON.stringify(json['version'])}, expected 2`;
  if (typeof json['name'] !== 'string') return 'no name';
  if (json['inherits'] !== undefined && typeof json['inherits'] !== 'string') return 'inherits is not a string';
  for (const k of ['metadata', 'settings', 'overrides']) {
    if (json[k] !== undefined && !isObject(json[k])) return `${k} is not an object`;
  }
  return undefined;
}

function readVariant(id: string, file: string, text: string): CuraVariant | string {
  const cfg = parseInstCfg(text);
  const general = cfg.get('general');
  const definition = general?.get('definition');
  const version = general?.get('version');
  if (definition === undefined || version === undefined) return 'no [general] definition and version';
  if (version !== '4') return `version ${version}, expected 4`;
  const values = cfg.get('values') ?? new Map<string, string>();
  return {
    id,
    file,
    name: general!.get('name') ?? id,
    definition,
    metadata: Object.fromEntries(cfg.get('metadata') ?? []),
    settings: Object.fromEntries([...values].map(([k, v]) => [k, v.startsWith('=') ? { expr: v.slice(1) } : v])),
  };
}
