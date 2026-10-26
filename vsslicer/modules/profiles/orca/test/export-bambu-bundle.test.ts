// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { exportBambuBundle } from '../src/adapters/bundles/bambu/export-bambu-bundle.ts';
import { importBambuBundle } from '../src/adapters/bundles/bambu/import-bambu-bundle.ts';
import { readBundleArchive, writeBundleArchive } from '../src/adapters/archive/bundle-archive.ts';

const load = (p: string) => new Uint8Array(readFileSync(new URL(`./fixtures/bundles/${p}`, import.meta.url)));
const saved = load('bambu-studio-saved-presets/saved-presets.bbscfg');
const documented = load('bambu-documented/documented.bbscfg');
const opts = { name: 'Bambu-Studio-saved-presets', clock: '20261026120000' };
const enc = (o: unknown) => new TextEncoder().encode(JSON.stringify(o));
const text = (b: Uint8Array | undefined) => new TextDecoder().decode(b);
// The export adds the `*_settings_id` Studio needs when a preset lacks it; compare without it.
const bare = (es: ReturnType<typeof importBambuBundle>['entities']) =>
  es.map((e) => ({
    ...e,
    settings: Object.fromEntries(
      Object.entries((e as { settings: object }).settings).filter(([k]) => !k.endsWith('_settings_id')),
    ),
  }));
const errors = (r: ReturnType<typeof importBambuBundle>) => r.diagnostics.filter((d) => d.severity === 'error');

describe('exportBambuBundle', () => {
  test('a Studio-saved bundle re-exports byte-identically', () => {
    const r = importBambuBundle(saved);
    expect(exportBambuBundle(r.entities, r.native, opts)).toEqual(saved);
  });

  test('import(export(x)) equals x for every fixture and for each single preset', () => {
    for (const f of [saved, documented]) {
      const r = importBambuBundle(f);
      const sets = [r.entities, ...r.entities.map((e) => [e])];
      for (const sel of sets) {
        const back = importBambuBundle(exportBambuBundle(sel, r.native, opts));
        expect(bare(back.entities)).toEqual(bare(sel));
        expect(errors(back)).toEqual([]);
      }
    }
  });

  test('a .bbsflmt holds only filaments and round-trips', () => {
    const r = importBambuBundle(saved);
    const flmt = exportBambuBundle(r.entities, r.native, { ...opts, kind: 'filament' });
    expect([...readBundleArchive(flmt).entries.keys()]).toEqual(['filament/Generic PLA - Copy.json']);
    const back = importBambuBundle(flmt, 'x.bbsflmt');
    expect(back.entities).toEqual(r.entities.filter((e) => 'type' in e));
    expect(errors(back)).toEqual([]);
  });

  test('nil, setting_id, filament_id and version survive', () => {
    const src = importBambuBundle(
      writeBundleArchive({
        ...opts,
        filament: [
          {
            fileName: 'F.json',
            data: enc({
              name: 'F',
              from: 'System',
              filament_id: 'P0123',
              setting_id: 'S1',
              version: '1.0.0.1',
              k: ['nil', '1'],
              z: 'nil',
            }),
          },
        ],
      }),
    );
    const back = importBambuBundle(exportBambuBundle(src.entities, src.native, opts));
    expect(back.native.F).toMatchObject({
      from: 'System',
      version: '1.0.0.1',
      external_ids: { setting_id: 'S1', filament_id: 'P0123' },
    });
    expect(bare(back.entities)).toEqual(bare(src.entities));
    expect(back.entities[0]).toMatchObject({ settings: { k: [null, '1'], z: null } });
  });

  test('no host, credential or account id reaches the output', () => {
    const src = importBambuBundle(
      writeBundleArchive({
        ...opts,
        printer: [
          {
            fileName: 'P.json',
            data: enc({
              name: 'P',
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
      }),
    );
    const files = readBundleArchive(exportBambuBundle(src.entities, src.native, opts));
    const p = JSON.parse(text(files.entries.get('printer/P.json'))) as Record<string, unknown>;
    expect(Object.keys(p)).toEqual(['from', 'inherits', 'name', 'nozzle_diameter', 'printer_settings_id', 'version']);
    expect(files.manifest?.bundleId).toBe('offline_Bambu-Studio-saved-presets_20261026120000');
    expect(files.manifest?.version).toBe('');
  });

  test('a preset with no imported data still carries what Studio needs to load it', () => {
    const files = readBundleArchive(
      exportBambuBundle(
        [
          { id: 'P', name: 'P', technology: 'fdm', settings: {} },
          { id: 'F', name: 'F', type: 'PLA', settings: {} },
          { id: 'Q', name: 'Q', settings: {} },
        ] as never,
        { P: { from: { x: 1 } } },
        opts,
      ),
    );
    const j = (k: string) => JSON.parse(text(files.entries.get(k))) as Record<string, unknown>;
    expect(j('printer/P.json')).toMatchObject({ from: 'User', version: '1.0.0.0', printer_settings_id: 'P' });
    expect(j('filament/F.json')).toMatchObject({ from: 'User', version: '1.0.0.0', filament_settings_id: ['F'] });
    expect(j('process/Q.json')).toMatchObject({ from: 'User', version: '1.0.0.0', print_settings_id: 'Q' });
  });

  test('an unsafe name is refused', () => {
    const r = importBambuBundle(saved);
    expect(() => exportBambuBundle([{ ...r.entities[1]!, name: '../x' } as never], {}, opts)).toThrow(
      /unsafe preset file name/,
    );
  });
});
