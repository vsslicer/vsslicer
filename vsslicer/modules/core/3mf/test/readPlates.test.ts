// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import {
  MAX_LAYOUT_ITEMS,
  MAX_PLATES,
  MAX_VALUE_CHARS,
  MODEL_SETTINGS_PART,
  readPlates,
  SLICE_INFO_PART,
} from '../src/adapters/bambu/readPlates.ts';
import type { Package } from '../src/domain/package.ts';
import { openPackage } from '../src/openPackage.ts';
import { readProject } from '../src/readProject.ts';

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
const realBytes = (name: string) => readFileSync(join(__dirname, 'fixtures/real', name));
const real = (name: string) => openPackage(realBytes(name));
const meta = (k: string, v: string | number) => `<metadata key="${k}" value="${v}"/>`;
const plate = (id: number | string, extra = '', instances = '') =>
  `<plate>${meta('plater_id', id)}${extra}${instances}</plate>`;
const inst = (o: number, i: number, identify?: number) =>
  `<model_instance>${meta('object_id', o)}${meta('instance_id', i)}${identify === undefined ? '' : meta('identify_id', identify)}</model_instance>`;
const settings = (body: string) => `<config>${body}</config>`;
const sliced = (body: string) => `<config><header/>${body}</config>`;

describe('real fixtures', () => {
  // Hand-checked against each file's Metadata/model_settings.config and slice_info.config (see PROVENANCE.md);
  // BambuStudio@79df7ae pa_pattern.3mf and auto_pa_line_single.3mf, ElegooSlicer@2d507e39 Elegoo_stringhell.3mf.
  test('pa_pattern.3mf: one plate with its images and instance, unsliced', () => {
    const { plates, notices } = readPlates(real('pa_pattern.3mf'));
    expect(notices).toEqual([]);
    expect(plates).toEqual([
      {
        id: 1,
        config: new Map(),
        locked: false,
        instances: [{ objectId: 2, instanceId: 0, identifyId: 58 }],
        thumbnail: 'Metadata/plate_1.png',
        topImage: 'Metadata/top_1.png',
        pickImage: 'Metadata/pick_1.png',
      },
    ]);
    expect(plates[0]!.slice).toBeUndefined();
  });

  test('auto_pa_line_single.3mf: four instances, no-light thumbnail, raw plate metadata kept', () => {
    const { plates, notices } = readPlates(real('auto_pa_line_single.3mf'));
    expect(notices).toEqual([]);
    expect(plates).toHaveLength(1);
    const p = plates[0]!;
    expect(p.instances).toEqual(
      [
        [3, 374],
        [4, 389],
        [5, 419],
        [6, 449],
      ].map(([objectId, identifyId]) => ({ objectId, instanceId: 0, identifyId })),
    );
    expect([p.thumbnail, p.noLightThumbnail, p.topImage, p.pickImage]).toEqual([
      'Metadata/plate_1.png',
      'Metadata/plate_no_light_1.png',
      'Metadata/top_1.png',
      'Metadata/pick_1.png',
    ]);
    expect(Object.fromEntries(p.config)).toEqual({
      first_layer_print_sequence: '1 2 3 4 5 6 7 8',
      filament_map_mode: 'Auto For Flush',
    });
    expect(p.slice).toBeUndefined();
  });

  test('Elegoo_stringhell.3mf: plate_1.json is read as the layout', () => {
    const [p] = readPlates(real('Elegoo_stringhell.3mf')).plates;
    expect(p!.layout).toEqual({
      bboxAll: [48.285599999999995, 75.455381, 207.701131, 187.99792399999998],
      filamentIds: [],
      filamentColors: [],
      objects: [
        { id: 89, name: '篮子提手.STL', bbox: [48.285599999999995, 75.455381, 207.701131, 187.99792399999998] },
      ],
      nozzleDiameter: 0.20000000298023224,
      bedType: 'hot_plate',
      version: 2,
    });
    expect(p!.slice).toBeUndefined();
  });

  test('readProject carries the plates and puts each instance on its plate', () => {
    const p = readProject(real('auto_pa_line_single.3mf'));
    expect(p.plates.map((x) => x.id)).toEqual([1]);
    expect(p.instances.map((i) => i.plateId)).toEqual([1, 1, 1, 1]);
  });
});

