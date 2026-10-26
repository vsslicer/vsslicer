// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  allSchemas,
  applyOverrides,
  entitySchemas,
  nativeKeys,
  type ImportResult,
  type PrinterModel,
  type SourceFile,
} from '@vsslicer/profile-api';
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
import { noteTags } from '../../src/adapters/import/notes.ts';
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
const validators = Object.fromEntries(
  [...Object.entries(SCHEMA), ['nozzle', 'nozzle'] as const].map(([k, s]) => [k, ajv.compile(entitySchemas[s])]),
);
/** The printer_model a split nozzle belongs to. */
const modelOf = (r: ImportResult, id: string) =>
  r.entities.find((e) => (e as PrinterModel).nozzles?.includes(id)) as PrinterModel | undefined;
/** A split nozzle's settings: its model with the nozzle's overrides applied. */
const resolved = (r: ImportResult, id: string) => applyOverrides(modelOf(r, id)!, { nozzle: { id } }).entity.settings;
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
    const nozzle = n.kind === 'printer' && 'diameter' in e;
    const validate = validators[nozzle ? 'nozzle' : n.kind]!;
    expect(validate(e), `${e.id}: ${JSON.stringify(validate.errors)}`).toBe(true);
    const settings = (nozzle ? resolved(r, e.id) : (e as { settings?: object }).settings) ?? {};
    // `tags` comes from printer_notes, which stays native
    const mapped = new Set(
      Object.keys(settings)
        .filter((k) => k !== 'tags')
        .flatMap((k) => nativeKeys('prusa', k)),
    );
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
    expect(modelOf(r, 'Original Prusa MK4S 0.4 nozzle')!.id).toBe('MK4S');
  });

  test('200 presets split into nozzles that resolve to the unsplit preset; the 17 MMU multi-extruder ones stay', () => {
    const u = importPrusaIni([{ path: 'PrusaResearch.ini', bytes: text }], { splitVariants: false });
    const nozzles = r.entities.filter((e) => nat(r, e.id).kind === 'printer' && 'diameter' in e);
    expect(nozzles).toHaveLength(200);
    for (const n of nozzles) {
      const orig = ent(u, n.id) as unknown as PrinterModel;
      expect(resolved(r, n.id), n.id).toEqual(orig.settings);
      expect(modelOf(r, n.id)!.bed).toEqual(orig.bed);
      expect(modelOf(r, n.id)!.toolheads).toEqual(orig.toolheads);
      const un = nat(u, n.id);
      const defaults = ['default_print_profile', 'default_filament_profile'].filter((k) => Object.hasOwn(un.values, k));
      expect(r.native[n.id]).toEqual({ ...un, native_only: [...un.native_only, ...defaults] });
    }
    const kept = r.diagnostics.filter((d) => d.message.includes('not split'));
    expect(kept.map((d) => d.severity)).toEqual(Array(17).fill('info'));
    expect(ent(r, 'MK4S')['nozzles']).toHaveLength(10);
  });
});

