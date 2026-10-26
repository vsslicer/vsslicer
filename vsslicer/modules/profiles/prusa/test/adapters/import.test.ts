// SPDX-License-Identifier: AGPL-3.0-or-later
import { allSchemas, entitySchemas, nativeKeys, type ImportResult, type SourceFile } from '@vsslicer/profile-api';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { MAX_INHERITS_DEPTH, MAX_PARENTS, splitList } from '../../src/adapters/import/flatten.ts';
import {
  importPrusaIni,
  MAX_IMPORT_BYTES,
  MAX_IMPORT_SECTIONS,
  MAX_INHERITED_KEYS,
  prusaIniImporter,
  type PrusaNative,
} from '../../src/adapters/import/import.ts';
import { MAX_KEYS_PER_SECTION, MAX_SECTIONS } from '../../src/adapters/ini/parse.ts';

const file = (path: string, text: string): SourceFile => ({ path, bytes: new TextEncoder().encode(text) });
const VENDOR = '[vendor]\nname = Test\nconfig_version = 1.0.0\n';
const nat = (r: ImportResult, id: string) => r.native[id] as PrusaNative;
const ent = (r: ImportResult, id: string) => r.entities.find((e) => e.id === id) as unknown as Record<string, unknown>;
const codes = (r: ImportResult) => r.diagnostics.filter((d) => d.severity !== 'info').map((d) => d.code);

const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const s of allSchemas) ajv.addSchema(s);
const SCHEMA = {
  vendor: 'vendor',
  printer_model: 'printer_model',
  printer: 'printer_model',
  print: 'process',
  filament: 'material',
} as const;
const validators = Object.fromEntries(Object.entries(SCHEMA).map(([k, s]) => [k, ajv.compile(entitySchemas[s])]));
/** Entity fields read from a native key, besides `settings`. */
const FIELD_KEYS = new Set([
  ...['name', 'config_version', 'repo_id', 'technology', 'family', 'bed_model', 'bed_texture', 'thumbnail'],
  ...['default_materials', 'inherits', 'renamed_from', 'compatible_printers_condition', 'printer_technology'],
  ...['printer_model', 'default_print_profile', 'default_filament_profile'],
]);

/** Every entity validates, and every native key is either converted into a field or setting or listed native-only. */
function checkAll(r: ImportResult) {
  for (const e of r.entities) {
    const n = nat(r, e.id);
    const validate = validators[n.kind]!;
    expect(validate(e), `${e.id}: ${JSON.stringify(validate.errors)}`).toBe(true);
    const settings = (e as { settings?: object }).settings ?? {};
    const mapped = new Set(Object.keys(settings).flatMap((k) => nativeKeys('prusa', k)));
    for (const k of Object.keys(n.values)) {
      if (!n.native_only.includes(k)) expect(mapped.has(k) || FIELD_KEYS.has(k), `${e.id}: ${k}`).toBe(true);
    }
  }
}

