// SPDX-License-Identifier: AGPL-3.0-or-later
import { HOST_TYPES, MAX_CONNECTION_STRING } from '@vsslicer/profile-api';
import type { Diagnostic, InstanceImport } from '@vsslicer/profile-api';
import { splitOrcaPrinters } from '../split/split.ts';
import type { OrcaTree } from '../tree/read-tree.ts';
import type { OrcaUserPreset } from '../user/read-user-presets.ts';

/**
 * Orca / Bambu user machine presets as printer instances. Orca has no separate physical-printer file: the
 * "Print Host upload" dialog edits the selected printer preset's own config (OrcaSlicer@09aa0114:
 * src/slic3r/GUI/PhysicalPrinterDialog.cpp:119 `m_config = &...printers.get_edited_preset().config`), and the
 * connection keys are printer options (src/libslic3r/Preset.cpp:1591-1594: `host_type`, `print_host`,
 * `printhost_apikey`, ..., `printhost_authorization_type`, `printhost_user`, `printhost_password`). A user preset is
 * saved as the diff against its parent (Preset.cpp:754-800), so every key is looked up along the `inherits` chain,
 * ending at the flattened vendor preset. Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors
 * (AGPL-3.0); only key names and defaults are used.
 */

/** Longest `inherits` chain followed from one user preset. */
export const MAX_INSTANCE_CHAIN = 16;
/** Longest preset name taken as an instance id (it also goes into `secret_ref`). */
export const MAX_INSTANCE_NAME = 255;
/** Longest credential kept; a longer one is dropped with a warning. */
export const MAX_CREDENTIAL = 4096;

/**
 * Orca `host_type` -> profile-api HostType, for the values both sides know. Orca's keys:
 * src/libslic3r/PrintConfig.cpp:197-215 (`s_keys_map_PrintHostType`); the rest have no connector here.
 */
const HOST_MAP: ReadonlyMap<string, (typeof HOST_TYPES)[number]> = new Map([
  ['prusalink', 'prusalink'],
  ['octoprint', 'octoprint'],
  ['moonraker', 'moonraker'],
  ['duet', 'duet'],
]);

export interface OrcaInstances {
  instances: InstanceImport[];
  diagnostics: Diagnostic[];
}

type Settings = Record<string, unknown>;

/**
 * Reads every `machine` user preset into an instance; the credential is returned beside the entity. `model` and the
 * toolhead nozzle are the ids `splitOrcaPrinters(tree)` gives the nearest vendor machine preset, so an instance only
 * names entities the same import produces.
 */