describe('plates from model_settings.config', () => {
  test('several plates in file order, name and lock, instances by object and instance number', () => {
    const { plates, notices } = readPlates(
      pkg({
        [MODEL_SETTINGS_PART]: settings(
          plate(2, meta('plater_name', 'Second') + meta('locked', 'true'), inst(7, 1, 9) + inst(7, 0)) +
            plate(1, meta('locked', 'false') + meta('x_unknown', 'v')),
        ),
      }),
    );
    expect(notices).toEqual([]);
    expect(plates.map((p) => [p.id, p.name, p.locked])).toEqual([
      [2, 'Second', true],
      [1, undefined, false],
    ]);
    expect(plates[0]!.instances).toEqual([
      { objectId: 7, instanceId: 1, identifyId: 9 },
      { objectId: 7, instanceId: 0 },
    ]);
    expect(Object.fromEntries(plates[1]!.config)).toEqual({ x_unknown: 'v' });
  });

  test('thumbnail falls back to the G-code name with .png; gcodePart only for a part that exists', () => {
    const files = {
      [MODEL_SETTINGS_PART]: settings(
        plate(1, meta('gcode_file', 'Metadata/plate_1.gcode')) + plate(2, meta('gcode_file', 'Metadata/plate_2.gcode')),
      ),
      'metadata/PLATE_1.gcode': 'G1',
    };
    const [a, b] = readPlates(pkg(files)).plates;
    expect([a!.thumbnail, a!.gcodePart]).toEqual(['Metadata/plate_1.png', 'metadata/PLATE_1.gcode']);
    expect([a!.config.size, b!.config.size]).toEqual([0, 0]);
    expect([b!.thumbnail, b!.gcodePart]).toEqual(['Metadata/plate_2.png', undefined]);
  });

  test('the default G-code part Metadata/plate_N.gcode is found when no gcode_file is written', () => {
    const [a] = readPlates(pkg({ [MODEL_SETTINGS_PART]: settings(plate(3)), 'Metadata/plate_3.gcode': 'G1' })).plates;
    expect(a!.gcodePart).toBe('Metadata/plate_3.gcode');
  });

  test('bad plates and instances are skipped with a notice', () => {
    const { plates, notices } = readPlates(
      pkg({
        [MODEL_SETTINGS_PART]: settings(
          plate('x') +
            plate(0) +
            '<plate>' +
            meta('plater_name', 'no id') +
            '</plate>' +
            plate(1, '', inst(1, 0) + '<model_instance>' + meta('object_id', 2) + '</model_instance>') +
            plate(1, meta('plater_name', 'again')),
        ),
      }),
    );
    expect(plates.map((p) => [p.id, p.name, p.instances!.length])).toEqual([[1, undefined, 1]]);
    expect(notices).toEqual([
      expect.stringContaining('"x" is not a plate number'),
      expect.stringContaining('"0" is not a plate number'),
      expect.stringContaining('a plate without plater_id'),
      expect.stringContaining('model_instance without object_id and instance_id'),
      expect.stringContaining('duplicate plate 1'),
    ]);
  });

  test('metadata outside plates and plate keys named like Object.prototype members are harmless', () => {
    const { plates } = readPlates(
      pkg({
        [MODEL_SETTINGS_PART]: settings(
          `<object id="1">${meta('name', 'o')}</object>` + plate(1, meta('__proto__', 'a') + meta('constructor', 'b')),
        ),
      }),
    );
    expect([...plates[0]!.config]).toEqual([
      ['__proto__', 'a'],
      ['constructor', 'b'],
    ]);
  });

  test('only plain integers of at most ten digits are plate numbers', () => {
    const { plates, notices } = readPlates(
      pkg({
        [MODEL_SETTINGS_PART]: settings(
          ['-1', '', '1e3', '12345678901', '1.5', '4294967295'].map((v) => plate(v)).join(''),
        ),
      }),
    );
    expect(plates.map((p) => p.id)).toEqual([4294967295]);
    expect(notices).toHaveLength(5);
  });

  test('empty parts are not errors', () => {
    const r = readPlates(
      pkg({ [MODEL_SETTINGS_PART]: settings(plate(1)), [SLICE_INFO_PART]: '', 'Metadata/plate_1.json': '' }),
    );
    expect(r.notices).toEqual([]);
    expect(r.plates).toHaveLength(1);
    expect(readPlates(pkg({ [MODEL_SETTINGS_PART]: '' }))).toEqual({ plates: [], notices: [] });
  });

  test('a package without model_settings.config has no plates and no notice', () => {
    expect(readPlates(pkg({ 'a.txt': 'x' }))).toEqual({ plates: [], notices: [] });
  });
});

