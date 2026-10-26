// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Diagnostic, ImportResult, Material, PrinterModel, Process, Settings } from '@vsslicer/profile-api';
import { BundleArchiveError, readBundleArchive } from '../../archive/bundle-archive.ts';
import { bedShape } from '../../split/split.ts';

/**
 * Imports a Bambu Studio preset bundle (`.bbscfg`, or `.bbsflmt` which holds only `filament/`). Both are the zip
 * layout `readBundleArchive` reads (Bambu Studio@79df7ae shares OrcaSlicer@09aa0114b4e1
 * `src/slic3r/GUI/ExportPresetBundleDialog.cpp:374-463`). Copyright (c) Bambu Lab and the BambuStudio and
 * OrcaSlicer contributors (AGPL-3.0); only the format is used.
 *
 * Each `printer/`, `filament/` and `process/` entry becomes a `printer_model`, `material` or `process` whose id is
 * the file stem and whose `inherits` is the preset's parent (usually a system preset that is not in the bundle,
 * reported as an `unknown-parent` warning). `setting_id` and `filament_id` go to `native[id].external_ids`, and a
 * material's `filament_id` also to `external_ids.bambu_filament_id`. Settings keep their Bambu keys and values;
 * `"nil"` is `null`. A preset whose `version` differs from a non-empty manifest `version` gets a warning (offline
 * exports have an empty manifest version and presets saved by different app versions, which is normal).
 * Diagnostic codes are profile-api's closed set: a version problem is reported as `malformed-line`.
 * Bounded by `readBundleArchive`'s limits; linear in entries x keys.
 */
const FOLDERS = { printer: 'printer', filament: 'filament', process: 'process' } as const;
const IDENTITY = new Set(['name', 'from', 'inherits', 'setting_id', 'filament_id', 'version']);
const dec = new TextDecoder('utf-8', { fatal: true });
const first = (v: unknown): unknown => (Array.isArray(v) ? v[0] : v);
const str = (v: unknown): string | undefined => (typeof v === 'string' && v !== '' ? v : undefined);

export function importBambuBundle(data: Uint8Array, file = 'bundle.bbscfg'): ImportResult {
  const entities: ImportResult['entities'] = [];
  const native: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  const diagnostics: Diagnostic[] = [];
  const diag = (severity: Diagnostic['severity'], code: Diagnostic['code'], f: string, message: string) =>
    diagnostics.push({ severity, code, file: f, message });

  let archive;
  try {
    archive = readBundleArchive(data, { lenient: true });
  } catch (e) {
    if (!(e instanceof BundleArchiveError)) throw e;
    diag('error', 'malformed-line', file, e.message); // includes an unsupported manifest version
    return { entities, native, diagnostics };
  }
  for (const f of archive.missing) diag('error', 'unreadable-folder', f, 'listed in the bundle but not in the archive');
  const bundleVersion = archive.manifest?.version ?? '';
  const ids = new Set<string>();
  // `<kind>/<stem>` of every preset in the archive, for the in-bundle parent check
  const present = new Set<string>();
  for (const path of archive.entries.keys()) if (path.endsWith('.json')) present.add(path.slice(0, -5));
  for (const [path, bytes] of archive.entries) {
    const [folder, ...rest] = path.split('/');
    if (!Object.hasOwn(FOLDERS, folder!) || rest.length !== 1 || !path.endsWith('.json')) continue;
    const kind = folder as keyof typeof FOLDERS;
    const id = path.slice(folder!.length + 1, -5);
    let raw: unknown;
    try {
      raw = JSON.parse(dec.decode(bytes));
    } catch (e) {
      diag('error', 'invalid-json', path, e instanceof Error ? e.message : 'invalid JSON');
      continue;
    }
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      diag('error', 'invalid-json', path, 'not a JSON object');
      continue;
    }
    if (ids.has(id)) {
      diag('error', 'malformed-line', path, `another preset is already named "${id.slice(0, 200)}"; not imported`);
      continue;
    }
    ids.add(id);
    const o = raw as Record<string, unknown>;
    const settings = Object.create(null) as Settings;
    for (const [k, v] of Object.entries(o))
      if (!IDENTITY.has(k))
        settings[k] = (v === 'nil' ? null : Array.isArray(v) ? v.map((x) => (x === 'nil' ? null : x)) : v) as never;
    const inherits = str(o.inherits);
    const base = { id, settings, ...(inherits === undefined ? {} : { inherits: [inherits] }) };
    const setting_id = str(o.setting_id);
    const filament_id = str(o.filament_id);
    native[id] = {
      type: kind,
      file: path,
      from: o.from,
      version: o.version,
      external_ids: { setting_id, filament_id },
    };
    const placeholder = (what: string) =>
      diag('warning', 'malformed-line', path, `${what} is missing or invalid; placeholder used`);
    if (kind === 'printer') {
      const count = Array.isArray(settings.nozzle_diameter) ? settings.nozzle_diameter.length : 1;
      const shape = bedShape(settings.printable_area);
      if (!shape) placeholder('printable_area');
      entities.push({
        ...base,
        vendor: 'User',
        name: id,
        technology: 'fff',
        bed: {
          shape:
            shape ??
            ([
              [0, 0],
              [0, 0],
              [0, 0],
            ] as [number, number][]),
          max_height: Number(first(settings.printable_height)) || 0,
        },
        toolheads: { count, kinematics: 'unspecified' },
      } satisfies PrinterModel);
    } else if (kind === 'filament') {
      const type = str(first(settings.filament_type));
      if (type === undefined) placeholder('filament_type');
      entities.push({
        ...base,
        vendor: str(first(settings.filament_vendor)) ?? 'User',
        name: id,
        type: type ?? 'unknown',
        diameter: Number(first(settings.filament_diameter)) || 1.75,
        ...(filament_id === undefined ? {} : { external_ids: { bambu_filament_id: filament_id } }),
      } satisfies Material);
    } else {
      // A saved process stores only what the user changed; the layer height then lives in the parent.
      const lh = Number(first(settings.layer_height));
      if (!(lh > 0)) placeholder('layer_height');
      entities.push({ ...base, name: id, layer_height: lh > 0 ? lh : 0.2 } satisfies Process);
    }
    const v = str(o.version);
    if (bundleVersion !== '' && v !== bundleVersion)
      diag(
        'warning',
        'malformed-line',
        path,
        `version mismatch: preset is version ${JSON.stringify((v ?? '').slice(0, 64))}, bundle is ${bundleVersion}`,
      );
    if (inherits !== undefined && !present.has(`${kind}/${inherits}`))
      diag(
        'warning',
        'unknown-parent',
        path,
        `parent "${inherits.slice(0, 200)}" is not in the bundle; imported as a diff`,
      );
  }
  return { entities, native, diagnostics };
}
