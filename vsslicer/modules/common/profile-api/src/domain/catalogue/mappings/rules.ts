// SPDX-License-Identifier: AGPL-3.0-or-later
// The 56 keys of docs/research/profiles.md section 6 (unified = Orca's key names, D9). Native key names come from the
// catalogue; a rule adds the value kind and what the catalogue cannot hold: enum tables, percent handling, custom shapes.
import type { Conversion, Dialect } from '../entry.ts';
import type { Kind } from './values.ts';

export type MappedDialect = Extract<Dialect, 'orca' | 'bambu' | 'prusa' | 'prusa3' | 'cura'>;
type Family = 'orca' | 'prusa' | 'cura';
export const familyOf = (d: MappedDialect): Family => (d === 'bambu' ? 'orca' : d === 'prusa3' ? 'prusa' : d);

export interface Rule {
  kind: Kind;
  /** Dialect families (orca covers bambu, prusa covers prusa3) with no equivalent key. */
  none?: Family[];
  /** Conversion per family, native -> unified. */
  conv?: { [F in Family]?: Conversion };
  /** `float_or_percent`: the unified key a `%` is relative to, and the families that can keep it relative. */
  of?: string;
  relative?: Family[];
  /** Notes beyond the catalogue's `lossy` text. */
  notes?: { [F in Family]?: string };
  custom?: 'plates' | 'ironing' | 'bed' | 'extruder_offset' | 'chamber' | 'single_list';
}

const pair = (map: { [native: string]: string }, reverse?: { [unified: string]: string }): Conversion => ({
  kind: 'enum_map',
  map,
  ...(reverse ? { reverse } : {}),
});
const same = (...vals: string[]) => Object.fromEntries(vals.map((v) => [v, v]));

// Prusa 2.9 PrintConfig.cpp (PrusaSlicer-2.9) enum maps against Orca@09aa0114 enum values.
const INFILL_PRUSA = pair({
  ...same(
    'rectilinear',
    'alignedrectilinear',
    'grid',
    'triangles',
    'cubic',
    'concentric',
    'honeycomb',
    '3dhoneycomb',
    'gyroid',
    'hilbertcurve',
    'archimedeanchords',
    'octagramspiral',
    'adaptivecubic',
    'supportcubic',
    'lightning',
    'zigzag',
    'line',
  ),
});
const INFILL_CURA = pair({
  lines: 'rectilinear',
  grid: 'grid',
  triangles: 'triangles',
  trihexagon: 'tri-hexagon',
  cubic: 'cubic',
  cubicsubdiv: 'adaptivecubic',
  quarter_cubic: 'quartercubic',
  concentric: 'concentric',
  zigzag: 'zigzag',
  gyroid: 'gyroid',
  lightning: 'lightning',
  honeycomb: 'honeycomb',
});
const TOP_PRUSA = pair({
  ...same(
    'rectilinear',
    'monotonic',
    'alignedrectilinear',
    'concentric',
    'hilbertcurve',
    'archimedeanchords',
    'octagramspiral',
  ),
  monotoniclines: 'monotonicline',
});
const TOP_CURA = pair(
  { lines: 'monotonicline', zigzag: 'rectilinear', concentric: 'concentric' },
  {
    monotonicline: 'lines',
    monotonic: 'lines',
    alignedrectilinear: 'lines',
    rectilinear: 'zigzag',
    concentric: 'concentric',
  },
);
const STYLE_PRUSA = pair(same('grid', 'snug', 'organic'), {
  default: 'grid',
  grid: 'grid',
  snug: 'snug',
  organic: 'organic',
  tree_slim: 'organic',
  tree_strong: 'organic',
  tree_hybrid: 'organic',
});
const SEAM_PRUSA = pair(
  { random: 'random', nearest: 'nearest', aligned: 'aligned', rear: 'back' },
  { random: 'random', nearest: 'nearest', aligned: 'aligned', aligned_back: 'aligned', back: 'rear' },
);
const SEAM_CURA = pair(
  { back: 'back', shortest: 'nearest', random: 'random', sharpest_corner: 'aligned' },
  { back: 'back', aligned_back: 'back', nearest: 'shortest', random: 'random', aligned: 'sharpest_corner' },
);
const FLAVOR_PRUSA = pair(
  {
    marlin: 'marlin',
    reprap: 'marlin',
    reprapfirmware: 'reprapfirmware',
    repetier: 'repetier',
    marlin2: 'marlin2',
    klipper: 'klipper',
  },
  { marlin: 'marlin', reprapfirmware: 'reprapfirmware', repetier: 'repetier', marlin2: 'marlin2', klipper: 'klipper' },
);
const FLAVOR_CURA = pair(
  {
    'RepRap (Marlin/Sprinter)': 'marlin',
    'RepRap (Volumetric)': 'marlin',
    'RepRap (RepRap)': 'reprapfirmware',
    Repetier: 'repetier',
  },
  {
    marlin: 'RepRap (Marlin/Sprinter)',
    marlin2: 'RepRap (Marlin/Sprinter)',
    klipper: 'RepRap (Marlin/Sprinter)',
    reprapfirmware: 'RepRap (RepRap)',
    repetier: 'Repetier',
  },
);

