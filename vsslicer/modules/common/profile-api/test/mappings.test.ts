// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import type { SettingValue } from '../src/domain/entities/index.ts';
import { orcaCatalogue } from '../src/domain/catalogue/orca.ts';
import {
  MAPPED_KEYS,
  MappingError,
  nativeKeys,
  nativeToUnified,
  RULES,
  unifiedToNative,
  type MappedDialect,
} from '../src/domain/catalogue/mappings/index.ts';
import { ConversionError } from '../src/domain/catalogue/conversion/index.ts';

const DIALECTS: MappedDialect[] = ['orca', 'bambu', 'prusa', 'prusa3', 'cura'];
const fam = (d: MappedDialect) => (d === 'bambu' ? 'orca' : d === 'prusa3' ? 'prusa' : d);
const rect: SettingValue = [
  [0, 0],
  [220, 0],
  [220, 220],
  [0, 220],
];
const plates = { supertack: 60, cool: 60, textured_cool: 60, engineering: 60, hot: 60, textured: 60 };

// One unified value per key that survives a round trip in every dialect that has the key.
const SAMPLE: { [k: string]: SettingValue } = {
  layer_height: 0.2,
  initial_layer_print_height: 0.3,
  wall_loops: 3,
  top_shell_layers: 4,
  bottom_shell_layers: 4,
  sparse_infill_density: 15,
  sparse_infill_pattern: 'gyroid',
  top_surface_pattern: 'concentric',
  line_width: 0.42,
  outer_wall_line_width: 0.45,
  outer_wall_speed: 40,
  inner_wall_speed: 60,
  sparse_infill_speed: 80,
  travel_speed: 150,
  initial_layer_speed: 30,
  default_acceleration: 2000,
  enable_support: true,
  support_threshold_angle: 30,
  support_style: 'grid',
  brim_width: 5,
  skirt_loops: 2,
  raft_layers: 3,
  seam_position: 'aligned',
  ironing_type: 'topmost',
  elefant_foot_compensation: 0.15,
  nozzle_temperature: 215,
  nozzle_temperature_initial_layer: 220,
  hot_plate_temp: plates,
  hot_plate_temp_initial_layer: plates,
  chamber_temperature: 40,
  fan_min_speed: 35,
  fan_max_speed: 100,
  close_fan_the_first_x_layers: 3,
  slow_down_layer_time: 8,
  filament_diameter: 1.75,
  filament_density: 1.24,
  filament_flow_ratio: 0.98,
  filament_max_volumetric_speed: 12,
  filament_type: 'PLA',
  filament_vendor: 'Acme',
  filament_cost: 25,
  retraction_length: 0.8,
  retraction_speed: 30,
  z_hop: 0.4,
  nozzle_diameter: 0.4,
  printable_area: rect,
  printable_height: 250,
  gcode_flavor: 'marlin',
  machine_start_gcode: 'G28',
  machine_end_gcode: 'M84',
  layer_change_gcode: ';LAYER',
  change_filament_gcode: 'T[next_extruder]',
  extruder_offset: [0, 5],
  machine_max_acceleration_x: [1000, 1000],
  machine_max_speed_x: [500, 500],
  pressure_advance: 0.02,
};

describe('the 56 mapped keys', () => {
  test('are 56, all in the catalogue, and each has a sample', () => {
    expect(MAPPED_KEYS).toHaveLength(56);
    for (const k of MAPPED_KEYS) {
      expect(orcaCatalogue.entries[k], k).toBeDefined();
      expect(SAMPLE[k], k).not.toBeUndefined();
    }
  });
  test("rule conversions equal the catalogue's own where it has one", () => {
    for (const k of MAPPED_KEYS) {
      const c = orcaCatalogue.entries[k]?.native.cura;
      if (c && 'key' in c && c.conversion) expect(RULES[k]?.conv?.cura, k).toEqual(c.conversion);
    }
  });
  for (const k of MAPPED_KEYS) {
    for (const d of DIALECTS) {
      const none = RULES[k]?.none?.includes(fam(d));
      test(`${k} round trips in ${d}${none ? ' (no equivalent)' : ''}`, () => {
        const u = SAMPLE[k] as SettingValue;
        if (none) {
          expect(() => unifiedToNative(d, k, u)).toThrow(MappingError);
          expect(() => nativeToUnified(d, k, {})).toThrow(MappingError);
          return;
        }
        const { native } = unifiedToNative(d, k, u);
        expect(Object.keys(native).sort(), 'native keys').toEqual(expect.arrayContaining(Object.keys(native)));
        for (const nk of Object.keys(native)) expect(nativeKeys(d, k)).toContain(nk);
        expect(nativeToUnified(d, k, native).value).toEqual(u);
      });
    }
  }
});

