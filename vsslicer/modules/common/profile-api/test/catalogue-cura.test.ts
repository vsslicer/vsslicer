// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, mkdtempSync, readFileSync, rmSync, truncateSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';
import { catalogueEntrySchema, catalogueSchema, defsSchema, orcaCatalogue } from '../src/index.ts';
import { curaCatalogue } from '../src/domain/catalogue/cura.ts';
import {
  CURA_NAMES,
  CURA_OUTPUT,
  CURA_SOURCE,
  CURA_SPLITS,
  extractCura,
  FDM_MATERIALS_SOURCE,
  FDM_PLA,
  FDMEXTRUDER,
  FDMPRINTER,
  generateCura,
  MAX_DEPTH,
  MAX_FILE_BYTES,
  readBounded,
  renderCura,
  XML_PROFILE,
} from '../tools/catalogue/cura.ts';

const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addSchema(defsSchema).addSchema(catalogueEntrySchema);
const prefixed = Object.entries(curaCatalogue.entries);
const curaKeys = [
  ...prefixed.map(([k]) => k.slice(5)),
  ...Object.values(curaCatalogue.names).flatMap((n) =>
    'key' in n ? [n.key] : Array.isArray(n.conversion.keys) ? n.conversion.keys : Object.values(n.conversion.keys),
  ),
];

describe('the generated Cura catalogue', () => {
  test('its cura. entries validate against catalogueSchema', () => {
    const valid = ajv.compile(catalogueSchema);
    const { notice, entries } = curaCatalogue;
    expect(valid({ notice, entries }), JSON.stringify(valid.errors?.slice(0, 5))).toBe(true);
    for (const [key, e] of prefixed)
      expect(e, key).toMatchObject({ native_only: 'cura', native: { cura: { key: key.slice(5) } } });
  });

  test('each Cura name targets an Orca entry and is a valid native.cura there', () => {
    const valid = ajv.compile(catalogueEntrySchema);
    for (const [orca, name] of Object.entries(curaCatalogue.names)) {
      const target = orcaCatalogue.entries[orca];
      expect(target, orca).toBeDefined();
      const merged = { ...target, native: { ...target!.native, cura: name } };
      expect(valid(merged), `${orca}: ${JSON.stringify(valid.errors?.slice(0, 3))}`).toBe(true);
    }
  });

  test('assigns each of the 762 Cura keys once (771 definitions, 9 in both files)', () => {
    expect(new Set(curaKeys).size).toBe(curaKeys.length);
    expect(curaKeys).toHaveLength(762);
    expect(Object.keys(curaCatalogue.names)).toHaveLength(
      Object.keys(CURA_NAMES).length + Object.keys(CURA_SPLITS).length,
    );
  });

  test('flags extruder-scoped keys per extruder', () => {
    const per = new Set(curaCatalogue.per_extruder);
    for (const k of ['machine_nozzle_offset_x', 'machine_extruder_start_code', 'material_guid', 'speed_print'])
      expect(per.has(k), k).toBe(true);
    expect(per.has('machine_disallowed_areas')).toBe(false);
    for (const k of per)
      if (curaCatalogue.entries[`cura.${k}`]) expect(curaCatalogue.entries[`cura.${k}`]?.per_extruder, k).toBe(true);
    for (const [key, e] of prefixed) if (e.per_extruder) expect(per.has(key.slice(5)), key).toBe(true);
  });

  // Counts cura. entries only: a formula on a key mapped to an Orca name is not an entry.
  test('keeps formula defaults verbatim as {expr}', () => {
    expect(curaCatalogue.entries['cura.wall_thickness']?.default).toEqual({
      expr: 'wall_line_width_0 if magic_spiralize else 0.8',
    });
    expect(prefixed.filter(([, e]) => typeof e.default === 'object' && e.default && 'expr' in e.default).length).toBe(
      290,
    );
  });

  test('puts density, diameter and GUID on the Material entity, not in settings', () => {
    const m = curaCatalogue.material;
    expect(m['properties/density']).toMatchObject({ field: 'density' });
    expect(m['properties/diameter']).toMatchObject({ field: 'diameter', cura: 'material_diameter' });
    expect(m['metadata/GUID']).toMatchObject({ field: 'external_ids.cura_guid', cura: 'material_guid' });
    for (const k of ['properties/density', 'properties/diameter', 'metadata/GUID'])
      expect(m[k], k).not.toHaveProperty('setting');
    expect(m['settings/print temperature']).toMatchObject({ setting: 'cura.default_material_print_temperature' });
    expect(m['settings/retraction amount']).toMatchObject({ setting: 'retraction_length' });
  });

  // The data these lines check is ported material: Copyright (C) Ultimaker B.V., LGPL-3.0 (see the file's notice).
  test('carries the LGPL notice and a Cura provenance line on every cura. entry', () => {
    expect(curaCatalogue.notice).toMatch(/Cura@5bea2f8.*GNU Lesser General Public License v3\.0/);
    for (const [, e] of prefixed)
      expect(e.provenance).toMatch(
        /^Ported from Cura@5bea2f8:resources\/definitions\/fdm(printer|extruder)\.def\.json:\d+/,
      );
  });
});

const def = (settings: object) => JSON.stringify({ settings });
/** `levels` nested setting levels: a category at level 1, then children down to one setting. */
const nested = (levels: number) => {
  let node: object = { leaf: { type: 'int', default_value: 1, label: 'Leaf' } };
  for (let i = levels - 1; i >= 1; i--)
    node = { [`c${i}`]: { type: i === 1 ? 'category' : 'int', default_value: 0, children: node } };
  return def(node);
};

