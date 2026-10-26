// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  Diagnostic,
  ImportResult,
  Nozzle,
  Override,
  PrinterModel,
  Settings,
  SettingValue,
} from '@vsslicer/profile-api';
import { isDeepStrictEqual } from 'node:util';
import type { OrcaPreset, OrcaTree } from '../tree/read-tree.ts';

/** `nozzle.id == '<id>'`, quoted for the condition lexer. */
const nozzleIs = (id: string) => `nozzle.id == '${id.replace(/[\\']/g, (c) => `\\${c}`)}'`;

const first = (v: unknown): unknown => (Array.isArray(v) ? v[0] : v);

/**
 * `printable_area` (`["0x0", "120x0", ...]`, or one `"0x0,120x0,..."` string as `ConfigOptionPoints::deserialize`
 * reads it, OrcaSlicer@09aa0114:src/libslic3r/Config.hpp:1619-1640) as points; undefined unless every point is two
 * finite numbers.
 */
function bedShape(a: unknown): [number, number][] | undefined {
  const v = typeof a === 'string' ? a.split(',') : a;
  if (!Array.isArray(v) || v.length < 3) return undefined;
  const out: [number, number][] = [];
  for (const p of v) {
    const xy = typeof p === 'string' ? p.split('x').map(Number) : [];
    if (xy.length !== 2 || !xy.every(Number.isFinite)) return undefined;
    out.push(xy as [number, number]);
  }
  return out;
}

/**
 * Splits the machine presets of an Orca or Bambu tree into one `printer_model` per `machine_model` with a
 * `nozzle` entity per preset, the shape of profiles-prusa's `splitVariants`.
 *
 * A machine preset belongs to a model by its `printer_model` key (the model's name) and to a nozzle by
 * `printer_variant` (OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:3881-3885 `diameters_of_selected_printer`,
 * :4504-4514 `find_system_preset_by_model_and_variant`). Each such instantiable preset becomes a `nozzle` under its
 * own name; the model gets the settings every variant shares, an `overrides` block per nozzle (`when: nozzle.id ==
 * ...`) with the rest, and `nozzles` listing them, so `applyOverrides(model, {nozzle: {id}})` gives back each
 * preset's flattened settings. The bed and toolhead count come from the model's first preset. Presets that do not
 * qualify stay one `printer_model` each: no model in the same vendor, no `printer_variant`, or a bed or nozzle
 * count other than the model's. Abstract machines are templates already flattened into their children and are
 * left out; so is a `machine_model` with no preset. `native` keys every entity id to its source preset.
 * Settings keep their Orca keys and native values (Orca names are the unified keys); value conversion is the
 * importer's. Linear in presets x keys; the tree's own limits bound the input.
 */
export function splitOrcaPrinters(tree: OrcaTree): ImportResult {
  const entities: ImportResult['entities'] = [];
  // preset names and settings keys are untrusted: null-prototype maps keep `__proto__` an own key
  const native: Record<string, unknown> = Object.create(null);
  const diagnostics: Diagnostic[] = [];
  const diag = (severity: Diagnostic['severity'], p: OrcaPreset, message: string) =>
    diagnostics.push({
      severity,
      code: 'malformed-line',
      file: p.file,
      message: `${p.name.slice(0, 256)}: ${message}`,
    });

  const models = new Map<string, OrcaPreset>();
  for (const p of tree.presets) if (p.type === 'machine_model') models.set(`${p.vendor}\0${p.name}`, p);
  const groups = new Map<OrcaPreset, { model: PrinterModel; members: { nozzle: Nozzle; settings: Settings }[] }>();

  for (const p of tree.presets) {
    if (p.type !== 'machine' || p.abstract) continue;
    const s = p.settings as Settings; // JSON values; readOrcaTree only maps "nil" to null
    const shape = bedShape(s['printable_area']);
    const count = Array.isArray(s['nozzle_diameter']) ? s['nozzle_diameter'].length : 1;
    if (!shape) {
      diag('warning', p, 'no usable printable_area; not imported');
      continue;
    }
    const printer: PrinterModel = {
      id: p.name,
      vendor: p.vendor,
      name: p.name,
      technology: 'fff',
      bed: { shape, max_height: Number(first(s['printable_height'])) || 0 },
      // Orca has no kinematics setting
      toolheads: { count, kinematics: 'unspecified' },
      settings: s,
    };
    native[p.name] = p;
    const modelName = first(s['printer_model']);
    const mp = typeof modelName === 'string' ? models.get(`${p.vendor}\0${modelName}`) : undefined;
    const diameter = Number(first(s['nozzle_diameter']));
    if (!mp || !first(s['printer_variant'])) {
      entities.push(printer);
      continue;
    }
    if (!(diameter > 0)) {
      diag('warning', p, 'no nozzle diameter; not split');
      entities.push(printer);
      continue;
    }
    let g = groups.get(mp);
    if (!g) {
      const model: PrinterModel = { ...printer, id: mp.name, name: mp.name };
      const family = first(mp.settings['family']);
      if (typeof family === 'string' && family) model.family = family;
      g = { model, members: [] };
      groups.set(mp, g);
      native[mp.name] = mp;
    }
    if (!isDeepStrictEqual(printer.bed, g.model.bed) || printer.toolheads.count !== g.model.toolheads.count) {
      diag('info', p, 'bed or nozzle count differ from its model; not split');
      entities.push(printer);
      continue;
    }
    // shortcut: a multi-extruder preset becomes one nozzle from extruder 0; per-slot nozzles wait for printer_instance
    const nozzle: Nozzle = { id: p.name, diameter };
    g.members.push({ nozzle, settings: s });
    entities.push(nozzle);
  }

  for (const { model, members } of groups.values()) {
    const base = members[0]!.settings;
    const common: Settings = Object.create(null);
    for (const k of Object.keys(base))
      if (members.every(({ settings }) => Object.hasOwn(settings, k) && isDeepStrictEqual(settings[k], base[k])))
        common[k] = base[k] as SettingValue;
    const overrides: Override[] = [];
    for (const { nozzle, settings } of members) {
      // null prototype too: profile-api's merge reads `rest[k]` without an own-key check
      const rest: Settings = Object.create(null);
      for (const k of Object.keys(settings)) if (!Object.hasOwn(common, k)) rest[k] = settings[k] as SettingValue;
      if (Object.keys(rest).length) overrides.push({ when: nozzleIs(nozzle.id), settings: rest });
    }
    model.settings = common;
    if (overrides.length) model.overrides = overrides;
    model.nozzles = members.map(({ nozzle }) => nozzle.id);
    entities.push(model);
  }
  for (const mp of models.values())
    if (!groups.has(mp)) diag('info', mp, 'machine_model with no splittable machine preset; not imported');
  return { entities, native, diagnostics };
}