const NO_CURA: Family[] = ['cura'];
const gcodeNote = 'placeholder languages differ (Prusa/Orca [var] and {expr} macros, Cura {setting}); not portable';

export const RULES: { [unifiedKey: string]: Rule } = {
  layer_height: { kind: 'float' },
  initial_layer_print_height: { kind: 'float_or_percent', of: 'layer_height', relative: ['prusa'] },
  wall_loops: { kind: 'int' },
  top_shell_layers: { kind: 'int' },
  bottom_shell_layers: { kind: 'int' },
  sparse_infill_density: { kind: 'percent' },
  sparse_infill_pattern: { kind: 'enum', conv: { prusa: INFILL_PRUSA, cura: INFILL_CURA } },
  top_surface_pattern: { kind: 'enum', conv: { prusa: TOP_PRUSA, cura: TOP_CURA } },
  line_width: { kind: 'float_or_percent', of: 'nozzle_diameter', relative: ['prusa', 'orca'] },
  outer_wall_line_width: { kind: 'float_or_percent', of: 'nozzle_diameter', relative: ['prusa', 'orca'] },
  outer_wall_speed: { kind: 'float_or_percent', of: 'inner_wall_speed', relative: ['prusa'] },
  inner_wall_speed: { kind: 'float' },
  sparse_infill_speed: { kind: 'float' },
  travel_speed: { kind: 'float' },
  // Prusa: "40%" scales the default speeds; the base is unverified, so inner_wall_speed stands in (flagged).
  initial_layer_speed: {
    kind: 'float_or_percent',
    of: 'inner_wall_speed',
    relative: ['prusa'],
    notes: { prusa: "a percentage scales Prusa's default speeds; the base is taken as inner_wall_speed (unverified)" },
  },
  default_acceleration: { kind: 'float' },
  enable_support: { kind: 'bool' },
  // Prusa/Orca: slope from horizontal, 0 = auto. Cura: overhang angle from vertical, 0 = everything.
  support_threshold_angle: { kind: 'int', conv: { cura: { kind: 'scale', factor: -1, offset: 90 } } },
  support_style: {
    kind: 'enum',
    none: NO_CURA,
    conv: { prusa: STYLE_PRUSA },
    // Cura's support_structure (normal/tree) is the unified `support_type`, not this style.
  },
  brim_width: { kind: 'float' },
  skirt_loops: { kind: 'int' },
  raft_layers: { kind: 'int' },
  seam_position: { kind: 'enum', conv: { prusa: SEAM_PRUSA, cura: SEAM_CURA } },
  ironing_type: { kind: 'enum', custom: 'ironing' },
  elefant_foot_compensation: { kind: 'float', conv: { cura: { kind: 'sign_flip' } } },
  nozzle_temperature: { kind: 'int' },
  nozzle_temperature_initial_layer: { kind: 'int' },
  hot_plate_temp: { kind: 'int', custom: 'plates' },
  hot_plate_temp_initial_layer: { kind: 'int', custom: 'plates' },
  chamber_temperature: { kind: 'int', custom: 'chamber' },
  fan_min_speed: { kind: 'float' },
  fan_max_speed: { kind: 'float' },
  // Cura's cool_fan_full_layer is Orca's full_fan_speed_layer (PRF-17), not a count of fan-off layers.
  close_fan_the_first_x_layers: { kind: 'int', none: NO_CURA },
  slow_down_layer_time: { kind: 'float' },
  filament_diameter: { kind: 'float' },
  filament_density: { kind: 'float' },
  filament_flow_ratio: { kind: 'float', conv: { cura: { kind: 'scale', factor: 0.01 } } },
  filament_max_volumetric_speed: { kind: 'float', none: NO_CURA },
  filament_type: { kind: 'string' },
  filament_vendor: { kind: 'string' },
  filament_cost: { kind: 'float', none: NO_CURA },
  retraction_length: { kind: 'float' },
  retraction_speed: { kind: 'float' },
  z_hop: { kind: 'float' },
  nozzle_diameter: { kind: 'float' },
  printable_area: { kind: 'polygon', custom: 'bed' },
  printable_height: { kind: 'float' },
  gcode_flavor: { kind: 'enum', conv: { prusa: FLAVOR_PRUSA, cura: FLAVOR_CURA } },
  machine_start_gcode: { kind: 'text', notes: { prusa: gcodeNote, orca: gcodeNote, cura: gcodeNote } },
  machine_end_gcode: { kind: 'text', notes: { prusa: gcodeNote, orca: gcodeNote, cura: gcodeNote } },
  layer_change_gcode: { kind: 'text', none: NO_CURA, notes: { prusa: gcodeNote, orca: gcodeNote } },
  change_filament_gcode: {
    kind: 'text',
    notes: {
      prusa: gcodeNote,
      orca: gcodeNote,
      cura: `${gcodeNote}; Cura runs a per-extruder start code, not one toolchange macro`,
    },
  },
  extruder_offset: { kind: 'point', custom: 'extruder_offset' },
  machine_max_acceleration_x: { kind: 'list', custom: 'single_list' },
  machine_max_speed_x: { kind: 'list', custom: 'single_list' },
  pressure_advance: { kind: 'float', none: ['prusa', 'cura'] },
};

export const MAPPED_KEYS: readonly string[] = Object.keys(RULES);
