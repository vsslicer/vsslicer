// SPDX-License-Identifier: AGPL-3.0-or-later
import type { PresetType } from '../tree/read-tree.ts';

/**
 * Decodes the per-extruder-variant arrays of multi-extruder printers (Bambu H2D, H2C) into values keyed by
 * extruder, then by variant, and encodes them back to the original array order.
 *
 * A machine preset lists its variant slots in `printer_extruder_variant` with the 1-based extruder of each slot in
 * `printer_extruder_id`; a variant option holds one value per slot, a machine-limit option two (normal, silent).
 * A slot is found by its (extruder id, variant name) pair (`get_index_for_extruder`,
 * BambuStudio@79df7ae:src/libslic3r/PrintConfig.cpp:8223-8253; lengths `get_parameter_size` :8015-8042).
 * The key sets are the union of BambuStudio@79df7ae:src/libslic3r/PrintConfig.cpp:7619-7770 and
 * OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:10089-10260 (`print_options_with_variant`,
 * `printer_extruder_options`, `printer_options_with_variant_1`, `printer_options_with_variant_2`).
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0; the file carries no per-file notice).
 *
 * Differences from upstream: an array whose length does not match its layout is kept as it is with a warning;
 * upstream pads it with its first value or truncates it, for user presets only (`extend_default_config_length`,
 * BambuStudio@79df7ae:src/libslic3r/Preset.cpp:210-262). Filament presets are not decoded: `filament_extruder_variant`
 * has no extruder id list, so their values are not per extruder.
 */

const PRINT_WITH_VARIANT = [
  'initial_layer_speed',
  'initial_layer_infill_speed',
  'outer_wall_speed',
  'inner_wall_speed',
  'small_perimeter_speed',
  'small_perimeter_threshold',
  'sparse_infill_speed',
  'internal_solid_infill_speed',
  'vertical_shell_speed',
  'top_surface_speed',
  'enable_overhang_speed',
  'overhang_1_4_speed',
  'overhang_2_4_speed',
  'overhang_3_4_speed',
  'overhang_4_4_speed',
  'overhang_totally_speed',
  'slowdown_for_curled_perimeters',
  'enable_height_slowdown',
  'slowdown_start_height',
  'slowdown_start_speed',
  'slowdown_start_acc',
  'slowdown_end_height',
  'slowdown_end_speed',
  'slowdown_end_acc',
  'bridge_speed',
  'internal_bridge_speed',
  'gap_infill_speed',
  'support_speed',
  'support_interface_speed',
  'travel_speed',
  'travel_speed_z',
  'initial_layer_travel_speed',
  'default_acceleration',
  'bridge_acceleration',
  'travel_acceleration',
  'travel_short_distance_acceleration',
  'initial_layer_travel_acceleration',
  'initial_layer_acceleration',
  'outer_wall_acceleration',
  'inner_wall_acceleration',
  'sparse_infill_acceleration',
  'internal_solid_infill_acceleration',
  'top_surface_acceleration',
  'default_jerk',
  'outer_wall_jerk',
  'inner_wall_jerk',
  'infill_jerk',
  'top_surface_jerk',
  'initial_layer_jerk',
  'travel_jerk',
  'initial_layer_travel_jerk',
  'default_junction_deviation',
  'top_solid_infill_flow_ratio',
];

const PRINTER_EXTRUDER = [
  'extruder_type',
  'nozzle_diameter',
  'default_nozzle_volume_type',
  'extruder_printable_area',
  'extruder_bed_exclude_volumes',
  'extruder_printable_height',
  'min_layer_height',
  'max_layer_height',
  'extruder_max_nozzle_count',
];

const PRINTER_WITH_VARIANT_1 = [
  'nozzle_volume',
  'nozzle_type',
  'retraction_length',
  'z_hop',
  'travel_slope',
  'retract_lift_above',
  'retract_lift_below',
  'retract_lift_enforce',
  'z_hop_types',
  'retraction_speed',
  'deretraction_speed',
  'retraction_minimum_travel',
  'retract_when_changing_layer',
  'wipe',
  'wipe_distance',
  'retract_before_wipe',
  'retract_after_wipe',
  'retract_length_toolchange',
  'retract_restart_extra',
  'retract_restart_extra_toolchange',
  'long_retractions_when_cut',
  'retraction_distances_when_cut',
  'hotend_cooling_rate',
  'hotend_heating_rate',
  'nozzle_flush_dataset',
];

