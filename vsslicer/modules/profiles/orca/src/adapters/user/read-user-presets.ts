// SPDX-License-Identifier: AGPL-3.0-or-later
import type { SourceFile } from '@vsslicer/profile-api';
import {
  safePath,
  treeLimits,
  type OrcaTree,
  type PresetType,
  type TreeDiagnostic,
  type TreeLimits,
} from '../tree/read-tree.ts';

/**
 * Reads Orca / Bambu user presets: `user/<user_id>/{machine,process,filament}/<name>.json` with an optional
 * `<name>.info` INI sidecar (OrcaSlicer@09aa0114:src/libslic3r/Preset.hpp:31-44, Preset.cpp:670-700 `load_info`,
 * :1820-1844 `resolve_user_preset`). A user preset stores only its own keys plus `inherits`; it is not flattened
 * here, its parent is linked to the vendor (or another user) preset of the same type that `readOrcaTree` found.
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0).
 *
 * `meta.base_version` is the sidecar's `base_id` (the parent's `setting_id` the diff was based on); `"null"`
 * means none (Preset.cpp:687-690). Bundle folders (`user/<id>/_local/...`) are not read here; they and any other
 * file under `user/` the reader does not recognise get an `unknown-type` warning.
 *
 * Each type folder's `base/` subfolder holds detached "custom roots" and is read first (Preset.cpp:2007-2010,
 * `path_from_name` :4487-4488), so on a name clash the `base/` preset wins. A preset's name is its file stem
 * (Preset.cpp:2038-2043, `canonical_preset_name`); an inner `name` that disagrees is a warning. A user preset named
 * like a vendor preset of its type is skipped with a `duplicate` warning, as Orca does (Preset.cpp:2044-2048).
 */

const DIRS: Readonly<Record<string, PresetType>> = { machine: 'machine', process: 'process', filament: 'filament' };

export interface OrcaUserPreset {
  user_id: string;
  type: PresetType;
  name: string;
  file: string;
  inherits?: string;
  /** The preset `inherits` names: a vendor preset, or another user preset (`vendor` undefined); absent when standalone or unresolved. */
  parent?: { vendor?: string; name: string };
  /** Own keys only; `"nil"` is `null`. */
  settings: Record<string, unknown>;
  external_ids: { setting_id?: string };
  meta: { base_version?: string; updated?: string };
  sync_info?: string;
}

export interface UserPresets {
  presets: OrcaUserPreset[];
  diagnostics: TreeDiagnostic[];
}

const IDENTITY = new Set(['type', 'name', 'inherits', 'setting_id']);
const dec = new TextDecoder('utf-8', { fatal: true });

