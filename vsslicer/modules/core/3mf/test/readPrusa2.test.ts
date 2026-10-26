// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { readProject as readCore } from '../src/adapters/model/resolveProject.ts';
import { readModel } from '../src/adapters/model/readModel.ts';
import { MODEL_CONFIG, PRINT_CONFIG, readModelConfig, readPrusa2 } from '../src/adapters/prusa/readPrusa2.ts';
import { createReadProject } from '../src/application/readProject.ts';
import { MalformedXmlError } from '../src/domain/errors.ts';
import type { Package } from '../src/domain/package.ts';
import { openPackage } from '../src/openPackage.ts';
import { coreNs } from './support/minimalPackage.ts';

const enc = new TextEncoder();
const part = (name: string, text: string) => ({ name, contentType: 'x', relationships: [], bytes: enc.encode(text) });
const model = (body: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xmlns="${coreNs}" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"><metadata name="Application">PrusaSlicer-2.9.6</metadata>${body}</model>`;
const config = (body: string) => `<?xml version="1.0" encoding="UTF-8"?><config>${body}</config>`;
const pkg = (modelXml: string, configXml?: string, extra: Package['parts'] = []): Package => ({
  rootModel: '3D/3dmodel.model',
  parts: [
    part('3D/3dmodel.model', modelXml),
    ...(configXml === undefined ? [] : [part(MODEL_CONFIG, configXml)]),
    ...extra,
  ],
});

/** A closed unit tetrahedron at `x`, outward-facing, as 4 vertices and 4 triangles offset by `base`. */
const tetra = (x: number, base = 0, inverted = false): { v: string; t: string } => {
  const v = [
    [x, 0, 0],
    [x + 1, 0, 0],
    [x, 1, 0],
    [x, 0, 1],
  ]
    .map(([a, b, c]) => `<vertex x="${a}" y="${b}" z="${c}"/>`)
    .join('');
  const faces = [
    [0, 2, 1],
    [0, 1, 3],
    [0, 3, 2],
    [1, 2, 3],
  ].map((f) => (inverted ? [f[0]!, f[2]!, f[1]!] : f));
  const t = faces.map((f) => `<triangle v1="${f[0]! + base}" v2="${f[1]! + base}" v3="${f[2]! + base}"/>`).join('');
  return { v, t };
};
const meshObject = (id: number, ...tets: { v: string; t: string }[]) =>
  `<object id="${id}" type="model"><mesh><vertices>${tets.map((m) => m.v).join('')}</vertices><triangles>${tets
    .map((m) => m.t)
    .join('')}</triangles></mesh></object>`;
const twoTets = meshObject(1, tetra(0), tetra(5, 4));
const meta = (type: string, key: string, value: string) => `<metadata type="${type}" key="${key}" value="${value}"/>`;

describe('readPrusa2 on a PrusaSlicer 2.9.6 project (fdm_roundtrip1.3mf)', () => {
  const pk = openPackage(readFileSync(join(__dirname, 'fixtures/real/fdm_roundtrip1.3mf')));
  const p = readPrusa2(pk);

  // Golden hand-derived from the fixture's XML by the 2.9 importer rules (.reference/notes/VWR-25-*.md).
  interface GoldenPart {
    name: string;
    type: string;
    extruder: string;
    first: number[];
    extra?: Record<string, string>;
  }
  const golden: { id: number; name: string; config: Record<string, string>; parts: GoldenPart[]; at: number[] }[] = [
    {
      id: 1,
      name: 'Shape-Box',
      config: { brim_width: '10', gap_fill_enabled: '1' },
      parts: [
        { name: 'Shape-Box', type: 'ModelPart', extruder: '3', first: [18, 18, -18] },
        { name: 'Generic-Box', type: 'NegativeVolume', extruder: '0', first: [-0.863596618, -7.59427643, -18] },
      ],
      at: [109.438736, 195.194153, 18],
    },
    {
      id: 2,
      name: 'Merged',
      config: {},
      parts: [
        { name: 'Shape-Box', type: 'ModelPart', extruder: '1', first: [-7.5266695, 59.351902, -18] },
        { name: 'Shape-Box', type: 'ModelPart', extruder: '4', first: [43.5266724, 58.8307266, -18] },
        {
          name: 'Generic-Box',
          type: 'ParameterModifier',
          extruder: '0',
          first: [17.886919, 43.9408875, -18],
          extra: { modifier: '1', perimeter_extruder: '2' },
        },
        {
          name: 'Generic-Box',
          type: 'ParameterModifier',
          extruder: '0',
          first: [66.0774765, 77.3224869, -18],
          extra: { modifier: '1', top_solid_layers: '9' },
        },
      ],
      at: [185.965183, 155.275273, 18],
    },
  ];

  test('objects, volumes and per-object config match the golden', () => {
    expect(p.dialect).toBe('prusa2');
    expect(p.objects.map((o) => [o.id, o.name, Object.fromEntries(o.config)])).toEqual(
      golden.map((g) => [g.id, g.name, g.config]),
    );
    p.objects.forEach((o, i) => {
      const g = golden[i]!;
      expect(o.parts).toHaveLength(g.parts.length);
      o.parts.forEach((pt, j) => {
        const gp = g.parts[j]!;
        expect(pt.name).toBe(gp.name);
        expect(pt.config.get('volume_type')).toBe(gp.type);
        expect(pt.config.get('extruder')).toBe(gp.extruder);
        for (const [k, v] of Object.entries(gp.extra ?? {})) expect(pt.config.get(k)).toBe(v);
        expect(pt.config.has('name')).toBe(false);
        expect(pt.transform).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
        // Each volume is 12 triangles over its own 8 vertices, rebased to 0.
        expect(pt.mesh.triangles).toHaveLength(36);
        expect(pt.mesh.vertices).toHaveLength(24);
        expect([...pt.mesh.triangles.slice(0, 3)]).toEqual([0, 1, 2]);
        expect(Math.max(...pt.mesh.triangles)).toBe(7);
        expect([...pt.mesh.vertices.slice(0, 3)]).toEqual(gp.first.map(Math.fround));
      });
    });
    expect(Object.fromEntries(p.objects[1]!.parts[2]!.config)).toEqual({
      volume_type: 'ParameterModifier',
      modifier: '1',
      matrix: '1 0 0 -0.45232412154089729 0 1 0 103.7635546479145 0 0 1 0 0 0 0 1',
      source_file: 'apply_test_object.3mf',
      source_object_id: '1',
      source_volume_id: '2',
      source_offset_x: '-0.11308097839355469',
      source_offset_y: '25.940888404846191',
      source_offset_z: '0',
      source_is_builtin_volume: '1',
      extruder: '0',
      perimeter_extruder: '2',
    });
    expect(p.instances.map((i) => [i.objectId, i.transform.slice(9)])).toEqual(golden.map((g) => [g.id, g.at]));
  });

  test('the raw INI blob is the part bytes', () => {
    const ini = pk.parts.find((x) => x.name === PRINT_CONFIG)!;
    expect(p.rawConfig.get(PRINT_CONFIG)).toBe(ini.bytes);
    expect(ini.bytes.length).toBe(32562);
    expect(createHash('sha256').update(ini.bytes).digest('hex')).toBe(
      '56117a21deea48c8c5963ae0b8b3d5203eea6ea758ccd53d373f19cdae479057',
    );
  });

  test('every other non-model part, the model config included, is preserved', () => {
    const want = pk.parts.filter((x) => x.name !== PRINT_CONFIG && !x.name.endsWith('.model')).map((x) => x.name);
    expect(p.preserved.map((x) => x.name)).toEqual(want);
    expect(want).toContain(MODEL_CONFIG);
  });

  test('the dispatcher picks it for the detected prusa2 dialect', () => {
    const run = createReadProject({
      readCore,
      readMetadata: (x) => readModel(x.parts.find((q) => q.name === x.rootModel)!.bytes, x.rootModel).metadata,
      readers: new Map([['prusa2', readPrusa2]]),
    });
    const out = run(pk);
    expect(out.dialect).toBe('prusa2');
    expect(out.notices).toBeUndefined();
  });
});

describe('readPrusa2 rules', () => {
  test('without a model config entry an object is one part over its whole mesh', () => {
    const p = readPrusa2(pkg(model(`<resources>${twoTets}</resources><build><item objectid="1"/></build>`)));
    expect(p.objects[0]!.name).toBe('object 1');
    expect(p.objects[0]!.parts).toHaveLength(1);
    expect(p.objects[0]!.parts[0]!.mesh.triangles).toHaveLength(24);
    expect(p.rawConfig.size).toBe(0);
  });

  test('component-only objects are instances of their mesh object; unplaced objects are dropped', () => {
    const p = readPrusa2(
      pkg(
        model(
          `<resources>${twoTets}${meshObject(3, tetra(0))}<object id="2" type="model"><components><component objectid="1" transform="1 0 0 0 1 0 0 0 1 1 2 3"/></components></object></resources>` +
            `<build><item objectid="1"/><item objectid="2" transform="0 1 0 -1 0 0 0 0 1 10 0 0"/></build>`,
        ),
      ),
    );
    expect(p.objects.map((o) => o.id)).toEqual([1]);
    expect(p.instances.map((i) => [i.objectId, i.transform.slice(9)])).toEqual([
      [1, [0, 0, 0]],
      [1, [8, 1, 3]], // component first, then the rotating item,
    ]);
  });

  test('the last object name wins; unnamed volumes take it, the second one on with _<n>; ranges split and rebase', () => {
    const cfg = config(
      `<object id="1">${meta('object', 'name', 'Old')}${meta('object', 'name', 'Obj')}${meta('object', 'layer_height', '0.1')}<volume firstid="0" lastid="3"/><volume firstid="4" lastid="7">${meta('volume', 'volume_type', 'SupportBlocker')}</volume></object>`,
    );
    const p = readPrusa2(pkg(model(`<resources>${twoTets}</resources><build><item objectid="1"/></build>`), cfg));
    const o = p.objects[0]!;
    expect(o.name).toBe('Obj');
    expect(Object.fromEntries(o.config)).toEqual({ layer_height: '0.1' });
    expect(o.parts.map((x) => x.name)).toEqual(['Obj', 'Obj_2']);
    expect(o.parts[1]!.config.get('volume_type')).toBe('SupportBlocker');
    expect([...o.parts[1]!.mesh.triangles]).toEqual([0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3]);
    expect([...o.parts[1]!.mesh.vertices.slice(0, 3)]).toEqual([5, 0, 0]);
  });

  test('an inside-out volume is flipped, an outward one is not', () => {
    const p = readPrusa2(
      pkg(
        model(
          `<resources>${meshObject(1, tetra(0), tetra(5, 4, true))}</resources><build><item objectid="1"/></build>`,
        ),
        config(`<object id="1"><volume firstid="0" lastid="3"/><volume firstid="4" lastid="7"/></object>`),
      ),
    );
    const [a, b] = p.objects[0]!.parts;
    expect([...a!.mesh.triangles.slice(0, 3)]).toEqual([0, 2, 1]);
    expect([...b!.mesh.triangles.slice(0, 3)]).toEqual([0, 2, 1]);
  });

  test('model config: volume metadata goes to the last volume, object metadata to the object wherever it sits', () => {
    const m = readModelConfig(
      enc.encode(
        config(
          `<object id="7">${meta('volume', 'lost', '1')}<volume firstid="0" lastid="1">${meta('volume', 'a', '1')}</volume>${meta('object', 'late', 'x')}${meta('volume', 'b', '2')}</object>`,
        ),
      ),
      MODEL_CONFIG,
    );
    expect(m.get(7)).toEqual({
      metadata: [['late', 'x']],
      volumes: [
        {
          first: 0,
          last: 1,
          metadata: [
            ['a', '1'],
            ['b', '2'],
          ],
        },
      ],
    });
  });

  test.each([
    ['a duplicate object id', `<object id="1"/><object id="1"/>`, /duplicate object id 1/],
    ['an invalid metadata type', `<object id="1">${meta('plate', 'k', 'v')}</object>`, /metadata of type "plate"/],
    ['a volume outside an object', `<volume firstid="0" lastid="1"/>`, /a volume outside an object/],
    ['metadata outside an object', meta('object', 'k', 'v'), /metadata outside an object/],
    ['a bad firstid', `<object id="1"><volume firstid="-1" lastid="1"/></object>`, /firstid/],
    ['deep nesting', `${'<a>'.repeat(70)}${'</a>'.repeat(70)}`, /nested deeper/],
  ])('model config with %s is refused', (_n, body, msg) => {
    expect(() => readModelConfig(enc.encode(config(body)), MODEL_CONFIG)).toThrow(MalformedXmlError);
    expect(() => readModelConfig(enc.encode(config(body)), MODEL_CONFIG)).toThrow(msg);
  });

  const items = `<build><item objectid="1"/></build>`;
  test.each([
    ['last past the mesh', `<volume firstid="0" lastid="8"/>`, /triangles 0-8 are outside 0-7/],
    ['first after last', `<volume firstid="3" lastid="2"/>`, /triangles 3-2/],
    [
      'overlapping triangle ranges',
      `<volume firstid="0" lastid="7"/><volume firstid="0" lastid="0"/>`,
      /triangle ranges overlap/,
    ],
  ])('a volume with %s is refused', (_n, volumes, msg) => {
    const p = pkg(model(`<resources>${twoTets}</resources>${items}`), config(`<object id="1">${volumes}</object>`));
    expect(() => readPrusa2(p)).toThrow(msg);
  });

  test('volumes whose vertex ranges overlap are refused', () => {
    // Two triangles, each touching vertices 0 and 7, so each range copies all 8 vertices.
    const obj = `<object id="1"><mesh><vertices>${tetra(0).v}${tetra(5).v}</vertices><triangles><triangle v1="0" v2="1" v3="7"/><triangle v1="0" v2="2" v3="7"/></triangles></mesh></object>`;
    const p = pkg(
      model(`<resources>${obj}</resources>${items}`),
      config(`<object id="1"><volume firstid="0" lastid="0"/><volume firstid="1" lastid="1"/></object>`),
    );
    expect(() => readPrusa2(p)).toThrow(/vertex ranges overlap/);
  });

  test.each([
    [
      'an item naming a missing object',
      `<resources>${twoTets}</resources><build><item objectid="9"/></build>`,
      /object 9 does not exist/,
    ],
    [
      'an item naming a non-model object',
      `<resources>${twoTets.replace('type="model"', 'type="support"')}</resources>${items}`,
      /not of type model/,
    ],
    [
      'a production path',
      `<resources>${twoTets}<object id="2"><components><component objectid="1" p:path="/3D/o.model"/></components></object></resources><build><item objectid="2"/></build>`,
      /production paths/,
    ],
    [
      'a production path on a build item',
      `<resources>${twoTets}</resources><build><item objectid="1" p:path="/3D/o.model"/></build>`,
      /production paths/,
    ],
    [
      'an object without mesh or components',
      `<resources><object id="1" type="model"/></resources>${items}`,
      /neither a mesh nor components/,
    ],
  ])('a model with %s is refused', (_n, body, msg) => {
    expect(() => readPrusa2(pkg(model(body)))).toThrow(msg);
  });

  test('components nest at most 10 deep (3mf.cpp:2401)', () => {
    const chain = (n: number) => {
      let body = twoTets;
      for (let i = 2; i <= n; i++)
        body += `<object id="${i}"><components><component objectid="${i - 1}"/></components></object>`;
      return model(`<resources>${body}</resources><build><item objectid="${n}"/></build>`);
    };
    expect(readPrusa2(pkg(chain(10))).instances).toHaveLength(1);
    expect(() => readPrusa2(pkg(chain(11)))).toThrow(/nest deeper than 10/);
  });

  test('component fan-out stops at 100000 instances (rule 25)', () => {
    // 6 levels of 10 components each reach the mesh 10^6 times.
    let body = twoTets;
    for (let i = 2; i <= 7; i++)
      body += `<object id="${i}"><components>${`<component objectid="${i - 1}"/>`.repeat(10)}</components></object>`;
    const p = pkg(model(`<resources>${body}</resources><build><item objectid="7"/></build>`));
    expect(() => readPrusa2(p)).toThrow(/more than 100000 instances/);
  }, 30_000); // hang guard only
});
