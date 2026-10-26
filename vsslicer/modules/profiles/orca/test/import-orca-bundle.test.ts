// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { zipSync } from 'fflate';
import { describe, expect, test } from 'vitest';
import { importOrcaBundle } from '../src/adapters/bundles/orca/import-orca-bundle.ts';
import { writeBundleArchive } from '../src/adapters/archive/bundle-archive.ts';

const enc = (o: unknown) => new TextEncoder().encode(JSON.stringify(o));
const fixture = (p: string) => new Uint8Array(readFileSync(new URL(`./fixtures/bundles/${p}`, import.meta.url)));
const kinds = (r: ReturnType<typeof importOrcaBundle>) =>
  r.entities.map((e) => ('technology' in e ? 'printer' : 'type' in e ? 'filament' : 'process'));

describe('importOrcaBundle', () => {
  test('the Orca fixture imports one printer, one filament and one process', () => {
    const r = importOrcaBundle(fixture('orca-documented/documented.orca_printer'));
    expect(kinds(r)).toEqual(['printer', 'filament', 'process']);
    expect(r.entities.map((e) => e.id)).toEqual(['Example Printer 0.4 nozzle', 'Example PLA', '0.20mm Example']);
    expect(Object.keys(r.native)).toEqual(r.entities.map((e) => e.id));
    expect(r.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  });

  test('values come from the preset; absent ones are placeholders with a warning', () => {
    const r = importOrcaBundle(
      writeBundleArchive({
        name: 'B',
        clock: '1',
        printer: [
          {
            fileName: 'P.json',
            data: enc({ name: 'P', type: 'machine', printable_area: ['0x0', '200x0', '200x100', '0x100'] }),
          },
        ],
        filament: [
          {
            fileName: 'F.json',
            data: enc({ name: 'F', type: 'filament', filament_type: ['PETG'], filament_diameter: ['2.85'] }),
          },
          { fileName: 'G.json', data: enc({ name: 'G', type: 'filament' }) },
        ],
        process: [
          { fileName: 'A.json', data: enc({ name: 'A', type: 'process', layer_height: '0.28' }) },
          { fileName: 'B.json', data: enc({ name: 'B', type: 'process' }) },
        ],
      }),
    );
    const by = (id: string) => r.entities.find((e) => e.id === id) as never as Record<string, unknown>;
    expect(by('P')['bed']).toEqual({
      shape: [
        [0, 0],
        [200, 0],
        [200, 100],
        [0, 100],
      ],
      max_height: 0,
    });
    expect([by('F')['type'], by('F')['diameter']]).toEqual(['PETG', 2.85]);
    expect([by('G')['type'], by('G')['diameter']]).toEqual(['unknown', 1.75]);
    expect([by('A')['layer_height'], by('B')['layer_height']]).toEqual([0.28, 0.2]);
    expect(r.diagnostics.map((d) => [d.severity, d.file, d.message.split(' ')[0]])).toEqual([
      ['warning', 'filament/G.json', 'filament_type'],
      ['warning', 'filament/G.json', 'filament_diameter'],
      ['warning', 'process/B.json', 'layer_height'],
    ]);
  });

  test('a listed file missing from the archive gives a diagnostic and the rest imports', () => {
    const manifest = {
      version: '',
      bundle_id: 'x',
      bundle_type: 'printer config bundle',
      printer_config: ['printer/gone.json'],
      filament_config: ['filament/F.json'],
      process_config: [],
    };
    const zip = zipSync({
      'filament/F.json': enc({ name: 'F', type: 'filament', filament_type: ['PLA'] }),
      'bundle_structure.json': enc(manifest),
    });
    const r = importOrcaBundle(zip);
    expect(r.entities.map((e) => e.id)).toEqual(['F']);
    const d = r.diagnostics.find((x) => x.file === 'printer/gone.json');
    expect(d).toMatchObject({ severity: 'error', code: 'unreadable-folder' });
  });

  test('an in-bundle parent links; a vendor parent stays in native', () => {
    const r = importOrcaBundle(
      zipSync({
        'filament/A.json': enc({ name: 'A', type: 'filament', inherits: 'Generic PLA' }),
        'filament/B.json': enc({ name: 'B', type: 'filament', inherits: 'A' }),
      }),
    );
    const by = (id: string) => r.entities.find((e) => e.id === id)! as { inherits?: string[] };
    expect(by('B').inherits).toEqual(['A']);
    expect(by('A').inherits).toBeUndefined();
    expect(r.native['A']).toMatchObject({ inherits: 'Generic PLA' });
  });

  test('presets of different kinds with one name keep the first; `__proto__` is a plain id', () => {
    const r = importOrcaBundle(
      zipSync({
        'printer/__proto__.json': enc({ name: '__proto__', type: 'machine' }),
        'process/__proto__.json': enc({ name: '__proto__', type: 'process', layer_height: '0.2' }),
      }),
    );
    expect(r.entities).toHaveLength(1);
    expect(Object.keys(r.native)).toEqual(['__proto__']);
    expect(r.diagnostics.some((d) => d.severity === 'error' && d.file === 'process/__proto__.json')).toBe(true);
  });

  test('an archive that is refused gives one error diagnostic, not a throw; unlisted and foreign entries are ignored', () => {
    const bad = importOrcaBundle(new TextEncoder().encode('not a zip'));
    expect(bad.entities).toEqual([]);
    expect(bad.diagnostics).toMatchObject([{ severity: 'error' }]);
    const manifest = {
      version: '',
      bundle_id: 'x',
      bundle_type: 'printer config bundle',
      filament_config: ['filament/F.json'],
    };
    const r = importOrcaBundle(
      zipSync({
        'filament/F.json': enc({ name: 'F', type: 'filament' }),
        'filament/Unlisted.json': enc({ name: 'Unlisted', type: 'filament' }),
        'printer/model.stl': new Uint8Array([1]),
        'bundle_structure.json': enc(manifest),
      }),
    );
    expect(r.entities.map((e) => e.id)).toEqual(['F']);
  });

  test('without a manifest every preset JSON in the three folders is read; other entries are ignored', () => {
    const r = importOrcaBundle(
      zipSync({
        'filament/F.json': enc({ name: 'F', type: 'filament' }),
        'printer/model.stl': new Uint8Array([1]),
        'process/sub/deep.json': enc({ name: 'deep', type: 'process' }),
        'other/x.json': enc({ name: 'x', type: 'process' }),
      }),
    );
    expect(r.entities.map((e) => e.id)).toEqual(['F']);
    expect(r.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  });

  test('diagnostic file and message are clipped to exactly 300 characters plus an ellipsis', () => {
    const name = 'n'.repeat(400);
    const r = importOrcaBundle(
      zipSync({
        [`printer/${name}.json`]: enc({ name, type: 'machine' }),
        [`process/${name}.json`]: enc({ name, type: 'process', layer_height: '0.2' }),
      }),
    );
    const d = r.diagnostics.find((x) => x.severity === 'error' && x.code === 'malformed-line')!;
    expect(d.message.length).toBe(303);
    expect(d.file.length).toBe(303);
  });

  test('a printer without printable_area gets a three-point zero bed and a warning; toolheads and max_height come from the preset', () => {
    const r = importOrcaBundle(
      zipSync({
        'printer/P.json': enc({ name: 'P', type: 'machine' }),
        'printer/Q.json': enc({
          name: 'Q',
          type: 'machine',
          printable_area: ['0x0', '10x0', '10x10'],
          nozzle_diameter: ['0.4', '0.6'],
          printable_height: '250',
        }),
      }),
    );
    const by = (id: string) =>
      r.entities.find((e) => e.id === id) as never as {
        bed: { max_height: number };
        toolheads: { count: number };
      };
    expect(by('P').bed).toEqual({
      shape: [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      max_height: 0,
    });
    expect(by('P').toolheads.count).toBe(1);
    expect(by('Q').toolheads.count).toBe(2);
    expect(by('Q').bed.max_height).toBe(250);
    expect(r.diagnostics.map((d) => [d.severity, d.file, d.message.split(' ')[0]])).toEqual([
      ['warning', 'printer/P.json', 'printable_area'],
    ]);
  });
});
