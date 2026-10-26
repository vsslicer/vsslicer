// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  CUSTOM_GCODE_PART,
  CUT_PART,
  LAYER_HEIGHTS_PART,
  LAYER_RANGES_PART,
  readLayerData,
} from '../src/adapters/bambu/readLayerData.ts';
import type { Package } from '../src/domain/package.ts';
import { openPackage } from '../src/openPackage.ts';

const enc = new TextEncoder();
const pkg = (parts: Record<string, string | Uint8Array>): Package => ({
  rootModel: '3D/3dmodel.model',
  parts: Object.entries(parts).map(([name, b]) => ({
    name,
    contentType: 'x',
    relationships: [],
    bytes: typeof b === 'string' ? enc.encode(b) : b,
  })),
});
const real = (name: string) => openPackage(readFileSync(join(__dirname, 'fixtures/real', name)));
const gcodes = (body: string) => `<custom_gcodes_per_layer>${body}</custom_gcodes_per_layer>`;

describe('real fixtures (BambuStudio@79df7ae calib 3MFs)', () => {
  test('pa_pattern.3mf: custom G-code per layer and cut information', () => {
    const d = real('pa_pattern.3mf');
    const r = readLayerData(d);
    expect(r.notices).toEqual([]);
    expect(r.customGcodes).toHaveLength(1);
    const plate = r.customGcodes[0]!;
    expect([plate.plateId, plate.mode]).toEqual([1, 'SingleExtruder']);
    expect(plate.items.map((i) => [i.printZ, i.type, i.extruder, i.color])).toEqual(
      [0.25, 0.45, 0.65, 0.8500000000000001].map((z) => [z, 4, -858993460, '']),
    );
    expect(plate.items[0]!.extra).toMatch(/^; start pressure advance pattern for layer/);
    // `gcode` is not one of the five known attributes, so it stays raw.
    expect([...plate.items[0]!.attributes.keys()]).toEqual(['gcode']);
    expect(r.cuts).toEqual([{ objectId: 1, cutId: { id: 0, checkSum: 1, connectorsCount: 0 }, connectors: [] }]);
    expect(r.layerRanges).toEqual([]);
    expect(r.layerHeightProfiles).toEqual([]);
  });

  test('auto_pa_line_single.3mf: four uncut objects, no custom G-code', () => {
    const r = readLayerData(real('auto_pa_line_single.3mf'));
    expect(r.notices).toEqual([]);
    expect(r.cuts.map((c) => [c.objectId, c.cutId, c.connectors.length])).toEqual(
      [1, 2, 3, 4].map((id) => [id, { id: 0, checkSum: 1, connectorsCount: 0 }, 0]),
    );
    expect(r.customGcodes).toEqual([]);
  });

  test('a package with none of the files is fine', () => {
    expect(readLayerData(real('booleans_operations.3mf'))).toEqual({
      customGcodes: [],
      layerRanges: [],
      layerHeightProfiles: [],
      cuts: [],
      notices: [],
    });
  });
});

