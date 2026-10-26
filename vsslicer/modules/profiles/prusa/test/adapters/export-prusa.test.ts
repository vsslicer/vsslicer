// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  MAPPED_KEYS,
  nativeKeys,
  type ImportedEntity,
  type ImportResult,
  type Process,
  type SourceFile,
} from '@vsslicer/profile-api';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  exportPrusaIni,
  MAX_EXPORT_BYTES,
  MAX_EXPORT_ENTITIES,
  prusaIniExporter,
} from '../../src/adapters/export/prusa/export.ts';
import { canon, g } from '../../src/adapters/export/prusa/serialize.ts';
import { OPTION_TYPES } from '../../src/adapters/export/prusa/types.ts';
import { importPrusaIni, type PrusaNative } from '../../src/adapters/import/import.ts';
import { MAX_DIAGNOSTICS, MAX_KEYS_PER_SECTION, MAX_LINE_LENGTH } from '../../src/adapters/ini/parse.ts';

const FIX = join(import.meta.dirname, '../fixtures');
const read = (p: string) => readFileSync(join(FIX, p));
const file = (path: string, text: string | Uint8Array): SourceFile => ({
  path,
  bytes: typeof text === 'string' ? new TextEncoder().encode(text) : new Uint8Array(text),
});
const str = (f: SourceFile | undefined) => new TextDecoder().decode(f?.bytes);
const out = (r: ReturnType<typeof exportPrusaIni>, path: string) => str(r.files.find((f) => f.path === path));
const errors = (r: { diagnostics: { severity: string }[] }) => r.diagnostics.filter((d) => d.severity !== 'info');
/** The lines of a text minus its leading `#`/`;` header and blank lines: what a header-less writer can give back. */
const body = (t: string) => t.replace(/^\uFEFF?(?:[#;][^\n]*\n|\n)*/, '');
const proc = (r: ImportResult, id: string) => r.entities.find((e) => e.id === id) as Process;
/** The import with one entity's settings replaced. */
const edited = (r: ImportResult, id: string, f: (s: Record<string, unknown>) => void, extra: object = {}) => {
  const e = structuredClone(proc(r, id)) as Process & Record<string, unknown>;
  f(e.settings as Record<string, unknown>);
  Object.assign(e, extra);
  return { entities: [e as ImportedEntity], native: { [id]: r.native[id] } };
};
const lineDiff = (a: string, b: string) => {
  const A = new Set(a.split('\n'));
  const B = new Set(b.split('\n'));
  return { removed: [...A].filter((l) => !B.has(l)), added: [...B].filter((l) => !A.has(l)) };
};

describe('PrusaSlicer serializer (port of the PRF-43 probe)', () => {
  test('%g with precision 6', () => {
    expect([0.2, 1000000, 0.0001, 0.00001, 123456.7, 0.123456789, 1.5, 0, -0, 1e21].map(g)).toEqual([
      '0.2',
      '1e+06',
      '0.0001',
      '1e-05',
      '123457',
      '0.123457',
      '1.5',
      '0',
      '-0',
      '1e+21',
    ]);
  });
  test('canon per option type', () => {
    expect(canon('coFloats', '0.40,0.4')).toBe('0.4,0.4');
    expect(canon('coPercent', '80')).toBe('80%');
    expect(canon('coPercents', '15%,nil')).toBe('15%,nil');
    expect(canon('coFloatOrPercent', '150')).toBe('150');
    expect(canon('coFloatOrPercent', '0.30%')).toBe('0.3%');
    expect(canon('coInt', '3')).toBe('3');
    expect(canon('coInt', 'x')).toBeUndefined();
    expect(canon('coFloat', 'abc')).toBeUndefined();
    expect(canon('coString', 'M104 \\"x\\"\nG28')).toBe('M104 "x"\\nG28');
    expect(canon('coStrings', '"PLA"')).toBe('PLA');
    expect(canon('coStrings', '""')).toBe('""');
    expect(canon('coStrings', 'a b;c')).toBe('"a b";c');
    expect(canon('coStrings', '"unterminated')).toBeUndefined();
    expect(canon('coPoints', '0x0,250.0x0')).toBe('0x0,250x0');
    expect(canon('coBool', '1')).toBe('1');
  });
  test('the type table holds every option the mapped keys write, and the copied filament overrides', () => {
    const missing = MAPPED_KEYS.flatMap((k) => {
      try {
        return nativeKeys('prusa', k).filter((n) => !OPTION_TYPES.has(n));
      } catch {
        return [];
      }
    });
    expect(missing).toEqual([]);
    expect(OPTION_TYPES.get('filament_retract_before_wipe')).toBe('coPercents');
    expect(OPTION_TYPES.get('filament_seam_gap_distance')).toBe('coFloatsOrPercents');
    expect(OPTION_TYPES.get('machine_max_jerk_e')).toBe('coFloats');
  });
  test('a file PrusaSlicer wrote is a fixed point on every typed line', () => {
    const lines = body(read('export-prusa/default_fff.ini').toString('utf8')).split('\n').filter(Boolean);
    const typed = lines.map((l) => l.split(' = ')).filter(([k]) => OPTION_TYPES.has(k!));
    expect(typed.length).toBeGreaterThan(300);
    expect(typed.filter(([k, v]) => canon(OPTION_TYPES.get(k!)!, v!) !== v)).toEqual([]);
  });
});

describe('round trips', () => {
  test('a user preset fixture gives back its stored lines byte for byte (header aside)', () => {
    const src = read('ini/user/print/My 0.15mm @MK4S.ini');
    const r = exportPrusaIni(importPrusaIni([file('print/My 0.15mm @MK4S.ini', src)]));
    expect(r.files.map((f) => f.path)).toEqual(['print/My 0.15mm @MK4S.ini']);
    expect(out(r, 'print/My 0.15mm @MK4S.ini')).toBe(body(src.toString('utf8')));
    expect(errors(r)).toEqual([]);
  });

  test.each(['print', 'filament', 'printer'])(
    'a file PrusaSlicer wrote round-trips byte for byte as a %s preset',
    (kind) => {
      const src = read('export-prusa/default_fff.ini');
      const imp = importPrusaIni([file(`${kind}/default_fff.ini`, src)]);
      expect(imp.entities).toHaveLength(1);
      const r = exportPrusaIni(imp);
      expect(out(r, `${kind}/default_fff.ini`)).toBe(body(src.toString('utf8')));
      expect(errors(r)).toEqual([]);
    },
  );

  test('a hand-written user preset (BOM, CRLF, padding) keeps its values and is stable', () => {
    const imp = importPrusaIni([file('print/user-preset.ini', read('ini/user-preset.ini'))]);
    const once = exportPrusaIni(imp);
    const again = importPrusaIni(once.files);
    expect((again.native['user-preset'] as PrusaNative).values).toEqual(
      (imp.native['user-preset'] as PrusaNative).values,
    );
    expect(exportPrusaIni(again).files).toEqual(once.files);
  });

  test.each(['ini/bundle.ini', 'ini/mk4s-nozzles.ini', 'ini/superslicer.ini'])(
    'vendor presets of %s: export is idempotent and re-imports to the same values',
    (p) => {
      const imp = importPrusaIni([file(p, read(p))]);
      const once = exportPrusaIni(imp);
      expect(once.files.length).toBeGreaterThan(0);
      expect(errors(once)).toEqual([]);
      const again = importPrusaIni(once.files);
      for (const f of once.files) {
        const id = f.path.replace(/^\w+\//, '').replace(/\.ini$/, '');
        expect((again.native[id] as PrusaNative).values, id).toEqual((imp.native[id] as PrusaNative).values);
      }
      expect(exportPrusaIni(again).files).toEqual(once.files);
    },
  );
});

describe('edits', () => {
  const src = read('export-prusa/default_fff.ini');
  const imp = importPrusaIni([file('print/default_fff.ini', src)]);
  const before = body(src.toString('utf8'));
  const run = (f: (s: Record<string, unknown>) => void, extra?: object) => {
    const r = exportPrusaIni(edited(imp, 'default_fff', f, extra));
    return { r, diff: lineDiff(before, out(r, 'print/default_fff.ini')) };
  };

  test('only the edited keys change, formatted by PrusaSlicer rules', () => {
    const { r, diff } = run((s) => {
      s['layer_height'] = 0.30000000000000004;
      s['wall_loops'] = 4;
      s['sparse_infill_density'] = 25;
      s['machine_start_gcode'] = 'G28\nM104 "x"';
      s['enable_support'] = true;
    });
    expect(diff.removed.map((l) => l.slice(0, 20)).sort()).toEqual(
      [
        'fill_density = 15%',
        'layer_height = 0.2',
        'perimeters = 2',
        'start_gcode = M862.3',
        'support_material = 0',
      ].sort(),
    );
    expect(diff.added.sort()).toEqual(
      [
        'layer_height = 0.3',
        'perimeters = 4',
        'fill_density = 25%',
        'start_gcode = G28\\nM104 "x"',
        'support_material = 1',
      ].sort(),
    );
    expect(errors(r)).toEqual([]);
  });

  test('untouched keys keep their stored text even when PrusaSlicer would re-format it', () => {
    const own = importPrusaIni([file('print/p.ini', 'layer_height = 0.20\nperimeters = 3\nfill_density = 15\n')]);
    const r = exportPrusaIni(edited(own, 'p', (s) => (s['wall_loops'] = 5)));
    expect(out(r, 'print/p.ini')).toBe('layer_height = 0.20\nperimeters = 5\nfill_density = 15\n');
  });

  test('a new key joins a sorted file in sorted position', () => {
    const own = importPrusaIni([file('print/p.ini', 'layer_height = 0.2\nwipe_tower = 1\n')]);
    const r = exportPrusaIni(edited(own, 'p', (s) => (s['wall_loops'] = 2)));
    expect(out(r, 'print/p.ini')).toBe('layer_height = 0.2\nperimeters = 2\nwipe_tower = 1\n');
  });

  test('a removed setting drops its line', () => {
    const { diff } = run((s) => delete s['wall_loops']);
    expect(diff).toEqual({ removed: ['perimeters = 2'], added: [] });
  });

  test('an unknown unified key gives a diagnostic and no line', () => {
    const { r, diff } = run((s) => {
      s['not_a_key'] = 1;
      s['pressure_advance'] = 0.05; // mapped, but PrusaSlicer has no equivalent
    });
    expect(diff).toEqual({ removed: [], added: [] });
    expect(r.diagnostics.filter((d) => d.code === 'unknown-type').map((d) => d.message)).toEqual([
      expect.stringContaining('not_a_key'),
      expect.stringContaining('pressure_advance'),
    ]);
  });

  test('an invalid edited value keeps the stored one, with an error', () => {
    const { r, diff } = run((s) => (s['wall_loops'] = 'many'));
    expect(diff).toEqual({ removed: [], added: [] });
    expect(errors(r)).toEqual([
      expect.objectContaining({ severity: 'error', message: expect.stringContaining('wall_loops') }),
    ]);
  });

  test('inherits holds one parent, or none (flattened)', () => {
    expect(run(() => {}, { inherits: ['Parent'] }).diff).toEqual({ removed: [], added: ['inherits = Parent'] });
    const two = run(() => {}, { inherits: ['A', 'B'] });
    expect(two.diff.added).toEqual(['inherits = A']);
    expect(errors(two.r)).toEqual([expect.objectContaining({ message: expect.stringContaining('only the first') })]);
    const user = importPrusaIni([file('print/u.ini', read('ini/user/print/My 0.15mm @MK4S.ini'))]);
    const flat = exportPrusaIni(edited(user, 'u', () => {}, { inherits: [] }));
    expect(out(flat, 'print/u.ini')).not.toContain('inherits');
  });

  test('a changed when is reported, the stored condition kept', () => {
    const { r, diff } = run(() => {}, { when: "printer.id == 'x'" });
    expect(diff).toEqual({ removed: [], added: [] });
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('when') })]);
  });
});