describe('the notes of the table', () => {
  test('support_angle is 90-x between Prusa/Orca and Cura', () => {
    expect(nativeToUnified('cura', 'support_threshold_angle', { support_angle: 50 }).value).toBe(40);
    expect(unifiedToNative('cura', 'support_threshold_angle', 30).native).toEqual({ support_angle: 60 });
    expect(nativeToUnified('prusa', 'support_threshold_angle', { support_material_threshold: '55' }).value).toBe(55);
    expect(nativeToUnified('cura', 'support_threshold_angle', { support_angle: 50 }).lossy).toMatch(/0 is auto/);
  });
  test('flow_ratio is x100 for Cura', () => {
    expect(unifiedToNative('cura', 'filament_flow_ratio', 0.98).native).toEqual({ material_flow: 98 });
    expect(nativeToUnified('cura', 'filament_flow_ratio', { material_flow: 95 }).value).toBe(0.95);
    expect(nativeToUnified('prusa', 'filament_flow_ratio', { extrusion_multiplier: '0.95' }).value).toBe(0.95);
  });
  test('elephant foot flips sign for Cura and is flagged lossy', () => {
    const r = nativeToUnified('cura', 'elefant_foot_compensation', { xy_offset_layer_0: -0.2 });
    expect(r.value).toBe(0.2);
    expect(r.lossy).toMatch(/exact only when xy_offset is 0/);
    expect(unifiedToNative('cura', 'elefant_foot_compensation', 0.2).native).toEqual({ xy_offset_layer_0: -0.2 });
  });
  test('bed_temp maps the six Orca plate keys; Prusa and Cura hold one', () => {
    const rec = { cool_plate_temp: '35', eng_plate_temp: '70', hot_plate_temp: '60', textured_plate_temp: '65' };
    expect(nativeToUnified('orca', 'hot_plate_temp', rec).value).toEqual({
      cool: 35,
      engineering: 70,
      hot: 60,
      textured: 65,
    });
    expect(nativeKeys('orca', 'hot_plate_temp')).toHaveLength(6);
    expect(nativeKeys('orca', 'hot_plate_temp_initial_layer')).toContain('textured_cool_plate_temp_initial_layer');
    const one = unifiedToNative('prusa', 'hot_plate_temp', { cool: 35, hot: 60 });
    expect(one.native).toEqual({ bed_temperature: 60 });
    expect(one.lossy).toMatch(/hot plate used/);
    expect(unifiedToNative('cura', 'hot_plate_temp_initial_layer', { cool: 35 }).native).toEqual({
      material_bed_temperature_layer_0: 35,
    });
    expect(nativeToUnified('prusa', 'hot_plate_temp', { bed_temperature: 55 }).lossy).toMatch(/every plate/);
    expect(() => unifiedToNative('orca', 'hot_plate_temp', { glass_x: 1 })).toThrow(MappingError);
  });
  test('percent-or-absolute stays relative for Prusa, resolves for Cura', () => {
    expect(nativeToUnified('prusa', 'line_width', { extrusion_width: '120%' }).value).toBe('120%');
    expect(unifiedToNative('prusa', 'line_width', '120%').native).toEqual({ extrusion_width: '120%' });
    const c = unifiedToNative('cura', 'line_width', '120%', { bases: { nozzle_diameter: 0.4 } });
    expect(c.native).toEqual({ line_width: 0.48 });
    expect(c.lossy).toMatch(/no longer relative/);
    expect(() => unifiedToNative('cura', 'line_width', '120%')).toThrow(ConversionError);
    expect(unifiedToNative('orca', 'outer_wall_speed', '50%', { bases: { inner_wall_speed: 60 } }).native).toEqual({
      outer_wall_speed: 30,
    });
    expect(nativeToUnified('prusa', 'initial_layer_speed', { first_layer_speed: '40%' }).lossy).toMatch(/unverified/);
  });
  test('infill density is a percent string for Prusa/Orca, a number for Cura', () => {
    expect(nativeToUnified('prusa', 'sparse_infill_density', { fill_density: '15%' }).value).toBe(15);
    expect(unifiedToNative('orca', 'sparse_infill_density', 15).native).toEqual({ sparse_infill_density: '15%' });
    expect(unifiedToNative('cura', 'sparse_infill_density', 15).native).toEqual({ infill_sparse_density: 15 });
  });
  test('enums map by table; an unmapped value is a typed error', () => {
    expect(nativeToUnified('prusa', 'seam_position', { seam_position: 'rear' }).value).toBe('back');
    expect(nativeToUnified('cura', 'seam_position', { z_seam_type: 'shortest' }).value).toBe('nearest');
    expect(nativeToUnified('prusa', 'top_surface_pattern', { top_fill_pattern: 'monotoniclines' }).value).toBe(
      'monotonicline',
    );
    expect(nativeToUnified('cura', 'gcode_flavor', { machine_gcode_flavor: 'RepRap (Marlin/Sprinter)' }).value).toBe(
      'marlin',
    );
    expect(unifiedToNative('cura', 'gcode_flavor', 'klipper').native).toEqual({
      machine_gcode_flavor: 'RepRap (Marlin/Sprinter)',
    });
    expect(unifiedToNative('prusa', 'support_style', 'tree_slim').native).toEqual({
      support_material_style: 'organic',
    });
    const e = (() => {
      try {
        nativeToUnified('prusa', 'sparse_infill_pattern', { fill_pattern: 'stars' });
      } catch (x) {
        return x as ConversionError;
      }
    })();
    expect(e?.code).toBe('unmapped_enum_value');
    expect(nativeToUnified('prusa', 'gcode_flavor', { gcode_flavor: 'reprap' }).lossy).toMatch(/both map to "marlin"/);
  });
  test('ironing: Prusa bool + type, Cura bool + highest-layer, Orca enum', () => {
    expect(nativeToUnified('prusa', 'ironing_type', { ironing: '0' }).value).toBe('no ironing');
    expect(nativeToUnified('prusa', 'ironing_type', { ironing: '1', ironing_type: 'solid' }).value).toBe('solid');
    expect(unifiedToNative('prusa', 'ironing_type', 'no ironing').native).toEqual({ ironing: false });
    expect(unifiedToNative('cura', 'ironing_type', 'topmost').native).toEqual({
      ironing_enabled: true,
      ironing_only_highest_layer: true,
    });
    expect(unifiedToNative('cura', 'ironing_type', 'solid').lossy).toMatch(/no solid ironing/);
    expect(nativeToUnified('orca', 'ironing_type', { ironing_type: 'no ironing' }).value).toBe('no ironing');
  });
  test('Cura bed: width x depth, machine_center_is_zero, non-rectangles', () => {
    expect(
      nativeToUnified('cura', 'printable_area', {
        machine_width: 200,
        machine_depth: 100,
        machine_center_is_zero: 'True',
      }).value,
    ).toEqual([
      [-100, -50],
      [100, -50],
      [100, 50],
      [-100, 50],
    ]);
    expect(
      unifiedToNative('cura', 'printable_area', [
        [-100, -50],
        [100, -50],
        [100, 50],
        [-100, 50],
      ]).native,
    ).toEqual({ machine_width: 200, machine_depth: 100, machine_center_is_zero: true });
    const tri = unifiedToNative('cura', 'printable_area', [
      [0, 0],
      [100, 0],
      [0, 100],
    ]);
    expect(tri.lossy).toMatch(/bounding rectangle/);
    expect(
      unifiedToNative('cura', 'printable_area', [
        [5, 5],
        [105, 5],
        [105, 55],
        [5, 55],
      ]).lossy,
    ).toMatch(/origin offset/);
    expect(nativeToUnified('prusa', 'printable_area', { bed_shape: '0x0,250x0,250x210,0x210' }).value).toEqual([
      [0, 0],
      [250, 0],
      [250, 210],
      [0, 210],
    ]);
    expect(
      nativeToUnified('orca', 'printable_area', { printable_area: ['0x0', '250x0', '250x210', '0x210'] }).value,
    ).toEqual([
      [0, 0],
      [250, 0],
      [250, 210],
      [0, 210],
    ]);
    expect(unifiedToNative('prusa', 'printable_area', rect).native).toEqual({ bed_shape: '0x0,220x0,220x220,0x220' });
    expect(
      nativeToUnified('cura', 'printable_area', { machine_width: 100, machine_depth: 100, machine_shape: 'elliptic' })
        .lossy,
    ).toMatch(/elliptic/);
  });
  test('Bambu holds chamber_temperatures as a list; Cura machine limits are single', () => {
    expect(unifiedToNative('bambu', 'chamber_temperature', 40).native).toEqual({ chamber_temperatures: [40] });
    expect(nativeToUnified('bambu', 'chamber_temperature', { chamber_temperatures: ['45'] }).value).toBe(45);
    expect(unifiedToNative('orca', 'chamber_temperature', 40).native).toEqual({ chamber_temperature: 40 });
    expect(
      nativeToUnified('prusa', 'machine_max_acceleration_x', { machine_max_acceleration_x: '9000,5000' }).value,
    ).toEqual([9000, 5000]);
    expect(nativeToUnified('orca', 'machine_max_speed_x', { machine_max_speed_x: ['500', '200'] }).value).toEqual([
      500, 200,
    ]);
    expect(nativeKeys('prusa', 'machine_max_speed_x')).toEqual(['machine_max_feedrate_x']);
    expect(unifiedToNative('cura', 'machine_max_acceleration_x', [1000, 500]).native).toEqual({
      machine_max_acceleration_x: 1000,
    });
  });
  test('extruder_offset: "AxB" for Prusa/Orca, x and y keys for Cura', () => {
    expect(nativeToUnified('prusa', 'extruder_offset', { extruder_offset: '0x25' }).value).toEqual([0, 25]);
    expect(unifiedToNative('orca', 'extruder_offset', [0, 25]).native).toEqual({ extruder_offset: '0x25' });
    expect(unifiedToNative('cura', 'extruder_offset', [0, 25]).native).toEqual({
      machine_nozzle_offset_x: 0,
      machine_nozzle_offset_y: 25,
    });
  });
  test('G-code, no-equivalent keys and lossy notes carry the table text', () => {
    expect(
      nativeToUnified('cura', 'machine_start_gcode', { machine_start_gcode: 'G28 {material_bed_temperature}' }).lossy,
    ).toMatch(/not portable/);
    expect(() => nativeToUnified('cura', 'layer_change_gcode', {})).toThrow(/no cura equivalent/);
    expect(() => nativeToUnified('prusa', 'pressure_advance', {})).toThrow(MappingError);
    expect(nativeToUnified('prusa', 'initial_layer_print_height', { first_layer_height: '75%' }).value).toBe('75%');
    expect(nativeToUnified('orca', 'pressure_advance', { pressure_advance: 'nil' }).value).toBeNull();
    expect(() => nativeToUnified('orca', 'not_a_key', {})).toThrow(MappingError);
  });
});

