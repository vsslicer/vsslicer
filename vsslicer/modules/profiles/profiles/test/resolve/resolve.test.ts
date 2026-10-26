// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-49: resolve over hand-built Bambu, Prusa and Cura shaped tuple fixtures (fixtures/PROVENANCE.md). Every expected
// value below is worked out by hand from the fixture files, not taken from the code.
import type { EntityBase, EntityKind } from '@vsslicer/profile-api';
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { resolveTuple, type EntityReader } from '../../src/application/resolve/resolve.ts';

type Entry = { kind: EntityKind; entity: EntityBase & Record<string, unknown> };
const fixture = (name: string): Entry[] =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8')) as Entry[];

function readerOf(entries: Entry[]): EntityReader & { gets: number } {
  const byKey = new Map(entries.map((e) => [`${e.kind}\0${e.entity.id}`, e.entity]));
  const r = {
    gets: 0,
    async get(kind: EntityKind, id: string) {
      r.gets++;
      return byKey.get(`${kind}\0${id}`) as never;
    },
  };
  return r;
}
const src = (kind: EntityKind, id: string, override?: number) => ({
  kind,
  id,
  ...(override !== undefined && { override }),
});

const H2C = 'Bambu Lab H2C';
const BASIC = 'Bambu PLA Basic @BBL H2C';
const STANDARD = '0.20mm Standard @BBL H2C';

describe('resolve: Bambu H2C 0.4 nozzle + PLA Basic + 0.20 mm Standard', () => {
  test('values and provenance', async () => {
    const r = await resolveTuple(readerOf(fixture('bambu-h2c')), 'my-h2c', [BASIC], STANDARD);
    expect(r.diagnostics).toEqual([]);
    expect(r.unified).toEqual({
      printer: {
        max_height: 325,
        retract_length: 5,
        gcode_flavor: 'marlin',
        nozzle_diameter: 0.4,
        nozzle_volume_type: 'Standard',
        extruder_clearance_height_to_lid: 201,
      },
      materials: [
        {
          filament_type: 'PLA',
          nozzle_temp: 220,
          bed_temp: 55,
          max_volumetric_speed: 25,
          filament_density: 1.24,
          flow_ratio: 0.99,
          filament_vendor: 'Bambu Lab',
        },
      ],
      process: {
        layer_height: 0.2,
        first_layer_height: 0.2,
        infill_density: '15%',
        top_layers: 3,
        wall_loops: 2,
        speed_outer_wall: 200,
        speed_inner_wall: 300,
        speed_travel: 1000,
      },
    });
    const pc = src('process', 'fdm_process_common');
    const ps = src('process', STANDARD);
    expect(r.provenance).toEqual({
      printer: {
        max_height: src('printer_model', 'fdm_bbl_3dp_002_common'),
        retract_length: src('printer_model', 'fdm_machine_common'),
        gcode_flavor: src('printer_model', H2C),
        nozzle_diameter: src('printer_model', H2C, 0),
        nozzle_volume_type: src('printer_model', H2C, 0),
        extruder_clearance_height_to_lid: src('printer_model', H2C, 0),
      },
      materials: [
        {
          filament_type: src('material', 'fdm_filament_common'),
          nozzle_temp: src('material', 'fdm_filament_pla'),
          bed_temp: src('material', 'fdm_filament_pla'),
          max_volumetric_speed: src('material', BASIC),
          filament_density: src('material', 'fdm_filament_pla'),
          flow_ratio: src('material', BASIC),
          filament_vendor: src('material', 'Bambu PLA Basic @base'),
        },
      ],
      process: {
        layer_height: pc,
        first_layer_height: pc,
        infill_density: pc,
        top_layers: pc,
        wall_loops: pc,
        speed_outer_wall: ps,
        speed_inner_wall: ps,
        speed_travel: ps,
      },
    });
  });

  test('the trail follows a changed parent', async () => {
    const entries = fixture('bambu-h2c');
    const pla = entries.find((e) => e.entity.id === 'fdm_filament_pla')!.entity;
    delete pla.settings!['nozzle_temp'];
    pla.settings!['filament_vendor'] = 'Generic';
    const r = await resolveTuple(readerOf(entries), 'my-h2c', [BASIC], STANDARD);
    expect(r.unified.materials[0]!['nozzle_temp']).toBe(200);
    expect(r.provenance.materials[0]!['nozzle_temp']).toEqual(src('material', 'fdm_filament_common'));
    // a key the parent now sets but a nearer one overrides keeps the nearer source
    expect(r.unified.materials[0]!['filament_vendor']).toBe('Bambu Lab');
    expect(r.provenance.materials[0]!['filament_vendor']).toEqual(src('material', 'Bambu PLA Basic @base'));
  });
});

