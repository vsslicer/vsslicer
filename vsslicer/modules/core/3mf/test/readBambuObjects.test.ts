// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  MAX_COMPONENTS,
  MODEL_SETTINGS,
  readBambuObjects,
  readModelSettings,
} from '../src/adapters/bambu/readObjects.ts';
import { MAX_TRIANGLE_ATTRIBUTES, readModel } from '../src/adapters/model/readModel.ts';
import { MalformedXmlError } from '../src/domain/errors.ts';
import type { Package } from '../src/domain/package.ts';
import { openPackage } from '../src/openPackage.ts';
import { readProject } from '../src/readProject.ts';
import { coreNs } from './support/minimalPackage.ts';
import { projectJson } from './support/projectJson.ts';

const enc = new TextEncoder();
const part = (name: string, text: string) => ({ name, contentType: 'x', relationships: [], bytes: enc.encode(text) });
const P = 'http://schemas.microsoft.com/3dmanufacturing/production/2015/06';
const model = (body: string, app = 'BambuStudio-02.06.00.51') =>
  `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xmlns="${coreNs}" xmlns:p="${P}"><metadata name="Application">${app}</metadata>${body}</model>`;
const tri = (attrs = '') =>
  `<mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/><vertex x="0" y="0" z="1"/></vertices>` +
  `<triangles><triangle v1="0" v2="2" v3="1" ${attrs}/><triangle v1="0" v2="1" v3="3"/><triangle v1="0" v2="3" v3="2"/></triangles></mesh>`;
const config = (body: string) => `<?xml version="1.0" encoding="UTF-8"?><config>${body}</config>`;
const pkg = (root: string, settings?: string, extra: Package['parts'] = []): Package => ({
  rootModel: '3D/3dmodel.model',
  parts: [
    part('3D/3dmodel.model', root),
    ...(settings === undefined ? [] : [part(MODEL_SETTINGS, settings)]),
    ...extra,
  ],
});

// Painted sub-object 1: paint_color on triangle 0, paint_supports on triangle 1, neither on triangle 2.
const objects = part(
  '3D/Objects/object_1.model',
  model(
    `<resources>` +
      `<object id="1" type="model"><mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/><vertex x="0" y="0" z="1"/></vertices>` +
      `<triangles><triangle v1="0" v2="2" v3="1" paint_color="4"/><triangle v1="0" v2="1" v3="3" paint_supports="8"/><triangle v1="0" v2="3" v3="2"/></triangles></mesh></object>` +
      [2, 3, 4, 5].map((id) => `<object id="${id}" type="model">${tri()}</object>`).join('') +
      `</resources><build/>`,
    '',
  ),
);
const comp = (id: number, t = '1 0 0 0 1 0 0 0 1 0 0 0') =>
  `<component p:path="/3D/Objects/object_1.model" objectid="${id}" transform="${t}"/>`;
