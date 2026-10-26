// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { readModel } from '../src/adapters/model/readModel.ts';
import { composeTransforms, resolveProject } from '../src/adapters/model/resolveProject.ts';
import { openPackage } from '../src/index.ts';
import type { Transform } from '../src/index.ts';
import { MalformedXmlError } from '../src/index.ts';
import { coreNs } from './support/minimalPackage.ts';

const enc = new TextEncoder();
const MAT = 'http://schemas.microsoft.com/3dmanufacturing/material/2015/02';
const PROD = 'http://schemas.microsoft.com/3dmanufacturing/production/2015/06';
const model = (body: string): string =>
  `<model unit="millimeter" xmlns="${coreNs}" xmlns:m="${MAT}" xmlns:p="${PROD}">${body}</model>`;
const parse = (xml: string) => readModel(enc.encode(xml), 'm.model');
const quad = (attrs = '', tri = ['', '']) =>
  `<mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="1" y="1" z="0"/><vertex x="0" y="1" z="0"/></vertices>` +
  `<triangles><triangle v1="0" v2="1" v3="2" ${tri[0]}/><triangle v1="0" v2="2" v3="3" ${tri[1]}/></triangles></mesh>`.replace(
    '',
    attrs,
  );
const apply = (t: Transform, p: [number, number, number]) => [
  p[0] * t[0] + p[1] * t[3] + p[2] * t[6] + t[9],
  p[0] * t[1] + p[1] * t[4] + p[2] * t[7] + t[10],
  p[0] * t[2] + p[1] * t[5] + p[2] * t[8] + t[11],
];