// The slice_info.config shape is what Orca's exporter writes (OrcaSlicer@09aa0114 bbs_3mf.cpp:8715-8960); no real sliced
// project is in the corpus, so these files are built from that writer.
describe('slice_info.config', () => {
  const two = settings(plate(1) + plate(2));
  const sliceFor2 = sliced(
    `<plate>${meta('index', 2)}${meta('printer_model_id', 'N1')}${meta('prediction', 3600)}${meta('weight', '12.34')}` +
      `${meta('first_layer_time', '55.5')}${meta('outside', 'false')}${meta('support_used', 'true')}` +
      `<object identify_id="5" name="cube" skipped="false" />` +
      `<filament id="1" tray_info_idx="GFA00" type="PLA" color="#FF0000" used_m="1.5" used_g="4.5" used_for_object="true" used_for_support="false"/>` +
      `<filament id="3" tray_info_idx="" type="PETG" color="#00FF00" used_m="0.5" used_g="1.5"/>` +
      `<warning msg="bed_temp" level="1" error_code =""  />` +
      `</plate>`,
  );

  test('a plate listed in slice_info is sliced with its time, weight and filaments; one not listed is unsliced', () => {
    const { plates, notices } = readPlates(pkg({ [MODEL_SETTINGS_PART]: two, [SLICE_INFO_PART]: sliceFor2 }));
    expect(notices).toEqual([]);
    expect(plates[0]!.slice).toBeUndefined();
    expect(plates[1]!.slice).toEqual({
      predictionSeconds: 3600,
      weightGrams: 12.34,
      printerModelId: 'N1',
      supportUsed: true,
      toolpathOutside: false,
      filaments: [
        {
          id: 1,
          type: 'PLA',
          color: '#FF0000',
          usedMeters: 1.5,
          usedGrams: 4.5,
          trayInfoId: 'GFA00',
          usedForObject: true,
          usedForSupport: false,
        },
        { id: 3, type: 'PETG', color: '#00FF00', usedMeters: 0.5, usedGrams: 1.5, trayInfoId: '' },
      ],
      warnings: [{ message: 'bed_temp', level: 1, errorCode: '' }],
      attributes: new Map([['first_layer_time', '55.5']]),
    });
  });

  test('a header-only slice_info (what an unsliced project writes) is not an error', () => {
    const r = readPlates(
      pkg({
        [MODEL_SETTINGS_PART]: two,
        [SLICE_INFO_PART]: '<config><header><header_item key="a" value="b"/></header></config>',
      }),
    );
    expect(r.notices).toEqual([]);
    expect(r.plates.map((p) => p.slice)).toEqual([undefined, undefined]);
  });

  test('a missing slice_info.config leaves every plate unsliced', () => {
    const r = readPlates(pkg({ [MODEL_SETTINGS_PART]: two }));
    expect(r.notices).toEqual([]);
    expect(r.plates.map((p) => p.slice)).toEqual([undefined, undefined]);
  });

  test('bad entries are skipped or left out with a notice', () => {
    const body =
      `<plate>${meta('index', 'z')}</plate>` +
      `<plate>${meta('index', 9)}</plate>` +
      `<plate>${meta('index', 1)}${meta('prediction', 'soon')}${meta('weight', '2')}` +
      `<filament id="1" used_m="x" used_g="1"/></plate>` +
      `<plate>${meta('index', 1)}</plate>`;
    const { plates, notices } = readPlates(pkg({ [MODEL_SETTINGS_PART]: two, [SLICE_INFO_PART]: sliced(body) }));
    expect(plates[0]!.slice).toMatchObject({ weightGrams: 2, filaments: [] });
    expect(plates[0]!.slice!.predictionSeconds).toBeUndefined();
    expect(notices).toEqual([
      expect.stringContaining('without a numeric index'),
      expect.stringContaining('filament without a numeric id'),
      expect.stringContaining('prediction is not a number'),
      expect.stringContaining('duplicate plate 1'),
      expect.stringContaining('slice info for unknown plate 9'),
    ]);
  });

  test('malformed slice_info.config yields a notice and unsliced plates, not a throw', () => {
    const r = readPlates(pkg({ [MODEL_SETTINGS_PART]: two, [SLICE_INFO_PART]: '<config><plate>' }));
    expect(r.plates).toHaveLength(2);
    expect(r.plates.map((p) => p.slice)).toEqual([undefined, undefined]);
    expect(r.notices).toEqual([expect.stringMatching(/slice_info\.config could not be read/)]);
  });
});