describe('resolve: multi-material on a dual-nozzle instance', () => {
  test('each material resolves against its own toolhead; differing printer keys become per-slot maps', async () => {
    const r = await resolveTuple(
      readerOf(fixture('bambu-h2c')),
      'my-h2c-mixed',
      [BASIC, 'Bambu PLA Matte @BBL H2C'],
      STANDARD,
    );
    expect(r.diagnostics).toEqual([]);
    expect(r.unified.printer).toEqual({
      max_height: 320,
      retract_length: 5,
      gcode_flavor: 'marlin',
      nozzle_diameter: { '0': 0.4, '1': 0.4 },
      nozzle_volume_type: { '0': 'Standard', '1': 'High Flow' },
      extruder_clearance_height_to_lid: { '0': 201, '1': 201 },
    });
    expect(r.provenance.printer).toEqual({
      max_height: src('printer_instance', 'my-h2c-mixed'),
      retract_length: src('printer_model', 'fdm_machine_common'),
      gcode_flavor: src('printer_model', H2C),
      'nozzle_diameter.0': src('printer_model', H2C, 0),
      'nozzle_diameter.1': src('printer_model', H2C, 1),
      'nozzle_volume_type.0': src('printer_model', H2C, 0),
      'nozzle_volume_type.1': src('printer_model', H2C, 1),
      'extruder_clearance_height_to_lid.0': src('printer_model', H2C, 0),
      'extruder_clearance_height_to_lid.1': src('printer_model', H2C, 1),
    });
    // material 0 on the standard nozzle: no high-flow block
    expect(r.unified.materials[0]!['max_volumetric_speed']).toBe(25);
    expect(r.provenance.materials[0]!['max_volumetric_speed']).toEqual(src('material', BASIC));
    // material 1 on the high-flow nozzle
    expect(r.unified.materials[1]).toEqual({
      filament_type: 'PLA',
      nozzle_temp: 220,
      bed_temp: 55,
      max_volumetric_speed: 35,
      filament_density: 1.24,
      flow_ratio: 0.98,
    });
    expect(r.provenance.materials[1]!['max_volumetric_speed']).toEqual(src('material', 'Bambu PLA Matte @BBL H2C', 0));
  });
});

describe('resolve: Prusa MK4S 0.6 + Prusament PLA + 0.20 mm SPEED', () => {
  test('values and provenance, with two parents and an inherited override list', async () => {
    const r = await resolveTuple(
      readerOf(fixture('prusa-mk4s')),
      'my-mk4s',
      ['Prusament PLA'],
      '0.20mm SPEED @MK4S 0.4',
    );
    expect(r.diagnostics).toEqual([]);
    expect(r.unified).toEqual({
      printer: {
        gcode_flavor: 'marlin2',
        retract_length: 0.7,
        max_height: 220,
        tags: ['PRINTER_VENDOR_PRUSA3D', 'PRINTER_MODEL_MK4S'],
        nozzle_diameter: 0.6,
        z_hop: 0.2,
      },
      materials: [
        {
          filament_type: 'PLA',
          nozzle_temp: 215,
          bed_temp: 60,
          filament_vendor: 'Prusa Polymers',
          filament_cost: 27.99,
          filament_density: 1.24,
          max_volumetric_speed: 15.5,
        },
      ],
      process: { layer_height: 0.2, wall_loops: 2, support_angle: 35, speed_first_layer: 30, speed_travel: 340 },
    });
    const mk4is = src('process', '0.20mm SPEED @MK4IS 0.4');
    expect(r.provenance).toEqual({
      printer: {
        gcode_flavor: src('printer_model', '*common*'),
        retract_length: src('printer_model', 'MK4S', 1),
        max_height: src('printer_model', 'MK4S'),
        tags: src('printer_model', 'MK4S'),
        nozzle_diameter: src('printer_model', 'MK4S', 1),
        z_hop: src('printer_instance', 'my-mk4s'),
      },
      materials: [
        {
          filament_type: src('material', '*PLA*'),
          nozzle_temp: src('material', 'Prusament PLA'),
          bed_temp: src('material', '*PLA*'),
          filament_vendor: src('material', 'Prusament PLA'),
          filament_cost: src('material', 'Prusament PLA'),
          filament_density: src('material', 'Prusament PLA'),
          max_volumetric_speed: src('material', 'Prusament PLA', 0),
        },
      ],
      process: {
        layer_height: mk4is,
        wall_loops: mk4is,
        support_angle: src('process', '0.20mm SPEED @MK4S 0.4'),
        speed_first_layer: src('process', '*MK4S_04*', 0),
        speed_travel: src('process', '*MK4S_04*'),
      },
    });
  });
});

