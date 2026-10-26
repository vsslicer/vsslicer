// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { readModel } from '../src/adapters/model/readModel.ts';
import { openZip } from '../src/adapters/zip/fflateZip.ts';
import { MalformedXmlError } from '../src/index.ts';
import { coreNs, triangleModel } from './support/minimalPackage.ts';

const enc = new TextEncoder();
const read = (xml: string) => readModel(enc.encode(xml), '3D/3dmodel.model');
const model = (body: string, extra = ''): string =>
  `<?xml version="1.0"?><model unit="inch" xmlns="${coreNs}" ${extra}>${body}</model>`;

test('reads the one-triangle model', () => {
  const m = read(triangleModel);
  expect(m.unit).toBe('millimeter');
  expect(m.objects).toHaveLength(1);
  expect([...m.objects[0]!.mesh!.vertices]).toEqual([0, 0, 0, 10, 0, 0, 0, 10, 0]);
  expect([...m.objects[0]!.mesh!.triangles]).toEqual([0, 1, 2]);
  expect(m.build).toEqual([{ objectId: 1, transform: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] }]);
});

test('reads metadata, names, components, transforms, production paths and skips foreign elements', () => {
  const m = read(
    model(
      `<metadata name="Title">  Hi &amp; bye </metadata>
       <resources>
        <object id="2" type="model" name="asm" partnumber="P1"><metadata name="k">v</metadata><components>
          <component objectid="1" transform="1 0 0 0 1 0 0 0 1 5 6 7" p:path="/3D/o.model"/></components></object>
        <x:thing xmlns:x="urn:x"><object id="2"/></x:thing>
       </resources>
       <build><item objectid="2" partnumber="B" transform="1 0 0 0 1 0 0 0 1 1 2 3"/></build>`,
      'xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"',
    ),
  );
  expect(m.unit).toBe('inch');
  expect(m.metadata.get('Title')).toBe('Hi & bye');
  const o = m.objects[0]!;
  expect([o.name, o.partNumber, o.mesh, o.metadata.get('k')]).toEqual(['asm', 'P1', undefined, 'v']);
  expect(o.components[0]).toMatchObject({ objectId: 1, path: '/3D/o.model' });
  expect(o.components[0]!.transform.slice(9)).toEqual([5, 6, 7]);
  expect(m.build[0]).toMatchObject({ objectId: 2, partNumber: 'B' });
});

test.each([
  ['not xml', '<model'],
  ['wrong root', '<model xmlns="urn:other"/>'],
  ['empty', ''],
  [
    'bad number',
    model(
      '<resources><object id="1"><mesh><vertices><vertex x="a" y="0" z="0"/></vertices></mesh></object></resources>',
    ),
  ],
  [
    'index out of range',
    model(
      '<resources><object id="1"><mesh><vertices><vertex x="0" y="0" z="0"/></vertices><triangles><triangle v1="0" v2="0" v3="1"/></triangles></mesh></object></resources>',
    ),
  ],
  ['duplicate id', model('<resources><object id="1"/><object id="1"/></resources>')],
  ['bad transform', model('<build><item objectid="1" transform="1 2"/></build>')],
])('malformed: %s', (_n, xml) => {
  expect(() => read(xml)).toThrow(MalformedXmlError);
});

test('multi-byte text split across chunks decodes', () => {
  const pad = ' '.repeat((1 << 20) - 80);
  const m = read(model(`${pad}<metadata name="n">ééé</metadata>`));
  expect(m.metadata.get('n')).toBe('ééé');
});

test('generated model: counts and values', () => {
  const nv = 50_000;
  const v = Array.from({ length: nv }, (_, i) => `<vertex x="${i}" y="${i / 2}" z="-1.5"/>`).join('');
  const t = Array.from({ length: nv - 2 }, (_, i) => `<triangle v1="${i}" v2="${i + 1}" v3="${i + 2}"/>`).join('');
  const m = read(
    model(
      `<resources><object id="1"><mesh><vertices>${v}</vertices><triangles>${t}</triangles></mesh></object></resources>`,
    ),
  );
  const mesh = m.objects[0]!.mesh!;
  expect(mesh.vertices.length).toBe(nv * 3);
  expect(mesh.triangles.length).toBe((nv - 2) * 3);
  expect(mesh.vertices[nv * 3 - 2]).toBe((nv - 1) / 2);
});

// Real files: counts must equal a regex count of the XML.
const repos = new URL('../../../../.reference/repos/', import.meta.url);
const files = [
  'OrcaSlicer/resources/handy_models/OrcaBadge.3mf',
  'AnycubicSlicerNext/resources/handy_models/3DBenchy.3mf',
  'AnycubicSlicerNext/resources/handy_models/OrcaCube_v2.3mf',
  'AnycubicSlicerNext/resources/handy_models/Stanford_Bunny.3mf',
  '3mf-spec-booleans/Examples/booleans_operations.3mf',
  'Cura/resources/meshes/voron2_250_bed.3mf',
];
test.each(files)('real file %s', (f) => {
  const url = new URL(f, repos);
  if (!existsSync(url)) return;
  const zip = openZip(new Uint8Array(readFileSync(url)));
  const models = zip.entries.filter((e) => e.name.endsWith('.model'));
  expect(models.length).toBeGreaterThan(0);
  let total = 0;
  for (const e of models) {
    const bytes = zip.inflated(e.name);
    const text = new TextDecoder().decode(bytes);
    const m = readModel(bytes, e.name);
    const nv = (text.match(/<vertex /g) ?? []).length;
    const nt = (text.match(/<triangle /g) ?? []).length;
    expect(m.objects.reduce((n, o) => n + (o.mesh?.vertices.length ?? 0) / 3, 0)).toBe(nv);
    expect(m.objects.reduce((n, o) => n + (o.mesh?.triangles.length ?? 0) / 3, 0)).toBe(nt);
    total += nv;
  }
  expect(total).toBeGreaterThan(0);
});

const meshModel = (tri: string, vertexCount = 3): string =>
  model(
    `<resources><object id="1"><mesh><vertices>${'<vertex x="0" y="0" z="0"/>'.repeat(vertexCount)}</vertices><triangles>${tri}</triangles></mesh></object></resources>`,
  );

test.each(['4294967296', '4294967297', '3', '1e0', '0x1', ''])('rejects triangle index %j', (v) => {
  expect(() => read(meshModel(`<triangle v1="${v}" v2="1" v3="2"/>`))).toThrow(MalformedXmlError);
});

test('rejects oversized property indices', () => {
  expect(() => read(meshModel('<triangle v1="0" v2="1" v3="2" pid="1" p1="4294967296"/>'))).toThrow(MalformedXmlError);
});

test.each(['', '0x10', 'NaN', '1e'])('rejects vertex coordinate %j', (v) => {
  expect(() =>
    read(
      model(
        `<resources><object id="1"><mesh><vertices><vertex x="${v}" y="0" z="0"/></vertices></mesh></object></resources>`,
      ),
    ),
  ).toThrow(MalformedXmlError);
});

test('rejects a second mesh in one object', () => {
  const mesh = '<mesh><vertices/><triangles/></mesh>';
  expect(() => read(model(`<resources><object id="1">${mesh}${mesh}</object></resources>`))).toThrow(/more than one/);
});

test('fails fast on 100k nested elements', () => {
  const n = 100_000;
  expect(() => read(model('<a>'.repeat(n) + '</a>'.repeat(n)))).toThrow(MalformedXmlError);
}, 30_000); // hang guard only; the opentag count is asserted in xmlDepth.test.ts