const root = model(
  `<resources>` +
    `<object id="10" type="model"><components>${comp(1)}${comp(2, '2 0 0 0 2 0 0 0 2 1 2 3')}${comp(3)}${comp(4)}${comp(99)}</components></object>` +
    `<object id="20" name="Painted" type="model">${tri('paint_seam="1C"')}</object>` +
    `<object id="30" type="model"><components>${comp(5, '1 0 0 0 1 0 0 0 1 5 0 0')}</components></object>` +
    `<object id="40" type="model">${tri()}</object>` +
    `</resources><build>` +
    `<item objectid="10" transform="1 0 0 0 1 0 0 0 1 10 10 0"/>` +
    `<item objectid="10" transform="1 0 0 0 1 0 0 0 1 50 10 0"/>` +
    `<item objectid="20" transform="1 0 0 0 1 0 0 0 1 0 50 0"/>` +
    `<item objectid="30" transform="1 0 0 0 1 0 0 0 1 100 0 0"/>` +
    `<item objectid="30" transform="1 0 0 0 1 0 0 0 1 100 20 0"/>` +
    `<item objectid="40" transform="0 0 0 0 1 0 0 0 1 7 7 7"/>` +
    `</build>`,
);
const settings = config(
  `<object id="10"><metadata key="name" value="Assembly"/><metadata key="extruder" value="2"/><metadata face_count="3"/>` +
    `<part id="1" subtype="normal_part"><metadata key="name" value="Body"/><metadata key="wall_loops" value="3"/><mesh_stat face_count="3"/></part>` +
    `<part id="3" subtype="support_enforcer"></part>` +
    `<part id="2" subtype="negative_part"><metadata key="name" value="Hole"/></part>` +
    `<part id="4" subtype="modifier_part"><metadata key="name" value=""/><metadata key="sparse_infill_density" value="20%"/></part>` +
    `</object>` +
    `<object id="30"><metadata key="name" value="Moved"/></object>` +
    `<plate><metadata key="plater_id" value="1"/><model_instance><metadata key="object_id" value="10"/></model_instance></plate>` +
    `<assemble><assemble_item object_id="10" instance_id="0" transform="1 0 0 0 1 0 0 0 1 0 0 0" offset="0 0 0"/></assemble>`,
);

const I = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const at = (x: number, y: number, z: number) => [...I, x, y, z];