describe('resolve: Cura UltiMaker S5 AA 0.4 + BB 0.4, PLA + PVA, Fine', () => {
  test('values and provenance, a quality override on printer.model, nozzle.id and material.base', async () => {
    const r = await resolveTuple(readerOf(fixture('cura-s5')), 'my-s5', ['generic_pla', 'generic_pva'], 'normal');
    expect(r.diagnostics).toEqual([]);
    expect(r.unified).toEqual({
      printer: {
        max_height: 300,
        gcode_flavor: 'Griffin',
        nozzle_diameter: { '0': 0.4, '1': 0.4 },
        retract_length: { '1': 4.5 },
      },
      materials: [
        { nozzle_temp: 200, bed_temp: 60, filament_density: 1.24 },
        { nozzle_temp: 215, bed_temp: 60, filament_density: 1.23 },
      ],
      process: { layer_height: 0.1, speed_infill: { expr: '=math.ceil(speed_print * 50 / 60)' }, speed_travel: 150 },
    });
    const pla = src('material', 'generic_pla');
    const pva = src('material', 'generic_pva');
    expect(r.provenance).toEqual({
      printer: {
        max_height: src('printer_model', 'ultimaker_s5'),
        gcode_flavor: src('printer_model', 'ultimaker_s5'),
        'nozzle_diameter.0': src('nozzle', 'AA 0.4'),
        'nozzle_diameter.1': src('nozzle', 'BB 0.4'),
        'retract_length.1': src('nozzle', 'BB 0.4'),
      },
      materials: [
        { nozzle_temp: pla, bed_temp: pla, filament_density: pla },
        { nozzle_temp: pva, bed_temp: pva, filament_density: pva },
      ],
      process: {
        layer_height: src('process', 'normal'),
        speed_infill: src('process', 'normal', 0),
        speed_travel: src('process', 'normal', 0),
      },
    });
  });
});

describe('resolve: condition context', () => {
  test('surface, feeder, instance and printer settings are visible to overrides; extra materials use toolhead 0', async () => {
    const entries: Entry[] = [
      {
        kind: 'printer_instance',
        entity: {
          id: 'i',
          model: 'm',
          surface: 'satin',
          feeder: { type: 'mmu', slots: 5 },
          toolheads: [{ slot: 0, nozzle: 'n6' }],
        },
      },
      { kind: 'printer_model', entity: { id: 'm', settings: { bed_kind: 'flat' } } },
      { kind: 'nozzle', entity: { id: 'n6', diameter: 0.6 } },
      { kind: 'surface', entity: { id: 'satin', type: 'pei_satin', settings: { z_offset: 0.02 } } },
      { kind: 'material', entity: { id: 'a' } },
      {
        kind: 'material',
        entity: { id: 'b', overrides: [{ when: 'nozzle.diameter == 0.6', settings: { on_06: true } }] },
      },
      {
        kind: 'process',
        entity: {
          id: 'p',
          overrides: [
            { when: "surface.type == 'pei_satin'", settings: { s: 1 } },
            { when: "feeder.type == 'mmu' and feeder.slots == 5", settings: { f: 1 } },
            { when: "printer.instance == 'i' and printer.model == 'm'", settings: { i: 1 } },
            { when: "printer.bed_kind == 'flat' and printer.settings.bed_kind == 'flat'", settings: { b: 1 } },
            { when: "material.id == 'a'", settings: { m: 1 } },
          ],
        },
      },
    ];
    const r = await resolveTuple(readerOf(entries), 'i', ['a', 'b'], 'p');
    expect(r.diagnostics).toEqual([]);
    expect(r.unified.printer).toEqual({ bed_kind: 'flat', z_offset: 0.02 });
    expect(r.provenance.printer['z_offset']).toEqual(src('surface', 'satin'));
    expect(r.unified.process).toEqual({ s: 1, f: 1, i: 1, b: 1, m: 1 });
    // material 1 has no toolhead 1: it runs on toolhead 0's 0.6 nozzle
    expect(r.unified.materials[1]).toEqual({ on_06: true });
  });
});

