// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ImportedEntity, Nozzle, Override, PrinterModel, Settings } from '@vsslicer/profile-api';
import { isDeepStrictEqual } from 'node:util';
import type { Diag } from './flatten.ts';
import type { PrusaNative } from './import.ts';

export interface Mapped {
  entity: ImportedEntity;
  native: PrusaNative;
}

/** `nozzle.id == '<id>'`, quoted for the condition lexer. */
const nozzleIs = (id: string) => `nozzle.id == '${id.replace(/[\\']/g, (c) => `\\${c}`)}'`;

/**
 * Splits the per-nozzle printer presets of one bundle into their `[printer_model]` plus one `nozzle` each.
 *
 * PrusaSlicer ties a printer preset to a model and a nozzle variant by its `printer_model` and `printer_variant`
 * keys (PrusaSlicer@b028299:src/libslic3r/Preset.cpp:428-433, `find_system_preset_by_model_and_variant` at
 * :1727-1737); the model lists its variants (`variants`, :205-215). A preset with both keys, whose model is in
 * the same file, becomes a `nozzle` entity under its own id (its native form stays under that id). The model
 * gets the settings every variant shares, an `overrides` block per nozzle (`when: nozzle.id == ...`) with the
 * rest, and `nozzles` listing them, so `applyOverrides(model, {nozzle: {id}})` gives back each preset's settings.
 * Presets that do not qualify stay one printer_model each: user presets, no `printer_variant`, or a bed or
 * toolhead count other than the model's (taken from its first preset). Linear in presets x keys.
 */
export function splitVariants(mapped: readonly Mapped[], diag: Diag): Mapped[] {
  const models = new Map<string, PrinterModel>();
  for (const r of mapped) if (r.native.kind === 'printer_model') models.set(r.entity.id, r.entity as PrinterModel);
  const groups = new Map<string, { nozzle: Nozzle; settings: Settings }[]>();
  const out = mapped.map((r): Mapped => {
    if (r.native.kind !== 'printer') return r;
    const p = r.entity as PrinterModel;
    const v = r.native.values;
    const model = p.family === undefined ? undefined : models.get(p.family);
    if (!model || !v['printer_variant']) return r;
    // the MMU models hold single-mode (1 extruder) and multi-material (5) presets of one variant: not nozzle variants
    if (!isDeepStrictEqual(p.bed, model.bed) || !isDeepStrictEqual(p.toolheads, model.toolheads)) {
      diag(
        'info',
        'malformed-line',
        r.native.line,
        `${p.id.slice(0, 256)}: bed or toolheads differ from its model; not split`,
      );
      return r;
    }
    // shortcut: a multi-extruder preset becomes one nozzle from extruder 0; per-slot nozzles wait for printer_instance
    const diameter = Number(v['nozzle_diameter']?.split(',')[0]);
    if (!(diameter > 0)) {
      diag('warning', 'malformed-line', r.native.line, `${p.id.slice(0, 256)}: no nozzle diameter; not split`);
      return r;
    }
    const nozzle: Nozzle = {
      id: p.id,
      diameter,
      flow: v['nozzle_high_flow']?.split(',')[0]?.trim() === '1' ? 'high_flow' : 'standard',
      ...(p.renamed_from ? { renamed_from: p.renamed_from } : {}),
    };
    const g = groups.get(model.id) ?? [];
    g.push({ nozzle, settings: p.settings ?? {} });
    groups.set(model.id, g);
    return { entity: nozzle, native: r.native };
  });
  for (const [id, g] of groups) {
    const first = g[0]!.settings;
    const common: Settings = {};
    for (const k of Object.keys(first)) {
      if (g.every(({ settings }) => Object.hasOwn(settings, k) && isDeepStrictEqual(settings[k], first[k])))
        common[k] = first[k]!;
    }
    const overrides: Override[] = [];
    for (const { nozzle, settings } of g) {
      const rest = Object.fromEntries(Object.entries(settings).filter(([k]) => !Object.hasOwn(common, k)));
      if (Object.keys(rest).length) overrides.push({ when: nozzleIs(nozzle.id), settings: rest });
    }
    const model = models.get(id)!;
    model.settings = common;
    if (overrides.length) model.overrides = overrides;
    model.nozzles = g.map(({ nozzle }) => nozzle.id);
  }
  return out;
}
