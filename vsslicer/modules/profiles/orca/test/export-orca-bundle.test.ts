// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { exportOrcaBundle } from '../src/adapters/bundles/orca/export-orca-bundle.ts';
import { importOrcaBundle } from '../src/adapters/bundles/orca/import-orca-bundle.ts';
import { readBundleArchive, writeBundleArchive } from '../src/adapters/archive/bundle-archive.ts';

const fixture = new Uint8Array(
  readFileSync(new URL('./fixtures/bundles/orca-documented/documented.orca_printer', import.meta.url)),
);
const opts = { name: 'Documented-Orca', clock: '20261026120000' };
const enc = (o: unknown) => new TextEncoder().encode(JSON.stringify(o));
const out = (b: Uint8Array) => {
  const a = readBundleArchive(b);
  return { manifest: a.manifest, entries: a.entries };
};

describe('exportOrcaBundle', () => {
  test('export(import(b)) is byte-identical to b for the unmodified Orca fixture', () => {
    const r = importOrcaBundle(fixture);
    expect(exportOrcaBundle(r.entities, r.native, opts)).toEqual(fixture);
  });

  test('import(export(x)) equals x for a bundle, a single printer and a single filament', () => {
    const r = importOrcaBundle(fixture);
    const [printer, filament] = r.entities;
    for (const ids of [[0, 1, 2], [0], [1]]) {
      const sel = ids.map((i) => r.entities[i]!);
      const back = importOrcaBundle(exportOrcaBundle(sel, r.native, opts));
      expect(back.entities).toEqual(sel);
      expect(back.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    }
    expect([printer?.id, filament?.id]).toEqual(['Example Printer 0.4 nozzle', 'Example PLA']);
  });

  test('a file written without a native layout round-trips too', () => {
    const r = importOrcaBundle(fixture);
    const back = importOrcaBundle(exportOrcaBundle(r.entities, {}, opts));
    expect(back.entities.map((e) => 'settings' in e && e.settings)).toEqual(
      r.entities.map((e) => 'settings' in e && e.settings),
    );
  });

  test('the bundle id is offline_ and carries no user id', () => {
    const r = importOrcaBundle(fixture);
    const id = out(exportOrcaBundle(r.entities, r.native, { name: 'Mine', clock: '1' })).manifest?.bundleId;
    expect(id).toBe('offline_Mine_1');
    expect(id).not.toMatch(/^\d/);
  });

  test('host and credential keys are erased from printers, other presets keep theirs', () => {
    const src = importOrcaBundle(
      writeBundleArchive({
        ...opts,
        printer: [
          {
            fileName: 'P.json',
            data: enc({
              name: 'P',
              type: 'machine',
              print_host: '10.0.0.2',
              print_host_webui: 'w',
              printhost_apikey: 'k',
              printhost_cafile: 'c',
              printhost_user: 'u',
              printhost_password: 'p',
              printhost_port: '80',
              nozzle_diameter: ['0.4'],
            }),
          },
        ],
        filament: [{ fileName: 'F.json', data: enc({ name: 'F', type: 'filament', print_host: 'x' }) }],
      }),
    );
    const files = out(exportOrcaBundle(src.entities, src.native, opts)).entries;
    const p = JSON.parse(new TextDecoder().decode(files.get('printer/P.json'))) as Record<string, unknown>;
    expect(Object.keys(p).sort()).toEqual(['from', 'inherits', 'name', 'nozzle_diameter', 'type']);
    expect(JSON.parse(new TextDecoder().decode(files.get('filament/F.json')))).toMatchObject({ print_host: 'x' });
  });

  test('the display name, not the id, names the preset', () => {
    const r = importOrcaBundle(fixture);
    const renamed = { ...r.entities[1]!, id: 'X', name: 'Display' };
    const back = importOrcaBundle(exportOrcaBundle([renamed], {}, opts));
    expect(back.entities.map((e) => [e.id, 'name' in e && e.name])).toEqual([['Display', 'Display']]);
  });

  test('an id that is not a safe file name is refused', () => {
    const r = importOrcaBundle(fixture);
    expect(() => exportOrcaBundle([{ ...r.entities[1]!, id: '../x', name: '../x' }], {}, opts)).toThrow(
      /unsafe preset file name/,
    );
  });
});