describe('readBambuObjects', () => {
  const { objects: objs, instances, notices } = readBambuObjects(pkg(root, settings, [objects]));
  const view = (projectJson({ dialect: 'bambu', objects: objs, instances } as never) as { objects: unknown[] }).objects;

  test('objects, parts (modifier, negative, enforcer) and per-object metadata', () => {
    expect(view).toEqual([
      {
        id: 10,
        name: 'Assembly',
        config: { extruder: '2' },
        parts: [
          {
            id: 0,
            name: 'Body',
            subtype: 'normal_part',
            vertices: 4,
            triangles: 3,
            transform: at(0, 0, 0),
            config: { wall_loops: '3' },
            triangleAttributes: { paint_color: ['4', '', ''], paint_supports: ['', '8', ''] },
          },
          {
            id: 1,
            name: 'Hole',
            subtype: 'negative_part',
            vertices: 4,
            triangles: 3,
            transform: [2, 0, 0, 0, 2, 0, 0, 0, 2, 1, 2, 3],
            config: {},
          },
          // Unnamed parts take the object name, then `_2` (bbs_3mf.cpp:5478-5484).
          {
            id: 2,
            name: 'Assembly',
            subtype: 'support_enforcer',
            vertices: 4,
            triangles: 3,
            transform: at(0, 0, 0),
            config: {},
          },
          {
            id: 3,
            name: 'Assembly_2',
            subtype: 'modifier_part',
            vertices: 4,
            triangles: 3,
            transform: at(0, 0, 0),
            config: { sparse_infill_density: '20%' },
          },
        ],
      },
      {
        id: 20,
        name: 'Painted',
        config: {},
        parts: [
          {
            id: 0,
            name: 'Painted',
            vertices: 4,
            triangles: 3,
            transform: at(0, 0, 0),
            config: {},
            triangleAttributes: { paint_seam: ['1C', '', ''] },
          },
        ],
      },
      // The lone part's (5, 0, 0) offset moved into the instances.
      {
        id: 30,
        name: 'Moved',
        config: {},
        parts: [{ id: 0, name: 'Moved', vertices: 4, triangles: 3, transform: at(0, 0, 0), config: {} }],
      },
      // No settings entry and no name: `Object_<n>` (:2304).
      {
        id: 40,
        name: 'Object_4',
        config: {},
        parts: [{ id: 0, name: 'Object_4', vertices: 4, triangles: 3, transform: at(0, 0, 0), config: {} }],
      },
    ]);
  });

  test('instances: one per build item, singular transforms at identity, lone-part offsets folded in', () => {
    expect(instances).toEqual([
      { objectId: 10, transform: at(10, 10, 0) },
      { objectId: 10, transform: at(50, 10, 0) },
      { objectId: 20, transform: at(0, 50, 0) },
      { objectId: 30, transform: at(105, 0, 0) },
      { objectId: 30, transform: at(105, 20, 0) },
      { objectId: 40, transform: at(0, 0, 0) },
    ]);
  });

  test('meshes and paint are shared with the model, never copied', () => {
    const twice = model(
      `<resources><object id="1" type="model"><components>${comp(1)}${comp(1)}</components></object></resources><build><item objectid="1"/></build>`,
    );
    const [a, b] = readBambuObjects(pkg(twice, undefined, [objects])).objects[0]!.parts;
    expect(a!.mesh).toBe(b!.mesh);
    expect(a!.triangleAttributes).toBe(b!.triangleAttributes);
  });

  test('a missing component target is skipped with a notice', () => {
    expect(notices).toEqual([expect.stringMatching(/object 99 in \/3D\/Objects\/object_1.model, which is missing/)]);
  });

  test('a triangle-range volume never matches a sub-object (:970-976)', () => {
    const s = config(
      `<object id="40"><metadata key="name" value="O"/><volume firstid="0" lastid="2" id="40"><metadata key="name" value="V"/></volume></object>`,
    );
    expect(readBambuObjects(pkg(root, s, [objects])).objects.find((o) => o.id === 40)!.parts[0]!.name).toBe('O');
  });

  test('components win over an own mesh, and empty meshes are no parts (:5186-5203)', () => {
    const both = model(
      `<resources><object id="2" type="model"><mesh><vertices/><triangles/></mesh></object><object id="3" type="model">${tri()}</object>` +
        `<object id="1" type="model"><mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/></vertices><triangles><triangle v1="0" v2="1" v3="2"/></triangles></mesh><components><component objectid="2"/><component objectid="3"/></components></object></resources><build><item objectid="1"/></build>`,
    );
    const parts = readBambuObjects(pkg(both)).objects[0]!.parts;
    expect(parts.map((x) => x.mesh.vertices.length / 3)).toEqual([4]);
  });

  test('a component cycle stops at the budget', () => {
    const loop = model(
      `<resources><object id="1" type="model"><components><component objectid="1"/></components></object></resources><build><item objectid="1"/></build>`,
    );
    expect(() => readBambuObjects(pkg(loop))).toThrow(new RegExp(`more than ${MAX_COMPONENTS} component`));
  });

  test('nested components compose the inner transform first, then the outer', () => {
    const nested = model(
      `<resources><object id="3" type="model">${tri()}</object><object id="4" type="model">${tri()}</object>` +
        `<object id="2" type="model"><components><component objectid="3" transform="1 0 0 0 1 0 0 0 1 1 0 0"/></components></object>` +
        `<object id="1" type="model"><components><component objectid="2" transform="2 0 0 0 2 0 0 0 2 0 0 0"/><component objectid="4"/></components></object>` +
        `</resources><build><item objectid="1"/></build>`,
    );
    const { objects: o } = readBambuObjects(pkg(nested));
    expect(o[0]!.parts[1]!.transform).toEqual([2, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0]);
  });

  test('the last name metadata wins', () => {
    const one = model(
      `<resources><object id="1" type="model">${tri()}</object></resources><build><item objectid="1"/></build>`,
    );
    const cfg = config(
      `<object id="1"><metadata key="name" value="First"/><metadata key="name" value="Second"/><part id="1"><metadata key="name" value="P1"/><metadata key="name" value="P2"/></part></object>`,
    );
    const { objects: o } = readBambuObjects(pkg(one, cfg));
    expect([o[0]!.name, o[0]!.parts[0]!.name]).toEqual(['Second', 'P2']);
  });

  test('an object id clashing with another part takes the next free id', () => {
    const ext = part(
      '3D/Objects/o.model',
      model(`<resources><object id="1" type="model">${tri()}</object></resources><build/>`, ''),
    );
    const clash = model(
      `<resources><object id="1" type="model">${tri()}</object></resources>` +
        `<build><item objectid="1"/><item objectid="1" p:path="/3D/Objects/o.model"/></build>`,
    );
    const { objects: o, instances: i } = readBambuObjects(pkg(clash, undefined, [ext]));
    expect(o.map((x) => x.id)).toEqual([1, 2]);
    expect(i.map((x) => x.objectId)).toEqual([1, 2]);
  });

  test('a build item without its object fails', () => {
    expect(() => readBambuObjects(pkg(model('<resources/><build><item objectid="5"/></build>')))).toThrow(
      MalformedXmlError,
    );
  });
});

