// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { detectDialect } from '../src/domain/detectDialect.ts';
import { openPackage } from '../src/openPackage.ts';
import { readModel } from '../src/adapters/model/readModel.ts';

const md = (o: Record<string, string>) => new Map(Object.entries(o));

describe('detectDialect', () => {
  const cases: [string, Record<string, string>, string[], string][] = [
    ['bambu', { Application: 'BambuStudio-02.08.04.57' }, [], 'bambu'],
    [
      'orca with BambuStudio- Application and OrcaSlicer tag',
      { Application: 'BambuStudio-02.08.01.55', OrcaSlicer: '2.5.0-dev' },
      [],
      'orca',
    ],
    ['orca prefix', { Application: 'OrcaSlicer-2.3.0' }, [], 'orca'],
    ['orca tag, no Application (defensive: Orca never writes it alone)', { OrcaSlicer: '2.5.0' }, [], 'orca'],
    ['prusa 2.9', { Application: 'PrusaSlicer-2.9.6' }, ['Metadata/Slic3r_PE.config'], 'prusa2'],
    ['prusa cut-off is inclusive', { Application: 'PrusaSlicer-2.99.1' }, [], 'prusa2'],
    ['prusa cut-off prerelease of 2.99.1', { Application: 'PrusaSlicer-2.99.1-alpha1' }, [], 'prusa2'],
    ['prusa just past the cut-off', { Application: 'PrusaSlicer-2.99.2' }, [], 'prusa3'],
    ['prusa 3.0 alpha', { Application: 'PrusaSlicer-3.0.0-alpha12' }, [], 'prusa3'],
    ['prusa unparsable version is not legacy', { Application: 'PrusaSlicer-x' }, [], 'prusa3'],
    ['prusa 3 by project part', {}, ['Metadata/PrusaSlicer3_project.json'], 'prusa3'],
    ['prusa 2 by config part', {}, ['Metadata/Slic3r_PE.config'], 'prusa2'],
    ['cura folder', { Application: 'Cura' }, ['3D/3dmodel.model', 'Cura/preferences.cfg'], 'cura'],
    [
      'cura folder wins over a foreign Application',
      { Application: 'BambuStudio-02.03.00.70' },
      ['Cura/preferences.cfg'],
      'cura',
    ],
    [
      'cura folder wins over Orca tag',
      { Application: 'BambuStudio-02.03.00.70', OrcaSlicer: '2.5.0' },
      ['Cura/x'],
      'cura',
    ],
    ['prusa version without patch is legacy', { Application: 'PrusaSlicer-2.9' }, [], 'prusa2'],
    ['prusa version without patch past the cut-off', { Application: 'PrusaSlicer-3.0' }, [], 'prusa3'],
    ['prusa version with four parts is unparsable', { Application: 'PrusaSlicer-2.9.1.1' }, [], 'prusa3'],
    ['cura-like name is not the folder', {}, ['Curaf/x', 'curb/x'], 'core'],
    ['cura folder in another case', {}, ['CURA/x.cfg'], 'cura'],
    ['cura folder with a leading slash', {}, ['/Cura/x.cfg'], 'cura'],
    ['prusa2 config with a leading slash', {}, ['/Metadata/Slic3r_PE.config'], 'prusa2'],
    ['prusa2 config in lower case', {}, ['metadata/slic3r_pe.config'], 'prusa2'],
    ['prusa3 project in another case', {}, ['/METADATA/PrusaSlicer3_Project.json'], 'prusa3'],
    ['unknown writer keeps Application', { Application: 'Fusion 360' }, [], 'core'],
    ['empty', {}, [], 'core'],
  ];
  it.each(cases)('%s', (_n, meta, parts, dialect) => {
    const g = detectDialect(md(meta), parts);
    expect(g.dialect).toBe(dialect);
    expect(g.application).toBe(meta.Application);
  });

  const real = (n: string) => new URL(`./fixtures/real/${n}`, import.meta.url);
  it.for<[string, string]>([
    ['pa_pattern.3mf', 'bambu'],
    ['production_ext.3mf', 'core'],
    ['booleans_operations.3mf', 'core'],
  ])('real fixture %s', ([file, dialect], ctx) => {
    if (!existsSync(real(file))) return ctx.skip(`fixture ${file} is not present`);
    const pkg = openPackage(new Uint8Array(readFileSync(real(file))));
    const root = pkg.parts.find((p) => p.name === pkg.rootModel)!;
    expect(
      detectDialect(
        readModel(root.bytes, root.name).metadata,
        pkg.parts.map((p) => p.name),
      ).dialect,
    ).toBe(dialect);
  });
});