describe('transforms', () => {
  test('compose applies the first transform first (row vectors)', () => {
    const rotZ90: Transform = [0, 1, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0];
    const move: Transform = [1, 0, 0, 0, 1, 0, 0, 0, 1, 10, 0, 0];
    // (1,0,0) rotated to (0,1,0), then moved to (10,1,0).
    expect(apply(composeTransforms(rotZ90, move), [1, 0, 0])).toEqual([10, 1, 0]);
    // Reverse order: moved to (11,0,0), then rotated to (0,11,0).
    expect(apply(composeTransforms(move, rotZ90), [1, 0, 0])).toEqual([0, 11, 0]);
  });

  test('nested components compose child, then parent, and items stay on the instance', () => {
    const m = parse(
      model(`<resources>
        <object id="1">${quad()}</object>
        <object id="2"><components><component objectid="1" transform="1 0 0 0 1 0 0 0 1 1 0 0"/></components></object>
        <object id="3" name="asm"><components><component objectid="2" transform="2 0 0 0 2 0 0 0 2 0 5 0"/></components></object>
      </resources><build><item objectid="3" transform="1 0 0 0 1 0 0 0 1 0 0 7"/></build>`),
    );
    const p = resolveProject(m);
    expect(p.dialect).toBe('core');
    expect(p.objects.map((o) => [o.id, o.name, o.parts.length])).toEqual([[3, 'asm', 1]]);
    // (0,0,0) -> +1 x -> scaled x2 -> +5 y
    expect(apply(p.objects[0]!.parts[0]!.transform, [0, 0, 0])).toEqual([2, 5, 0]);
    expect(p.instances).toEqual([{ objectId: 3, transform: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 7] }]);
  });

  test('two instances of one object share one ModelObject', () => {
    const p = resolveProject(
      parse(
        model(
          `<resources><object id="1">${quad()}</object></resources><build><item objectid="1"/><item objectid="1" transform="1 0 0 0 1 0 0 0 1 9 0 0"/></build>`,
        ),
      ),
    );
    expect(p.objects).toHaveLength(1);
    expect(p.instances).toHaveLength(2);
  });

  test('production paths load other parts; id clashes get a free id', () => {
    const root = parse(
      model(`<resources><object id="1">${quad()}</object><object id="5"><components><component objectid="1" p:path="/3D/o.model"/></components></object></resources>
      <build><item objectid="1"/><item objectid="1" p:path="/3D/o.model"/><item objectid="5"/></build>`),
    );
    const other = parse(model(`<resources><object id="1" name="far">${quad()}</object></resources>`));
    const p = resolveProject(root, 'r', (path) => (path === '/3D/o.model' ? other : undefined));
    expect(p.objects.map((o) => [o.id, o.name])).toEqual([
      [1, 'object 1'],
      [2, 'far'],
      [5, 'object 5'],
    ]);
    expect(p.instances.map((i) => i.objectId)).toEqual([1, 2, 5]);
    expect(p.objects[2]!.parts[0]!.name).toBe('far');
  });

  test.each([
    ['cycle', '<object id="1"><components><component objectid="1"/></components></object>'],
    ['missing component', '<object id="1"><components><component objectid="9"/></components></object>'],
  ])('%s throws MalformedXmlError', (_n, obj) => {
    const m = parse(model(`<resources>${obj}</resources><build><item objectid="1"/></build>`));
    expect(() => resolveProject(m)).toThrow(MalformedXmlError);
  });

  test('a production part the loader lacks throws MissingProductionPartError naming it', () => {
    const m = parse(
      model(
        '<resources><object id="1"><components><component objectid="1" p:path="/x.model"/></components></object></resources><build><item objectid="1"/></build>',
      ),
    );
    expect(() => resolveProject(m)).toThrow(
      expect.objectContaining({ code: 'missing-production-part', path: '/x.model' }),
    );
  });

  // Production ids are per part: root object 1 naming object 1 of another part is not a cycle.
  const pathRoot = parse(
    model(
      '<resources><object id="1"><components><component objectid="1" p:path="/3D/Objects/o.model"/></components></object></resources><build><item objectid="1"/></build>',
    ),
  );
  test('the same object id in the root and a production part is not a cycle', () => {
    const ext = parse(model(`<resources><object id="1">${quad()}</object></resources>`));
    const p = resolveProject(pathRoot, 'r', (path) => (path === '/3D/Objects/o.model' ? ext : undefined));
    expect(p.objects.map((o) => [o.id, o.parts.length])).toEqual([[1, 1]]);
  });

  test('a cycle inside a production part still throws', () => {
    const ext = parse(
      model('<resources><object id="1"><components><component objectid="1"/></components></object></resources>'),
    );
    expect(() => resolveProject(pathRoot, 'r', () => ext)).toThrow(/cycle/);
  });

  test('a build item naming a missing object throws', () => {
    expect(() => resolveProject(parse(model('<resources/><build><item objectid="4"/></build>')))).toThrow(
      MalformedXmlError,
    );
  });
});

describe('materials', () => {
  const res = `<basematerials id="10"><base name="red" displaycolor="#FF0000"/><base name="blue" displaycolor="#0000FFCC"/></basematerials>
    <m:colorgroup id="11"><m:color color="#00FF00"/></m:colorgroup>`;

  test('object-level base material and colour group', () => {
    const p = resolveProject(
      parse(
        model(`<resources>${res}<object id="1" pid="10" pindex="1">${quad()}</object><object id="2" pid="11" pindex="0">${quad()}</object></resources>
        <build><item objectid="1"/><item objectid="2"/></build>`),
      ),
    );
    expect(p.objects.map((o) => o.parts[0]!.material)).toEqual([{ color: '#0000FFCC' }, { color: '#00FF00' }]);
  });

  test('per-triangle properties split the mesh by colour, falling back to the object default', () => {
    const p = resolveProject(
      parse(
        model(
          `<resources>${res}<object id="1" pid="10" pindex="0">${quad('', ['pid="11" p1="0"', ''])}</object></resources><build><item objectid="1"/></build>`,
        ),
      ),
    );
    const parts = p.objects[0]!.parts;
    expect(parts.map((x) => [x.material?.color, x.mesh.triangles.length])).toEqual([
      ['#00FF00', 3],
      ['#FF0000', 3],
    ]);
    expect(parts.map((x) => x.id)).toEqual([0, 1]);
  });

  test('same colour on all triangles stays one part; no properties means no material', () => {
    const same = resolveProject(
      parse(
        model(
          `<resources>${res}<object id="1">${quad('', ['pid="10" p1="1"', 'pid="10" p1="1"'])}</object><object id="2">${quad()}</object></resources><build><item objectid="1"/><item objectid="2"/></build>`,
        ),
      ),
    );
    expect(same.objects[0]!.parts).toHaveLength(1);
    expect(same.objects[0]!.parts[0]!.material).toEqual({ color: '#0000FFCC' });
    expect(same.objects[1]!.parts[0]!.material).toBeUndefined();
  });

  test.each([
    ['unknown group', '<object id="1" pid="99" pindex="0">Q</object>'],
    ['index out of range', '<object id="1" pid="10" pindex="5">Q</object>'],
  ])('%s throws', (_n, obj) => {
    const m = parse(
      model(`<resources>${res}${obj.replace('Q', quad())}</resources><build><item objectid="1"/></build>`),
    );
    expect(() => resolveProject(m)).toThrow(MalformedXmlError);
  });
});

