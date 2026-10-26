// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allSchemas, entitySchemas, MAX_CONNECTION_STRING } from '@vsslicer/profile-api';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';
import { readBundleArchive } from '../src/adapters/archive/bundle-archive.ts';
import {
  MAX_CREDENTIAL,
  MAX_INSTANCE_CHAIN,
  MAX_INSTANCE_NAME,
  readOrcaInstances,
} from '../src/adapters/instances/read-instances.ts';
import { splitOrcaPrinters } from '../src/adapters/split/split.ts';
import { loadProfileTree } from '../src/adapters/tree/load-tree.ts';
import { readOrcaTree } from '../src/adapters/tree/read-tree.ts';
import { readOrcaUserPresets } from '../src/adapters/user/read-user-presets.ts';

const enc = new TextEncoder();
const files = (m: Record<string, unknown>) =>
  Object.entries(m).map(([path, v]) => ({ path, bytes: enc.encode(JSON.stringify(v)) }));
const machine = (vendor: string, name: string, model: string, extra: Record<string, unknown> = {}) => ({
  [`${vendor}/machine/${name}.json`]: {
    type: 'machine',
    name,
    inherits: 'common',
    instantiation: 'true',
    printer_model: model,
    printer_variant: '0.4',
    printable_area: ['0x0', '200x0', '200x200', '0x200'],
    nozzle_diameter: ['0.4'],
    ...extra,
  },
});
const model = (vendor: string, name: string) => ({
  [`${vendor}/machine/${name}.json`]: { type: 'machine_model', name, model_id: name },
});
/** Vendor presets the fixtures inherit, named as in Orca's `Custom` and Bambu's `BBL` vendors. */
const tree = readOrcaTree(
  files({
    'Custom.json': {
      name: 'Custom',
      version: '1',
      machine_model_list: ['MyKlipper', 'MyMarlin'].map((n) => ({ name: n, sub_path: `machine/${n}.json` })),
      machine_list: [
        { name: 'common', sub_path: 'machine/common.json' },
        ...['MyKlipper 0.4 nozzle', 'MyKlipper 0.6 nozzle', 'MyKlipper Big 0.4 nozzle', 'MyMarlin 0.4 nozzle'].map(
          (n) => ({ name: n, sub_path: `machine/${n}.json` }),
        ),
      ],
    },
    ...model('Custom', 'MyKlipper'),
    ...model('Custom', 'MyMarlin'),
    'Custom/machine/common.json': { type: 'machine', name: 'common', instantiation: 'false', host_type: 'octoprint' },
    ...machine('Custom', 'MyKlipper 0.4 nozzle', 'MyKlipper', { host_type: 'moonraker' }),
    ...machine('Custom', 'MyKlipper 0.6 nozzle', 'MyKlipper', { printer_variant: '0.6', nozzle_diameter: ['0.6'] }),
    // a bed other than its model's: split keeps it a printer_model of its own and makes no nozzle for it
    ...machine('Custom', 'MyKlipper Big 0.4 nozzle', 'MyKlipper', {
      printable_area: ['0x0', '350x0', '350x350', '0x350'],
    }),
    ...machine('Custom', 'MyMarlin 0.4 nozzle', 'MyMarlin'),
    'BBL.json': {
      name: 'BBL',
      version: '1',
      machine_model_list: [{ name: 'Bambu Lab X1 Carbon', sub_path: 'machine/x1c-model.json' }],
      machine_list: [
        { name: 'common', sub_path: 'machine/common.json' },
        { name: 'Bambu Lab X1 Carbon 0.4 nozzle', sub_path: 'machine/x1c.json' },
      ],
    },
    'BBL/machine/x1c-model.json': { type: 'machine_model', name: 'Bambu Lab X1 Carbon' },
    'BBL/machine/common.json': { type: 'machine', name: 'common', instantiation: 'false' },
    'BBL/machine/x1c.json': machine('BBL', 'Bambu Lab X1 Carbon 0.4 nozzle', 'Bambu Lab X1 Carbon')[
      'BBL/machine/Bambu Lab X1 Carbon 0.4 nozzle.json'
    ],
  }),
);

