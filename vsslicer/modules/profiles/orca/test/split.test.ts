// SPDX-License-Identifier: AGPL-3.0-or-later
import { applyOverrides, type Nozzle, type PrinterModel } from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import { splitOrcaPrinters } from '../src/adapters/split/split.ts';
import { readOrcaTree } from '../src/adapters/tree/read-tree.ts';

const enc = new TextEncoder();
const bed = ['0x0', '120x0', '120x120', '0x120'];
const machine = (d: string, extra: Record<string, unknown> = {}) => ({
  type: 'machine',
  name: `M ${d} nozzle`,
  inherits: 'common',
  instantiation: 'true',
  printer_model: 'M',
  printer_variant: d,
  nozzle_diameter: [d],
  max_layer_height: [String(Number(d) * 0.75)],
  ...extra,
});

/** A vendor `V` with model `M`, an abstract `common` machine and the given machine presets. */
function tree(machines: Record<string, unknown>[]) {
  const file = (x: Record<string, unknown>) => `machine/${String(x['name']).replace(/\\/g, '_')}.json`;
  const m = {
    'V.json': {
      name: 'V',
      version: '1',
      machine_model_list: [{ name: 'M', sub_path: 'machine/M.json' }],
      machine_list: [
        { name: 'common', sub_path: 'machine/common.json' },
        ...machines.map((x) => ({ name: x['name'], sub_path: file(x) })),
      ],
    },
    'V/machine/M.json': { type: 'machine_model', name: 'M', family: 'Fam', nozzle_diameter: '0.2;0.4;0.6' },
    'V/machine/common.json': {
      type: 'machine',
      name: 'common',
      instantiation: 'false',
      printable_area: bed,
      printable_height: '120',
      gcode_flavor: 'klipper',
    },
    ...Object.fromEntries(machines.map((x) => [`V/${file(x)}`, x])),
  };
  const t = readOrcaTree(Object.entries(m).map(([path, v]) => ({ path, bytes: enc.encode(JSON.stringify(v)) })));
  expect(t.diagnostics).toEqual([]);
  return t;
}
const byId = (r: ReturnType<typeof splitOrcaPrinters>, id: string) => r.entities.find((e) => 'id' in e && e.id === id);