describe('custom_gcode_per_layer.xml', () => {
  test('plates by plate_info, in order; a plate without plate_info is skipped', () => {
    const r = readLayerData(
      pkg({
        [CUSTOM_GCODE_PART.toUpperCase()]: gcodes(
          `<plate><layer top_z="1.5" type="0" extruder="2" color="#FF0000" extra="" gcode="M600" x="y"/><mode value="MultiAsSingle"/><plate_info id="2"/></plate>` +
            `<plate><layer top_z="3" type="1" extruder="1" color="" extra="pause"/></plate>` +
            `<plate><plate_info id="3"/></plate>`,
        ),
      }),
    );
    expect(r.customGcodes.map((p) => [p.plateId, p.mode, p.items.length])).toEqual([
      [2, 'MultiAsSingle', 1],
      [3, undefined, 0],
    ]);
    expect(r.customGcodes[0]!.items[0]).toEqual({
      printZ: 1.5,
      type: 0,
      extruder: 2,
      color: '#FF0000',
      extra: '',
      attributes: new Map([
        ['gcode', 'M600'],
        ['x', 'y'],
      ]),
    });
  });

  test('without any plate the layers are plate 1; the pre-2.2 gcode attribute maps to a type', () => {
    const r = readLayerData(
      pkg({
        [CUSTOM_GCODE_PART]: gcodes(
          `<layer top_z="1" extruder="1" color="#00FF00" gcode="M600"/>` +
            `<layer top_z="2" extruder="1" color="#0000FF" gcode="M601"/>` +
            `<layer top_z="3" extruder="1" color="" gcode="tool_change"/>` +
            `<layer top_z="4" extruder="1" color="" gcode="G4 S5"/><mode value="SingleExtruder"/>`,
        ),
      }),
    );
    expect(r.customGcodes).toHaveLength(1);
    expect(r.customGcodes[0]!.plateId).toBe(1);
    expect(r.customGcodes[0]!.items.map((i) => [i.type, i.extra])).toEqual([
      [0, ''],
      [1, '#0000FF'],
      [2, ''],
      [4, 'G4 S5'],
    ]);
  });

  test('a layer outside the plates is dropped when plates exist', () => {
    const r = readLayerData(
      pkg({
        [CUSTOM_GCODE_PART]: gcodes(
          `<layer top_z="1" type="0" extruder="1" color="" extra=""/><plate><plate_info id="2"/></plate>`,
        ),
      }),
    );
    expect(r.customGcodes.map((p) => [p.plateId, p.items.length])).toEqual([[2, 0]]);
  });

  test('a bad layer fails the part with a notice and keeps the rest of the file untouched', () => {
    const r = readLayerData(
      pkg({
        [CUSTOM_GCODE_PART]: gcodes(`<plate><plate_info id="1"/><layer top_z="x" type="0" extruder="1"/></plate>`),
        [CUT_PART]: `<objects><object id="1"><cut_id id="0" check_sum="1" connectors_cnt="0"/></object></objects>`,
      }),
    );
    expect(r.customGcodes).toEqual([]);
    expect(r.notices).toEqual([expect.stringMatching(/custom_gcode_per_layer\.xml could not be read .*top_z/)]);
    expect(r.cuts).toHaveLength(1);
  });
});

describe('layer_config_ranges.xml', () => {
  const xml = `<objects>
 <object id="2"><range min_z="0" max_z="2"><option opt_key="layer_height">0.15</option><option opt_key="fill_density">15%</option></range>
  <range min_z="2" max_z="4.5"><option opt_key="wall_loops">4</option></range>
  <range min_z="0" max_z="2"><option opt_key="layer_height">0.1</option></range></object>
 <object id="0"><range min_z="0" max_z="1"/></object>
 <object id="5"/>
 <object id="2"><range min_z="9" max_z="10"/></object></objects>`;
  test('ranges with options, equal bounds merge, bad and duplicate objects are skipped with notices', () => {
    const r = readLayerData(pkg({ [LAYER_RANGES_PART]: xml }));
    expect(r.layerRanges.map((x) => [x.objectId, x.minZ, x.maxZ, Object.fromEntries(x.options)])).toEqual([
      [2, 0, 2, { layer_height: '0.1', fill_density: '15%' }],
      [2, 2, 4.5, { wall_loops: '4' }],
    ]);
    expect(r.notices).toEqual([
      expect.stringMatching(/invalid object id/),
      expect.stringMatching(/duplicate object 2/),
    ]);
  });
});

describe('layer_heights_profile.txt', () => {
  test('profiles per object; short, odd, garbled, duplicate and id-less lines are skipped', () => {
    const r = readLayerData(
      pkg({
        [LAYER_HEIGHTS_PART]: [
          'object_id=1|0;0.2;2;0.2;2;0.1;4;0.1',
          'object_id=2|0;0.2;2;0.2',
          'object_id=3|0;0.2;2;0.2;4',
          'object_id=4|0;0.2;2;abc;4;0.1',
          'object_id=1|0;0.3;2;0.3;4;0.3',
          'object_id=0|0;0.2;2;0.2;4;0.2',
          'nonsense',
          '',
        ].join('\n'),
      }),
    );
    expect(r.layerHeightProfiles).toEqual([{ objectId: 1, profile: [0, 0.2, 2, 0.2, 2, 0.1, 4, 0.1] }]);
    expect(r.notices).toHaveLength(6);
  });
});