describe('readModelSettings', () => {
  test.each([
    ['<metadata key="k" value="v"/>', /outside an object/],
    ['<part id="1"/>', /outside an object/],
    ['<object id="1"/><object id="1"/>', /duplicate object id 1/],
    ['<object id="x"/>', /not an integer/],
  ])('%s is refused', (body, why) => {
    expect(() => readModelSettings(enc.encode(config(body)), MODEL_SETTINGS)).toThrow(why);
  });

  test('plate metadata and keyless metadata are not object metadata', () => {
    const s = readModelSettings(
      enc.encode(
        config(
          `<object id="1"><metadata face_count="1"/></object><plate><metadata key="plater_id" value="1"/></plate>`,
        ),
      ),
      'x',
    );
    expect(s.get(1)).toEqual({ metadata: [], parts: [] });
  });

  test('metadata after a part closes goes back to the object', () => {
    const s = readModelSettings(
      enc.encode(
        config(
          `<object id="1"><part id="2"><metadata key="a" value="1"/></part><metadata key="b" value="2"/></object>`,
        ),
      ),
      'x',
    );
    expect(s.get(1)).toEqual({ metadata: [['b', '2']], parts: [{ id: 2, metadata: [['a', '1']] }] });
  });
});

describe('triangle attributes in readModel', () => {
  test(`only the first ${MAX_TRIANGLE_ATTRIBUTES} names of an object are kept`, () => {
    const many = Array.from({ length: MAX_TRIANGLE_ATTRIBUTES + 1 }, (_, i) => `a${i}="x"`).join(' ');
    const m = readModel(
      enc.encode(model(`<resources><object id="1" type="model">${tri(many)}</object></resources><build/>`)),
      'm',
    );
    expect(m.objects[0]!.triangleAttributes!.size).toBe(MAX_TRIANGLE_ATTRIBUTES);
  });
  test('core attributes and a plain mesh carry none', () => {
    const m = readModel(
      enc.encode(model(`<resources><object id="1" type="model">${tri('pid="1" p1="0"')}</object></resources><build/>`)),
      'm',
    );
    expect(m.objects[0]!.triangleAttributes).toBeUndefined();
  });
});

describe('through readProject', () => {
  test('a broken model_settings.config falls back to the core read with a notice', () => {
    const p = readProject(
      pkg(
        model(
          `<resources><object id="1" type="model">${tri()}</object></resources><build><item objectid="1"/></build>`,
        ),
        config('<metadata key="k" value="v"/>'),
      ),
    );
    expect(p.dialect).toBe('core');
    expect(p.notices?.[0]).toMatch(/bambu project, but its reader failed: .*outside an object/);
  });

  // BambuStudio@79df7ae:resources/calib/pressure_advance/auto_pa_line_single.3mf, hand-checked against its
  // 3D/3dmodel.model and Metadata/model_settings.config (see test/fixtures/real/PROVENANCE.md).
  test('auto_pa_line_single.3mf matches its golden JSON', () => {
    const dir = join(__dirname, 'fixtures/real');
    const p = readProject(openPackage(readFileSync(join(dir, 'auto_pa_line_single.3mf'))));
    expect(p.notices).toBeUndefined();
    expect(projectJson(p)).toEqual(JSON.parse(readFileSync(join(dir, 'auto_pa_line_single.golden.json'), 'utf8')));
  });
});