describe('the Cura generator bounds (rule 25)', () => {
  test(`refuses a definition file over ${MAX_FILE_BYTES} bytes before reading it`, () => {
    const dir = mkdtempSync(join(tmpdir(), 'cura-bounds-'));
    try {
      const big = join(dir, 'big.def.json');
      writeFileSync(big, '');
      truncateSync(big, MAX_FILE_BYTES + 1);
      expect(() => readBounded(big)).toThrow(/limit/);
      const ok = join(dir, 'ok.def.json');
      writeFileSync(ok, def({}));
      expect(readBounded(ok)).toBe(def({}));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    expect(() => extractCura(' '.repeat(MAX_FILE_BYTES + 1), 'x')).toThrow(/limit/);
  });

  test(`refuses settings nested deeper than ${MAX_DEPTH} levels`, () => {
    expect(extractCura(nested(MAX_DEPTH), 'x').map((s) => s.key)).toContain('leaf');
    expect(() => extractCura(nested(MAX_DEPTH + 1), 'x')).toThrow(/deeper than 32/);
  });

  test('finds the lines of 100k flat settings in linear time', () => {
    const n = 100_000;
    const children = Array.from({ length: n }, (_, i) => `"k${i}":\n{"type":"float","default_value":0}`).join(',\n');
    const text = `{"settings":{"c":{"type":"category","children":{${children}}}}}`;
    const t0 = performance.now();
    const out = extractCura(text, 'x');
    // The old indexOf-from-0 scan took about 19 s at 40k settings; one pass takes well under a second.
    expect(performance.now() - t0).toBeLessThan(2000);
    expect(out).toHaveLength(n);
    expect(out[n - 1]).toMatchObject({ key: `k${n - 1}`, line: 2 * n - 1 });
  });

  test('ignores a key-shaped text inside a string when citing a line', () => {
    const text =
      '{"settings":{"c":{"type":"category","children":{\n"a":{"description":"\\"b\\": {","type":"float","default_value":0},\n"b":\n{"type":"float","default_value":0}}}}}';
    expect(extractCura(text, 'x').map((s) => [s.key, s.line])).toEqual([
      ['a', 2],
      ['b', 3],
    ]);
  });

  test('stores a formula verbatim and never evaluates it', () => {
    const value = "__import__('os').system('touch /tmp/pwned') or 1";
    const [s] = extractCura(def({ c: { type: 'category', children: { k: { type: 'int', value } } } }), 'x');
    expect(s?.node.value).toBe(value);
    // The real generator path: formula and expression bounds stay data.
    const out = generateCura(
      def({
        machine_settings: {
          type: 'category',
          children: {
            ...Object.fromEntries(
              [...Object.keys(CURA_NAMES), ...Object.values(CURA_SPLITS).flat()].map((k) => [
                k,
                { type: 'float', default_value: 0, label: k },
              ]),
            ),
            evil: { type: 'float', label: 'Evil', value, minimum_value: 'machine_nozzle_size * 0.1' },
          },
        },
      }),
      def({}),
      '__material_settings_setting_map = {\n}\n__material_properties_setting_map = {\n "diameter": "material_diameter"\n}\n' +
        '__material_metadata_setting_map = {\n "GUID": "material_guid",\n "material": "material_type",\n "brand": "material_brand"\n}\n',
    );
    expect(out.entries['cura.evil']).toMatchObject({ default: { expr: value } });
    expect(out.entries['cura.evil']).not.toHaveProperty('min');
  });
});

// The pinned sources live in .reference (ignored); without them only the committed data is checked.
const sources = existsSync(join(CURA_SOURCE, FDMPRINTER));
describe.skipIf(!sources)('the Cura generator, on Cura@5bea2f8', () => {
  const read = (path: string) => readFileSync(join(CURA_SOURCE, path), 'utf8');

  test('is deterministic and matches the committed data', () => {
    const run = () => renderCura(generateCura(read(FDMPRINTER), read(FDMEXTRUDER), read(XML_PROFILE)));
    const first = run();
    expect(run()).toBe(first);
    expect(first).toBe(readFileSync(CURA_OUTPUT, 'utf8'));
  });

  test('reads 740 + 31 definitions', () => {
    expect(extractCura(read(FDMPRINTER), FDMPRINTER)).toHaveLength(740);
    expect(extractCura(read(FDMEXTRUDER), FDMEXTRUDER)).toHaveLength(31);
  });

  test('cites the line that defines each cura. key', () => {
    const lines = read(FDMPRINTER).split('\n');
    const ext = read(FDMEXTRUDER).split('\n');
    for (const [key, e] of prefixed) {
      const m = /def\.json:(\d+)/.exec(e.provenance!)!;
      const file = e.provenance!.includes(`${FDMPRINTER}:`) ? lines : ext;
      expect(file[Number(m[1]) - 1], key).toContain(`"${key.slice(5)}":`);
    }
  });

  test('cites the fdm_materials line holding <density>', () => {
    const pla = join(FDM_MATERIALS_SOURCE, FDM_PLA);
    if (!existsSync(pla)) return;
    const line = Number(/:(\d+)$/.exec(curaCatalogue.material['properties/density']!.provenance)![1]);
    expect(readFileSync(pla, 'utf8').split('\n')[line - 1]).toContain('<density>');
  });
});
