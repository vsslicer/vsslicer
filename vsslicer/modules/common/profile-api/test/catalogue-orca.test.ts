// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';
import { catalogueEntrySchema, catalogueSchema, defsSchema, orcaCatalogue } from '../src/index.ts';
import {
  BAMBU_SOURCE,
  CONSTANTS,
  DEFAULT_SOURCE,
  generate,
  generateBambu,
  PRESET,
  PRINT_CONFIG,
  render,
} from '../tools/catalogue/generate.ts';

const entries = Object.entries(orcaCatalogue.entries);
// Keys whose Orca default is an empty vector or a cast enum the extractor does not resolve.
const NO_DEFAULT = ['default_filament_profile', 'extruder', 'filament_volume_map', 'filament_ids'];

describe('the generated Orca catalogue', () => {
  test('validates against catalogueSchema', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    ajv.addSchema(defsSchema).addSchema(catalogueEntrySchema);
    const valid = ajv.compile(catalogueSchema);
    expect(valid(orcaCatalogue), JSON.stringify(valid.errors?.slice(0, 5))).toBe(true);
  });

  test("has Orca's 804 FFF keys, each with a type and, but for four, a default", () => {
    expect(entries).toHaveLength(804);
    expect(entries.every(([, e]) => e.type)).toBe(true);
    expect(entries.filter(([, e]) => !('default' in e)).map(([k]) => k)).toEqual(NO_DEFAULT);
  });

  // The data these lines check is ported material: Copyright (C) the OrcaSlicer authors, AGPL-3.0 (see the file's notice).
  test('carries the AGPL notice and a provenance line on every entry', () => {
    expect(orcaCatalogue.notice).toMatch(/GNU Affero General Public License v3\.0/);
    for (const [, e] of entries)
      expect(e.provenance).toMatch(/^Ported from OrcaSlicer@09aa0114:src\/libslic3r\/PrintConfig\.cpp:\d+/);
  });

  test('reads values, enums and per-extruder keys as Orca defines them', () => {
    const e = orcaCatalogue.entries;
    expect(e.layer_height).toMatchObject({ type: 'float', unit: 'mm', default: 0.2, home: 'process' });
    expect(e.nozzle_diameter).toMatchObject({ per_extruder: true, default: 0.4 });
    expect(e.machine_max_speed_x).toMatchObject({ list: true, default: [500, 200] });
    expect(e.print_sequence).toMatchObject({ type: 'enum', default: 'by layer' });
    expect(e.printable_area?.default).toEqual([
      [0, 0],
      [200, 0],
      [200, 200],
      [0, 200],
    ]);
  });
});

// The pinned source lives in .reference (ignored); without it only the committed data is checked.
const source = existsSync(join(DEFAULT_SOURCE, PRINT_CONFIG));
describe.skipIf(!source)('the generator, on OrcaSlicer@09aa0114', () => {
  const read = (path: string) => readFileSync(join(DEFAULT_SOURCE, path), 'utf8');
  // The committed file also carries Bambu names (PRF-15); compare like for like when Bambu's source is present.
  const bambu = existsSync(join(BAMBU_SOURCE, PRINT_CONFIG));
  const readBambu = (path: string) => readFileSync(join(BAMBU_SOURCE, path), 'utf8');
  const run = () => {
    const orca = generate(read(PRINT_CONFIG), read(PRESET), read(CONSTANTS));
    return render(bambu ? generateBambu(orca, readBambu(PRINT_CONFIG), readBambu(PRESET)).orca : orca);
  };

  test('is deterministic', () => {
    expect(run()).toBe(run());
  });

  // The committed file also carries every other dialect's names and PRF-18's groups: `outputs()` is compared with it
  // in catalogue-prusa.test.ts and catalogue-groups.test.ts.

  test('cites the line that defines each key', () => {
    const lines = read(PRINT_CONFIG).split('\n');
    for (const [key, e] of entries) {
      const line = lines[Number(/PrintConfig\.cpp:(\d+)/.exec(e.provenance!)![1]) - 1]!;
      // Loop-, axis- and lambda-generated keys cite their `add(key, ...)` call.
      expect(line, key).toMatch(
        new RegExp(
          `add(?:_nullable)?\\("${key}"|add(?:_nullable)?\\(key,|add_belt_remap|for \\(auto& opt_key|\\+ axis\\.name`,
        ),
      );
    }
  });

  test('covers every key defined in init_common_params and init_fff_params', () => {
    const src = read(PRINT_CONFIG).replace(/^[ \t]*\/\/.*$/gm, '');
    const fff = src.slice(src.indexOf('init_common_params()'), src.indexOf('init_extruder_option_keys()'));
    const literal = [...fff.matchAll(/this->add(?:_nullable)?\("(\w+)"/g)].map((m) => m[1]!);
    const loops = [...fff.matchAll(/add_belt_remap\("(\w+)"/g)].map((m) => m[1]!);
    for (const key of [...literal, ...loops].filter((k) => !k.endsWith('_')))
      expect(orcaCatalogue.entries, key).toHaveProperty([key]);
  });
});