describe('nozzle variants', () => {
  const fixture = readFileSync(join(import.meta.dirname, '../fixtures/ini/mk4s-nozzles.ini'));
  const r = importPrusaIni([{ path: 'mk4s-nozzles.ini', bytes: fixture }]);
  const u = importPrusaIni([{ path: 'mk4s-nozzles.ini', bytes: fixture }], { splitVariants: false });
  const ids = ['Original Prusa MK4S 0.4 nozzle', 'Original Prusa MK4S 0.6 nozzle'];

  test('MK4S 0.4/0.6 become 1 printer_model + 2 nozzles; model plus nozzle resolves to each original preset', () => {
    expect(codes(r)).toEqual([]);
    expect(r.entities.map((e) => [e.id, nat(r, e.id).kind])).toEqual([
      ['prusa-fff', 'vendor'],
      ['MK4S', 'printer_model'],
      [ids[0], 'printer'],
      [ids[1], 'printer'],
    ]);
    expect(r.entities.slice(2)).toEqual([
      { id: ids[0], diameter: 0.4, flow: 'standard' },
      { id: ids[1], diameter: 0.6, flow: 'standard' },
    ]);
    const m = ent(r, 'MK4S') as unknown as PrinterModel;
    expect(m.nozzles).toEqual(ids);
    expect(m.overrides!.map((o) => o.when)).toEqual(ids.map((id) => `nozzle.id == '${id}'`));
    for (const id of ids) {
      const orig = ent(u, id) as unknown as PrinterModel;
      expect(resolved(r, id)).toEqual(orig.settings);
      expect([m.bed, m.toolheads]).toEqual([orig.bed, orig.toolheads]);
    }
    expect(m.settings!['tags']).toEqual(['PRINTER_MODEL_MK4S', 'PG', 'NO_TEMPLATES']);
    checkAll(r);
  });

  test('the native form of each original preset stays attached under the nozzle id', () => {
    for (const id of ids) {
      const defaults = ['default_print_profile', 'default_filament_profile'];
      expect(r.native[id]).toEqual({ ...nat(u, id), native_only: [...nat(u, id).native_only, ...defaults] });
      expect(nat(r, id).values['printer_variant']).toBe(id.split(' ').at(-2));
    }
  });

  test("a nozzle keeps its preset's default print and filament native (PRF-206)", () => {
    expect(ids.map((id) => [nat(r, id).values['default_print_profile'], nat(r, id).native_only.slice(-2)])).toEqual([
      ['0.20mm SPEED @MK4S 0.4', ['default_print_profile', 'default_filament_profile']],
      ['0.25mm SPEED @MK4S 0.6', ['default_print_profile', 'default_filament_profile']],
    ]);
    // the unsplit preset holds them as entity defaults instead, so they are not native there
    for (const id of ids) expect(nat(u, id).native_only).not.toContain('default_print_profile');
  });

  test('a nozzle lists only the default keys its preset has (PRF-206)', () => {
    const bed = 'bed_shape = 0x0,220x0,220x220,0x220\nprinter_model = M\n';
    const r2 = importPrusaIni([
      file(
        'b.ini',
        VENDOR +
          '[printer_model:M]\nname = M\nvariants = 0.4; 0.6\n' +
          `[printer:M 0.4]\n${bed}printer_variant = 0.4\nnozzle_diameter = 0.4\ndefault_print_profile = P\n` +
          `[printer:M 0.6]\n${bed}printer_variant = 0.6\nnozzle_diameter = 0.6\ndefault_filament_profile = F\n`,
      ),
    ]);
    expect(r2.entities.filter((e) => 'diameter' in e).length).toBe(2);
    const defaults = (id: string) => nat(r2, id).native_only.filter((k) => k.startsWith('default_'));
    expect([defaults('M 0.4'), defaults('M 0.6')]).toEqual([['default_print_profile'], ['default_filament_profile']]);
  });

  describe('one name in several kinds (PRF-202)', () => {
    const skipped = (r2: ImportResult) => r2.diagnostics.filter((d) => d.message.includes('already imported'));

    test('[printer_model:SV06] and its nozzle [printer:SV06] both survive; the nozzle id is kind-qualified', () => {
      const r2 = importPrusaIni([
        file(
          'b.ini',
          VENDOR +
            '[printer_model:SV06]\nname = SV06\nvariants = 0.4\n' +
            '[printer:SV06]\nbed_shape = 0x0,220x0,220x220,0x220\nprinter_model = SV06\nprinter_variant = 0.4\n' +
            'nozzle_diameter = 0.4\nretract_length = 0.8\n',
        ),
      ]);
      expect(skipped(r2)).toEqual([]);
      expect(r2.entities.map((e) => [e.id, nat(r2, e.id).kind, nat(r2, e.id).name])).toEqual([
        ['Test', 'vendor', ''],
        ['SV06', 'printer_model', 'SV06'],
        ['printer:SV06', 'printer', 'SV06'],
      ]);
      const m = ent(r2, 'SV06') as unknown as PrinterModel;
      expect(m.nozzles).toEqual(['printer:SV06']);
      expect(resolved(r2, 'printer:SV06')!['retraction_length']).toBe(0.8);
    });

    test('a model named like its vendor (live Jubilee) is qualified and still gets its nozzles', () => {
      const r2 = importPrusaIni([
        file(
          'b.ini',
          VENDOR +
            '[printer_model:Test]\nname = Test\nvariants = 0.4\n' +
            '[printer:Test]\nbed_shape = 0x0,300x0,300x300,0x300\nprinter_model = Test\nprinter_variant = 0.4\n' +
            'nozzle_diameter = 0.4\n',
        ),
      ]);
      expect(skipped(r2)).toEqual([]);
      expect(r2.entities.map((e) => e.id)).toEqual(['Test', 'printer_model:Test', 'printer:Test']);
      expect(ent(r2, 'printer_model:Test')['nozzles']).toEqual(['printer:Test']);
    });

    test('a model and an unsplit printer of one name keep the printer settings', () => {
      const r2 = importPrusaIni([
        file(
          'b.ini',
          VENDOR +
            '[printer_model:Jubilee]\nname = Jubilee\n' +
            '[printer:Jubilee]\nbed_shape = 0x0,300x0,300x300,0x300\nprinter_model = Jubilee\nnozzle_diameter = 0.4\n',
        ),
      ]);
      expect(skipped(r2)).toEqual([]);
      expect(r2.entities.map((e) => e.id)).toEqual(['Test', 'Jubilee', 'printer:Jubilee']);
      expect((ent(r2, 'printer:Jubilee') as unknown as PrinterModel).settings!['printable_area']).toBeDefined();
    });

    test('user presets print/, filament/ and printer/ "My MK4" give three entities', () => {
      const r2 = importPrusaIni([
        file('print/My MK4.ini', 'layer_height = 0.2\n'),
        file('filament/My MK4.ini', 'filament_type = PLA\nfilament_diameter = 1.75\n'),
        file('printer/My MK4.ini', 'bed_shape = 0x0,1x0,1x1\nnozzle_diameter = 0.4\n'),
      ]);
      expect(skipped(r2)).toEqual([]);
      expect(r2.entities.map((e) => [e.id, nat(r2, e.id).kind])).toEqual([
        ['My MK4', 'print'],
        ['filament:My MK4', 'filament'],
        ['printer:My MK4', 'printer'],
      ]);
    });

    test('hostile: a qualified id another section already holds, a same-kind repeat and __proto__ are skipped, not overwritten', () => {
      const r2 = importPrusaIni([
        file('print/__proto__.ini', 'layer_height = 0.2\n'),
        file('filament/__proto__.ini', 'filament_type = PLA\nfilament_diameter = 1.75\n'),
        file('b.ini', '[print:filament:X]\nlayer_height = 0.3\n[print:X]\nlayer_height = 0.2\n'),
        file('filament/X.ini', 'filament_type = PETG\nfilament_diameter = 1.75\n'),
        file('print/X.ini', 'layer_height = 0.1\n'),
      ]);
      expect(r2.entities.map((e) => e.id)).toEqual(['__proto__', 'filament:__proto__', 'filament:X', 'X']);
      expect(nat(r2, 'filament:X').kind).toBe('print'); // the section of that name came first
      expect(skipped(r2)).toHaveLength(2); // filament/X.ini as filament:X, print/X.ini as X
      expect(Object.getPrototypeOf(r2.native)).toBe(Object.prototype);
    });
  });

  const bundle = (presets: string) =>
    VENDOR +
    '[printer_model:M]\nname = M\nvariants = 0.4; HF0.4\n' +
    '[printer:*common*]\nbed_shape = 0x0,250x0,250x210,0x210\nprinter_model = M\nmax_print_height = 220\n' +
    presets;

  test('quotes and backslashes in an id are escaped in the override condition; high flow is read', () => {
    const r2 = importPrusaIni([
      file(
        'b.ini',
        bundle(
          "[printer:It's 0.4]\ninherits = *common*\nprinter_variant = 0.4\nnozzle_diameter = 0.4\nretract_length = 0.8\n" +
            '[printer:A\\b HF0.4]\ninherits = *common*\nprinter_variant = HF0.4\nnozzle_diameter = 0.4\n' +
            'nozzle_high_flow = 1\nretract_length = 0.6\n',
        ),
      ),
    ]);
    expect(codes(r2)).toEqual([]);
    expect(ent(r2, 'A\\b HF0.4')['flow']).toBe('high_flow');
    for (const [id, len] of [
      ["It's 0.4", 0.8],
      ['A\\b HF0.4', 0.6],
    ] as const) {
      const a = applyOverrides(modelOf(r2, id)!, { nozzle: { id } });
      expect([a.diagnostics, a.applied.length, a.entity.settings!['retraction_length']]).toEqual([[], 1, len]);
    }
  });

  test('a preset with other toolheads than its model, or without a variant, or in a user file, is not split', () => {
    const r2 = importPrusaIni([
      file(
        'b.ini',
        bundle(
          '[printer:P1]\ninherits = *common*\nprinter_variant = 0.4\nnozzle_diameter = 0.4\n' +
            '[printer:P5]\ninherits = *common*\nprinter_variant = 0.4\nnozzle_diameter = 0.4,0.4,0.4,0.4,0.4\n' +
            '[printer:PB]\ninherits = *common*\nprinter_variant = 0.4\nnozzle_diameter = 0.4\nbed_shape = 0x0,9x0,9x9,0x9\n' +
            '[printer:PD]\ninherits = *common*\nprinter_variant = 0.4\nnozzle_diameter = abc\n' +
            '[printer:PX]\ninherits = *common*\nnozzle_diameter = 0.4\n',
        ),
      ),
      file(
        'printer/Mine.ini',
        'bed_shape = 0x0,1x0,1x1\nprinter_model = M\nprinter_variant = 0.4\nnozzle_diameter = 0.4\n',
      ),
    ]);
    expect(r2.entities.filter((e) => 'diameter' in e).map((e) => e.id)).toEqual(['P1']);
    expect(ent(r2, 'M')['nozzles']).toEqual(['P1']);
    for (const id of ['P5', 'PB', 'PD', 'PX', 'Mine']) expect(ent(r2, id)['family']).toBe('M');
    expect(r2.diagnostics.filter((d) => d.message.includes('split')).map((d) => [d.severity, d.message])).toEqual([
      ['info', expect.stringContaining('P5: bed or toolheads differ')],
      ['info', expect.stringContaining('PB: bed or toolheads differ')],
      ['warning', expect.stringContaining('PD: no nozzle diameter')],
    ]);
  });
});