test('an unreadable printer `when` on two toolheads is reported once, and its block applies', async () => {
  const r = await resolveTuple(
    readerOf([
      {
        kind: 'printer_instance',
        entity: {
          id: 'i',
          model: 'm',
          toolheads: [
            { slot: 0, nozzle: 'n' },
            { slot: 1, nozzle: 'n' },
          ],
        },
      },
      { kind: 'printer_model', entity: { id: 'm', overrides: [{ when: 'nozzle.id ==', settings: { x: 1 } }] } },
      { kind: 'nozzle', entity: { id: 'n' } },
      { kind: 'process', entity: { id: 'p' } },
    ]),
    'i',
    [],
    'p',
  );
  expect(r.diagnostics).toHaveLength(1);
  expect(r.diagnostics[0]).toMatch(/^printer_model "m" overrides\[0\]: /);
  expect(r.unified.printer).toEqual({ x: 1 });
});

describe('resolve: missing entities', () => {
  test('an unknown parent gives a diagnostic and the rest of the chain', async () => {
    const entries = fixture('bambu-h2c');
    entries.find((e) => e.entity.id === BASIC)!.entity.inherits = ['gone', 'Bambu PLA Basic @base'];
    const r = await resolveTuple(readerOf(entries), 'my-h2c', [BASIC], STANDARD);
    expect(r.diagnostics).toEqual([`material "${BASIC}" inherits from unknown parent "gone"; resolved without it`]);
    expect(r.unified.materials[0]!['filament_vendor']).toBe('Bambu Lab');
    expect(r.unified.materials[0]!['nozzle_temp']).toBe(220);
  });

  test('an unknown model or nozzle named by the instance gives a diagnostic; the instance settings still resolve', async () => {
    const r = await resolveTuple(
      readerOf([
        {
          kind: 'printer_instance',
          entity: { id: 'i', model: 'nope', toolheads: [{ slot: 0, nozzle: 'n?' }], settings: { z_hop: 1 } },
        },
        { kind: 'process', entity: { id: 'p' } },
      ]),
      'i',
      [],
      'p',
    );
    expect(r.diagnostics).toEqual([
      'printer_instance "i" names unknown printer_model "nope"; resolved without it',
      'printer_instance "i" names unknown nozzle "n?"; resolved without it',
    ]);
    expect(r.unified).toEqual({ printer: { z_hop: 1 }, materials: [], process: {} });
  });

  test('an unknown id passed in rejects', async () => {
    const reader = readerOf(fixture('bambu-h2c'));
    await expect(resolveTuple(reader, 'nope', [], STANDARD)).rejects.toThrow('unknown printer_instance "nope"');
    await expect(resolveTuple(reader, 'my-h2c', ['nope'], STANDARD)).rejects.toThrow('unknown material "nope"');
    await expect(resolveTuple(reader, 'my-h2c', [], 'nope')).rejects.toThrow('unknown process "nope"');
  });

  test('a cycle gives a diagnostic and still resolves', async () => {
    const r = await resolveTuple(
      readerOf([
        { kind: 'printer_instance', entity: { id: 'i', model: 'm', toolheads: [] } },
        { kind: 'process', entity: { id: 'a', inherits: ['b'], settings: { x: 1 } } },
        { kind: 'process', entity: { id: 'b', inherits: ['a'], settings: { x: 2, y: 2 } } },
      ]),
      'i',
      [],
      'a',
    );
    expect(r.diagnostics).toContain('process "b": inheritance cycle a -> b -> a; parent skipped');
    expect(r.unified.process).toEqual({ x: 1, y: 2 });
  });
});