describe('cut_information.xml', () => {
  test('cut id and connectors, unknown connector attributes stay raw; bad ids are skipped', () => {
    const r = readLayerData(
      pkg({
        [CUT_PART]:
          `<objects><object id="3"><cut_id id="7" check_sum="99" connectors_cnt="1"/><connectors>` +
          `<connector volume_id="2" type="1" r_tolerance="0.1" h_tolerance="0.2" shape="plug"/></connectors></object>` +
          `<object id="-1"/><object id="3"/></objects>`,
      }),
    );
    expect(r.cuts).toEqual([
      {
        objectId: 3,
        cutId: { id: 7, checkSum: 99, connectorsCount: 1 },
        connectors: [
          { volumeId: 2, type: 1, rTolerance: 0.1, hTolerance: 0.2, attributes: new Map([['shape', 'plug']]) },
        ],
      },
    ]);
    expect(r.notices).toHaveLength(2);
  });
});

describe('bounds (rule 25)', () => {
  // The caps are written as literals: an expected value never comes from the code under test.
  const objects = (n: number) =>
    `<objects>${Array.from({ length: n }, (_, i) => `<object id="${i + 1}"/>`).join('')}</objects>`;
  const nested = (n: number) => '<a>'.repeat(n) + '</a>'.repeat(n);
  const profile = (id: number, n: number) => `object_id=${id}|${Array(n).fill(1).join(';')}`;

  test('malformed XML yields a notice, not a throw', () => {
    const r = readLayerData(pkg({ [CUSTOM_GCODE_PART]: '<custom_gcodes_per_layer><layer' }));
    expect(r.notices).toEqual([expect.stringMatching(/could not be read/)]);
  });

  test('the element cap is 200000: the cap is read, one more gives a notice', () => {
    expect(readLayerData(pkg({ [CUT_PART]: objects(199_999) })).notices).toEqual([]);
    expect(readLayerData(pkg({ [CUT_PART]: objects(200_000) })).notices).toEqual([
      expect.stringContaining('more than 200000 elements'),
    ]);
  });

  test('the depth cap is 64: the cap is read, one more gives a notice', () => {
    expect(readLayerData(pkg({ [LAYER_RANGES_PART]: nested(64) })).notices).toEqual([]);
    expect(readLayerData(pkg({ [LAYER_RANGES_PART]: nested(65) })).notices).toEqual([
      expect.stringContaining('nested deeper than 64'),
    ]);
  });

  test('the part size cap is 16777216 bytes: the cap is read, one more gives a notice', () => {
    const padded = (n: number) => {
      const b = new Uint8Array(n).fill(0x20);
      b.set(enc.encode('<objects/>'));
      return b;
    };
    expect(readLayerData(pkg({ [CUT_PART]: padded(16_777_216) })).notices).toEqual([]);
    expect(readLayerData(pkg({ [CUT_PART]: padded(16_777_217) })).notices).toEqual([
      expect.stringContaining('larger than 16777216 bytes'),
    ]);
  });

  // Values come in even counts per profile, so the total is even: the cap 200000 is read, 200002 is the next total.
  test('the profile value cap is 200000 across objects: the cap is read, over it gives a notice', () => {
    const ok = readLayerData(pkg({ [LAYER_HEIGHTS_PART]: [profile(1, 100_000), profile(2, 100_000)].join('\n') }));
    expect(ok.notices).toEqual([]);
    expect(ok.layerHeightProfiles).toHaveLength(2);
    const over = readLayerData(pkg({ [LAYER_HEIGHTS_PART]: [profile(1, 100_000), profile(2, 100_002)].join('\n') }));
    expect(over.layerHeightProfiles).toEqual([]);
    expect(over.notices).toEqual([expect.stringContaining('more than 200000 profile values')]);
  });

  test('legacy gcode names that are Object.prototype keys become custom G-code', () => {
    for (const gcode of ['__proto__', 'constructor', 'toString']) {
      const r = readLayerData(
        pkg({ [CUSTOM_GCODE_PART]: gcodes(`<layer top_z="1" extruder="1" color="" gcode="${gcode}"/>`) }),
      );
      expect(r.customGcodes[0]!.items.map((i) => [i.type, i.extra])).toEqual([[4, gcode]]);
    }
  });

  test('notices are capped', () => {
    const r = readLayerData(pkg({ [CUT_PART]: `<objects>${'<object id="-1"/>'.repeat(100)}</objects>` }));
    expect(r.notices).toHaveLength(21);
    expect(r.notices[20]).toBe('and 80 more notices');
  });
});
