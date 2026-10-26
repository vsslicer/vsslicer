// SPDX-License-Identifier: AGPL-3.0-or-later
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';
import {
  allSchemas,
  entitySchemas,
  type EntityBase,
  type Feeder,
  type Material,
  type Nozzle,
  type PrinterInstance,
  type PrinterModel,
  type Process,
  type Surface,
  type Vendor,
} from '../src/index.ts';

const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const s of allSchemas) ajv.addSchema(s);
type Entity = keyof typeof entitySchemas;
const errorPaths = (entity: Entity, doc: unknown): string[] => {
  const validate = ajv.compile(entitySchemas[entity]);
  validate(doc);
  return (validate.errors ?? []).map(
    (e) =>
      e.instancePath +
      (e.params.missingProperty ? `/${e.params.missingProperty}` : '') +
      (e.params.additionalProperty ? `/${e.params.additionalProperty}` : ''),
  );
};

// Types versus schema: `Record<keyof T, true>` fails to compile when a key is added, dropped or renamed in the type.
type Req<T> = { [K in keyof T as object extends Pick<T, K> ? never : K]: T[K] };
const base: Record<keyof EntityBase, true> = {
  id: true,
  inherits: true,
  abstract: true,
  when: true,
  overrides: true,
  settings: true,
  renamed_from: true,
  meta: true,
};
const on = <T>(keys: Record<keyof T, true>, required: Record<keyof Req<T>, true>) => [
  Object.keys(keys).sort(),
  Object.keys(required).sort(),
];
const expected: Record<Entity, string[][]> = {
  vendor: on<Vendor>(
    { id: true, name: true, version: true, license: true, update: true, source: true, attribution: true },
    { id: true, name: true, version: true, license: true },
  ),
  printer_model: on<PrinterModel>(
    {
      ...base,
      vendor: true,
      name: true,
      technology: true,
      bed: true,
      toolheads: true,
      family: true,
      assets: true,
      features: true,
      nozzles: true,
      surfaces: true,
      defaults: true,
      firmware: true,
    },
    { id: true, vendor: true, name: true, technology: true, bed: true, toolheads: true },
  ),
  nozzle: on<Nozzle>(
    { ...base, diameter: true, flow: true, material: true, hrc: true, extruder_type: true, volume_type: true },
    { id: true, diameter: true },
  ),
  surface: on<Surface>({ ...base, type: true }, { id: true, type: true }),
  feeder: on<Feeder>({ ...base, slots: true, type: true }, { id: true, slots: true }),
  material: on<Material>(
    {
      ...base,
      vendor: true,
      name: true,
      type: true,
      diameter: true,
      brand: true,
      color: true,
      density: true,
      cost: true,
      spool_weight: true,
      external_ids: true,
    },
    { id: true, vendor: true, name: true, type: true, diameter: true },
  ),
  process: on<Process>(
    { ...base, name: true, layer_height: true, intent: true },
    { id: true, name: true, layer_height: true },
  ),
  printer_instance: on<PrinterInstance>(
    { ...base, model: true, toolheads: true, surface: true, feeder: true, connection: true },
    { id: true, model: true, toolheads: true },
  ),
};

describe('schemas match the TypeScript types', () => {
  for (const entity of Object.keys(entitySchemas) as Entity[]) {
    test(entity, () => {
      const s = entitySchemas[entity] as { properties: object; required: string[] };
      expect([Object.keys(s.properties).sort(), [...s.required].sort()]).toEqual(expected[entity]);
    });
  }
});

const bed = [
  [0, 0],
  [250, 0],
  [250, 210],
  [0, 210],
];
const positive: [Entity, unknown][] = [
  [
    'vendor',
    {
      id: 'prusa',
      name: 'Prusa Research',
      version: '1.2.0',
      license: 'CC0-1.0',
      source: { format: 'prusa-ini', origin: 'https://example.org/p', commit: 'abc123' },
    },
  ],
  [
    'printer_model',
    {
      id: 'mk4s',
      vendor: 'prusa',
      name: 'MK4S',
      technology: 'fff',
      bed: { shape: bed, max_height: 220 },
      toolheads: { count: 1, kinematics: 'cartesian' },
      nozzles: 'nozzle.diameter >= 0.4',
      surfaces: ['pei_smooth'],
      features: { input_shaper: true, custom: false },
      firmware: { gcode_templates: { start: 'G28' } },
    },
  ],
  [
    'nozzle',
    {
      id: 'n04',
      diameter: 0.4,
      flow: 'high_flow',
      abstract: false,
      inherits: ['base'],
      settings: {
        nozzle_diameter: 0.4,
        per_extruder: { '0': 0.4, '1': 0.6 },
        unset: null,
        f: { expr: '=math.ceil(1)' },
        list: [1, 2],
      },
    },
  ],
  ['surface', { id: 'pei', type: 'pei_smooth', overrides: [{ when: 'x == 1', match: 'first', settings: { a: 1 } }] }],
  ['feeder', { id: 'mmu3', slots: 5, type: 'mmu' }],
  [
    'material',
    {
      id: 'pla',
      vendor: 'acme',
      name: 'PLA',
      type: 'PLA',
      diameter: 1.75,
      cost: { amount: 20, currency: 'EUR', per: 'kg' },
      external_ids: { cura_guid: 'g' },
      meta: { created: '2026-01-01', base_version: '1.0.0' },
    },
  ],
  ['process', { id: 'p02', name: '0.20mm', layer_height: 0.2, intent: 'standard', renamed_from: ['old'] }],
  [
    'printer_instance',
    {
      id: 'mine',
      model: 'mk4s',
      toolheads: [{ slot: 0, nozzle: 'n04' }],
      connection: { host_type: 'moonraker', url: 'http://p.local', secret_ref: 'vsslicer/mine' },
    },
  ],
];