describe('resolve: bounds', () => {
  const base = (): Entry[] => [
    { kind: 'printer_instance', entity: { id: 'i', model: 'm', toolheads: [] } },
    { kind: 'printer_model', entity: { id: 'm' } },
    { kind: 'process', entity: { id: 'p' } },
    { kind: 'material', entity: { id: 'mat', settings: { t: 1 } } },
  ];

  test('64 materials are accepted, 65 refused', async () => {
    const reader = readerOf(base());
    const r = await resolveTuple(reader, 'i', Array(64).fill('mat'), 'p');
    expect(r.unified.materials).toHaveLength(64);
    await expect(resolveTuple(reader, 'i', Array(65).fill('mat'), 'p')).rejects.toThrow(RangeError);
  });

  const withHeads = (n: number): Entry[] => [
    ...base().filter((e) => e.kind !== 'printer_instance'),
    {
      kind: 'printer_instance',
      entity: {
        id: 'i',
        model: 'm',
        toolheads: Array.from({ length: n }, (_, slot) => ({ slot, nozzle: `n${slot}` })),
      },
    },
    ...Array.from({ length: n }, (_, slot): Entry => ({
      kind: 'nozzle',
      entity: { id: `n${slot}`, settings: { d: slot } },
    })),
  ];

  test('64 toolheads are used, a 65th is dropped with a diagnostic', async () => {
    const at = await resolveTuple(readerOf(withHeads(64)), 'i', [], 'p');
    expect(at.diagnostics).toEqual([]);
    expect(Object.keys(at.unified.printer['d'] as object)).toHaveLength(64);
    const over = await resolveTuple(readerOf(withHeads(65)), 'i', [], 'p');
    expect(over.diagnostics).toEqual(['printer_instance "i": more than 64 toolheads; the rest dropped']);
    expect(Object.keys(over.unified.printer['d'] as object)).toHaveLength(64);
  });

  // `p` inherits p1, p1 inherits p2, ... pN; only pN sets `deep`
  const line = (n: number): Entry[] => [
    ...base().filter((e) => e.kind !== 'process'),
    { kind: 'process', entity: { id: 'p', inherits: ['p1'] } },
    ...Array.from({ length: n }, (_, i): Entry => {
      const k = i + 1;
      return {
        kind: 'process',
        entity: { id: `p${k}`, ...(k < n ? { inherits: [`p${k + 1}`] } : { settings: { deep: k } }) },
      };
    }),
  ];

  test('a chain of 256 parents resolves whole; at 257 the rest is skipped with a diagnostic', async () => {
    const at = await resolveTuple(readerOf(line(256)), 'i', [], 'p');
    expect(at.diagnostics).toEqual([]);
    expect(at.unified.process).toEqual({ deep: 256 });
    const over = await resolveTuple(readerOf(line(257)), 'i', [], 'p');
    expect(over.diagnostics).toEqual(['process "p": more than 256 parents in its chain; the rest skipped']);
    expect(over.unified.process).toEqual({});
  });

  test('a diamond fan 30 levels deep stops after 256 parent reads', async () => {
    const levels = 30;
    const entries: Entry[] = [
      ...base().filter((e) => e.kind !== 'process'),
      ...Array.from({ length: levels }, (_, d): Entry => ({
        kind: 'process',
        entity: { id: d === 0 ? 'p' : `d${d}`, inherits: [`d${d + 1}`, `d${d + 1}`] },
      })),
      { kind: 'process', entity: { id: `d${levels}`, settings: { leaf: true } } },
    ];
    const reader = readerOf(entries);
    const r = await resolveTuple(reader, 'i', [], 'p');
    expect(r.diagnostics).toEqual(['process "p": more than 256 parents in its chain; the rest skipped']);
    // 3 entities passed in or named by the instance, then at most 256 parent reads (2^30 without the bound)
    expect(reader.gets).toBeLessThanOrEqual(3 + 256);
  });

  test('__proto__ and constructor setting keys stay data in values and provenance', async () => {
    const entries: Entry[] = JSON.parse(`[
      {"kind":"printer_instance","entity":{"id":"i","model":"m","toolheads":[{"slot":0,"nozzle":"a"},{"slot":1,"nozzle":"b"}]}},
      {"kind":"printer_model","entity":{"id":"m"}},
      {"kind":"nozzle","entity":{"id":"a","settings":{"__proto__":{"polluted":1},"constructor":1}}},
      {"kind":"nozzle","entity":{"id":"b","settings":{"__proto__":{"polluted":2}}}},
      {"kind":"process","entity":{"id":"p","settings":{"__proto__":5,"constructor":"x"}}},
      {"kind":"printer_instance","entity":{"id":"i2","model":"m","toolheads":[{"slot":0,"nozzle":"c"},{"slot":1,"nozzle":"c"}]}},
      {"kind":"nozzle","entity":{"id":"c","settings":{"__proto__":3}}}
    ]`);
    const r = await resolveTuple(readerOf(entries), 'i', [], 'p');
    expect(Object.hasOwn(r.unified.process, '__proto__')).toBe(true);
    expect(r.unified.process['__proto__']).toBe(5);
    expect(r.provenance.process['__proto__']).toEqual(src('process', 'p'));
    expect(r.provenance.process['constructor']).toEqual(src('process', 'p'));
    // slot 1 has no `constructor` key: it must not read Object.prototype.constructor
    expect(r.unified.printer['constructor']).toEqual({ '0': 1 });
    expect(Object.keys(r.provenance.printer).sort()).toEqual(['__proto__.0', '__proto__.1', 'constructor.0']);
    expect(Object.hasOwn(r.unified.printer, '__proto__')).toBe(true);
    // equal on both toolheads: one provenance entry named __proto__
    const same = await resolveTuple(readerOf(entries), 'i2', [], 'p');
    expect(Object.hasOwn(same.provenance.printer, '__proto__')).toBe(true);
    expect(same.provenance.printer['__proto__']).toEqual(src('nozzle', 'c'));
    expect(same.unified.printer['__proto__']).toBe(3);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });
});
