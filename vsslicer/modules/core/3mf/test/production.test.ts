// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { DETECTED_EXTENSIONS, InvalidPartEditError, openPackage, readProject } from '../src/index.ts';
import { coreNs, minimalEntries } from './support/minimalPackage.ts';
import { buildZip } from './support/zipBuilder.ts';

const PROD = 'http://schemas.microsoft.com/3dmanufacturing/production/2015/06';
const model = (body: string, req = 'p', ns = PROD) =>
  `<model unit="millimeter" xmlns="${coreNs}" xmlns:p="${PROD}" xmlns:x="${ns}" requiredextensions="${req}">${body}</model>`;
const tri =
  '<mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/></vertices><triangles><triangle v1="0" v2="1" v3="2"/></triangles></mesh>';
const meshModel = (req = 'p', ns = PROD) =>
  model(`<resources><object id="1">${tri}</object></resources><build/>`, req, ns);
// Root object 1 is a component pointing at object 1 of a sub-model (same id, other part), moved by 10 in x.
const rootVia = (path: string) =>
  model(
    `<resources><object id="1" name="holder"><components><component objectid="1" p:path="${path}" transform="1 0 0 0 1 0 0 0 1 10 0 0"/></components></object></resources><build><item objectid="1"/></build>`,
  );
const open = (parts: Record<string, string | null>) => openPackage(buildZip(minimalEntries(parts)));

describe('production sub-models in generated packages', () => {
  test('a component p:path resolves into the sub-model, without UUIDs', () => {
    const p = readProject(
      open({ '3D/3dmodel.model': rootVia('/3D/Objects/a.model'), '3D/Objects/a.model': meshModel() }),
    );
    expect(p.objects).toHaveLength(1);
    expect(p.objects[0]!.name).toBe('holder');
    expect(p.objects[0]!.parts.map((x) => [x.mesh.triangles.length, x.transform[9]])).toEqual([[3, 10]]);
  });

  test('a build item p:path resolves', () => {
    const root = model('<resources/><build><item objectid="1" p:path="/3D/Objects/a.model"/></build>');
    const p = readProject(open({ '3D/3dmodel.model': root, '3D/Objects/a.model': meshModel() }));
    expect(p.instances).toHaveLength(1);
    expect(p.objects[0]!.parts[0]!.mesh.triangles.length).toBe(3);
  });

  test('a path to a missing part, from the root or a sub-model, gives the typed error naming it', () => {
    const missing = expect.objectContaining({ code: 'missing-production-part', path: '/3D/Objects/gone.model' });
    expect(() => open({ '3D/3dmodel.model': rootVia('/3D/Objects/gone.model') })).toThrow(missing);
    const nested = model(
      '<resources><object id="1"><components><component objectid="1" p:path="/3D/Objects/gone.model"/></components></object></resources><build/>',
    );
    expect(() => open({ '3D/3dmodel.model': rootVia('/3D/Objects/a.model'), '3D/Objects/a.model': nested })).toThrow(
      missing,
    );
    expect(() => open({ '3D/3dmodel.model': rootVia('/3D/Objects/gone.model') })).toThrow(
      /refers to the part "\/3D\/Objects\/gone.model"/,
    );
  });

  test("a sub-model's own required extensions are checked", () => {
    const root = rootVia('/3D/Objects/a.model');
    const withSub = (sub: string) => open({ '3D/3dmodel.model': root, '3D/Objects/a.model': sub });
    expect(() => withSub(meshModel('p x', 'urn:x:unknown'))).toThrow(
      expect.objectContaining({ code: 'unsupported-required-extension', extension: 'urn:x:unknown' }),
    );
    const slice = withSub(meshModel('x', 'http://schemas.microsoft.com/3dmanufacturing/slice/2015/07'));
    expect(slice.readOnly).toMatch(/requires Slice.*read-only/);
  });
});

describe('detected extensions open read-only', () => {
  test.each([...DETECTED_EXTENSIONS])('%s (%s)', (ns, name) => {
    const pkg = open({
      '3D/3dmodel.model': model(
        `<resources><object id="1">${tri}</object></resources><build><item objectid="1"/></build>`,
        'p x',
        ns,
      ),
    });
    expect(pkg.readOnly).toContain(name);
    expect(() => pkg.replacePart('3D/3dmodel.model', new Uint8Array())).toThrow(InvalidPartEditError);
    expect(() => pkg.addPart('a.txt', 'text/plain', new Uint8Array())).toThrow(/read-only/);
    expect(() => pkg.removePart('3D/3dmodel.model')).toThrow(/read-only/);
  });

  test('a supported-only package is writable', () => {
    const pkg = open({ '3D/3dmodel.model': meshModel() });
    expect(pkg.readOnly).toBeUndefined();
  });
});

describe('real files', () => {
  const repos = join(import.meta.dirname, '../../../../.reference/repos');
  const cases: [string, number][] = [
    // [file, objects]: every one keeps its meshes in 3D/Objects/*.model.
    ['BambuStudio/resources/calib/pressure_advance/pa_pattern.3mf', 1],
    ['OrcaSlicer/resources/handy_models/OrcaBadge.3mf', 3],
    ['PrusaSlicer/src/slic3r-shared/test/data/test_3mf/production_ext.3mf', 1],
  ];
  test.each(cases.filter(([f]) => existsSync(join(repos, f))))('%s resolves its sub-models', (f, objects) => {
    const pkg = openPackage(readFileSync(join(repos, f)));
    expect(pkg.readOnly).toBeUndefined();
    const p = readProject(pkg);
    expect(p.objects).toHaveLength(objects);
    const triangles = p.objects.flatMap((o) => o.parts).reduce((n, x) => n + x.mesh.triangles.length / 3, 0);
    expect(triangles).toBeGreaterThan(0);
  });

  test.each(
    [
      ['3mf-spec-booleans/Examples/booleans_operations.3mf', 'Boolean Operations'],
      ['3mf-spec-displacement/Examples/CubeDisplacement_oneside.3mf', 'Displacement'],
    ].filter(([f]) => existsSync(join(repos, f!))),
  )('%s opens read-only naming %s', (f, name) => {
    expect(openPackage(readFileSync(join(repos, f!))).readOnly).toContain(name);
  });
});
