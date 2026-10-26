// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { unzipSync } from 'fflate';
import { describe, expect, test } from 'vitest';
import {
  createBambuReader,
  MAX_AREA_POINTS,
  MAX_CONFIG_BYTES,
  parsePrintableArea,
} from '../src/adapters/bambu/readBambu.ts';
import { readProject as readCore } from '../src/adapters/model/resolveProject.ts';
import { readModel } from '../src/adapters/model/readModel.ts';
import { createReadProject } from '../src/application/readProject.ts';
import type { Package } from '../src/domain/package.ts';
import { openPackage } from '../src/openPackage.ts';
import { minimalEntries, triangleModel } from './support/minimalPackage.ts';
import { buildZip } from './support/zipBuilder.ts';

const enc = new TextEncoder();
// Same wiring as the release line for src/readProject.ts.
const readProject = createReadProject({
  readCore,
  readMetadata: (pkg) =>
    readModel(pkg.parts.find((p) => p.name === pkg.rootModel)?.bytes ?? new Uint8Array(), pkg.rootModel).metadata,
  readers: new Map([
    ['bambu', createBambuReader('bambu')],
    ['orca', createBambuReader('orca')],
  ]),
});

const model = (app: string, extra = ''): string =>
  triangleModel.replace('<resources>', `<metadata name="Application">${app}</metadata>${extra}\n <resources>`);
const projectSettings = `{\n    "printable_area": [\n        "0x0",\n        "256x0",\n        "256x256",\n        "0x256"\n    ],\n    "version": "2.3.0.0"\n}\n`;
const presets: Record<string, string> = {
  'Metadata/process_settings_1.config': '{"print_settings_id": "0.20mm Standard"}',
  'Metadata/filament_settings_1.config': '{"filament_settings_id": ["PLA \\u00e9"]}',
  'Metadata/machine_settings_1.config': '{"printer_settings_id": "X1C"}',
  'Metadata/print_setting_1.config': 'layer_height = 0.2\n',
};
const fixture = (app: string, settings: string | null = projectSettings, extra = ''): Package =>
  openPackage(
    buildZip(
      minimalEntries({
        '3D/3dmodel.model': model(app, extra),
        'Metadata/project_settings.config': settings,
        'Metadata/model_settings.config': '<config/>',
        ...presets,
      }),
    ),
  );

describe('bambu/orca reader', () => {
  test.each([
    ['BambuStudio-02.06.00.51', '', 'bambu'],
    ['BambuStudio-02.06.00.51', '<metadata name="OrcaSlicer">2.5.0</metadata>', 'orca'],
    ['OrcaSlicer-2.3.0', '', 'orca'],
  ])('%s %s reads as %s with the raw config byte for byte', (app, extra, dialect) => {
    const p = readProject(fixture(app, projectSettings, extra));
    expect(p.dialect).toBe(dialect);
    expect(p.notices).toBeUndefined();
    expect([...p.rawConfig.keys()].sort()).toEqual(
      ['Metadata/project_settings.config', ...Object.keys(presets)].sort(),
    );
    expect(p.rawConfig.get('Metadata/project_settings.config')).toEqual(enc.encode(projectSettings));
    for (const [name, text] of Object.entries(presets)) expect(p.rawConfig.get(name)).toEqual(enc.encode(text));
    expect(p.printableArea).toEqual([
      [0, 0],
      [256, 0],
      [256, 256],
      [0, 256],
    ]);
    // Config parts are not preserved twice; other metadata is.
    expect(p.preserved.map((x) => x.name)).toContain('Metadata/model_settings.config');
    expect(p.preserved.some((x) => p.rawConfig.has(x.name))).toBe(false);
    expect(p.objects).toHaveLength(1);
  });

  test('part names match case-insensitively, as upstream iequals / istarts_with', () => {
    const pkg = fixture('OrcaSlicer-2.3.0');
    const renamed = { ...pkg, parts: pkg.parts.map((x) => ({ ...x, name: x.name.replace('Metadata/', 'metadata/') })) };
    expect(readProject(renamed).rawConfig.size).toBe(5);
  });

  test('no printable_area, no area and no notice', () => {
    const p = readProject(fixture('OrcaSlicer-2.3.0', '{"a": "1"}'));
    expect(p.printableArea).toBeUndefined();
    expect(p.notices).toBeUndefined();
  });

  test('a config that is not JSON stays raw, with a notice', () => {
    const p = readProject(fixture('OrcaSlicer-2.3.0', '{nope'));
    expect(p.dialect).toBe('orca');
    expect(p.rawConfig.get('Metadata/project_settings.config')).toEqual(enc.encode('{nope'));
    expect(p.printableArea).toBeUndefined();
    expect(p.notices?.[0]).toMatch(/is not JSON/);
  });

  test('an oversized config is not parsed', () => {
    const big = '{"printable_area": ["0x0"]}' + ' '.repeat(MAX_CONFIG_BYTES);
    const pkg: Package = {
      rootModel: '3D/3dmodel.model',
      parts: [
        { name: '3D/3dmodel.model', contentType: 'x', relationships: [], bytes: enc.encode(triangleModel) },
        { name: 'Metadata/project_settings.config', contentType: 'x', relationships: [], bytes: enc.encode(big) },
      ],
    };
    const p = createBambuReader('bambu')(pkg);
    expect(p.printableArea).toBeUndefined();
    expect(p.notices?.[0]).toMatch(/larger than/);
  });

  test('a bad area leaves it absent with a notice', () => {
    const p = readProject(fixture('OrcaSlicer-2.3.0', '{"printable_area": ["0x0", "1xq"]}'));
    expect(p.printableArea).toBeUndefined();
    expect(p.notices?.[0]).toMatch(/not XxY/);
  });
});

