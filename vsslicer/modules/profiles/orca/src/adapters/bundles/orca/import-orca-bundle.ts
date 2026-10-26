// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Diagnostic, ImportResult, Settings, SourceFile } from '@vsslicer/profile-api';
import { BundleArchiveError, readBundleArchive } from '../../archive/bundle-archive.ts';
import { bedShape } from '../../split/split.ts';
import type { TreeDiagnostic } from '../../tree/read-tree.ts';
import { readOrcaJson } from '../../export/orca/write-json.ts';
import { readOrcaUserPresets, type OrcaUserPreset } from '../../user/read-user-presets.ts';

/**
 * Imports an Orca preset bundle (`.orca_printer`, `.orca_filament`, `.orca_bundle`): the zip is read by
 * `readBundleArchive`, and its `printer/`, `filament/` and `process/` presets are fed to `readOrcaUserPresets` as
 * a user's `machine/`, `filament/` and `process/` folders, so a bundle preset is read exactly like a saved user
 * preset (OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:2410-2500 loads bundle entries as user presets).
 * Each becomes a `printer_model`, `material` or `process` under its own name, with its own keys as `settings`.
 * A bundle holds only the user's diff, so what its vendor parent supplies is unknown: a missing bed becomes a
 * zero-size placeholder, a missing filament type `unknown` and diameter 1.75, a missing layer height 0.2, each
 * with a warning. The unresolved `inherits` is kept in `native`. Manifest-listed files that are absent give a
 * diagnostic and the rest still import. Copyright (c) Bambu Lab and the OrcaSlicer contributors (AGPL-3.0).
 * Bounded by `readBundleArchive` (entry count, sizes, ratio) and the reader's tree limits.
 */

const KINDS = { printer: 'machine', filament: 'filament', process: 'process' } as const;
const MAX_MESSAGE = 300;
const clip = (s: string) => (s.length > MAX_MESSAGE ? `${s.slice(0, MAX_MESSAGE)}...` : s);
const first = (v: unknown): unknown => (Array.isArray(v) ? v[0] : v);
const VENDOR = 'user';

const CODES: Record<TreeDiagnostic['code'], Diagnostic['code']> = {
  'invalid-json': 'invalid-json',
  'unknown-type': 'unknown-type',
  'unknown-parent': 'unknown-parent',
  cycle: 'cycle',
  'missing-include': 'unreadable-folder',
  'missing-file': 'unreadable-folder',
  duplicate: 'malformed-line',
  'unsafe-path': 'malformed-line',
  limit: 'malformed-line',
  'name-mismatch': 'malformed-line',
};

export function importOrcaBundle(data: Uint8Array): ImportResult {
  const diagnostics: Diagnostic[] = [];
  // preset names are untrusted: null-prototype keeps `__proto__` a plain key
  const native: Record<string, unknown> = Object.create(null);
  const entities: ImportResult['entities'] = [];
  const diag = (severity: Diagnostic['severity'], code: Diagnostic['code'], file: string, message: string) =>
    diagnostics.push({ severity, code, file: clip(file), message: clip(message) });

  let archive;
  try {
    archive = readBundleArchive(data, { lenient: true });
  } catch (e) {
    if (!(e instanceof BundleArchiveError)) throw e;
    diag('error', 'unreadable-folder', '', e.message);
    return { entities, native, diagnostics };
  }
  for (const f of archive.missing) diag('error', 'unreadable-folder', f, `listed in the bundle but not in the archive`);

  const listed = archive.manifest
    ? new Set([
        ...archive.manifest.printerConfig,
        ...archive.manifest.filamentConfig,
        ...archive.manifest.processConfig,
      ])
    : undefined;
  const files: SourceFile[] = [];
  const origin = new Map<string, string>();
  for (const [name, bytes] of archive.entries) {
    const m = /^(printer|filament|process)\/([^/]+\.json)$/.exec(name);
    if (!m || (listed && !listed.has(name))) continue;
    const path = `user/bundle/${KINDS[m[1] as keyof typeof KINDS]}/${m[2]}`;
    origin.set(path, name);
    files.push({ path, bytes });
  }

  const read = readOrcaUserPresets(files, { presets: [] });
  for (const d of read.diagnostics) diag(d.severity, CODES[d.code], origin.get(d.file) ?? d.file, d.message);

  const bytes = new Map(files.map((f) => [f.path, f.bytes]));
  const taken = new Set<string>();
  for (const u of read.presets) {
    const file = origin.get(u.file) ?? u.file;
    if (taken.has(u.name)) {
      diag(
        'error',
        'malformed-line',
        file,
        `a ${u.type} preset reuses the id "${u.name}" of another kind; not imported`,
      );
      continue;
    }
    taken.add(u.name);
    const s = u.settings as Settings;
    const placeholder = (what: string) =>
      diag('warning', 'malformed-line', file, `${what} is not in the bundle; placeholder used`);
    const base = {
      id: u.name,
      name: u.name,
      settings: s,
      ...(u.parent && !u.parent.vendor ? { inherits: [u.parent.name] } : {}),
      ...(Object.keys(u.meta).length ? { meta: u.meta } : {}),
    };
    if (u.type === 'machine') {
      const shape = bedShape(s['printable_area']);
      if (!shape) placeholder('printable_area');
      const count = Array.isArray(s['nozzle_diameter']) ? s['nozzle_diameter'].length : 1;
      entities.push({
        ...base,
        vendor: VENDOR,
        technology: 'fff',
        bed: {
          shape:
            shape ??
            ([
              [0, 0],
              [0, 0],
              [0, 0],
            ] as [number, number][]),
          max_height: Number(first(s['printable_height'])) || 0,
        },
        toolheads: { count, kinematics: 'unspecified' },
      });
    } else if (u.type === 'filament') {
      const type = first(s['filament_type']);
      const diameter = Number(first(s['filament_diameter']));
      if (typeof type !== 'string' || !type) placeholder('filament_type');
      if (!(diameter > 0)) placeholder('filament_diameter');
      entities.push({
        ...base,
        vendor: VENDOR,
        type: typeof type === 'string' && type ? type : 'unknown',
        diameter: diameter > 0 ? diameter : 1.75,
      });
    } else if (u.type === 'process') {
      const height = Number(first(s['layer_height']));
      if (!(height > 0)) placeholder('layer_height');
      entities.push({ ...base, layer_height: height > 0 ? height : 0.2 });
    } else continue;
    native[u.name] = nativeOf(u, bytes.get(u.file));
  }
  return { entities, native, diagnostics };
}

/** What the unified entity cannot hold: the unresolved parent, the sidecar ids and the file's layout (for export). */
function nativeOf(u: OrcaUserPreset, file?: Uint8Array): Record<string, unknown> {
  const json = file && readOrcaJson(file);
  return {
    ...(json && 'native' in json ? { json: json.native } : {}),
    ...(u.inherits === undefined ? {} : { inherits: u.inherits }),
    external_ids: u.external_ids,
  };
}