describe('splitOrcaPrinters', () => {
  test('0.2/0.4/0.6 presets become one printer_model and three nozzles that resolve to the originals', () => {
    const t = tree([machine('0.2'), machine('0.4', { retraction_length: ['0.8'] }), machine('0.6')]);
    const r = splitOrcaPrinters(t);
    expect(r.diagnostics).toEqual([]);
    const model = byId(r, 'M') as PrinterModel;
    expect(model.nozzles).toEqual(['M 0.2 nozzle', 'M 0.4 nozzle', 'M 0.6 nozzle']);
    expect(model.family).toBe('Fam');
    expect(model.bed).toEqual({ shape: bed.map((p) => p.split('x').map(Number)), max_height: 120 });
    expect(model.settings).toMatchObject({ gcode_flavor: 'klipper', printer_model: 'M' });
    expect(model.settings).not.toHaveProperty('printer_variant');
    expect(r.entities).toHaveLength(4);
    for (const d of ['0.2', '0.4', '0.6']) {
      const id = `M ${d} nozzle`;
      expect((byId(r, id) as Nozzle).diameter).toBe(Number(d));
      const resolved = applyOverrides(model, { nozzle: { id } });
      expect(resolved.diagnostics).toEqual([]);
      const original = t.presets.find((p) => p.name === id)!;
      expect(resolved.entity.settings).toEqual(original.settings);
      // the native form of each original preset stays attached
      expect(r.native[id]).toBe(original);
    }
    expect(r.native['M']).toBe(t.presets.find((p) => p.name === 'M'));
  });

  test('a preset with another bed, no variant or no model stays its own printer_model', () => {
    const r = splitOrcaPrinters(
      tree([
        machine('0.4', { printable_area: bed.join(',') }),
        machine('0.6', { printable_area: ['0x0', '200x0', '200x200', '0x200'] }),
        machine('0.8', { printer_variant: '' }),
        machine('1.0', { printer_model: 'Other' }),
      ]),
    );
    expect((byId(r, 'M') as PrinterModel).nozzles).toEqual(['M 0.4 nozzle']);
    for (const id of ['M 0.6 nozzle', 'M 0.8 nozzle', 'M 1.0 nozzle'])
      expect(byId(r, id)).toMatchObject({ id, technology: 'fff', bed: expect.anything() });
    expect(r.diagnostics.map((d) => d.severity)).toEqual(['info']);
  });

  test('a preset or settings key named __proto__ stays an own key of native and the model settings', () => {
    // a computed key defines an own `__proto__` property, as JSON.parse does
    const t = tree([
      { ...machine('0.4'), name: '__proto__', ['__proto__']: 'x' },
      machine('0.6', { ['__proto__']: 'x' }),
    ]);
    const r = splitOrcaPrinters(t);
    expect(r.diagnostics).toEqual([]);
    expect(Object.hasOwn(r.native, '__proto__')).toBe(true);
    expect(r.native['__proto__']).toBe(t.presets.find((x) => x.name === '__proto__'));
    const model = byId(r, 'M') as PrinterModel;
    expect(Object.hasOwn(model.settings!, '__proto__')).toBe(true);
    for (const id of ['__proto__', 'M 0.6 nozzle'])
      expect(applyOverrides(model, { nozzle: { id } }).entity.settings).toEqual(
        t.presets.find((x) => x.name === id)!.settings,
      );
  });

  test('a nozzle id with a quote and a backslash still selects its override', () => {
    const t = tree([{ ...machine('0.4'), name: "M 'q\\ 0.4" }, machine('0.6')]);
    const model = byId(splitOrcaPrinters(t), 'M') as PrinterModel;
    const resolved = applyOverrides(model, { nozzle: { id: "M 'q\\ 0.4" } });
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.entity.settings).toEqual(t.presets.find((x) => x.name === "M 'q\\ 0.4")!.settings);
  });

  test('a preset with no nozzle diameter stays standalone with a warning', () => {
    const r = splitOrcaPrinters(tree([machine('0.4'), machine('0.6', { nozzle_diameter: ['0'] })]));
    expect((byId(r, 'M') as PrinterModel).nozzles).toEqual(['M 0.4 nozzle']);
    expect(byId(r, 'M 0.6 nozzle')).toMatchObject({ technology: 'fff' });
    expect(r.diagnostics.map((d) => [d.severity, d.message])).toEqual([
      ['warning', 'M 0.6 nozzle: no nozzle diameter; not split'],
    ]);
  });

  test('a preset with another toolhead count stays standalone', () => {
    const r = splitOrcaPrinters(tree([machine('0.4'), machine('0.6', { nozzle_diameter: ['0.6', '0.6'] })]));
    expect((byId(r, 'M') as PrinterModel).nozzles).toEqual(['M 0.4 nozzle']);
    expect(byId(r, 'M 0.6 nozzle')).toMatchObject({ toolheads: { count: 2 } });
    expect(r.diagnostics.map((d) => d.severity)).toEqual(['info']);
  });

  test('a machine_model of the same name in another vendor does not take the preset', () => {
    const files = {
      'V.json': {
        name: 'V',
        version: '1',
        machine_model_list: [],
        machine_list: [{ name: 'M 0.4 nozzle', sub_path: 'machine/a.json' }],
      },
      'V/machine/a.json': { ...machine('0.4'), inherits: undefined, printable_area: bed },
      'W.json': { name: 'W', version: '1', machine_model_list: [{ name: 'M', sub_path: 'machine/M.json' }] },
      'W/machine/M.json': { type: 'machine_model', name: 'M' },
    };
    const t = readOrcaTree(Object.entries(files).map(([path, v]) => ({ path, bytes: enc.encode(JSON.stringify(v)) })));
    expect(t.diagnostics).toEqual([]);
    const r = splitOrcaPrinters(t);
    expect(byId(r, 'M 0.4 nozzle')).toMatchObject({ technology: 'fff' });
    expect(byId(r, 'M')).toBeUndefined();
  });

  test('a preset with no usable bed is dropped with a warning; a model with no preset is reported', () => {
    const r = splitOrcaPrinters(tree([machine('0.4', { printable_area: ['0x0', 'axb', '1x1'] })]));
    expect(r.entities).toEqual([]);
    expect(r.diagnostics.map((d) => [d.severity, d.file])).toEqual([
      ['warning', 'V/machine/M 0.4 nozzle.json'],
      ['info', 'V/machine/M.json'],
    ]);
  });
});