describe('printer_notes tags', () => {
  test('keywords in the tag table become tags; an unknown keyword gives a diagnostic and no tag', () => {
    const r2 = importPrusaIni([
      file(
        'printer/N.ini',
        'bed_shape = 0x0,1x0,1x1\nnozzle_diameter = 0.4\n' +
          "printer_notes = Don't remove the following keywords!\\nPRINTER_MODEL_XL\\nPG\\nPG\\nMY_KEYWORD\\n\n",
      ),
    ]);
    expect((ent(r2, 'N')['settings'] as Record<string, unknown>)['tags']).toEqual(['PRINTER_MODEL_XL', 'PG']);
    expect(r2.diagnostics.map((d) => [d.severity, d.code, d.line, d.message])).toEqual([
      ['warning', 'unknown-type', 3, expect.stringContaining('MY_KEYWORD')],
    ]);
    expect(nat(r2, 'N').native_only).toContain('printer_notes');
  });

  test('noteTags unescapes as unescape_string_cstyle and skips prose', () => {
    expect(noteTags('a\\nPG\\r\\nHF_NOZZLE\\\\nx\\')).toEqual({ tags: ['PG'], unknown: [] }); // `\\\\n` is a backslash and n
    expect(noteTags('PG\nNot a keyword\n  INPUT_SHAPER  \nFOO.1')).toEqual({
      tags: ['PG', 'INPUT_SHAPER'],
      unknown: ['FOO.1'],
    });
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

  test('the inherited-keys cap stays near the measured need: at most 1M, at least 2x the pinned bundle (476 151)', () => {
    expect(MAX_INHERITED_KEYS).toBeLessThanOrEqual(1_000_000);
    expect(MAX_INHERITED_KEYS).toBeGreaterThanOrEqual(2 * 476_151);
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
