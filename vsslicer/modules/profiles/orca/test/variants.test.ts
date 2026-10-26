// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { loadProfileTree } from '../src/adapters/tree/load-tree.ts';
import { readOrcaTree } from '../src/adapters/tree/read-tree.ts';
import { decodeVariants, encodeVariants, MAX_EXTRUDERS, MAX_VARIANT_SLOTS } from '../src/adapters/variants/variants.ts';

/** The H2C 0.4 layout: three variants on the left extruder, two on the right. */
const h2c = {
  printer_extruder_id: ['1', '1', '1', '2', '2'],
  printer_extruder_variant: ['Std', 'HF', 'E3D', 'Std', 'HF'],
  retraction_length: ['0.8', '0.7', '0.6', '0.5', '0.4'],
  machine_max_speed_x: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  nozzle_diameter: ['0.4', '0.6'],
  printable_area: ['0x0', '330x0'],
};

describe('decodeVariants', () => {
  test('keys per-variant values by extruder then variant, machine limits as pairs, per-extruder by extruder', () => {
    const { settings, diagnostics } = decodeVariants('machine', h2c);
    expect(diagnostics).toEqual([]);
    expect(settings.retraction_length).toEqual({
      0: { Std: '0.8', HF: '0.7', E3D: '0.6' },
      1: { Std: '0.5', HF: '0.4' },
    });
    expect(settings.machine_max_speed_x).toEqual({
      0: { Std: ['1', '2'], HF: ['3', '4'], E3D: ['5', '6'] },
      1: { Std: ['7', '8'], HF: ['9', '10'] },
    });
    expect(settings.nozzle_diameter).toEqual({ 0: '0.4', 1: '0.6' });
    // Not a variant option, and the slot lists stay arrays.
    expect(settings.printable_area).toEqual(h2c.printable_area);
    expect(settings.printer_extruder_variant).toEqual(h2c.printer_extruder_variant);
    expect(encodeVariants('machine', settings)).toEqual(h2c);
  });

  test('re-encodes in slot order even when the keyed values come in another order', () => {
    const shuffled = {
      ...h2c,
      retraction_length: { 1: { HF: '0.4', Std: '0.5' }, 0: { E3D: '0.6', HF: '0.7', Std: '0.8' } },
    };
    expect(encodeVariants('machine', shuffled).retraction_length).toEqual(h2c.retraction_length);
  });

  test('process presets use print_extruder_id; filament presets and presets without slots are unchanged', () => {
    const process = {
      print_extruder_id: ['1', '2'],
      print_extruder_variant: ['Std', 'Std'],
      travel_speed: ['500', '400'],
    };
    expect(decodeVariants('process', process).settings.travel_speed).toEqual({ 0: { Std: '500' }, 1: { Std: '400' } });
    const filament = { filament_extruder_variant: ['Std', 'HF'], filament_flow_ratio: ['0.98', '0.95'] };
    expect(decodeVariants('filament', filament)).toEqual({ settings: filament, diagnostics: [] });
    const plain = { retraction_length: ['0.8'] };
    expect(decodeVariants('machine', plain)).toEqual({ settings: plain, diagnostics: [] });
  });

  test('a wrong length stays an array with a warning; empty arrays and nil stay silently', () => {
    const { settings, diagnostics } = decodeVariants('machine', {
      ...h2c,
      z_hop: ['0.4'],
      extruder_printable_area: [],
      wipe: null,
    });
    expect(diagnostics).toEqual([expect.objectContaining({ code: 'variant-length', key: 'z_hop' })]);
    expect(settings.z_hop).toEqual(['0.4']);
    expect(settings.extruder_printable_area).toEqual([]);
    expect(settings.wipe).toBeNull();
  });

  test('a per-extruder array of the wrong length stays an array with a warning', () => {
    const { settings, diagnostics } = decodeVariants('machine', { ...h2c, nozzle_diameter: ['0.4'] });
    expect(diagnostics).toEqual([expect.objectContaining({ code: 'variant-length', key: 'nozzle_diameter' })]);
    expect(settings.nozzle_diameter).toEqual(['0.4']);
    expect(encodeVariants('machine', settings)).toEqual({ ...h2c, nozzle_diameter: ['0.4'] });
  });

  test('a variant named __proto__ stays data', () => {
    const s = { printer_extruder_id: ['1'], printer_extruder_variant: ['__proto__'], z_hop: ['0.4'] };
    const d = decodeVariants('machine', s).settings.z_hop as Record<string, Record<string, unknown>>;
    expect(Object.hasOwn(d['0']!, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(d['0'])).toBe(Object.prototype);
    expect(encodeVariants('machine', decodeVariants('machine', s).settings)).toEqual(s);
  });
});

describe('decodeVariants: bounds', () => {
  const layout = (ids: unknown, variants: unknown) =>
    decodeVariants('machine', { printer_extruder_id: ids, printer_extruder_variant: variants, z_hop: ['0'] });

  test('a malformed slot list leaves the preset undecoded with one variant-layout warning', () => {
    for (const [ids, variants] of [
      [
        ['1', '1'],
        ['Std', 'Std'],
      ], // duplicate slot
      [['0'], ['Std']],
      [[String(MAX_EXTRUDERS + 1)], ['Std']],
      [['1.5'], ['Std']],
      [[1.5], ['Std']],
      [['1', '2'], ['Std']],
      [['1'], [7]],
      [null, ['Std']],
      [[], []],
      [
        Array<string>(MAX_VARIANT_SLOTS + 1).fill('1'),
        Array.from({ length: MAX_VARIANT_SLOTS + 1 }, (_, i) => `v${i}`),
      ],
    ]) {
      const { settings, diagnostics } = layout(ids, variants);
      expect(diagnostics.map((d) => d.code)).toEqual(['variant-layout']);
      expect(settings.z_hop).toEqual(['0']);
    }
  });

  test('the slot and extruder caps are inclusive', () => {
    const n = MAX_VARIANT_SLOTS;
    const ok = layout(
      Array<string>(n).fill(String(MAX_EXTRUDERS)),
      Array.from({ length: n }, (_, i) => `v${i}`),
    );
    expect(ok.diagnostics.map((d) => d.key)).toEqual(['z_hop']); // the layout itself is accepted
  });

  test('encode refuses a keyed value with a missing slot or a malformed limit pair', () => {
    const d = decodeVariants('machine', h2c).settings;
    expect(() =>
      encodeVariants('machine', { ...d, retraction_length: { 0: { Std: '1', HF: '1', E3D: '1' }, 1: { Std: '1' } } }),
    ).toThrow(RangeError);
    // An inherited extruder key is not a value.
    const inherited = Object.assign(Object.create({ 1: { Std: '1', HF: '1' } }) as object, {
      0: { Std: '1', HF: '1', E3D: '1' },
    });
    expect(() => encodeVariants('machine', { ...d, retraction_length: inherited })).toThrow(RangeError);
    expect(() =>
      encodeVariants('machine', {
        ...d,
        machine_max_speed_x: {
          0: { Std: ['1'], HF: ['1', '2'], E3D: ['1', '2'] },
          1: { Std: ['1', '2'], HF: ['1', '2'] },
        },
      }),
    ).toThrow(RangeError);
  });
});

const bambu = join(
  fileURLToPath(new URL('../../../../.reference/repos/', import.meta.url)),
  'BambuStudio/resources/profiles',
);

describe('H2C machine files (BambuStudio@79df7ae, local .reference clone)', () => {
  test.skipIf(!existsSync(bambu))(
    '11 files import; each nozzle preset decodes both extruders and round-trips; so does every Bambu preset',
    async () => {
      const t = readOrcaTree((await loadProfileTree(bambu)).files);
      const h2c = t.presets.filter((p) => p.vendor === 'BBL' && /^Bambu Lab H2C( |$)/.test(p.name));
      expect(h2c).toHaveLength(11);
      expect(h2c.filter((p) => p.type === 'machine_model')).toHaveLength(1);
      const nozzles = h2c.filter((p) => p.type === 'machine' && !p.abstract);
      expect(nozzles.map((p) => p.name).sort()).toEqual(
        ['0.2', '0.4', '0.6', '0.8'].map((d) => `Bambu Lab H2C ${d} nozzle`),
      );
      expect(h2c.filter((p) => p.abstract)).toHaveLength(6);

      for (const p of nozzles) {
        const { settings, diagnostics } = decodeVariants(p.type, p.settings);
        expect(diagnostics).toEqual([]);
        expect(Object.keys(settings.retraction_length as object)).toEqual(['0', '1']);
        expect(Object.keys(settings.nozzle_diameter as object)).toEqual(['0', '1']);
        expect(encodeVariants(p.type, settings)).toStrictEqual(p.settings);
      }
      const h04 = decodeVariants(
        'machine',
        nozzles.find((p) => p.name === 'Bambu Lab H2C 0.4 nozzle')!.settings,
      ).settings;
      expect(h04.nozzle_volume).toEqual({
        0: { 'Direct Drive Standard': '130', 'Direct Drive High Flow': '133', 'Direct Drive E3D High Flow': '133' },
        1: { 'Direct Drive Standard': '145', 'Direct Drive High Flow': '148' },
      });

      let decoded = 0;
      for (const p of t.presets) {
        const { settings, diagnostics } = decodeVariants(p.type, p.settings);
        expect(diagnostics, p.name).toEqual([]);
        if (settings.printer_extruder_variant ?? settings.print_extruder_variant) decoded++;
        expect(encodeVariants(p.type, settings), p.name).toStrictEqual(p.settings);
      }
      expect(decoded).toBe(335);
    },
    60_000,
  );
});