export function readOrcaInstances(presets: readonly OrcaUserPreset[], tree: OrcaTree): OrcaInstances {
  const diagnostics: Diagnostic[] = [];
  // vendor preset name -> the model and nozzle ids split gives it; an unsplit preset is its own model, no nozzle
  const placed = new Map<string, { model: string; nozzle?: string }>();
  for (const e of splitOrcaPrinters(tree).entities) {
    if (!('technology' in e)) continue;
    if (e.nozzles) for (const n of e.nozzles) placed.set(n, { model: e.id, nozzle: n });
    else placed.set(e.id, { model: e.id });
  }
  const vendor = new Map<string, OrcaTree['presets'][number]>();
  for (const p of tree.presets) if (p.type === 'machine') vendor.set(`${p.vendor}\0${p.name}`, p);
  const user = new Map<string, OrcaUserPreset>();
  for (const u of presets) if (u.type === 'machine') user.set(`${u.user_id}\0${u.name}`, u);

  const instances: InstanceImport[] = [];
  const ids = new Set<string>();
  for (const u of presets) {
    if (u.type !== 'machine') continue;
    const diag = (severity: Diagnostic['severity'], code: Diagnostic['code'], message: string) =>
      diagnostics.push({ severity, code, file: u.file, message });
    if (u.name.length > MAX_INSTANCE_NAME) {
      diag('error', 'malformed-line', `preset name is over ${MAX_INSTANCE_NAME} characters; not imported`);
      continue;
    }
    // Orca keeps `user/default/` (signed out) beside `user/<cloud id>/`, so one name can come twice; the store keys by id.
    const idKey = u.name.normalize('NFC').toLowerCase();
    if (ids.has(idKey)) {
      diag('warning', 'malformed-line', `another user folder already has a printer named "${u.name}"; not imported`);
      continue;
    }
    ids.add(idKey);
    // Own keys first, then each parent; the vendor preset is already flattened and ends the chain.
    const chain: Settings[] = [u.settings];
    let parent: string | undefined;
    const seen = new Set([u.name]);
    for (let p = u.parent; p;) {
      if (chain.length >= MAX_INSTANCE_CHAIN) {
        diag('warning', 'cycle', `inherits chain is longer than ${MAX_INSTANCE_CHAIN}; the rest is not read`);
        break;
      }
      if (p.vendor !== undefined) {
        const v = vendor.get(`${p.vendor}\0${p.name}`);
        if (v) {
          chain.push(v.settings);
          parent = v.name;
        }
        break;
      }
      if (seen.has(p.name)) {
        diag('warning', 'cycle', 'inherits chain loops; the rest is not read');
        break;
      }
      seen.add(p.name);
      const next = user.get(`${u.user_id}\0${p.name}`);
      if (!next) break;
      chain.push(next.settings);
      p = next.parent;
    }
    const get = (k: string): string => {
      for (const s of chain) {
        if (!Object.hasOwn(s, k) || s[k] === null) continue; // "nil" (null) falls through to the parent
        return typeof s[k] === 'string' ? s[k] : ''; // all keys read here are scalar strings in Orca
      }
      return '';
    };

    const at = parent === undefined ? undefined : placed.get(parent);
    if (!at)
      diag(
        'warning',
        'unknown-parent',
        'no imported vendor machine preset above this one; model and toolheads left empty',
      );
    else if (!at.nozzle)
      diag('warning', 'unknown-parent', `vendor preset "${at.model}" is not split into a nozzle; toolheads left empty`);
    const entity: InstanceImport['entity'] = {
      id: u.name,
      model: at?.model ?? '',
      toolheads: at?.nozzle ? [{ slot: 0, nozzle: at.nozzle }] : [],
    };
    const instance: InstanceImport = { entity };
    instances.push(instance);

    const host = get('print_host');
    if (!host) continue; // no print host configured: an instance without a connection, as Orca shows it
    const orcaType = get('host_type') || 'octoprint'; // PrintConfig.cpp:5787 default htOctoPrint
    const hostType = HOST_MAP.get(orcaType);
    if (!hostType) {
      diag(
        'warning',
        'unknown-type',
        `host_type "${orcaType.slice(0, 64)}" has no connector; imported without a connection`,
      );
      continue;
    }
    if (host.length > MAX_CONNECTION_STRING) {
      diag(
        'warning',
        'malformed-line',
        `print_host is over ${MAX_CONNECTION_STRING} characters; imported without a connection`,
      );
      continue;
    }
    entity.connection = {
      host_type: hostType,
      url: host,
      secret_ref: `orca-user/${u.user_id.slice(0, 255)}/${u.name}`,
    };
    // OctoPrint.cpp:586 (`atUserPassword`): `user` authenticates with the password, `key` (the default,
    // PrintConfig.cpp:1292) with the API key.
    // shortcut: printhost_user is not kept (the entity has no user field); add it when a connector needs digest auth.
    const credential =
      get('printhost_authorization_type') === 'user' ? get('printhost_password') : get('printhost_apikey');
    if (credential.length > MAX_CREDENTIAL)
      diag('warning', 'malformed-line', `credential is over ${MAX_CREDENTIAL} characters; not imported`);
    else if (credential) instance.credential = credential;
  }
  return { instances, diagnostics };
}
