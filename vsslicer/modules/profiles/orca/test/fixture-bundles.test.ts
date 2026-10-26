// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { readBundleArchive } from '../src/adapters/archive/bundle-archive.ts';

const dir = new URL('./fixtures/bundles/', import.meta.url);
const load = (p: string) => readBundleArchive(new Uint8Array(readFileSync(new URL(p, dir))));

describe('bundle fixtures', () => {
  test.each([
    ['orca-documented/documented.orca_printer', ['Example Printer 0.4 nozzle', 'Example PLA', '0.20mm Example']],
    ['bambu-documented/documented.bbscfg', ['Example X1 0.4 nozzle', 'Example PETG', '0.16mm Example']],
    [
      'bambu-studio-saved-presets/saved-presets.bbscfg',
      ['Bambu Lab X1 Carbon 0.4 nozzle - NoAuxFan', 'Generic PLA - Copy', '0.20mm Standard ASA-CF'],
    ],
  ])('%s reads with a manifest and one preset of each kind', (file, names) => {
    const r = load(file);
    expect(r.manifest).toBeDefined();
    expect([...r.entries.keys()].map((k) => k.split('/')[0])).toEqual(['printer', 'filament', 'process']);
    const got = [...r.entries.values()].map((b) => JSON.parse(new TextDecoder().decode(b)).name);
    expect(got).toEqual(names);
  });
});