describe('real files', () => {
  const repos = join(import.meta.dirname, '../../../../.reference/repos');
  const files = existsSync(repos)
    ? [...['prusai3_xl_platform', 'voron2_250_bed'].map((n) => join(repos, `Cura/resources/meshes/${n}.3mf`))].filter(
        existsSync,
      )
    : [];
  test.skipIf(files.length === 0)('resolve without throwing and give at least one instance with triangles', () => {
    for (const f of files) {
      const pkg = openPackage(readFileSync(f));
      const bytes = (n: string) => pkg.parts.find((p) => p.name === n)?.bytes;
      const root = readModel(bytes(pkg.rootModel)!, pkg.rootModel);
      const p = resolveProject(root, pkg.rootModel, (path) => {
        const b = bytes(path.replace(/^\//, ''));
        return b && readModel(b, path);
      });
      expect(p.instances.length, f).toBeGreaterThan(0);
      expect(
        p.objects.some((o) => o.parts.some((x) => x.mesh.triangles.length > 0)),
        f,
      ).toBe(true);
    }
  });
});

describe('component fan-out bounds (rule 25)', () => {
  // Object 0 is the mesh; object n has 10 components of object n-1, so 10^levels leaves.
  const fanOut = (levels: number, mesh = quad()): string => {
    let body = `<object id="0">${mesh}</object>`;
    for (let i = 1; i <= levels; i++)
      body += `<object id="${i}"><components>${`<component objectid="${i - 1}"/>`.repeat(10)}</components></object>`;
    return model(`<resources>${body}</resources><build><item objectid="${levels}"/></build>`);
  };

  test('the 8-level fan-out is refused fast and without a heap blow-up', () => {
    const xml = fanOut(8);
    expect(xml.length).toBeLessThan(4000);
    const heap = process.memoryUsage().heapUsed;
    const t0 = performance.now();
    expect(() => resolveProject(parse(xml))).toThrow(MalformedXmlError);
    expect(() => resolveProject(parse(xml))).toThrow(/components expand to more than 100000 parts/);
    expect(performance.now() - t0).toBeLessThan(1000);
    expect(process.memoryUsage().heapUsed - heap).toBeLessThan(100 * 1024 * 1024);
  });

  test('a fan-out under the caps still resolves', () => {
    expect(resolveProject(parse(fanOut(3))).objects[0]!.parts).toHaveLength(1000);
  });

  test('the triangle cap is hit before the part cap', () => {
    // 1000 leaves of 20,000 triangles = 20 M triangles, with only 1000 parts.
    const n = 20_000;
    const mesh =
      '<mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/></vertices><triangles>' +
      '<triangle v1="0" v2="1" v3="2"/>'.repeat(n) +
      '</triangles></mesh>';
    expect(() => resolveProject(parse(fanOut(3, mesh)))).toThrow(/more than 100000 parts or 10000000 triangles/);
    expect(resolveProject(parse(fanOut(2, mesh))).objects[0]!.parts).toHaveLength(100);
  });
});
