// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ImportResult } from '@vsslicer/profile-api';
import { writeBundleArchive, type BundlePreset } from '../../archive/bundle-archive.ts';
import { writeOrcaJson } from '../../export/orca/write-json.ts';

/**
 * Exports entities as a Bambu Studio preset bundle: `.bbscfg` (printers, filaments, processes) or `.bbsflmt`
 * (`kind: 'filament'`: only the materials, in `filament/`). One zip layout, the one `importBambuBundle` reads
 * (BambuStudio@79df7ae:src/slic3r/GUI/CreatePresetsDialog.cpp:4052-4166 writes `.bbscfg`, :4170-4245 writes
 * Studio's own `.bbsflmt` layout, which this does not reproduce: PRF-226; Studio imports ours, it ignores paths and
 * the manifest, PresetBundle.cpp:1068-1079).
 * Every preset is one Studio loads: a semver `version` and a `*_settings_id` are always present
 * (BambuStudio@79df7ae:src/libslic3r/PresetBundle.cpp:1118-1136 drops a preset without them).
 * Each preset is written as Bambu Studio saves one: every key sorted, four-space indent, `"nil"` for null,
 * then a newline (BambuStudio@79df7ae:src/libslic3r/Config.cpp:1522-1571, via `writeOrcaJson`), so an unmodified
 * import of a Studio-saved bundle re-exports byte-equivalently. The manifest has an `offline_` bundle id and an
 * empty version: no account id is written. A printer's host and credential keys are erased, as Orca's export does
 * (OrcaSlicer@09aa0114:src/slic3r/GUI/ExportPresetBundleDialog.cpp:236-243); `setting_id` and `filament_id` are
 * preset ids, not account ids, and stay. Bounded by `writeBundleArchive`.
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0).
 */

const SECRETS = new Set([
  'print_host',
  'print_host_webui',
  'printhost_apikey',
  'printhost_cafile',
  'printhost_user',
  'printhost_password',
  'printhost_port',
]);
const FOLDER = { machine: 'printer', filament: 'filament', process: 'process' } as const;

interface BambuNative {
  from?: unknown;
  version?: unknown;
  external_ids?: { setting_id?: string; filament_id?: string };
}

/** @param options.clock the export time, so the output is deterministic. */
export function exportBambuBundle(
  entities: ImportResult['entities'],
  native: ImportResult['native'],
  options: { name: string; clock: string; kind?: 'config' | 'filament' },
): Uint8Array {
  const kinds: Record<'printer' | 'filament' | 'process', BundlePreset[]> = { printer: [], filament: [], process: [] };
  for (const e of entities) {
    if (!('settings' in e)) continue; // a vendor is not a preset
    const type = 'technology' in e ? 'machine' : 'type' in e ? 'filament' : 'process';
    if (options.kind === 'filament' && type !== 'filament') continue;
    const name = 'name' in e && typeof e.name === 'string' ? e.name : e.id;
    const n = (Object.hasOwn(native, e.id) ? native[e.id] : undefined) as BambuNative | undefined;
    const values: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const [k, v] of Object.entries(e.settings ?? {})) if (type !== 'machine' || !SECRETS.has(k)) values[k] = v;
    values.name = name;
    values.from = typeof n?.from === 'string' ? n.from : 'User';
    values.inherits = e.inherits?.[0] ?? '';
    values.version = typeof n?.version === 'string' && n.version ? n.version : '1.0.0.0';
    const sid = `${type === 'machine' ? 'printer' : type === 'process' ? 'print' : type}_settings_id`;
    if (values[sid] === undefined) values[sid] = type === 'filament' ? [name] : name;
    const ids = n?.external_ids;
    if (ids?.setting_id) values.setting_id = ids.setting_id;
    const filamentId = ids?.filament_id ?? ('external_ids' in e ? e.external_ids?.bambu_filament_id : undefined);
    if (type === 'filament' && filamentId) values.filament_id = filamentId;
    kinds[FOLDER[type]].push({ fileName: `${name}.json`, data: writeOrcaJson(type, values, { dialect: 'bambu' }) });
  }
  return writeBundleArchive({ ...options, ...kinds });
}
