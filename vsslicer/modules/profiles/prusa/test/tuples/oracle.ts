// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-42: the tuples and their hand-checked expectations, the oracle PRF-21 chose for PrusaSlicer
// (vsslicer/fixtures/profile-research/oracle.md): ordered multi-parent `inherits`, the last-listed parent wins, the child
// beats every parent, `renamed_from` is never inherited (docs/research/profiles.md:31-37). Upstream loop:
// PrusaSlicer@b028299:src/libslic3r/PresetBundle.cpp:1413-1422; SuperSlicer@1f3d287:src/libslic3r/PresetBundle.cpp:1290-1296.

export type Kind = 'printer' | 'print' | 'filament';
/** Native `key = value` the tuple resolves to, and the section that sets it last (the layer that wins) with its line. */
export type Check = [kind: Kind, key: string, value: string, section: string, line: number];
/** A unified (profile-api) setting value after `applyOverrides`. */
export type UnifiedCheck = [kind: Kind, key: string, value: unknown];
export interface Tuple {
  printer: string;
  print: string;
  filament: string;
  checks: readonly Check[];
  unified?: readonly UnifiedCheck[];
}

/**
 * `fixtures/PrusaResearch-cut.ini`, cut verbatim from PrusaSlicer@b028299:resources/profiles/PrusaResearch.ini. Each
 * printer is paired with its `default_print_profile` and a filament of its family. Lines are those of the upstream file.
 * Per preset the checks hold the keys whose value changes when the first-listed parent wins instead (none for single-
 * parent chains), one own key and one inherited from deep in the chain.
 */
