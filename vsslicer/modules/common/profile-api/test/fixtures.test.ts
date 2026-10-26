// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-5 and PRF-4: hand-written fixtures validate against the entity schemas and keep per-nozzle and per-extruder values.
import { readFileSync } from 'node:fs';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';
import { allSchemas, entitySchemas, type EntityBase, type Material, type PrinterModel } from '../src/index.ts';

const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const s of allSchemas) ajv.addSchema(s);
type Entity = keyof typeof entitySchemas;
const load = <T = EntityBase>(path: string): T =>
  JSON.parse(readFileSync(new URL(`fixtures/${path}`, import.meta.url), 'utf8')) as T;
const errors = (entity: Entity, doc: unknown): string[] => {
  const validate = ajv.compile(entitySchemas[entity]);
  validate(doc);
  return (validate.errors ?? []).map((e) => e.instancePath);
};
const valid = (entity: Entity, path: string) => expect(errors(entity, load(path)), path).toEqual([]);

describe('PRF-5 per-nozzle printer presets, surfaces and materials', () => {
  test('all fixtures validate', () => {
    valid('printer_model', 'nozzle/printer-model-prusa-xl.json');
    valid('nozzle', 'nozzle/nozzle-0.4.json');
    valid('nozzle', 'nozzle/nozzle-0.6.json');
    for (const f of ['cura-glass', 'orca-textured', 'orca-cool']) valid('surface', `nozzle/surface-${f}.json`);
    valid('material', 'nozzle/material-bambu-pla-basic.json');
  });

  test('0.4 and 0.6 are one printer_model with nozzle entities and a nozzle override', () => {
    const model = load<PrinterModel>('nozzle/printer-model-prusa-xl.json');
    expect(model.nozzles).toEqual(['prusa.nozzle.0.4', 'prusa.nozzle.0.6']);
    expect(load<{ diameter: number }>('nozzle/nozzle-0.4.json').diameter).toBe(0.4);
    expect(load<{ diameter: number }>('nozzle/nozzle-0.6.json').diameter).toBe(0.6);
    expect(model.settings?.retract_length).toBe(0.8);
    expect(model.overrides).toEqual([{ when: 'nozzle.diameter == 0.6', settings: { retract_length: 0.7 } }]);
  });

  test('surfaces: Cura buildplate variant keeps its formula, Orca plate temperature keys are kept', () => {
    expect(load<{ settings: object }>('nozzle/surface-cura-glass.json').settings).toMatchObject({
      machine_buildplate_type: 'glass',
      material_bed_temperature: { expr: '=default_material_bed_temperature' },
    });
    expect(load<{ settings: object }>('nozzle/surface-orca-textured.json').settings).toEqual({
      textured_plate_temp: 55,
    });
    expect(load<{ settings: object }>('nozzle/surface-orca-cool.json').settings).toEqual({ cool_plate_temp: 35 });
  });

  test('material carries type, diameter, density, cost, temperatures, flow and all four external ids', () => {
    const m = load<Material>('nozzle/material-bambu-pla-basic.json');
    expect(m).toMatchObject({
      type: 'PLA',
      diameter: 1.75,
      density: 1.26,
      cost: { amount: 15.99, currency: 'USD', per: 'kg' },
    });
    expect(m.settings).toMatchObject({ nozzle_temp: 220, flow_ratio: 0.98, hot_plate_temp: 55 });
    expect(Object.keys(m.external_ids ?? {}).sort()).toEqual([
      'bambu_filament_id',
      'cura_guid',
      'orca_filament_id',
      'prusa_name',
    ]);
    expect(m.external_ids?.cura_guid).toBe('506c9f0d-e3aa-4bd4-b2d2-23e2425b1aa9');
    expect(m.external_ids?.bambu_filament_id).toBe('OFoiVqVM');
  });
});

describe('PRF-4 multi-tool, IDEX and H2C fixtures', () => {
  test('all fixtures validate', () => {
    valid('printer_model', 'multitool/prusa-xl-2t.json');
    valid('printer_instance', 'multitool/prusa-xl-2t-instance.json');
    valid('feeder', 'multitool/feeder-prusa-xl-toolchanger.json');
    valid('printer_model', 'multitool/orca-xplorer-idex.json');
    valid('printer_model', 'multitool/bambu-h2c.json');
  });

  const settings = (path: string) => load<PrinterModel>(path).settings ?? {};

  test('Prusa XL 2T reads back by slot with the INI numbers (nozzle_diameter 0.4,0.4; retract_length 0.8,0.8; extruder_offset 0x0,0x0)', () => {
    const s = settings('multitool/prusa-xl-2t.json');
    expect(s.nozzle_diameter).toEqual({ '0': 0.4, '1': 0.4 });
    expect(s.retract_length).toEqual({ '0': 0.8, '1': 0.8 });
    expect(s.extruder_offset).toEqual({ '0': '0x0', '1': '0x0' });
    expect(load<{ toolheads: unknown }>('multitool/prusa-xl-2t-instance.json').toolheads).toEqual([
      { slot: 0, nozzle: 'prusa.nozzle.0.4' },
      { slot: 1, nozzle: 'prusa.nozzle.0.4' },
    ]);
  });

  test('Orca Xplorer IDEX reads back by slot (colours differ per toolhead)', () => {
    const s = settings('multitool/orca-xplorer-idex.json');
    expect(s.extruder_colour).toEqual({ '0': '#FCE94F', '1': '#729FCF' });
    expect(s.nozzle_diameter).toEqual({ '0': 0.6, '1': 0.6 });
    expect(s.retraction_length).toEqual({ '0': 1.35, '1': 1.35 });
  });

  test('Bambu H2C keeps the five (extruder, variant) rows by index and the per-extruder variant lists', () => {
    const s = settings('multitool/bambu-h2c.json');
    expect(s.nozzle_volume).toEqual({ '0': 130, '1': 133, '2': 133, '3': 145, '4': 148 });
    expect(s.printer_extruder_id).toEqual({ '0': 1, '1': 1, '2': 1, '3': 2, '4': 2 });
    expect(s.hotend_heating_rate).toEqual({ '0': 3.5, '1': 3.5, '2': 3.5, '3': 13.3, '4': 13.3 });
    const variants = s.printer_extruder_variant as Record<string, string>;
    expect(variants['1']).toBe('Direct Drive High Flow');
    expect(variants['3']).toBe('Direct Drive Standard');
    expect((s.extruder_variant_list as Record<string, string>)['0']).toBe(
      'Direct Drive Standard,Direct Drive High Flow,Direct Drive E3D High Flow',
    );
  });

  test('a positional array for a per-extruder key is rejected at /settings/nozzle_diameter', () => {
    expect(errors('printer_model', load('multitool/negative-positional-array.json'))).toContain(
      '/settings/nozzle_diameter',
    );
  });
});
