// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { allSchemas, entitySchemas } from '@vsslicer/profile-api';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { zipSync } from 'fflate';
import { describe, expect, test } from 'vitest';
import { importBambuBundle } from '../src/adapters/bundles/bambu/import-bambu-bundle.ts';

const dir = new URL('./fixtures/bundles/', import.meta.url);
const load = (p: string) => new Uint8Array(readFileSync(new URL(p, dir)));
const enc = (o: unknown) => new TextEncoder().encode(JSON.stringify(o));
const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const sc of allSchemas) ajv.addSchema(sc);
const validators = {
  printer: ajv.compile(entitySchemas.printer_model),
  material: ajv.compile(entitySchemas.material),
  process: ajv.compile(entitySchemas.process),
};
const counts = (r: ReturnType<typeof importBambuBundle>) => ({
  printers: r.entities.filter((e) => 'toolheads' in e && !('slots' in e)).length,
  materials: r.entities.filter((e) => 'diameter' in e && 'type' in e && 'vendor' in e).length,
  processes: r.entities.filter((e) => 'layer_height' in e).length,
});
/** A bundle with a chosen manifest version and one preset of each kind (our own invented data). */
const synthetic = (manifestVersion: string, presetVersion: string, extra: Record<string, Uint8Array> = {}) => {
  const p = 'printer/P.json';
  const f = 'filament/F.json';
  const q = 'process/Q.json';
  return zipSync({
    [p]: enc({
      name: 'P',
      from: 'User',
      setting_id: 'GM001',
      version: presetVersion,
      nozzle_diameter: ['0.4', '0.4'],
      printable_area: ['0x0', '1x0', '1x1'],
    }),
    [f]: enc({ name: 'F', filament_id: 'P0123', filament_type: ['PLA'], version: presetVersion, k: 'nil' }),
    [q]: enc({ name: 'Q', setting_id: 'GP001', version: presetVersion, layer_height: '0.2' }),
    'bundle_structure.json': enc({
      version: manifestVersion,
      bundle_id: 'b',
      bundle_type: 'printer config bundle',
      printer_config: [p],
      filament_config: [f],
      process_config: [q],
    }),
    ...extra,
  });
};

