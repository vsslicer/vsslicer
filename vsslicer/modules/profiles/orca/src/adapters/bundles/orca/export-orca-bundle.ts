// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ImportResult } from '@vsslicer/profile-api';
import { writeBundleArchive, type BundlePreset } from '../../archive/bundle-archive.ts';
import { writeOrcaUserPreset, type OrcaJsonNative } from '../../export/orca/write-json.ts';
import type { PresetType } from '../../tree/read-tree.ts';

/**
 * Exports entities as an Orca preset bundle (`.orca_printer`, `.orca_filament`, `.orca_bundle`: one zip format; the
 * extension is the caller's choice). Each entity becomes `<printer|filament|process>/<name>.json` (the preset's name is its identity in Orca), written by
 * `writeOrcaUserPreset` over the layout the importer kept in `native[id].json`, so an unmodified import exports
 * the same preset bytes. The manifest carries an `offline_` bundle id and an empty version (`buildBundleStructure`):
 * no account id is ever written. As Orca's export does, the printer's host and credential keys are erased
 * (OrcaSlicer@09aa0114:src/slic3r/GUI/ExportPresetBundleDialog.cpp:236-243). Bounded by `writeBundleArchive`.
 * Copyright (c) Bambu Lab and the OrcaSlicer contributors (AGPL-3.0).
 */

const SECRETS = [
  'print_host',
  'print_host_webui',
  'printhost_apikey',
  'printhost_cafile',
  'printhost_user',
  'printhost_password',
  'printhost_port',
];
const FOLDER = { machine: 'printer', filament: 'filament', process: 'process' } as const;

interface OrcaNative {
  inherits?: string;
  external_ids?: { setting_id?: string };
  json?: OrcaJsonNative;
}

/** @param name and @param clock make the bundle id; pass the export time so the output is deterministic. */
export function exportOrcaBundle(
  entities: ImportResult['entities'],
  native: ImportResult['native'],
  options: { name: string; clock: string },
): Uint8Array {
  const kinds: Record<'printer' | 'filament' | 'process', BundlePreset[]> = { printer: [], filament: [], process: [] };
  for (const e of entities) {
    if (!('settings' in e)) continue; // a vendor is not a preset
    const type: PresetType = 'technology' in e ? 'machine' : 'type' in e ? 'filament' : 'process';
    const name = 'name' in e && typeof e.name === 'string' ? e.name : e.id;
    const n = (Object.hasOwn(native, e.id) ? native[e.id] : undefined) as OrcaNative | undefined;
    const settings: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const [k, v] of Object.entries(e.settings ?? {}))
      if (type !== 'machine' || !SECRETS.includes(k)) settings[k] = v;
    const inherits = e.inherits?.[0] ?? n?.inherits;
    const data = writeOrcaUserPreset(
      {
        user_id: 'bundle',
        type,
        name,
        file: '',
        settings,
        external_ids: n?.external_ids ?? {},
        meta: {},
        ...(inherits === undefined ? {} : { inherits }),
      },
      n?.json ? { native: n.json } : {},
    );
    kinds[FOLDER[type]].push({ fileName: `${name}.json`, data });
  }
  return writeBundleArchive({ ...options, ...kinds });
}