/** `key = value` lines; a plain linear split, no sections (the files carry none). `"null"` values are dropped for ids. */
function parseInfo(text: string): Record<string, string> {
  const out: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const line of text.split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

export function readOrcaUserPresets(
  files: readonly SourceFile[],
  tree: Pick<OrcaTree, 'presets'>,
  limits?: Partial<TreeLimits>,
): UserPresets {
  const lim = treeLimits(limits);
  const diagnostics: TreeDiagnostic[] = [];
  const warn = (
    code: TreeDiagnostic['code'],
    file: string,
    message: string,
    severity: TreeDiagnostic['severity'] = 'error',
  ) => diagnostics.push({ severity, code, file, message });
  if (files.length > lim.maxFiles) {
    warn('limit', '', `more than ${lim.maxFiles} files`);
    return { presets: [], diagnostics };
  }
  let total = 0;
  for (const f of files) total += f.bytes.byteLength;
  if (total > lim.maxTotalBytes) {
    warn('limit', '', `files total more than ${lim.maxTotalBytes} bytes`);
    return { presets: [], diagnostics };
  }

  const vendor = new Map<string, { vendor: string; name: string }>();
  for (const p of tree.presets) if (!vendor.has(`${p.type}\0${p.name}`)) vendor.set(`${p.type}\0${p.name}`, p);

  const infos = new Map<string, Uint8Array>();
  const jsons: { path: string; user: string; type: PresetType; base: boolean; bytes: Uint8Array }[] = [];
  for (const f of files) {
    const path = safePath(f.path);
    if (path === undefined) {
      warn('unsafe-path', f.path, 'unsafe path');
      continue;
    }
    const m = /^user\/([^/]+)\/([^/]+)\/(base\/)?([^/]+)\.(json|info)$/.exec(path);
    const type = m && Object.hasOwn(DIRS, m[2]!) ? DIRS[m[2]!] : undefined; // own keys only: `constructor` is no type
    if (!m || !type) {
      if (path.startsWith('user/')) warn('unknown-type', path, 'not a user preset or sidecar; ignored', 'warning');
      continue;
    }
    if (f.bytes.byteLength > lim.maxFileBytes) {
      warn('limit', path, `larger than ${lim.maxFileBytes} bytes`);
      continue;
    }
    if (m[5] === 'info') infos.set(path.slice(0, -5), f.bytes);
    else jsons.push({ path, user: m[1]!, type, base: m[3] !== undefined, bytes: f.bytes });
  }
  // Custom roots in base/ load first (stable sort keeps the input order otherwise).
  jsons.sort((a, b) => Number(b.base) - Number(a.base));

  const presets: OrcaUserPreset[] = [];
  const seen = new Set<string>();
  const byName = new Map<string, OrcaUserPreset>();
  for (const j of jsons) {
    let raw: unknown;
    try {
      raw = JSON.parse(dec.decode(j.bytes));
    } catch (e) {
      warn('invalid-json', j.path, (e as Error).message.slice(0, 200));
      continue;
    }
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      warn('invalid-json', j.path, 'not a JSON object');
      continue;
    }
    const o = raw as Record<string, unknown>;
    // The file stem is the identity Orca uses; `name` inside agrees with it in files Orca wrote.
    const name = j.path.slice(j.path.lastIndexOf('/') + 1, -5);
    if (typeof o.type === 'string' && o.type !== j.type) {
      warn('unknown-type', j.path, `type "${o.type}" does not match its folder "${j.type}"`);
      continue;
    }
    if (typeof o.name === 'string' && o.name !== name)
      warn('name-mismatch', j.path, `inner name "${o.name}" differs from the file name; using "${name}"`, 'warning');
    if (vendor.has(`${j.type}\0${name}`)) {
      warn('duplicate', j.path, `a vendor preset is already named "${name}"; not loaded`, 'warning');
      continue;
    }
    const key = `${j.user}\0${j.type}\0${name.normalize('NFC').toLowerCase()}`;
    if (seen.has(key)) {
      warn('duplicate', j.path, `second preset named "${name}"`);
      continue;
    }
    seen.add(key);
    const settings: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const [k, v] of Object.entries(o))
      if (!IDENTITY.has(k))
        settings[k] = v === 'nil' ? null : Array.isArray(v) ? v.map((x) => (x === 'nil' ? null : x)) : v;
    const sidecar = infos.get(j.path.slice(0, -5));
    let info: Record<string, string> = {};
    if (sidecar) {
      try {
        info = parseInfo(dec.decode(sidecar));
      } catch {
        warn('invalid-json', j.path.slice(0, -5) + '.info', 'sidecar is not valid UTF-8; ignored', 'warning');
      }
    }
    const id = (v: string | undefined) => (v === undefined || v === '' || v === 'null' ? undefined : v);
    const setting_id = id(info.setting_id) ?? (typeof o.setting_id === 'string' ? o.setting_id : undefined);
    const base = id(info.base_id);
    const u: OrcaUserPreset = {
      user_id: j.user,
      type: j.type,
      name,
      file: j.path,
      settings,
      external_ids: setting_id === undefined ? {} : { setting_id },
      meta: {
        ...(base === undefined ? {} : { base_version: base }),
        ...(id(info.updated_time) === undefined ? {} : { updated: info.updated_time }),
      },
      ...(id(info.sync_info) === undefined ? {} : { sync_info: info.sync_info }),
      ...(typeof o.inherits === 'string' && o.inherits !== '' ? { inherits: o.inherits } : {}),
    };
    presets.push(u);
    byName.set(`${j.user}\0${j.type}\0${name}`, u);
  }
  for (const u of presets) {
    if (u.inherits === undefined) continue;
    const v = vendor.get(`${u.type}\0${u.inherits}`);
    if (v) u.parent = { vendor: v.vendor, name: v.name };
    else if (byName.has(`${u.user_id}\0${u.type}\0${u.inherits}`)) u.parent = { name: u.inherits };
    else warn('unknown-parent', u.file, `parent "${u.inherits}" not found; imported as a standalone preset`, 'warning');
  }
  return { presets, diagnostics };
}