const fixture = fileURLToPath(new URL('./fixtures/instances/orca-documented', import.meta.url));
async function documented() {
  const loaded = await loadProfileTree(fixture);
  return readOrcaInstances(readOrcaUserPresets(loaded.files, tree).presets, tree);
}
const user = (m: Record<string, Record<string, unknown>>) =>
  readOrcaUserPresets(
    files(Object.fromEntries(Object.entries(m).map(([n, v]) => [`user/1/machine/${n}.json`, { name: n, ...v }]))),
    tree,
  ).presets;

describe('readOrcaInstances', () => {
  test('documented Orca presets keep model, nozzle and host; credentials travel beside the entity', async () => {
    const r = await documented();
    const by = new Map(r.instances.map((i) => [i.entity.id, i]));
    expect(by.get('MyKlipper 0.4 nozzle - Voron')).toEqual({
      entity: {
        id: 'MyKlipper 0.4 nozzle - Voron',
        model: 'MyKlipper',
        toolheads: [{ slot: 0, nozzle: 'MyKlipper 0.4 nozzle' }],
        connection: {
          host_type: 'moonraker',
          url: 'http://voron.local:7125',
          secret_ref: 'orca-user/default/MyKlipper 0.4 nozzle - Voron',
        },
      },
      credential: 'fixture-api-key-0001',
    });
    // printhost_authorization_type "user" selects the password, not the API key; host_type falls to the vendor's
    // inherited "octoprint".
    expect(by.get('MyMarlin 0.4 nozzle - Octo')).toMatchObject({
      entity: { model: 'MyMarlin', connection: { host_type: 'octoprint', url: 'https://octopi.local' } },
      credential: 'fixture-password-0002',
    });
    // No print host: an instance without a connection and without a diagnostic.
    expect(by.get('MyKlipper 0.6 nozzle - Offline')).toEqual({
      entity: {
        id: 'MyKlipper 0.6 nozzle - Offline',
        model: 'MyKlipper',
        toolheads: [{ slot: 0, nozzle: 'MyKlipper 0.6 nozzle' }],
      },
    });
    for (const i of r.instances) expect(JSON.stringify(i.entity)).not.toMatch(/fixture-(api-key|password)/);
  });

  test('an unknown host type is a diagnostic and the instance has no connection or credential', async () => {
    const r = await documented();
    expect(r.instances.find((i) => i.entity.id === 'MyKlipper 0.4 nozzle - Obico')).toEqual({
      entity: {
        id: 'MyKlipper 0.4 nozzle - Obico',
        model: 'MyKlipper',
        toolheads: [{ slot: 0, nozzle: 'MyKlipper 0.4 nozzle' }],
      },
    });
    expect(r.diagnostics).toEqual([
      {
        severity: 'warning',
        code: 'unknown-type',
        file: 'user/default/machine/MyKlipper 0.4 nozzle - Obico.json',
        message: 'host_type "obico" has no connector; imported without a connection',
      },
    ]);
  });

  test('entities validate against the printer_instance schema', async () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    for (const s of allSchemas) if (s !== entitySchemas.printer_instance) ajv.addSchema(s);
    const validate = ajv.compile(entitySchemas.printer_instance);
    for (const i of (await documented()).instances)
      expect(validate(i.entity), JSON.stringify(validate.errors)).toBe(true);
  });

  test('the machine preset Bambu Studio 02.08.02.61 saved reads as an instance of its vendor model', () => {
    const bundle = readFileSync(
      new URL('./fixtures/bundles/bambu-studio-saved-presets/saved-presets.bbscfg', import.meta.url),
    );
    const entries = [...readBundleArchive(new Uint8Array(bundle)).entries]
      .filter(([k]) => k.startsWith('printer/'))
      .map(([k, bytes]) => ({ path: `user/3494833915/machine/${k.slice(8)}`, bytes }));
    const r = readOrcaInstances(readOrcaUserPresets(entries, tree).presets, tree);
    expect(r).toEqual({
      instances: [
        {
          entity: {
            id: 'Bambu Lab X1 Carbon 0.4 nozzle - NoAuxFan',
            model: 'Bambu Lab X1 Carbon',
            toolheads: [{ slot: 0, nozzle: 'Bambu Lab X1 Carbon 0.4 nozzle' }],
          },
        },
      ],
      diagnostics: [],
    });
  });

  test('keys resolve through a user parent; a standalone preset warns for model and nozzle', () => {
    const r = readOrcaInstances(
      user({
        A: { inherits: 'MyKlipper 0.4 nozzle', print_host: 'http://a', printhost_apikey: 'k' },
        B: { inherits: 'A' },
        C: { host_type: 'duet', print_host: 'http://c' },
      }),
      tree,
    );
    expect(r.instances.find((i) => i.entity.id === 'B')).toEqual({
      entity: {
        id: 'B',
        model: 'MyKlipper',
        toolheads: [{ slot: 0, nozzle: 'MyKlipper 0.4 nozzle' }],
        connection: { host_type: 'moonraker', url: 'http://a', secret_ref: 'orca-user/1/B' },
      },
      credential: 'k',
    });
    expect(r.instances.find((i) => i.entity.id === 'C')!.entity).toEqual({
      id: 'C',
      model: '',
      toolheads: [],
      connection: { host_type: 'duet', url: 'http://c', secret_ref: 'orca-user/1/C' },
    });
    expect(r.diagnostics.map((d) => [d.file, d.code])).toEqual([['user/1/machine/C.json', 'unknown-parent']]);
  });

  test('model and nozzle are ids splitOrcaPrinters makes; a parent split refuses is its own model, no nozzle', async () => {
    const r = readOrcaInstances(
      user({
        K: { inherits: 'MyKlipper 0.6 nozzle' },
        Big: { inherits: 'MyKlipper Big 0.4 nozzle', print_host: 'http://big' },
      }),
      tree,
    );
    const by = new Map(r.instances.map((i) => [i.entity.id, i.entity]));
    expect(by.get('K')).toEqual({
      id: 'K',
      model: 'MyKlipper',
      toolheads: [{ slot: 0, nozzle: 'MyKlipper 0.6 nozzle' }],
    });
    expect(by.get('Big')).toMatchObject({ model: 'MyKlipper Big 0.4 nozzle', toolheads: [] });
    expect(r.diagnostics).toEqual([
      {
        severity: 'warning',
        code: 'unknown-parent',
        file: 'user/1/machine/Big.json',
        message: 'vendor preset "MyKlipper Big 0.4 nozzle" is not split into a nozzle; toolheads left empty',
      },
    ]);
    const made = new Set(splitOrcaPrinters(tree).entities.map((e) => e.id));
    for (const i of [...r.instances, ...(await documented()).instances]) {
      expect(made).toContain(i.entity.model);
      for (const t of i.entity.toolheads) expect(made).toContain(t.nozzle);
    }
  });

  test('one name in two user folders gives one instance and a diagnostic for the second', () => {
    const presets = readOrcaUserPresets(
      files({
        'user/default/machine/V.json': { name: 'V', print_host: 'http://a' },
        'user/123/machine/V.json': { name: 'V', print_host: 'http://b' },
        // a case alias: one file on a case-insensitive store
        'user/456/machine/v.json': { name: 'v', print_host: 'http://c' },
      }),
      tree,
    ).presets;
    expect(presets).toHaveLength(3);
    const r = readOrcaInstances(presets, tree);
    expect(r.instances.map((i) => i.entity.id)).toEqual(['V']);
    expect(r.diagnostics.filter((d) => d.code === 'malformed-line')).toEqual([
      {
        severity: 'warning',
        code: 'malformed-line',
        file: presets[1]!.file,
        message: 'another user folder already has a printer named "V"; not imported',
      },
      {
        severity: 'warning',
        code: 'malformed-line',
        file: presets[2]!.file,
        message: 'another user folder already has a printer named "v"; not imported',
      },
    ]);
  });

  test('the user id in secret_ref is kept to 255 characters', () => {
    const ref = (n: number) =>
      readOrcaInstances(
        readOrcaUserPresets(files({ [`user/${'u'.repeat(n)}/machine/S.json`]: { print_host: 'http://s' } }), tree)
          .presets,
        tree,
      ).instances[0]!.entity.connection!.secret_ref;
    expect(ref(255)).toBe(`orca-user/${'u'.repeat(255)}/S`);
    expect(ref(256)).toBe(`orca-user/${'u'.repeat(255)}/S`);
  });

  test('host_type defaults to octoprint when no preset in the chain sets it', () => {
    const r = readOrcaInstances(user({ S: { print_host: 'http://s' } }), tree);
    expect(r.instances[0]!.entity.connection?.host_type).toBe('octoprint');
  });

  test('an inherits loop between user presets stops with a cycle warning', () => {
    const r = readOrcaInstances(user({ X: { inherits: 'Y' }, Y: { inherits: 'X' } }), tree);
    expect(r.instances).toHaveLength(2);
    expect(r.diagnostics.filter((d) => d.message === 'inherits chain loops; the rest is not read')).toHaveLength(2);
  });

  test('"nil" falls through to the parent; an abstract vendor parent gives no nozzle', () => {
    const r = readOrcaInstances(
      user({
        N: { inherits: 'MyKlipper 0.4 nozzle', host_type: 'nil', print_host: 'http://n' },
        T: { inherits: 'common' },
      }),
      tree,
    );
    const by = new Map(r.instances.map((i) => [i.entity.id, i.entity]));
    expect(by.get('N')!.connection?.host_type).toBe('moonraker');
    expect(by.get('T')!.toolheads).toEqual([]);
  });

  test(`the inherits chain is read to ${MAX_INSTANCE_CHAIN} presets, not one more`, () => {
    // P0 -> P1 -> ... -> P(n-1) -> vendor: n user presets plus the vendor one.
    const chain = (n: number) => {
      const m: Record<string, Record<string, unknown>> = {};
      for (let i = 0; i < n; i++) m[`P${i}`] = { inherits: i === n - 1 ? 'MyKlipper 0.4 nozzle' : `P${i + 1}` };
      return readOrcaInstances(user(m), tree).instances.find((i) => i.entity.id === 'P0')!.entity;
    };
    expect(chain(MAX_INSTANCE_CHAIN - 1).model).toBe('MyKlipper');
    expect(chain(MAX_INSTANCE_CHAIN).model).toBe('');
  });

  test('length caps: name, host and credential at the cap are kept, one over is refused', () => {
    const name = (n: number) => 'n'.repeat(n);
    const r = readOrcaInstances(
      user({
        [name(MAX_INSTANCE_NAME)]: {},
        [name(MAX_INSTANCE_NAME + 1)]: {},
        H1: { print_host: 'h'.repeat(MAX_CONNECTION_STRING), printhost_apikey: 'c'.repeat(MAX_CREDENTIAL) },
        H2: { print_host: 'h'.repeat(MAX_CONNECTION_STRING + 1) },
        H3: { print_host: 'http://h', printhost_apikey: 'c'.repeat(MAX_CREDENTIAL + 1) },
      }),
      tree,
    );
    const by = new Map(r.instances.map((i) => [i.entity.id, i]));
    expect(by.has(name(MAX_INSTANCE_NAME))).toBe(true);
    expect(by.has(name(MAX_INSTANCE_NAME + 1))).toBe(false);
    expect(by.get('H1')!.entity.connection?.url).toHaveLength(MAX_CONNECTION_STRING);
    expect(by.get('H1')!.credential).toHaveLength(MAX_CREDENTIAL);
    expect(by.get('H2')!.entity.connection).toBeUndefined();
    expect(by.get('H3')!.entity.connection).toBeDefined();
    expect(by.get('H3')!.credential).toBeUndefined();
  });

  test('prototype keys are no host type and no inherited value', () => {
    const r = readOrcaInstances(
      user({
        __proto__x: { host_type: 'constructor', print_host: 'http://p' },
        Q: { host_type: '__proto__', print_host: 'http://q' },
      }),
      tree,
    );
    expect(r.instances.every((i) => i.entity.connection === undefined)).toBe(true);
    expect(r.diagnostics.filter((d) => d.code === 'unknown-type')).toHaveLength(2);
  });
});