describe('hostile input (rule 25)', () => {
  const code = (f: () => unknown) => {
    try {
      f();
    } catch (e) {
      return (e as { code: string }).code;
    }
  };
  test('strings over 64 characters are rejected', () => {
    expect(code(() => nativeToUnified('prusa', 'layer_height', { layer_height: '0.2'.padEnd(65, '0') }))).toBe(
      'value_too_long',
    );
    expect(code(() => nativeToUnified('prusa', 'filament_type', { filament_type: 'x'.repeat(65) }))).toBe(
      'value_too_long',
    );
    expect(nativeToUnified('prusa', 'filament_type', { filament_type: 'x'.repeat(64) }).value).toBe('x'.repeat(64));
    expect(code(() => nativeToUnified('prusa', 'line_width', { extrusion_width: '1'.repeat(1e6) + '%' }))).toBe(
      'value_too_long',
    );
  });
  test('numbers must be finite and strings numeric, never NaN', () => {
    for (const bad of [NaN, Infinity, -Infinity, '1e999', 'abc', '', ' ', '0x10', 'Infinity', '--1'])
      expect(
        code(() => nativeToUnified('orca', 'layer_height', { layer_height: bad })),
        String(bad),
      ).toBe('not_a_number');
    expect(code(() => unifiedToNative('orca', 'layer_height', NaN))).toBe('not_a_number');
    expect(code(() => unifiedToNative('cura', 'filament_flow_ratio', Infinity))).toBe('not_a_number');
    expect(code(() => nativeToUnified('orca', 'wall_loops', { wall_loops: '2.5' }))).toBe('invalid_value');
    expect(code(() => nativeToUnified('orca', 'enable_support', { enable_support: 'maybe' }))).toBe('invalid_value');
  });
  test('collections are bounded', () => {
    const pts = Array.from({ length: 4097 }, () => '1x1');
    expect(code(() => nativeToUnified('orca', 'printable_area', { printable_area: pts }))).toBe('value_too_long');
    expect(
      code(() => nativeToUnified('orca', 'machine_max_speed_x', { machine_max_speed_x: new Array(17).fill('1') })),
    ).toBe('value_too_long');
    expect(code(() => nativeToUnified('prusa', 'extruder_offset', { extruder_offset: '1x2x3' }))).toBe('invalid_value');
    expect(
      code(() => nativeToUnified('prusa', 'machine_start_gcode', { start_gcode: 'x'.repeat((1 << 20) + 1) })),
    ).toBe('value_too_long');
  });
  test('parsing is linear on adversarial input', () => {
    const t = performance.now();
    const pts = Array.from({ length: 4096 }, () => '1'.repeat(60) + 'x' + '1'.repeat(3));
    nativeToUnified('orca', 'printable_area', { printable_area: pts });
    for (let i = 0; i < 2000; i++) {
      try {
        nativeToUnified('prusa', 'line_width', { extrusion_width: '1'.repeat(63) + '%x' });
      } catch {
        /* rejected */
      }
    }
    expect(performance.now() - t).toBeLessThan(2000);
  });
});