describe('importBambuBundle', () => {
  test.each([
    ['bambu-documented/documented.bbscfg', 'Example X1 0.4 nozzle', 'Example PETG', '0.16mm Example'],
    [
      'bambu-studio-saved-presets/saved-presets.bbscfg',
      'Bambu Lab X1 Carbon 0.4 nozzle - NoAuxFan',
      'Generic PLA - Copy',
      '0.20mm Standard ASA-CF',
    ],
  ])('%s gives one printer, one material, one process', (file, p, m, q) => {
    const r = importBambuBundle(load(file));
    expect(counts(r)).toEqual({ printers: 1, materials: 1, processes: 1 });
    expect(r.entities.map((e) => e.id)).toEqual([p, m, q]);
    expect(r.diagnostics.map((d) => d.code).filter((c) => c === 'unknown-parent')).toHaveLength(3);
    expect(r.entities[1]).toMatchObject({
      inherits: [m.replace(' - Copy', '').replace('Example PETG', 'Generic PETG')],
    });
  });

  test('setting_id and filament_id land in external_ids', () => {
    const r = importBambuBundle(synthetic('', '1.0.0.0'));
    const ids = (id: string) => (r.native[id] as { external_ids: unknown }).external_ids;
    expect(ids('P')).toEqual({ setting_id: 'GM001', filament_id: undefined });
    expect(ids('F')).toEqual({ setting_id: undefined, filament_id: 'P0123' });
    expect(ids('Q')).toEqual({ setting_id: 'GP001', filament_id: undefined });
    expect(r.entities.find((e) => e.id === 'F')).toMatchObject({
      external_ids: { bambu_filament_id: 'P0123' },
      type: 'PLA',
      settings: { k: null },
    });
    expect(r.entities.find((e) => e.id === 'Q')).toMatchObject({ layer_height: 0.2 });
    expect(r.entities.find((e) => e.id === 'P')).toMatchObject({ toolheads: { count: 2 } });
  });

  test('a preset version that differs from the manifest version gives a diagnostic', () => {
    const r = importBambuBundle(synthetic('02.08.02.61', '1.9.0.0'));
    const mismatches = r.diagnostics.filter((d) => d.message.startsWith('version mismatch'));
    expect(mismatches.map((d) => d.file)).toEqual(['printer/P.json', 'filament/F.json', 'process/Q.json']);
    expect(counts(r)).toEqual({ printers: 1, materials: 1, processes: 1 });
    expect(importBambuBundle(synthetic('02.08.02.61', '02.08.02.61')).diagnostics).toEqual([]);
    expect(importBambuBundle(synthetic('', '1.9.0.0')).diagnostics).toEqual([]);
  });

  test('an unsupported manifest version gives an error diagnostic and no entities', () => {
    const r = importBambuBundle(synthetic('v2-beta', '1'), 'x.bbscfg');
    expect(r.entities).toEqual([]);
    expect(r.diagnostics).toMatchObject([{ severity: 'error', file: 'x.bbscfg' }]);
  });

  test('not a zip, bad JSON and clashing stems are diagnostics, not throws', () => {
    expect(importBambuBundle(new Uint8Array([1, 2, 3])).diagnostics).toHaveLength(1);
    const zip = zipSync({
      'printer/A.json': enc({ name: 'A' }),
      'process/A.json': enc({ name: 'A' }),
      'filament/Bad.json': new TextEncoder().encode('{'),
      'filament/Arr.json': enc([]),
      'printer/__proto__.json': enc({ name: 'x', __proto__: 1, constructor: 2 }),
    });
    const r = importBambuBundle(zip);
    expect(r.entities.map((e) => e.id).sort()).toEqual(['A', '__proto__']);
    expect(r.diagnostics.map((d) => d.code)).toContain('invalid-json');
    expect(r.diagnostics.filter((d) => d.message.startsWith('another preset'))).toHaveLength(1);
    expect(Object.getPrototypeOf(r.native)).toBeNull();
    expect(Object.keys(r.native['__proto__' as keyof typeof r.native] as object)).toContain('external_ids');
  });
  test.each(['bambu-documented/documented.bbscfg', 'bambu-studio-saved-presets/saved-presets.bbscfg'])(
    '%s: every entity satisfies the profile-api schema; placeholders get a warning',
    (file) => {
      const r = importBambuBundle(load(file));
      for (const e of r.entities) {
        const v =
          'toolheads' in e ? validators.printer : 'layer_height' in e ? validators.process : validators.material;
        v(e);
        // per-extruder settings arrays are the folder importers' known gap (reported to the coordinator)
        const own = (v.errors ?? []).filter((x) => !x.instancePath.startsWith('/settings'));
        expect(own, JSON.stringify(own)).toEqual([]);
      }
      const warned = r.diagnostics.filter((d) => d.message.endsWith('placeholder used')).map((d) => d.message);
      // both fixtures hold diffs only: no bed, no filament type, no layer height
      expect(warned.map((m) => m.split(' ')[0]).sort()).toEqual(['filament_type', 'layer_height', 'printable_area']);
      expect(r.entities.find((e) => 'layer_height' in e)).toMatchObject({ layer_height: 0.2 });
      expect(r.entities.find((e) => 'diameter' in e)).toMatchObject({ type: 'unknown' });
    },
  );

  test('a parent in the same bundle gives no unknown-parent warning; a missing one does', () => {
    const zip = zipSync({
      'filament/A.json': enc({ name: 'A', inherits: 'Generic PLA' }),
      'filament/B.json': enc({ name: 'B', inherits: 'A' }),
      'process/A.json.json': enc({ name: 'x' }),
      'process/C.json': enc({ name: 'C', inherits: 'B' }),
    });
    const r = importBambuBundle(zip);
    expect(r.diagnostics.filter((d) => d.code === 'unknown-parent').map((d) => d.file)).toEqual([
      'filament/A.json',
      'process/C.json',
    ]);
  });

  test('a printable_area becomes the bed shape', () => {
    const zip = zipSync({ 'printer/P.json': enc({ name: 'P', printable_area: ['0x0', '256x0', '256x250', '0x250'] }) });
    expect(importBambuBundle(zip).entities[0]).toMatchObject({
      bed: {
        shape: [
          [0, 0],
          [256, 0],
          [256, 250],
          [0, 250],
        ],
      },
    });
  });

  test('settings hold neither identity keys nor a prototype; __proto__ and constructor in the JSON are own keys', () => {
    const text = '{"name":"P","inherits":"I","setting_id":"S","__proto__":1,"constructor":2,"k":3}';
    const r = importBambuBundle(zipSync({ 'printer/P.json': new TextEncoder().encode(text) }));
    const settings = (r.entities[0] as { settings: object }).settings;
    expect(Object.getPrototypeOf(settings)).toBeNull();
    expect(Object.keys(settings).sort()).toEqual(['__proto__', 'constructor', 'k']);
  });

  test('input echoed into a message is cut at 200 (parent, stem) and 64 (version) characters', () => {
    const one = (name: string, o: object) =>
      importBambuBundle(zipSync({ [name]: enc(o) })).diagnostics.find((d) => d.code === 'unknown-parent')!.message;
    expect(one('filament/F.json', { inherits: 'p'.repeat(201) })).toContain(`"${'p'.repeat(200)}"`);
    expect(one('filament/F.json', { inherits: 'p'.repeat(201) })).not.toContain('p'.repeat(201));
    expect(one('filament/F.json', { inherits: 'p'.repeat(200) })).toContain(`"${'p'.repeat(200)}"`);
    const m = (v: string) =>
      importBambuBundle(synthetic('1.0', v)).diagnostics.find((d) => d.message.startsWith('version'))!.message;
    expect(m('v'.repeat(65))).toContain(JSON.stringify('v'.repeat(64)));
    expect(m('v'.repeat(65))).not.toContain('v'.repeat(65));
    expect(m('v'.repeat(64))).toContain(JSON.stringify('v'.repeat(64)));
  });

  test('a clashing stem is echoed at most 200 characters', () => {
    const stem = 's'.repeat(201);
    const r = importBambuBundle(zipSync({ [`printer/${stem}.json`]: enc({}), [`process/${stem}.json`]: enc({}) }));
    const m = r.diagnostics.find((d) => d.message.startsWith('another preset'))!.message;
    expect(m).toContain(`"${'s'.repeat(200)}"`);
  });

  test('a listed file missing from the archive is an error and the rest imports', () => {
    const zip = zipSync({
      'printer/P.json': enc({ name: 'P' }),
      'bundle_structure.json': enc({
        version: '',
        bundle_id: 'b',
        bundle_type: 'printer config bundle',
        printer_config: ['printer/P.json', 'printer/Gone.json'],
        filament_config: [],
        process_config: [],
      }),
    });
    const r = importBambuBundle(zip);
    expect(r.entities.map((e) => e.id)).toEqual(['P']);
    expect(r.diagnostics.filter((d) => d.severity === 'error').map((d) => d.file)).toEqual(['printer/Gone.json']);
  });
});