describe('from unified data alone', () => {
  test('writes only the settings, byte-sorted: no defaults, no non-type keys', () => {
    const p: Process = {
      id: 'mine',
      name: 'Mine',
      layer_height: 0.2,
      renamed_from: ['Old'],
      settings: { wall_loops: 3, layer_height: 0.2, sparse_infill_density: 20 },
    };
    const r = exportPrusaIni({ entities: [p], native: {} });
    expect(r.files.map((f) => [f.path, str(f)])).toEqual([
      ['print/Mine.ini', 'fill_density = 20%\nlayer_height = 0.2\nperimeters = 3\n'],
    ]);
    expect(errors(r)).toEqual([]);
  });

  test('a vendor and a model are not presets; a nozzle without its stored form is not written', () => {
    const r = exportPrusaIni({
      entities: [
        { id: 'v', name: 'V', version: '1', license: 'x' },
        { id: 'n', diameter: 0.4 },
      ],
      native: {},
    });
    expect(r.files).toEqual([]);
    expect(r.diagnostics.map((d) => d.severity)).toEqual(['info', 'info']);
    expect(prusaIniExporter.canHandle({ id: 'n', diameter: 0.4 })).toBe(true);
    expect(prusaIniExporter.canHandle({ id: 'v', name: 'V', version: '1', license: 'x' })).toBe(false);
  });
});