const negative: [string, Entity, unknown, string][] = [
  ['missing id', 'nozzle', { diameter: 0.4 }, '/id'],
  ['missing required diameter', 'nozzle', { id: 'n' }, '/diameter'],
  ['id empty', 'nozzle', { id: '', diameter: 0.4 }, '/id'],
  [
    'host_type is an object',
    'printer_instance',
    { id: 'i', model: 'm', toolheads: [], connection: { host_type: { a: 1 }, url: 'u', secret_ref: 's' } },
    '/connection/host_type',
  ],
  [
    'connection lacks secret_ref',
    'printer_instance',
    { id: 'i', model: 'm', toolheads: [], connection: { host_type: 'h', url: 'u' } },
    '/connection/secret_ref',
  ],
  ['abstract is a string', 'process', { id: 'p', name: 'n', layer_height: 0.2, abstract: 'base' }, '/abstract'],
  [
    'positional array for gcode_templates',
    'printer_model',
    {
      id: 'm',
      vendor: 'v',
      name: 'n',
      technology: 'fff',
      bed: { shape: bed, max_height: 1 },
      toolheads: { count: 1, kinematics: 'k' },
      firmware: { gcode_templates: ['G28'] },
    },
    '/firmware/gcode_templates',
  ],
  [
    'positional array for external_ids',
    'material',
    { id: 'm', vendor: 'v', name: 'n', type: 'PLA', diameter: 1.75, external_ids: ['x'] },
    '/external_ids',
  ],
  [
    'password in connection',
    'printer_instance',
    { id: 'i', model: 'm', toolheads: [], connection: { host_type: 'h', url: 'u', secret_ref: 's', password: 'pw' } },
    '/connection/password',
  ],
  [
    'apikey in connection',
    'printer_instance',
    { id: 'i', model: 'm', toolheads: [], connection: { host_type: 'h', url: 'u', secret_ref: 's', apikey: 'k' } },
    '/connection/apikey',
  ],
  [
    'access_code in connection',
    'printer_instance',
    { id: 'i', model: 'm', toolheads: [], connection: { host_type: 'h', url: 'u', secret_ref: 's', access_code: '1' } },
    '/connection/access_code',
  ],
  [
    'unknown technology',
    'printer_model',
    {
      id: 'm',
      vendor: 'v',
      name: 'n',
      technology: 'sla',
      bed: { shape: bed, max_height: 1 },
      toolheads: { count: 1, kinematics: 'k' },
    },
    '/technology',
  ],
  ['unknown top-level property', 'surface', { id: 's', type: 't', colour: 'red' }, '/colour'],
  ['vendor has inherits', 'vendor', { id: 'v', name: 'n', version: '1', license: 'MIT', inherits: ['x'] }, '/inherits'],
  [
    'override missing when',
    'process',
    { id: 'p', name: 'n', layer_height: 0.2, overrides: [{ settings: {} }] },
    '/overrides/0/when',
  ],
  ['settings is an array', 'feeder', { id: 'f', slots: 4, settings: [1] }, '/settings'],
  [
    'setting value is undefined-like object tree with bad leaf',
    'feeder',
    { id: 'f', slots: 4, settings: { a: { b: { c: undefined, d: () => 1 } } } },
    '/settings/a',
  ],
  ['bad enum flow', 'nozzle', { id: 'n', diameter: 0.4, flow: 'turbo' }, '/flow'],
  [
    'bed max_height wrong type',
    'printer_model',
    {
      id: 'm',
      vendor: 'v',
      name: 'n',
      technology: 'fff',
      bed: { shape: bed, max_height: '1' },
      toolheads: { count: 1, kinematics: 'k' },
    },
    '/bed/max_height',
  ],
  [
    'toolhead slot negative',
    'printer_instance',
    { id: 'i', model: 'm', toolheads: [{ slot: -1, nozzle: 'n' }] },
    '/toolheads/0/slot',
  ],
];

describe('fixtures', () => {
  test.each(positive)('valid %s', (entity, doc) => {
    expect(errorPaths(entity, doc)).toEqual([]);
  });
  test.each(negative)('invalid: %s', (_n, entity, doc, path) => {
    expect(errorPaths(entity, doc)).toContain(path);
  });
});