/** Machine limits: a normal and a silent-mode value per slot. */
const PRINTER_WITH_VARIANT_2 = [
  'machine_max_acceleration_x',
  'machine_max_acceleration_y',
  'machine_max_acceleration_z',
  'machine_max_acceleration_e',
  'machine_max_acceleration_extruding',
  'machine_max_acceleration_retracting',
  'machine_max_acceleration_travel',
  'machine_max_speed_x',
  'machine_max_speed_y',
  'machine_max_speed_z',
  'machine_max_speed_e',
  'machine_max_jerk_x',
  'machine_max_jerk_y',
  'machine_max_jerk_z',
  'machine_max_jerk_e',
  'machine_max_junction_deviation',
];

interface Layout {
  /** The slot lists; they stay arrays, since they fix the encoded order. */
  id: string;
  variant: string;
  /** Option to values per slot. */
  stride: ReadonlyMap<string, 1 | 2>;
  /** Options with one value per extruder. */
  perExtruder: ReadonlySet<string>;
}

const LAYOUTS: Partial<Record<PresetType, Layout>> = {
  machine: {
    id: 'printer_extruder_id',
    variant: 'printer_extruder_variant',
    stride: new Map([
      ...PRINTER_WITH_VARIANT_1.map((k) => [k, 1] as const),
      ...PRINTER_WITH_VARIANT_2.map((k) => [k, 2] as const),
    ]),
    perExtruder: new Set(PRINTER_EXTRUDER),
  },
  process: {
    id: 'print_extruder_id',
    variant: 'print_extruder_variant',
    stride: new Map(PRINT_WITH_VARIANT.map((k) => [k, 1] as const)),
    perExtruder: new Set(),
  },
};

/** Extruder ids are 1..MAX_EXTRUDERS; the H2D and H2C have 2. */
export const MAX_EXTRUDERS = 16;
/** Slots per preset; the H2C has 5. */
export const MAX_VARIANT_SLOTS = 256;

export interface VariantDiagnostic {
  code: 'variant-layout' | 'variant-length';
  /** The option, or the slot list, the problem is in. */
  key: string;
  message: string;
}

/** One slot: the 0-based extruder as a string key, and the variant name. */
interface Slot {
  extruder: string;
  variant: string;
}

type Slots = { slots: Slot[]; extruders: number } | { error: string } | undefined;

/** Reads the slot lists; undefined when the preset has none. */
function slotsOf(settings: Readonly<Record<string, unknown>>, layout: Layout): Slots {
  const ids = settings[layout.id];
  const names = settings[layout.variant];
  if (ids === undefined && names === undefined) return undefined;
  if (!Array.isArray(ids) || !Array.isArray(names) || ids.length !== names.length)
    return { error: `${layout.id} and ${layout.variant} must be arrays of the same length` };
  if (ids.length === 0 || ids.length > MAX_VARIANT_SLOTS)
    return { error: `${layout.variant} must have 1..${MAX_VARIANT_SLOTS} entries` };
  const slots: Slot[] = [];
  const seen = new Set<string>();
  let extruders = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i] as unknown;
    const variant = names[i] as unknown;
    const n = typeof id === 'string' && /^[0-9]{1,2}$/.test(id) ? Number(id) : id;
    if (!Number.isInteger(n) || (n as number) < 1 || (n as number) > MAX_EXTRUDERS)
      return { error: `${layout.id} entries must be integers in 1..${MAX_EXTRUDERS}` };
    if (typeof variant !== 'string') return { error: `${layout.variant} entries must be strings` };
    const extruder = String((n as number) - 1);
    const pair = `${extruder}\0${variant}`;
    if (seen.has(pair)) return { error: `extruder ${n} lists variant "${variant}" twice` };
    seen.add(pair);
    slots.push({ extruder, variant });
    extruders = Math.max(extruders, n as number);
  }
  return { slots, extruders };
}