const PIN = join(
  import.meta.dirname,
  '../../../../../.reference/repos/PrusaSlicer-2.9/resources/profiles/PrusaResearch.ini',
);
describe.skipIf(!existsSync(PIN))('golden: PrusaResearch.ini@b028299 (skips without the .reference clone)', () => {
  const text = existsSync(PIN) ? readFileSync(PIN) : new Uint8Array();
  const r = importPrusaIni([{ path: 'PrusaResearch.ini', bytes: text }]);

  test('1 vendor, 35 models, 217 + 519 + 5 761 presets once the 21 + 114 + 308 abstract sections are gone', () => {
    const count: Record<string, number> = {};
    for (const id of Object.keys(r.native)) count[nat(r, id).kind] = (count[nat(r, id).kind] ?? 0) + 1;
    expect(count).toEqual({ vendor: 1, printer_model: 35, printer: 217, print: 519, filament: 5761 });
    expect(r.entities).toHaveLength(6533);
    // sections as written: 238 printers, 633 prints, 6 069 filaments (profiles.md section 1)
    const raw = new TextDecoder().decode(text);
    expect([/^\[printer:/gm, /^\[print:/gm, /^\[filament:/gm].map((re) => raw.match(re)!.length)).toEqual([
      238, 633, 6069,
    ]);
    expect(r.entities.filter((e) => e.id.startsWith('*'))).toEqual([]);
    expect(codes(r)).toEqual([]);
  });

  test('every entity validates and every native key is mapped or native-only', () => checkAll(r));

  test('multi-parent flattening: MK4S 0.4 takes *MK4S_LFNOZZLE* (listed last) over the HF parent', () => {
    const v = nat(r, 'Original Prusa MK4S 0.4 nozzle').values;
    expect(v['printer_variant']).toBe('0.4');
    expect(v['nozzle_high_flow']).toBe('0');
    expect(v['inherits']).toBeUndefined();
    expect(ent(r, 'Original Prusa MK4S 0.4 nozzle')['family']).toBe('MK4S');
  });
});

describe('flattening', () => {
  const r = importPrusaIni([
    file(
      'b.ini',
      `${VENDOR}[print:*a*]\nlayer_height = 0.1\nperimeters = 1\nrenamed_from = "old"\n[print:*b*]\nperimeters = 2\nbrim_width = 5\n` +
        `[print:P]\ninherits = *a*; *b*\nbrim_width = 3\nfoo = bar\n[print:Q]\ninherits = P; *nope*\n` +
        `[print:C1]\ninherits = C2\nlayer_height = 0.2\n[print:C2]\ninherits = C1\n[print:D]\ninherits = C1\n`,
    ),
  ]);

  test('last-listed parent wins, the child beats all, renamed_from is not inherited, abstract sections are dropped', () => {
    expect(nat(r, 'P').values).toEqual({ brim_width: '3', foo: 'bar', perimeters: '2', layer_height: '0.1' });
    expect(ent(r, 'P')['settings']).toEqual({ brim_width: 3, layer_height: 0.1, wall_loops: 2 });
    expect(nat(r, 'P').native_only).toEqual(['foo']);
    expect(r.entities.map((e) => e.id)).toEqual(['Test', 'P', 'Q']);
    checkAll(r);
  });

  test('unknown parent and cycle give diagnostics with file and line; other entities import', () => {
    const errs = r.diagnostics.filter((d) => d.severity === 'error');
    expect(errs.map((d) => [d.code, d.file, d.line])).toEqual([
      ['unknown-parent', 'b.ini', 16],
      ['cycle', 'b.ini', 17],
      ['cycle', 'b.ini', 20],
      ['cycle', 'b.ini', 22],
    ]);
    expect(ent(r, 'Q')['layer_height']).toBe(0.1);
  });

  test('splitList follows unescape_strings_cstyle', () => {
    expect(splitList('a; "b;\\"c"; d')).toEqual(['a', 'b;"c', 'd']);
    expect(splitList('a ;b')).toEqual(['a ', 'b']);
    expect(splitList('a;')).toEqual(['a', '']);
    expect(splitList('"a')).toBeUndefined();
    expect(splitList('"a" b')).toBeUndefined();
  });
});

describe('user presets', () => {
  const path = 'user/print/My 0.15mm @MK4S.ini';
  const r = importPrusaIni([{ path, bytes: readFileSync(join(import.meta.dirname, '../fixtures/ini', path)) }]);

  test('a header-less file under print/ imports with inherits kept and a converted condition', () => {
    expect(codes(r)).toEqual([]);
    const e = ent(r, 'My 0.15mm @MK4S');
    expect(e['inherits']).toEqual(['0.20mm SPEED @MK4S 0.4']);
    expect(e['layer_height']).toBe(0.15);
    expect(e['when']).toContain('nozzle.diameter == 0.4');
    expect(nat(r, 'My 0.15mm @MK4S').values['inherits']).toBe('0.20mm SPEED @MK4S 0.4');
    checkAll(r);
  });

  test('a child in the same file inherits its parent system preset; a file outside a kind folder is refused', () => {
    const r2 = importPrusaIni([
      file('bundle.ini', '[print:U]\ninherits = Sys\nlayer_height = 0.3\n[print:V]\ninherits = U\n'),
      file('notes/x.ini', 'layer_height = 0.1\n'),
    ]);
    expect(ent(r2, 'V')['inherits']).toEqual(['Sys']);
    expect(r2.diagnostics.map((d) => [d.code, d.file])).toEqual([['unknown-type', 'notes/x.ini']]);
    expect(prusaIniImporter.canHandle(file('a.INI', ''))).toBe(true);
    expect(prusaIniImporter.canHandle(file('a.json', ''))).toBe(false);
  });

  test('a condition beside a non-empty compatible_printers stays native, as upstream ignores it', () => {
    const cond = 'layer_height = 0.2\ncompatible_printers_condition = nozzle_diameter[0]==0.6\n';
    const r2 = importPrusaIni([
      file('print/X.ini', `compatible_printers = "Original Prusa MK4S 0.4 nozzle"\n${cond}`),
      file('print/Y.ini', `compatible_printers = \n${cond}`),
    ]);
    expect(ent(r2, 'X')['when']).toBeUndefined();
    expect(nat(r2, 'X').native_only).toEqual(
      expect.arrayContaining(['compatible_printers', 'compatible_printers_condition']),
    );
    expect(r2.diagnostics.filter((d) => d.file === 'print/X.ini').map((d) => d.severity)).toEqual(['info']);
    expect(ent(r2, 'Y')['when']).toBe('nozzle.diameter == 0.6');
    expect(r2.diagnostics.filter((d) => d.file === 'print/Y.ini')).toEqual([]);
  });

  test('ids such as __proto__ get an own native entry', () => {
    const r2 = importPrusaIni([
      file('b.ini', '[print:__proto__]\nlayer_height = 0.2\n[print:constructor]\nlayer_height = 0.2\n'),
    ]);
    expect(r2.entities.map((e) => e.id)).toEqual(['__proto__', 'constructor']);
    expect(Object.keys(r2.native)).toEqual(['__proto__', 'constructor']);
    expect(Object.getPrototypeOf(r2.native)).toBe(Object.prototype);
    expect(nat(r2, '__proto__').values['layer_height']).toBe('0.2');
  });
});

describe('bounds (rule 25)', () => {
  const chain = (n: number) =>
    VENDOR +
    Array.from({ length: n }, (_, i) => `[print:L${i}]\n${i ? `inherits = L${i - 1}\n` : 'layer_height = 0.2\n'}`).join(
      '',
    );

  test(`an inherits chain of ${MAX_INHERITS_DEPTH} imports; one level more is refused with a diagnostic`, () => {
    const ok = importPrusaIni([file('a.ini', chain(MAX_INHERITS_DEPTH))]);
    expect(codes(ok)).toEqual([]);
    const deep = importPrusaIni([file('a.ini', chain(MAX_INHERITS_DEPTH + 1))]);
    expect(deep.entities).toHaveLength(MAX_INHERITS_DEPTH + 1); // vendor + the first 32 links
    expect(deep.diagnostics.map((d) => d.message)).toEqual([expect.stringContaining('deeper than')]);
  });

  test(`more than ${MAX_PARENTS} parents: the rest are ignored`, () => {
    const parents = Array.from({ length: MAX_PARENTS + 1 }, (_, i) => `[print:*p${i}*]\nk${i} = ${i}\n`).join('');
    const names = Array.from({ length: MAX_PARENTS + 1 }, (_, i) => `*p${i}*`).join(';');
    const r = importPrusaIni([
      file('a.ini', `${VENDOR}${parents}[print:C]\ninherits = ${names}\nlayer_height = 0.2\n`),
    ]);
    expect(codes(r)).toEqual(['malformed-line']);
    expect(Object.keys(nat(r, 'C').values)).toHaveLength(MAX_PARENTS + 1); // layer_height + one key per kept parent
  });

  test('a 20 000-section cycle is reported linearly; diagnostics stay capped', { timeout: 60_000 }, () => {
    const n = 20_000;
    const text = VENDOR + Array.from({ length: n }, (_, i) => `[print:c${i}]\ninherits = c${(i + 1) % n}\n`).join('');
    const r = importPrusaIni([file('a.ini', text)]);
    expect(r.entities).toHaveLength(1);
    expect(r.diagnostics.length).toBeLessThanOrEqual(1001);
    expect(r.diagnostics[0]!.code).toBe('cycle');
  });

  test(`inherited keys are budgeted over the whole call (${MAX_INHERITED_KEYS})`, { timeout: 60_000 }, () => {
    // one parent at the per-section key cap, inherited by enough children (in two files) to pass the budget
    const parent = `[print:*big*]\nlayer_height = 0.2\n${Array.from({ length: MAX_KEYS_PER_SECTION - 1 }, (_, i) => `k${i} = 1\n`).join('')}`;
    const kids = (from: number, n: number) =>
      Array.from({ length: n }, (_, i) => `[print:K${from + i}]\ninherits = *big*\n`).join('');
    const half = Math.ceil(MAX_INHERITED_KEYS / MAX_KEYS_PER_SECTION / 2) + 1;
    const r = importPrusaIni([
      file('a.ini', VENDOR + parent + kids(0, half)),
      file('b.ini', parent + kids(half, half)),
    ]);
    const err = r.diagnostics.filter((d) => d.severity === 'error');
    expect(err).toEqual([
      expect.objectContaining({ file: 'b.ini', message: expect.stringContaining('inherited keys') }),
    ]);
    expect(r.entities.length).toBeLessThan(2 * half);
  });

  test(`sections are capped over the whole call (${MAX_IMPORT_SECTIONS})`, () => {
    // sections of no preset kind: counted, but never flattened or mapped, so nothing else reports on them
    const many = (p: string) => Array.from({ length: MAX_SECTIONS - 1 }, (_, i) => `[${p}${i}]\n`).join('');
    const r = importPrusaIni([file('a.ini', many('a')), file('b.ini', many('b')), file('c.ini', many('c'))]);
    const err = r.diagnostics.filter((d) => d.severity === 'error');
    expect(err.map((d) => [d.file, d.message])).toEqual([['c.ini', expect.stringContaining('sections')]]);
  });

  test(`bytes are capped over the whole call (${MAX_IMPORT_BYTES}), checked before a file is read`, () => {
    // shortcut: a stand-in that only reports its size; the cap must refuse it before anything reads it
    const big = (path: string): SourceFile => ({ path, bytes: { byteLength: 60 * 1024 * 1024 } as Uint8Array });
    const r = importPrusaIni([file('a.ini', VENDOR), ...['1', '2', '3', '4', '5'].map((n) => big(`${n}.ini`))]);
    expect(r.diagnostics.at(-1)).toEqual(
      expect.objectContaining({ file: '5.ini', message: expect.stringContaining('bytes') }),
    );
    expect(r.diagnostics.some((d) => d.file === '5.ini' && d.message.includes('UTF-8'))).toBe(false);
  });
});
