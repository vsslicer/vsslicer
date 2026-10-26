// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, test } from 'vitest';
import { bambuCatalogue, catalogueEntrySchema, catalogueSchema, defsSchema, orcaCatalogue } from '../src/index.ts';
import {
  BAMBU_OUTPUT,
  BAMBU_RENAMES,
  BAMBU_SOURCE,
  CONSTANTS,
  DEFAULT_SOURCE,
  generate,
  generateBambu,
  PRESET,
  PRINT_CONFIG,
  render,
} from '../tools/catalogue/generate.ts';

const prefixed = Object.entries(bambuCatalogue.entries);
const named = Object.entries(orcaCatalogue.entries).filter(([, e]) => e.native.bambu);
const bambuName = (e: (typeof named)[number][1]) => (e.native.bambu as { key: string }).key;

describe('the generated Bambu catalogue', () => {
  test('validates against catalogueSchema', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    ajv.addSchema(defsSchema).addSchema(catalogueEntrySchema);
    const valid = ajv.compile(catalogueSchema);
    expect(valid(bambuCatalogue), JSON.stringify(valid.errors?.slice(0, 5))).toBe(true);
  });

  test("assigns Bambu's 608 FFF keys: 512 Orca entries with a Bambu name, 96 bambu. entries", () => {
    expect(named).toHaveLength(512);
    expect(prefixed).toHaveLength(96);
    for (const [key, e] of prefixed)
      expect(e, key).toMatchObject({ native_only: 'bambu', native: { bambu: { key: key.slice(6) } } });
  });

  test('maps chamber_temperatures onto chamber_temperature, with both native names', () => {
    expect(orcaCatalogue.entries.chamber_temperature?.native).toEqual({
      orca: { key: 'chamber_temperature' },
      bambu: { key: 'chamber_temperatures' },
    });
    expect(bambuCatalogue.entries).not.toHaveProperty(['bambu.chamber_temperatures']);
    expect(orcaCatalogue.entries.machine_max_speed_x?.native.bambu).toEqual({ key: 'machine_max_speed_x' });
  });

  test('carries the AGPL notice and a BambuStudio provenance line on every bambu. entry', () => {
    expect(bambuCatalogue.notice).toMatch(/BambuStudio@79df7ae.*GNU Affero General Public License v3\.0/);
    for (const [, e] of prefixed)
      expect(e.provenance).toMatch(/^Ported from BambuStudio@79df7ae:src\/libslic3r\/PrintConfig\.cpp:\d+/);
  });
});

// The pinned sources live in .reference (ignored); without them only the committed data is checked.
const sources = existsSync(join(BAMBU_SOURCE, PRINT_CONFIG)) && existsSync(join(DEFAULT_SOURCE, PRINT_CONFIG));
describe.skipIf(!sources)('the Bambu generator, on BambuStudio@79df7ae', () => {
  const bambu = (path: string) => readFileSync(join(BAMBU_SOURCE, path), 'utf8');
  const orca = (path: string) => readFileSync(join(DEFAULT_SOURCE, path), 'utf8');

  test('is deterministic and matches the committed data', () => {
    const run = () =>
      render(
        generateBambu(generate(orca(PRINT_CONFIG), orca(PRESET), orca(CONSTANTS)), bambu(PRINT_CONFIG), bambu(PRESET))
          .bambu,
      );
    const first = run();
    expect(run()).toBe(first);
    expect(first).toBe(readFileSync(BAMBU_OUTPUT, 'utf8'));
  });

  test('cites the line that defines each bambu. key', () => {
    const lines = bambu(PRINT_CONFIG).split('\n');
    for (const [key, e] of prefixed) {
      const line = lines[Number(/PrintConfig\.cpp:(\d+)/.exec(e.provenance!)![1]) - 1]!;
      expect(line, key).toMatch(
        new RegExp(`add(?:_nullable)?\\("${key.slice(6)}"|add(?:_nullable)?\\(key,|for \\(auto& opt_key`),
      );
    }
  });

  test("each rename is Orca's own legacy mapping at the cited line", () => {
    const lines = orca(PRINT_CONFIG).split('\n');
    for (const [from, r] of Object.entries(BAMBU_RENAMES)) {
      expect(lines[r.line - 1], from).toContain(`opt_key == "${from}"`);
      expect(lines.slice(r.line, r.line + 10).join('\n'), from).toContain(`opt_key = "${r.orca}"`);
    }
  });

  test('leaves no Bambu FFF key unassigned', () => {
    const src = bambu(PRINT_CONFIG)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '');
    const fff = src.slice(
      src.indexOf('void PrintConfigDef::init_common_params()'),
      src.indexOf('void PrintConfigDef::init_extruder_option_keys()'),
    );
    const keys = [...fff.matchAll(/this->add(?:_nullable)?\("(\w+)"/g)]
      .map((m) => m[1]!)
      .filter((k) => !k.endsWith('_'));
    const assigned = new Set([...named.map(([, e]) => bambuName(e)), ...prefixed.map(([k]) => k.slice(6))]);
    expect(keys.length).toBeGreaterThan(500);
    for (const key of keys) expect(assigned.has(key), key).toBe(true);
  });
});