/** Extruder keys in first-seen order. */
const extruderKeys = (slots: readonly Slot[]): string[] => [...new Set(slots.map((s) => s.extruder))];

/**
 * Replaces each per-variant array of a machine or process preset with `{extruder: {variant: value}}`
 * (`[normal, silent]` for machine limits), and each per-extruder array with `{extruder: value}`; extruder keys are
 * 0-based. The slot lists themselves stay arrays. Other types, and presets without slot lists, come back unchanged.
 * An array of the wrong length, or a malformed slot list, stays as it is with a warning.
 */
export function decodeVariants(
  type: PresetType,
  settings: Readonly<Record<string, unknown>>,
): { settings: Record<string, unknown>; diagnostics: VariantDiagnostic[] } {
  const layout = LAYOUTS[type];
  const out = { ...settings };
  const diagnostics: VariantDiagnostic[] = [];
  const read = layout && slotsOf(settings, layout);
  if (!layout || !read) return { settings: out, diagnostics };
  if ('error' in read)
    return { settings: out, diagnostics: [{ code: 'variant-layout', key: layout.variant, message: read.error }] };
  const { slots, extruders } = read;
  const keys = extruderKeys(slots);
  for (const [key, value] of Object.entries(settings)) {
    // An empty array is "unset" (single-extruder Bambu presets leave extruder_printable_area empty).
    if (!Array.isArray(value) || value.length === 0) continue;
    const stride = layout.stride.get(key);
    if (stride !== undefined) {
      if (value.length !== slots.length * stride) {
        diagnostics.push(lengthDiagnostic(key, value.length, slots.length * stride));
        continue;
      }
      const at = (i: number): unknown => (stride === 1 ? value[i] : value.slice(i * 2, i * 2 + 2));
      // fromEntries defines own properties, so a variant named __proto__ stays data.
      out[key] = Object.fromEntries(
        keys.map((e) => [
          e,
          Object.fromEntries(slots.flatMap((s, i) => (s.extruder === e ? [[s.variant, at(i)]] : []))),
        ]),
      );
    } else if (layout.perExtruder.has(key)) {
      if (value.length !== extruders) {
        diagnostics.push(lengthDiagnostic(key, value.length, extruders));
        continue;
      }
      out[key] = Object.fromEntries(value.map((v, i) => [String(i), v]));
    }
  }
  return { settings: out, diagnostics };
}

const lengthDiagnostic = (key: string, got: number, want: number): VariantDiagnostic => ({
  code: 'variant-length',
  key,
  message: `${key} has ${got} values where its layout needs ${want}; kept as an array`,
});

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function own(o: Record<string, unknown>, k: string, key: string): unknown {
  if (!Object.hasOwn(o, k)) throw new RangeError(`${key} has no value for ${JSON.stringify(k)}`);
  return o[k];
}

/**
 * The inverse of `decodeVariants`: each keyed value goes back to an array in slot order. Throws a RangeError when a
 * keyed value lacks a slot, or a machine limit is not a `[normal, silent]` pair.
 */
export function encodeVariants(type: PresetType, settings: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const layout = LAYOUTS[type];
  const out = { ...settings };
  const read = layout && slotsOf(settings, layout);
  if (!layout || !read || 'error' in read) return out;
  const { slots, extruders } = read;
  for (const [key, value] of Object.entries(settings)) {
    if (!isObject(value)) continue;
    const stride = layout.stride.get(key);
    if (stride !== undefined) {
      out[key] = slots.flatMap((s) => {
        const perExtruder = own(value, s.extruder, key);
        if (!isObject(perExtruder)) throw new RangeError(`${key}.${s.extruder} must be an object`);
        const v = own(perExtruder, s.variant, key);
        if (stride === 1) return [v];
        if (!Array.isArray(v) || v.length !== 2) throw new RangeError(`${key} values must be [normal, silent] pairs`);
        return v as unknown[];
      });
    } else if (layout.perExtruder.has(key)) {
      out[key] = Array.from({ length: extruders }, (_, i) => own(value, String(i), key));
    }
  }
  return out;
}