describe('plate_N.json', () => {
  const layoutOf = (json: string) => {
    const r = readPlates(pkg({ [MODEL_SETTINGS_PART]: settings(plate(1)), 'Metadata/plate_1.json': json }));
    return { layout: r.plates[0]!.layout, notices: r.notices };
  };
  const base = { bbox_all: [1, 2, 3, 4], filament_ids: [0, 1], filament_colors: ['#fff'], bbox_objects: [] };

  test('a minimal layout is read; optional fields are left out when absent', () => {
    expect(layoutOf(JSON.stringify(base))).toEqual({
      layout: { bboxAll: [1, 2, 3, 4], filamentIds: [0, 1], filamentColors: ['#fff'], objects: [] },
      notices: [],
    });
  });

  test('a layout of the wrong shape or malformed JSON is left out; only the malformed one gets a notice', () => {
    expect(layoutOf(JSON.stringify({ ...base, bbox_all: 'x' }))).toEqual({ layout: undefined, notices: [] });
    expect(layoutOf(JSON.stringify({ ...base, bbox_objects: [{ id: 1, bbox: [1], name: 5 }] })).layout).toBeUndefined();
    expect(layoutOf('{').layout).toBeUndefined();
    expect(layoutOf('{').notices).toEqual([expect.stringMatching(/plate_1\.json could not be read/)]);
  });

  test('pattern_bbox_file names the layout part', () => {
    const r = readPlates(
      pkg({
        [MODEL_SETTINGS_PART]: settings(plate(1, meta('pattern_bbox_file', 'Metadata/other.json'))),
        'Metadata/other.json': JSON.stringify(base),
      }),
    );
    expect(r.plates[0]!.layout?.bboxAll).toEqual([1, 2, 3, 4]);
  });

  test('plates naming one part parse it once and each gets the layout', () => {
    const spy = vi.spyOn(JSON, 'parse');
    try {
      const named = meta('pattern_bbox_file', 'Metadata/shared.json');
      const r = readPlates(
        pkg({
          [MODEL_SETTINGS_PART]: settings(plate(1, named) + plate(2, named)),
          'Metadata/shared.json': JSON.stringify(base),
        }),
      );
      expect(r.plates.map((p) => p.layout?.bboxAll)).toEqual([
        [1, 2, 3, 4],
        [1, 2, 3, 4],
      ]);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  test('a string in plate_N.json is kept to 65536 characters, one more leaves the layout out', () => {
    expect(layoutOf(JSON.stringify({ ...base, bed_type: 'a'.repeat(65_536) })).layout?.bedType).toHaveLength(65_536);
    expect(layoutOf(JSON.stringify({ ...base, bed_type: 'a'.repeat(65_537) })).layout?.bedType).toBeUndefined();
    const box = (n: number) => ({ ...base, bbox_objects: [{ id: 1, bbox: [1], name: 'a'.repeat(n) }] });
    expect(layoutOf(JSON.stringify(box(65_536))).layout?.objects[0]!.name).toHaveLength(65_536);
    expect(layoutOf(JSON.stringify(box(65_537))).layout).toBeUndefined();
  });

  test('the array cap is 10000: the cap is read, one more leaves the layout out', () => {
    expect(layoutOf(JSON.stringify({ ...base, filament_ids: Array(10_000).fill(1) })).layout?.filamentIds).toHaveLength(
      10_000,
    );
    expect(layoutOf(JSON.stringify({ ...base, filament_ids: Array(10_001).fill(1) })).layout).toBeUndefined();
  });
});

describe('bounds (rule 25)', () => {
  const plates = (n: number) => settings(Array.from({ length: n }, (_, i) => plate(i + 1)).join(''));

  test('constants are the documented caps', () => {
    expect([MAX_PLATES, MAX_LAYOUT_ITEMS, MAX_VALUE_CHARS]).toEqual([1024, 10_000, 65_536]);
  });

  test('the plate cap is 1024: the cap is read, one more gives a notice and no plates', () => {
    expect(readPlates(pkg({ [MODEL_SETTINGS_PART]: plates(1024) })).plates).toHaveLength(1024);
    const over = readPlates(pkg({ [MODEL_SETTINGS_PART]: plates(1025) }));
    expect(over.plates).toEqual([]);
    expect(over.notices).toEqual([expect.stringContaining('more than 1024 plates')]);
  });

  test('the slice plate cap is 1024: the cap is read, one more gives a notice', () => {
    const slices = (n: number) =>
      sliced(Array.from({ length: n }, (_, i) => `<plate>${meta('index', i + 1)}</plate>`).join(''));
    const ok = readPlates(pkg({ [MODEL_SETTINGS_PART]: plates(1024), [SLICE_INFO_PART]: slices(1024) }));
    expect(ok.notices).toEqual([]);
    expect(ok.plates.every((p) => p.slice)).toBe(true);
    const over = readPlates(pkg({ [MODEL_SETTINGS_PART]: plates(2), [SLICE_INFO_PART]: slices(1025) }));
    expect(over.plates.map((p) => p.slice)).toEqual([undefined, undefined]);
    expect(over.notices).toEqual([expect.stringContaining('more than 1024 plates')]);
  });

  test('the element cap is 200000: the cap is read, one more gives a notice', () => {
    const elements = (n: number) => `<config>${'<a/>'.repeat(n - 1)}</config>`;
    expect(readPlates(pkg({ [MODEL_SETTINGS_PART]: elements(200_000) })).notices).toEqual([]);
    expect(readPlates(pkg({ [MODEL_SETTINGS_PART]: elements(200_001) })).notices).toEqual([
      expect.stringContaining('more than 200000 elements'),
    ]);
  });

  test('the depth cap is 64: the cap is read, one more gives a notice', () => {
    const nested = (n: number) => '<a>'.repeat(n) + '</a>'.repeat(n);
    expect(readPlates(pkg({ [SLICE_INFO_PART]: nested(64), [MODEL_SETTINGS_PART]: plates(1) })).notices).toEqual([]);
    expect(readPlates(pkg({ [SLICE_INFO_PART]: nested(65), [MODEL_SETTINGS_PART]: plates(1) })).notices).toEqual([
      expect.stringContaining('nested deeper than 64'),
    ]);
  });

  test('the part size cap is 16777216 bytes: the cap is read, one more gives a notice', () => {
    const padded = (n: number) => {
      const b = new Uint8Array(n).fill(0x20);
      b.set(enc.encode('<config/>'));
      return b;
    };
    expect(readPlates(pkg({ [MODEL_SETTINGS_PART]: padded(16_777_216) })).notices).toEqual([]);
    expect(readPlates(pkg({ [MODEL_SETTINGS_PART]: padded(16_777_217) })).notices).toEqual([
      expect.stringContaining('larger than 16777216 bytes'),
    ]);
    // The same cap guards plate_N.json.
    const json = (n: number) => new Uint8Array(n).fill(0x20);
    const big = json(16_777_217);
    big.set(enc.encode('{}'));
    const r = readPlates(pkg({ [MODEL_SETTINGS_PART]: plates(1), 'Metadata/plate_1.json': big }));
    expect(r.notices).toEqual([expect.stringContaining('larger than 16777216 bytes')]);
  });

  test('a value is kept to 65536 characters', () => {
    const name = (n: number) =>
      readPlates(pkg({ [MODEL_SETTINGS_PART]: settings(plate(1, meta('plater_name', 'a'.repeat(n)))) })).plates[0]!
        .name;
    expect(name(65_536)).toHaveLength(65_536);
    expect(name(65_537)).toHaveLength(65_536);
  });

  test('slice_info attributes are kept to 65536 characters', () => {
    const slice = (n: number) => {
      const a = 'a'.repeat(n);
      return readPlates(
        pkg({
          [MODEL_SETTINGS_PART]: settings(plate(1)),
          [SLICE_INFO_PART]: sliced(
            `<plate>${meta('index', 1)}${meta('k', a)}<filament id="1" type="${a}" color="${a}" used_m="1" used_g="1"/><warning msg="${a}"/></plate>`,
          ),
        }),
      ).plates[0]!.slice!;
    };
    for (const n of [65_536, 65_537]) {
      const s = slice(n);
      expect([
        s.attributes.get('k')!.length,
        s.filaments[0]!.type.length,
        s.filaments[0]!.color.length,
        s.warnings[0]!.message.length,
      ]).toEqual([65_536, 65_536, 65_536, 65_536]);
    }
  });

  test('notices are capped', () => {
    const r = readPlates(pkg({ [MODEL_SETTINGS_PART]: settings(plate('x').repeat(100)) }));
    expect(r.notices).toHaveLength(21);
    expect(r.notices[20]).toBe('and 80 more notices');
  });
});