describe('parsePrintableArea', () => {
  test('a string is split on commas, as a JSON list joins', () => {
    expect(parsePrintableArea('0x0,10.5x-2')).toEqual([
      [0, 0],
      [10.5, -2],
    ]);
  });
  test.each([
    [['0x0', 1], /not a string/],
    [{}, /not a string/],
    ['0x0|1x1', /exclusion-volume/],
    ['0x0;1x1', /exclusion-volume/],
    ['0..1x1', /exclusion-volume/],
    ['0x', /not XxY/],
    ['x0', /not XxY/],
    ['1x2x3', /not XxY/],
    ['Infinityx0', /not XxY/],
    [Array.from({ length: MAX_AREA_POINTS + 1 }, () => '0x0'), /more than/],
  ])('%j is refused', (value, why) => {
    expect(parsePrintableArea(value)).toMatch(why);
  });
  test('the cap itself is accepted', () => {
    expect(parsePrintableArea(Array.from({ length: MAX_AREA_POINTS }, () => '1x1'))).toHaveLength(MAX_AREA_POINTS);
  });
});

// A real Orca project from .reference (not tracked); skipped when the clone is absent.
const badge = join(__dirname, '../../../../.reference/repos/OrcaSlicer/resources/handy_models/OrcaBadge.3mf');
test.skipIf(!existsSync(badge))('OrcaBadge.3mf (OrcaSlicer@09aa0114): raw project config byte for byte', () => {
  const p = readProject(openPackage(readFileSync(badge)));
  expect(p.dialect).toBe('orca');
  const expected = unzipSync(readFileSync(badge), { filter: (f) => f.name === 'Metadata/project_settings.config' });
  expect(p.rawConfig.get('Metadata/project_settings.config')).toEqual(expected['Metadata/project_settings.config']);
});

test('the k-th build item of an object lands on the plate that lists instance k', () => {
  const plate = (id: number, k: number) =>
    `<plate><metadata key="plater_id" value="${id}"/><model_instance><metadata key="object_id" value="1"/><metadata key="instance_id" value="${k}"/></model_instance></plate>`;
  const pkg = openPackage(
    buildZip(
      minimalEntries({
        '3D/3dmodel.model': model('OrcaSlicer-2.3.0').replace(
          '<item objectid="1"/>',
          '<item objectid="1"/><item objectid="1"/>',
        ),
        'Metadata/model_settings.config': `<config>${plate(1, 0)}${plate(2, 1)}</config>`,
      }),
    ),
  );
  expect(readProject(pkg).instances.map((i) => i.plateId)).toEqual([1, 2]);
});