describe('guards', () => {
  const base = importPrusaIni([file('print/p.ini', 'layer_height = 0.2\nperimeters = 3\n')]);
  const withNative = (n: Partial<PrusaNative>, id = 'p') => ({
    entities: [{ ...proc(base, 'p'), id }],
    native: { [id]: { ...(base.native['p'] as PrusaNative), ...n } },
  });

  test.each(['a/b', '.', '..', 'x\\y', 'nul\0', ''])('a name unusable as a file name (%j) writes no file', (name) => {
    const r = exportPrusaIni(withNative({ name }));
    expect(r.files).toEqual([]);
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('file name') })]);
  });

  test('stored lines that would break the file are left out', () => {
    const values = {
      layer_height: '0.2',
      'x = y': '1',
      injected: '1\n[printer:evil]',
      '#c': '1',
      ' pad': '1',
      perimeters: '3',
    };
    const r = exportPrusaIni(withNative({ values }));
    expect(out(r, 'print/p.ini')).toBe('layer_height = 0.2\nperimeters = 3\n');
    expect(errors(r)).toHaveLength(4);
  });

  test('no mapped key turns a line break in a unified value into a second line', () => {
    const settings = Object.fromEntries(MAPPED_KEYS.map((k) => [k, 'a\r\nb']));
    const r = exportPrusaIni({ entities: [{ id: 'x', name: 'x', layer_height: 0.2, settings }], native: {} });
    expect(out(r, 'print/x.ini')).not.toContain('\r');
    const lines = out(r, 'print/x.ini').split('\n').slice(0, -1);
    expect(lines.length).toBeGreaterThan(3); // the string-valued keys
    expect(lines.filter((l) => !l.includes(' = '))).toEqual([]);
  });

  test('more settings than MAX_KEYS_PER_SECTION writes no file', () => {
    const settings = Object.fromEntries(Array.from({ length: MAX_KEYS_PER_SECTION + 1 }, (_, i) => [`k${i}`, '1']));
    const r = exportPrusaIni({ entities: [{ id: 'x', name: 'x', layer_height: 0.2, settings }], native: {} });
    expect(r.files).toEqual([]);
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('settings unusable') })]);
  });

  test('diagnostics are capped at MAX_DIAGNOSTICS', () => {
    const settings = Object.fromEntries(Array.from({ length: MAX_DIAGNOSTICS + 50 }, (_, i) => [`nokey${i}`, '1']));
    const r = exportPrusaIni({ entities: [{ id: 'x', name: 'x', layer_height: 0.2, settings }], native: {} });
    expect(r.diagnostics.length).toBeLessThanOrEqual(MAX_DIAGNOSTICS + 1);
  });

  test('two entities for one file: the second is skipped', () => {
    const r = exportPrusaIni({
      entities: [proc(base, 'p'), { ...proc(base, 'p'), id: 'q' }],
      native: { p: base.native['p'], q: base.native['p'] },
    });
    expect(r.files).toHaveLength(1);
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('already written') })]);
  });

  test('a malformed native form is ignored, the entity written from its settings', () => {
    const r = exportPrusaIni({
      entities: [proc(base, 'p')],
      native: { p: { format: 'prusa-ini', kind: 'print', name: 'p', values: 'abc' } },
    });
    expect(out(r, 'print/p.ini')).toBe('layer_height = 0.2\nperimeters = 3\n');
  });

  test(`entities past ${MAX_EXPORT_ENTITIES} are not written`, () => {
    const filler = Array.from({ length: MAX_EXPORT_ENTITIES }, () => ({}) as ImportedEntity);
    const r = exportPrusaIni({ entities: [...filler, proc(base, 'p')], native: base.native });
    expect(r.files).toEqual([]);
    expect(r.diagnostics[0]).toEqual(expect.objectContaining({ message: expect.stringContaining('entities') }));
  });

  test(`output is capped at ${MAX_EXPORT_BYTES} bytes over the call`, () => {
    // nozzle-shaped entities skip the re-read, so each costs only its own text: 1 200 lines of 60 000 bytes
    const big = 'x'.repeat(60_000);
    const values = Object.fromEntries(Array.from({ length: 1_200 }, (_, i) => [`k${i}`, big]));
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const r = exportPrusaIni({
      entities: ids.map((id) => ({ id, diameter: 0.4 })),
      native: Object.fromEntries(ids.map((id) => [id, { format: 'prusa-ini', kind: 'printer', name: id, values }])),
    });
    expect(r.files.map((f) => f.path)).toEqual(['printer/a.ini', 'printer/b.ini', 'printer/c.ini']);
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('bytes') })]);
  }, 60_000);

  test('never throws on garbage', async () => {
    const junk = [null, 1, 'x', { id: 1 }, { id: 'a', settings: 'x', layer_height: 1, name: 'a' }];
    const r = await prusaIniExporter.export({ entities: junk as unknown as ImportedEntity[], native: {} });
    expect(r.files).toEqual([]);
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('settings unusable') })]);
    await expect(prusaIniExporter.export(null as unknown as ImportResult)).resolves.toEqual({
      files: [],
      diagnostics: [],
    });
    expect(prusaIniExporter.canHandle(null as unknown as ImportedEntity)).toBe(false);
  });

  test(`stored keys past ${MAX_KEYS_PER_SECTION} are dropped`, () => {
    const values = Object.fromEntries(Array.from({ length: MAX_KEYS_PER_SECTION + 1 }, (_, i) => [`k${i}`, '1']));
    const r = exportPrusaIni({
      entities: [{ id: 'n', diameter: 0.4 }],
      native: { n: { format: 'prusa-ini', kind: 'printer', name: 'n', values } },
    });
    expect(out(r, 'printer/n.ini').split('\n')).toHaveLength(MAX_KEYS_PER_SECTION + 1); // + the final newline
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('rest dropped') })]);
  });

  test(`an edited line over ${MAX_LINE_LENGTH} characters is left out`, () => {
    const r = exportPrusaIni(edited(base, 'p', (s) => (s['machine_start_gcode'] = 'G'.repeat(MAX_LINE_LENGTH))));
    expect(out(r, 'print/p.ini')).toBe('layer_height = 0.2\nperimeters = 3\n');
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('one line') })]);
  });

  test('an edited value PrusaSlicer could not read back is left out', () => {
    const fil = importPrusaIni([file('filament/f.ini', 'filament_type = PLA\nfilament_diameter = 1.75\n')]);
    const r = exportPrusaIni(edited(fil, 'f', (s) => (s['filament_type'] = '"PLA')));
    expect(out(r, 'filament/f.ini')).toBe('filament_type = PLA\nfilament_diameter = 1.75\n');
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('invalid filament_type') })]);
  });

  test('a per-extruder map writes extruder 0, with a warning for the rest', () => {
    const r = exportPrusaIni(edited(base, 'p', (s) => (s['nozzle_temperature'] = { '0': 220, '1': 230 })));
    expect(out(r, 'print/p.ini')).toContain('temperature = 220\n');
    expect(errors(r)).toEqual([expect.objectContaining({ message: expect.stringContaining('only extruder 0') })]);
  });

  test("a mapping's lossy note is passed on as info", () => {
    const r = exportPrusaIni(edited(base, 'p', (s) => (s['initial_layer_print_height'] = 0.3)));
    expect(out(r, 'print/p.ini')).toContain('first_layer_height = 0.3\n');
    expect(r.diagnostics).toEqual([
      expect.objectContaining({ severity: 'info', message: expect.stringContaining('initial_layer_print_height') }),
    ]);
  });
});