export const PRUSA: readonly Tuple[] = [
  {
    printer: 'Original Prusa MK4S 0.4 nozzle',
    print: '0.20mm SPEED @MK4S 0.4',
    filament: 'Prusament PLA @MK4S',
    checks: [
      ['printer', 'nozzle_high_flow', '0', '*MK4S_LFNOZZLE*', 41138],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'overhang_speed_2', '50', '0.20mm SPEED @MK4S 0.4', 5278],
      ['print', 'travel_short_distance_acceleration', '250', '*MK4IS_common*', 4020],
      ['filament', 'min_fan_speed', '70', '*PLAPG4S*', 8716],
      ['filament', 'fan_below_layer_time', '17', '*PLAPG4S*', 8719],
      ['filament', 'filament_soluble', '0', '*common*', 8510],
    ],
  },
  {
    printer: 'Original Prusa MK4S 0.6 nozzle',
    print: '0.25mm SPEED @MK4S 0.6',
    filament: 'Prusament PLA @MK4S 0.6',
    checks: [
      ['printer', 'nozzle_high_flow', '0', '*MK4S_LFNOZZLE*', 41138],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'overhang_speed_2', '40', '0.25mm SPEED @MK4S 0.6', 5407],
      ['print', 'travel_short_distance_acceleration', '250', '*MK4IS_common*', 4020],
      ['filament', 'min_fan_speed', '70', '*PLA06PG4S*', 8731],
      ['filament', 'fan_below_layer_time', '22', '*PLA06PG4S*', 8732],
      ['filament', 'filament_soluble', '0', '*common*', 8510],
    ],
  },
  {
    printer: 'Original Prusa MK4S HF0.4 nozzle',
    print: '0.20mm SPEED @MK4S HF0.4',
    filament: 'Prusament PLA @HF0.4',
    checks: [
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'overhang_speed_2', '50', '0.20mm SPEED @MK4S HF0.4', 5283],
      ['print', 'travel_short_distance_acceleration', '250', '*MK4IS_common*', 4020],
      ['filament', 'filament_infill_max_crossing_speed', '200', '*PLAHF*', 8674],
      ['filament', 'slowdown_below_layer_time', '8', '*PLAPG*', 8549],
      ['filament', 'first_layer_temperature', '230', 'Prusament PLA @HF0.4', 36391],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa MK4S 0.25 nozzle',
    print: '0.12mm STRUCTURAL @MK4S 0.25',
    filament: 'Prusament PETG @MK4S',
    checks: [
      ['printer', 'nozzle_high_flow', '0', '*MK4S_LFNOZZLE*', 41138],
      ['printer', 'nozzle_diameter', '0.25', 'Original Prusa MK4S 0.25 nozzle', 41169],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'travel_short_distance_acceleration', '250', '*MK4IS_common*', 4020],
      ['filament', 'min_fan_speed', '20', '*PETPG4S*', 8900],
      ['filament', 'max_fan_speed', '40', '*PETPG4S*', 8901],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa MK4 0.4 nozzle',
    print: '0.20mm QUALITY @MK4 0.4',
    filament: 'Prusament PLA @PG',
    checks: [
      ['printer', 'max_layer_height', '0.30', 'Original Prusa MK4 0.4 nozzle', 40886],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'single_extruder_multi_material_priming', '0', '*MK4*', 501],
      ['print', 'travel_speed', '200', '*MK4*', 502],
      ['print', 'perimeter_speed', '45', '0.20mm QUALITY @MK4 0.4', 3419],
      ['print', 'top_solid_layers', '5', '*0.20mm*', 921],
      ['filament', 'slowdown_below_layer_time', '8', '*PLAPG*', 8549],
      ['filament', 'full_fan_speed_layer', '3', '*PLAPG*', 8551],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa MK4 Input Shaper 0.4 nozzle',
    print: '0.20mm SPEED @MK4IS 0.4',
    filament: 'Prusament PLA @PGIS',
    checks: [
      ['printer', 'max_layer_height', '0.30', 'Original Prusa MK4 Input Shaper 0.4 nozzle', 40946],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'top_solid_infill_acceleration', '1500', '0.20mm SPEED @MK4IS 0.4', 4299],
      ['print', 'travel_short_distance_acceleration', '250', '*MK4IS_common*', 4020],
      ['filament', 'full_fan_speed_layer', '3', '*PLAPG*', 8551],
      ['filament', 'filament_loading_speed', '10', '*PLAPG*', 8563],
      ['filament', 'first_layer_temperature', '230', 'Prusament PLA @PGIS', 36444],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa XL 0.4 nozzle',
    print: '0.20mm QUALITY @XL 0.4',
    filament: 'Prusament PETG @PG',
    checks: [
      ['printer', 'max_layer_height', '0.30', 'Original Prusa XL 0.4 nozzle', 40261],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'single_extruder_multi_material_priming', '0', '*XL*', 471],
      ['print', 'travel_speed', '400', '*XL*', 472],
      ['print', 'perimeter_speed', '65', '0.20mm QUALITY @XL 0.4', 2405],
      ['print', 'top_solid_layers', '5', '*0.20mm*', 921],
      ['filament', 'filament_max_volumetric_speed', '12', '*PETPG*', 8848],
      ['filament', 'filament_retract_length', '0.8', '*PETPG*', 8851],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa XL Input Shaper 0.4 nozzle',
    print: '0.20mm SPEED @XLIS 0.4',
    filament: 'Prusament PLA @XLIS',
    checks: [
      ['printer', 'max_layer_height', '0.30', 'Original Prusa XL Input Shaper 0.4 nozzle', 40494],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'top_solid_infill_acceleration', '1500', '0.20mm SPEED @XLIS 0.4', 6996],
      ['print', 'travel_short_distance_acceleration', '250', '*XLIS_common*', 6739],
      ['filament', 'full_fan_speed_layer', '3', '*PLAPG*', 8551],
      ['filament', 'filament_loading_speed', '10', '*PLAPG*', 8563],
      ['filament', 'first_layer_temperature', '230', 'Prusament PLA @XLIS', 36466],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Prusa CORE One 0.4 nozzle',
    print: '0.20mm SPEED @COREONE 0.4',
    filament: 'Prusament PLA @COREONE',
    checks: [
      ['printer', 'nozzle_high_flow', '0', 'Prusa CORE One 0.4 nozzle', 41425],
      ['printer', 'extruder_clearance_height', '33', 'Prusa CORE One HF0.4 nozzle', 41353],
      ['print', 'infill_acceleration', '7000', '*C1_SPEED*', 5512],
      ['print', 'solid_infill_acceleration', '6000', '*C1_SPEED*', 5513],
      ['print', 'overhang_speed_2', '50', '0.20mm SPEED @COREONE 0.4', 5671],
      ['print', 'single_extruder_multi_material_priming', '0', '*MK4IS_common*', 4019],
      ['filament', 'min_fan_speed', '85', '*PLAPGC1*', 9958],
      ['filament', 'fan_below_layer_time', '40', '*PLAPGC1*', 9959],
      ['filament', 'filament_soluble', '0', '*common*', 8510],
    ],
  },
  {
    printer: 'Prusa CORE One HF0.4 nozzle',
    print: '0.20mm BALANCED @COREONE HF0.4',
    filament: 'Prusament PLA @COREONE HF0.4',
    checks: [
      ['printer', 'nozzle_diameter', '0.4', 'Prusa CORE One HF0.4 nozzle', 41286],
      ['print', 'infill_acceleration', '5000', '*C1_BALANCED*', 5530],
      ['print', 'solid_infill_acceleration', '5000', '*C1_BALANCED*', 5531],
      ['print', 'top_solid_infill_speed', '100', '0.20mm BALANCED @COREONE HF0.4', 5697],
      ['print', 'single_extruder_multi_material_priming', '0', '*MK4IS_common*', 4019],
      ['filament', 'min_fan_speed', '85', '*PLAHFC1*', 9979],
      ['filament', 'fan_below_layer_time', '40', '*PLAHFC1*', 9980],
      ['filament', 'filament_soluble', '0', '*common*', 8510],
    ],
  },
  {
    printer: 'Prusa CORE One 0.6 nozzle',
    print: '0.25mm SPEED @COREONE 0.6',
    filament: 'Prusament PETG @COREONE',
    checks: [
      ['printer', 'nozzle_high_flow', '0', 'Prusa CORE One 0.6 nozzle', 41439],
      ['printer', 'extruder_clearance_height', '33', 'Prusa CORE One HF0.4 nozzle', 41353],
      ['print', 'infill_acceleration', '7000', '*C1_SPEED*', 5512],
      ['print', 'solid_infill_acceleration', '6000', '*C1_SPEED*', 5513],
      ['print', 'overhang_speed_2', '30', '0.25mm SPEED @COREONE 0.6', 5920],
      ['print', 'single_extruder_multi_material_priming', '0', '*MK4IS_common*', 4019],
      ['filament', 'max_fan_speed', '60', '*PETPGC1*', 10008],
      ['filament', 'bridge_fan_speed', '60', '*PETPGC1*', 10009],
      ['filament', 'bed_temperature', '85', 'Prusament PETG @COREONE', 27260],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa MK3.9S 0.4 nozzle',
    print: '0.20mm SPEED @MK4S 0.4',
    filament: 'Prusament PLA @MK4S',
    checks: [
      ['printer', 'nozzle_high_flow', '0', '*MK4S_LFNOZZLE*', 41138],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'overhang_speed_2', '50', '0.20mm SPEED @MK4S 0.4', 5278],
      ['print', 'travel_short_distance_acceleration', '250', '*MK4IS_common*', 4020],
      ['filament', 'min_fan_speed', '70', '*PLAPG4S*', 8716],
      ['filament', 'fan_below_layer_time', '17', '*PLAPG4S*', 8719],
      ['filament', 'filament_soluble', '0', '*common*', 8510],
    ],
  },
  {
    printer: 'Original Prusa MK3.9 0.4 nozzle',
    print: '0.20mm SPEED @MK4IS 0.4',
    filament: 'Generic PLA @PG',
    checks: [
      ['printer', 'max_layer_height', '0.30', 'Original Prusa MK3.9 0.4 nozzle', 41678],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'top_solid_infill_acceleration', '1500', '0.20mm SPEED @MK4IS 0.4', 4299],
      ['print', 'travel_short_distance_acceleration', '250', '*MK4IS_common*', 4020],
      ['filament', 'slowdown_below_layer_time', '8', '*PLAPG*', 8549],
      ['filament', 'full_fan_speed_layer', '3', '*PLAPG*', 8551],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa i3 MK3S & MK3S+',
    print: '0.15mm QUALITY @MK3',
    filament: 'Prusament PLA',
    checks: [
      ['printer', 'extruder_clearance_radius', '45', '*common*', 39296],
      ['print', 'single_extruder_multi_material_priming', '0', '*MK3*', 464],
      ['print', 'wipe_tower_y', '125', '*MK3*', 467],
      ['print', 'bridge_speed', '25', '0.15mm QUALITY @MK3', 1337],
      ['print', 'support_tree_top_rate', '30%', '*common*', 460],
      ['filament', 'filament_vendor', 'Prusa Polymers', 'Prusament PLA', 36347],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa i3 MK3S & MK3S+ 0.6 nozzle',
    print: '0.30mm QUALITY @0.6 nozzle MK3',
    filament: 'Prusament PLA',
    checks: [
      ['printer', 'extruder_clearance_radius', '45', '*common*', 39296],
      ['print', 'fill_pattern', 'gyroid', '*MK306*', 531],
      ['print', 'support_tree_tip_diameter', '1.2', '*MK306*', 533],
      ['print', 'external_perimeter_speed', '35', '0.30mm QUALITY @0.6 nozzle MK3', 1556],
      ['print', 'support_tree_top_rate', '30%', '*common*', 460],
      ['filament', 'filament_vendor', 'Prusa Polymers', 'Prusament PLA', 36347],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
  {
    printer: 'Original Prusa MINI & MINI+',
    print: '0.15mm QUALITY @MINI',
    filament: 'Prusament PETG @MINI',
    checks: [
      ['printer', 'printer_technology', 'FFF', 'Original Prusa MINI & MINI+', 39972],
      ['printer', 'z_offset', '0', '*common*', 39289],
      ['print', 'travel_speed', '150', '*MINI*', 537],
      ['print', 'wipe_tower', '0', '*MINI*', 538],
      ['print', 'perimeter_speed', '40', '0.15mm QUALITY @MINI', 1738],
      ['print', 'support_tree_top_rate', '30%', '*common*', 460],
      ['filament', 'full_fan_speed_layer', '0', '*PETMINI*', 9113],
      ['filament', 'filament_retract_length', 'nil', '*PETMINI*', 9114],
      ['filament', 'bed_temperature', '85', 'Prusament PETG @MINI', 38634],
      ['filament', 'slowdown_below_layer_time', '15', '*common*', 8512],
    ],
  },
  {
    printer: 'Original Prusa i3 MK2.5S',
    print: '0.15mm OPTIMAL',
    filament: 'Prusament PLA',
    checks: [
      ['printer', 'extruder_clearance_radius', '45', '*common*', 39296],
      ['print', 'top_infill_extrusion_width', '0.45', '0.15mm OPTIMAL', 1025],
      ['print', 'support_tree_top_rate', '30%', '*common*', 460],
      ['filament', 'filament_vendor', 'Prusa Polymers', 'Prusament PLA', 36347],
      ['filament', 'min_print_speed', '15', '*common*', 8511],
    ],
  },
];

/**
 * `fixtures/superslicer.ini`, written for this repository in SuperSlicer's dialect (the SuperSlicer@1f3d287 clone ships
 * no vendor bundle). Lines are those of the fixture; values computed by hand from it.
 */
export const SUPERSLICER: readonly Tuple[] = [
  {
    printer: 'Tuple Test 250 0.4 nozzle',
    print: '0.20mm Normal @SST',
    filament: 'Generic PLA @SST',
    checks: [
      ['printer', 'retract_length', '0.5', '*direct_drive*', 34],
      ['printer', 'retract_speed', '45', '*direct_drive*', 35],
      ['printer', 'retract_lift', '0.4', '*fast_klipper*', 28],
      ['printer', 'machine_max_acceleration_x', '8000', '*direct_drive*', 36],
      ['printer', 'z_step', '0.0025', '*fast_klipper*', 31],
      ['printer', 'max_print_height', '250', '*common*', 17],
      ['print', 'perimeter_speed', '120', '*speedy*', 84],
      ['print', 'fill_pattern', 'grid', '*speedy*', 87],
      ['print', 'external_perimeter_speed', '25', '*quality*', 92],
      ['print', 'gap_fill_last', '1', '*quality*', 94],
      ['print', 'perimeter_round_corners', '1', '*speedy*', 88],
      ['print', 'top_solid_layers', '5', '*0.20mm*', 80],
      ['print', 'bridge_type', 'nozzle', '0.20mm Normal @SST', 99],
      ['filament', 'temperature', '205', '*PLA*', 129],
      ['filament', 'filament_max_volumetric_speed', '18', '*PLA*', 130],
      ['filament', 'top_fan_speed', '100', '*PLA*', 131],
      ['filament', 'external_perimeter_fan_speed', '40', '*SST_hot*', 147],
      ['filament', 'filament_max_speed', '300', '*SST_hot*', 148],
      ['filament', 'first_layer_temperature', '215', '*common*', 117],
    ],
    unified: [
      ['printer', 'retraction_length', 0.5],
      ['printer', 'retraction_speed', 45],
      ['printer', 'z_hop', 0.4],
      ['printer', 'nozzle_diameter', 0.4],
      ['print', 'inner_wall_speed', 120],
      ['print', 'sparse_infill_pattern', 'grid'],
      ['filament', 'nozzle_temperature', 205],
    ],
  },
  {
    printer: 'Tuple Test 250 0.6 nozzle',
    print: '0.30mm Draft @SST 0.6',
    filament: 'Generic PETG @SST',
    checks: [
      ['printer', 'nozzle_diameter', '0.6', 'Tuple Test 250 0.6 nozzle', 53],
      ['printer', 'retract_length', '0.7', 'Tuple Test 250 0.6 nozzle', 54],
      ['printer', 'retract_speed', '45', '*direct_drive*', 35],
      ['printer', 'z_step', '0.0025', '*fast_klipper*', 31],
      ['print', 'perimeter_speed', '45', '*quality*', 91],
      ['print', 'fill_pattern', 'rectilinear', '*quality*', 93],
      ['print', 'perimeter_round_corners', '1', '*speedy*', 88],
      ['print', 'top_solid_layers', '4', '*common*', 66],
      ['filament', 'temperature', '225', '*SST_hot*', 145],
      ['filament', 'filament_type', 'PETG', '*PET*', 134],
      ['filament', 'filament_max_volumetric_speed', '24', '*SST_hot*', 146],
      ['filament', 'first_layer_temperature', '235', '*PET*', 136],
      ['filament', 'top_fan_speed', '100', '*PLA*', 131],
      ['filament', 'bed_temperature', '85', 'Generic PETG @SST', 157],
    ],
    unified: [
      ['printer', 'retraction_length', 0.7],
      ['printer', 'nozzle_diameter', 0.6],
      ['print', 'inner_wall_speed', 45],
      ['print', 'sparse_infill_pattern', 'rectilinear'],
      ['filament', 'filament_type', 'PETG'],
      ['filament', 'nozzle_temperature', 225],
    ],
  },
  {
    printer: 'Tuple Bowden 0.4 nozzle',
    print: '0.20mm Normal @SST',
    filament: 'Generic PETG @SST',
    checks: [
      ['printer', 'retract_length', '2.5', '*bowden*', 40],
      ['printer', 'retract_speed', '40', '*bowden*', 41],
      ['printer', 'machine_max_acceleration_x', '8000', '*direct_drive*', 36],
      ['printer', 'retract_lift', '0.2', '*common*', 21],
      ['printer', 'max_print_height', '300', 'Tuple Bowden 0.4 nozzle', 60],
      ['printer', 'renamed_from', '"Tuple Bowden"', 'Tuple Bowden 0.4 nozzle', 59],
      ['print', 'perimeter_speed', '120', '*speedy*', 84],
      ['print', 'fill_pattern', 'grid', '*speedy*', 87],
      ['filament', 'temperature', '225', '*SST_hot*', 145],
      ['filament', 'filament_type', 'PETG', '*PET*', 134],
    ],
    unified: [
      ['printer', 'retraction_length', 2.5],
      ['printer', 'retraction_speed', 40],
      ['printer', 'printable_height', 300],
      ['filament', 'nozzle_temperature', 225],
    ],
  },
  {
    printer: 'Tuple Bowden 0.4 nozzle',
    print: '0.15mm Fine @SST',
    filament: 'Generic PLA @SST',
    checks: [
      ['printer', 'retract_length', '2.5', '*bowden*', 40],
      ['print', 'perimeter_speed', '45', '*quality*', 91],
      ['print', 'fill_pattern', 'rectilinear', '*quality*', 93],
      ['print', 'external_perimeter_speed', '25', '*quality*', 92],
      ['print', 'bridge_type', 'nozzle', '0.20mm Normal @SST', 99],
      ['print', 'layer_height', '0.15', '0.15mm Fine @SST', 109],
      ['print', 'top_solid_layers', '7', '0.15mm Fine @SST', 110],
      ['filament', 'temperature', '205', '*PLA*', 129],
      ['filament', 'filament_max_volumetric_speed', '18', '*PLA*', 130],
    ],
    unified: [
      ['print', 'layer_height', 0.15],
      ['print', 'inner_wall_speed', 45],
      ['print', 'sparse_infill_pattern', 'rectilinear'],
      ['filament', 'filament_max_volumetric_speed', 18],
    ],
  },
];
