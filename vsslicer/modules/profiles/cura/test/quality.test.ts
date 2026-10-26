// SPDX-License-Identifier: AGPL-3.0-or-later
import { evaluate } from '@vsslicer/profile-api';
import type { SourceFile } from '@vsslicer/profile-api';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { readCuraResourceFolder } from '../src/adapters/definitions/folder.ts';
import { readCuraResources } from '../src/adapters/definitions/read.ts';
import { curaCfgOf, readCuraQualities, readCuraUserChanges } from '../src/adapters/quality/read.ts';

const enc = new TextEncoder();
const file = (path: string, content: string | Uint8Array): SourceFile => ({
  path,
  bytes: typeof content === 'string' ? enc.encode(content) : content,
});
const cfg = (general: string, metadata: string, values = '') =>
  `[general]\nversion = 4\n${general}\n\n[metadata]\n${metadata}\n\n[values]\n${values}\n`;
const def = (name: string, metadata: object, extra: object = {}) =>
  file(`definitions/${name}.def.json`, JSON.stringify({ version: 2, name, metadata, ...extra }));
const resources = readCuraResources([
  def(
    'fdmprinter',
    { has_machine_quality: false },
    { settings: { s: { type: 'category', children: { layer_height: { type: 'float', default_value: 0.1 } } } } },
  ),
  def(
    'printer_a',
    { has_machine_quality: true, has_variants: true },
    { inherits: 'fdmprinter', overrides: { layer_height: { value: 0.3 } } },
  ),
  def('printer_b', { has_machine_quality: true }, { inherits: 'fdmprinter' }),
  def(
    'printer_f',
    { has_machine_quality: true },
    { inherits: 'fdmprinter', overrides: { layer_height: { value: 'min(1, 2)' } } },
  ),
]);
const q = (path: string, definition: string, metadata: string, values = '') =>
  file(path, cfg(`name = N\ndefinition = ${definition}`, `type = quality\n${metadata}`, values));
const ctx = (model: string, nozzle: string, base: string) => ({
  printer: { model },
  nozzle: { id: nozzle },
  material: { base },
});

describe('curaCfgOf', () => {
  test('ids follow Uranium: suffix without a dot, case-insensitive, last character lost without the dot', () => {
    expect(curaCfgOf('quality/a/b/x%20y+z.inst.cfg')).toEqual({ kind: 'quality', id: 'x y z' });
    expect(curaCfgOf('quality/m/x.INST.CFG')).toEqual({ kind: 'quality', id: 'x' });
    expect(curaCfgOf('quality/m/pla_h0.6inst.cfg')).toEqual({ kind: 'quality', id: 'pla_h0.6inst.cf' });
    expect(curaCfgOf('quality_changes/mine.inst.cfg')).toEqual({ kind: 'quality_changes', id: 'mine' });
  });
  test('refuses what is not a container', () => {
    for (const p of [
      'quality/x.cfg',
      'quality/inst.cfg',
      'quality/.hidden/x.inst.cfg',
      'quality_changes/sub/x.inst.cfg',
      'definition_changes/a/b.inst.cfg',
      'variants/x.inst.cfg',
      'quality',
    ]) {
      expect(curaCfgOf(p), p).toBeUndefined();
    }
  });
});

describe('readCuraQualities', () => {
  test('definition, variant and material become the when; quality_type goes to native', () => {
    const r = readCuraQualities(
      [
        q(
          'quality/printer_a/a.inst.cfg',
          'printer_a',
          'material = generic_pla\nquality_type = fast\nvariant = AA 0.4\nweight = -1',
          'layer_height = 0.15\nspeed_wall = =speed_print / 2',
        ),
      ],
      resources,
    );
    expect(r.diagnostics).toEqual([]);
    const p = r.entities[0] as { when: string; layer_height: number; settings: object };
    expect(p.when).toBe("printer.model == 'printer_a' and nozzle.id == 'AA 0.4' and material.base == 'generic_pla'");
    expect(evaluate(p.when, ctx('printer_a', 'AA 0.4', 'generic_pla'))).toEqual({ compatible: true });
    expect(evaluate(p.when, ctx('printer_a', 'AA 0.8', 'generic_pla'))).toEqual({ compatible: false });
    expect(p.layer_height).toBe(0.15);
    expect(p.settings).toEqual({ layer_height: '0.15', speed_wall: { expr: 'speed_print / 2' } });
    expect(r.native['a']).toMatchObject({ definition: 'printer_a', quality_type: 'fast', weight: '-1' });
  });

  test('only the keys the machine looks up by become clauses', () => {
    const r = readCuraQualities(
      [
        q(
          'quality/printer_b/b.inst.cfg',
          'printer_b',
          'material = m\nquality_type = x\nvariant = V',
          'layer_height = 0.2',
        ),
        q(
          'quality/fdmprinter/g.inst.cfg',
          'fdmprinter',
          'global_quality = True\nquality_type = x',
          'layer_height = 0.2',
        ),
        q(
          'quality/unknown_machine/u.inst.cfg',
          'unknown_machine',
          'quality_type = x\nmaterial = m',
          'layer_height = 0.2',
        ),
      ],
      resources,
    );
    expect(r.entities.map((e) => (e as { when: string }).when)).toEqual([
      "printer.model == 'printer_b' and material.base == 'm'",
      "printer.model == 'fdmprinter'",
      "printer.model == 'unknown_machine' and material.base == 'm'",
    ]);
  });

  test('layer_height: own, then the global quality, then fdmprinter global, then the definition, then a stand-in', () => {
    const r = readCuraQualities(
      [
        q('quality/printer_a/own.inst.cfg', 'printer_a', 'quality_type = t', 'layer_height = 0.15'),
        q(
          'quality/printer_a/glob.inst.cfg',
          'printer_a',
          'global_quality = True\nquality_type = t',
          'layer_height = 0.2',
        ),
        q('quality/printer_a/viaglobal.inst.cfg', 'printer_a', 'quality_type = t'),
        q(
          'quality/fdmprinter/fglob.inst.cfg',
          'fdmprinter',
          'global_quality = True\nquality_type = u',
          'layer_height = 0.4',
        ),
        q('quality/printer_b/viafdm.inst.cfg', 'printer_b', 'quality_type = u'),
        q('quality/printer_a/viadef.inst.cfg', 'printer_a', 'quality_type = other'),
        q(
          'quality/printer_f/formula.inst.cfg',
          'printer_f',
          'quality_type = other',
          'layer_height = =round(0.4 * 2, 5)',
        ),
      ],
      resources,
    );
    const h = Object.fromEntries(r.entities.map((e) => [e.id, (e as { layer_height: number }).layer_height]));
    expect(h).toEqual({ own: 0.15, glob: 0.2, viaglobal: 0.2, fglob: 0.4, viafdm: 0.4, viadef: 0.3, formula: 0.1 });
    expect(r.diagnostics.map((d) => d.file)).toEqual(['quality/printer_f/formula.inst.cfg']);
    expect(r.native['formula']).toMatchObject({ layer_height_estimated: true });
    expect(r.native['own']).not.toHaveProperty('layer_height_estimated');
  });

  test('a file of the wrong type, version or shape is reported and skipped', () => {
    const r = readCuraQualities(
      [
        file('quality/m/a.inst.cfg', cfg('definition = d', 'type = quality_changes')),
        file('quality/m/b.inst.cfg', '[general]\nversion = 3\ndefinition = d\n'),
        file('quality/m/c.inst.cfg', '[general]\nname = c\n'),
        file('quality/m/d.inst.cfg', new Uint8Array([0xff, 0xfe])),
        q('quality/m/ok.inst.cfg', 'printer_b', 'quality_type = x', 'layer_height = 0.2'),
      ],
      resources,
    );
    expect(r.entities.map((e) => e.id)).toEqual(['ok']);
    expect(r.diagnostics.map((d) => d.file)).toEqual([
      'quality/m/a.inst.cfg',
      'quality/m/b.inst.cfg',
      'quality/m/c.inst.cfg',
      'quality/m/d.inst.cfg',
    ]);
  });

  test('a value that is not a short string is dropped from the when with a warning', () => {
    const r = readCuraQualities(
      [
        q(
          'quality/printer_a/a.inst.cfg',
          'printer_a',
          `material = ${'x'.repeat(300)}\nquality_type = t`,
          'layer_height = 0.2',
        ),
      ],
      resources,
    );
    expect((r.entities[0] as { when: string }).when).toBe("printer.model == 'printer_a'");
    expect(r.diagnostics).toHaveLength(1);
  });

  test('__proto__ settings stay own keys', () => {
    const r = readCuraQualities(
      [q('quality/printer_a/a.inst.cfg', 'printer_a', 'quality_type = t', 'layer_height = 0.2\n__proto__ = 1')],
      resources,
    );
    const s = (r.entities[0] as { settings: object }).settings;
    expect(Object.getPrototypeOf(s)).toBe(Object.prototype);
    expect(Object.keys(s)).toContain('__proto__');
    expect(({} as Record<string, unknown>)['x']).toBeUndefined();
  });

  describe('bounds', () => {
    const many = (n: number) =>
      Array.from({ length: n }, (_, i) =>
        q(`quality/m/q${i}.inst.cfg`, 'printer_b', 'quality_type = t', 'layer_height = 0.2'),
      );
    test('file count', () => {
      const r = readCuraQualities(many(5), resources, { maxFiles: 3 });
      expect(r.entities).toHaveLength(3);
      expect(r.diagnostics[0]!.code).toBe('unreadable-folder');
    });
    test('file size', () => {
      const r = readCuraQualities(many(2), resources, { maxFileBytes: 20 });
      expect(r.entities).toHaveLength(0);
      expect(r.diagnostics).toHaveLength(2);
    });
    test('total bytes across the call', () => {
      const one = many(1)[0]!.bytes.length;
      const r = readCuraQualities(many(5), resources, { maxTotalBytes: one * 2 + 1 });
      expect(r.entities).toHaveLength(2);
    });
    test('case, Unicode and percent aliases of an id are one file', () => {
      const r = readCuraQualities(
        ['A', 'a', '%41', 'café', 'café'].map((n) =>
          q(`quality/m/${n}.inst.cfg`, 'printer_b', 'quality_type = t', 'layer_height = 0.2'),
        ),
        resources,
      );
      expect(r.entities.map((e) => e.id)).toEqual(['A', 'café']);
    });
    test('limits are validated', () => {
      expect(() => readCuraQualities([], resources, { maxFiles: 0 })).toThrow(RangeError);
      expect(() => readCuraUserChanges([], undefined, { maxFileBytes: Number.NaN })).toThrow(RangeError);
    });
    test('diagnostics are capped', () => {
      const bad = Array.from({ length: 1500 }, (_, i) => file(`quality/m/b${i}.inst.cfg`, 'x'));
      expect(readCuraQualities(bad, resources).diagnostics.length).toBeLessThanOrEqual(1001);
    });
  });
});

describe('readCuraUserChanges', () => {
  const qc = file(
    'quality_changes/my_profile.inst.cfg',
    cfg(
      'name = My profile\ndefinition = printer_a',
      'quality_type = fast\nposition = 0\ntype = quality_changes',
      'infill_sparse_density = 40\nlayer_height = 0.12',
    ),
  );
  const dc = file(
    'definition_changes/printer_a_settings.inst.cfg',
    cfg(
      'name = printer_a settings\ndefinition = printer_a',
      'type = definition_changes',
      'machine_width = 300\nmachine_start_gcode = =x',
    ),
  );

  test('a quality_changes and definition_changes pair import as a user process and a printer_instance diff', () => {
    const r = readCuraUserChanges([qc, dc]);
    expect(r.diagnostics).toEqual([]);
    expect(r.entities).toEqual([
      {
        id: 'my_profile',
        name: 'My profile',
        layer_height: 0.12,
        when: "printer.model == 'printer_a'",
        settings: { infill_sparse_density: '40', layer_height: '0.12' },
      },
      {
        id: 'printer_a_settings',
        model: 'printer_a',
        toolheads: [],
        settings: { machine_width: '300', machine_start_gcode: { expr: 'x' } },
      },
    ]);
    expect(r.native['my_profile']).toMatchObject({ quality_type: 'fast', position: '0' });
  });

  test('a change without layer_height takes the base global quality, else a stand-in', () => {
    const noLh = file(
      'quality_changes/x.inst.cfg',
      cfg('name = X\ndefinition = printer_a', 'quality_type = t\ntype = quality_changes', 'wall_thickness = 2'),
    );
    const base = readCuraQualities(
      [
        q(
          'quality/printer_a/g.inst.cfg',
          'printer_a',
          'global_quality = True\nquality_type = t',
          'layer_height = 0.25',
        ),
      ],
      resources,
    );
    expect((readCuraUserChanges([noLh], base).entities[0] as { layer_height: number }).layer_height).toBe(0.25);
    const bare = readCuraUserChanges([noLh]);
    expect((bare.entities[0] as { layer_height: number }).layer_height).toBe(0.1);
    expect(bare.native['x']).toMatchObject({ layer_height_estimated: true });
    expect(bare.diagnostics).toHaveLength(1);
  });

  test('a stand-in layer height of a formula-only global quality is not inherited', () => {
    const noLh = file(
      'quality_changes/x.inst.cfg',
      cfg('name = X\ndefinition = printer_f', 'quality_type = t\ntype = quality_changes', 'wall_thickness = 2'),
    );
    const base = readCuraQualities(
      [
        q(
          'quality/printer_f/g.inst.cfg',
          'printer_f',
          'global_quality = True\nquality_type = t',
          'layer_height = =round(0.4 * 2, 5)',
        ),
        q(
          'quality/fdmprinter/f.inst.cfg',
          'fdmprinter',
          'global_quality = True\nquality_type = t',
          'layer_height = 0.4',
        ),
      ],
      resources,
    );
    expect((readCuraUserChanges([noLh], base).entities[0] as { layer_height: number }).layer_height).toBe(0.4);
  });

  test('a change under a formula-only global quality is still marked as estimated', () => {
    const noLh = file(
      'quality_changes/x.inst.cfg',
      cfg('name = X\ndefinition = printer_f', 'quality_type = z\ntype = quality_changes', 'wall_thickness = 2'),
    );
    const base = readCuraQualities(
      [
        q(
          'quality/printer_f/g.inst.cfg',
          'printer_f',
          'global_quality = True\nquality_type = z',
          'layer_height = =round(0.4 * 2, 5)',
        ),
      ],
      resources,
    );
    expect(readCuraUserChanges([noLh], base).native['x']).toMatchObject({ layer_height_estimated: true });
  });

  test('files of the other folders and nested user files are ignored', () => {
    const r = readCuraUserChanges([file('quality/m/x.inst.cfg', 'x'), file('quality_changes/sub/y.inst.cfg', 'x')]);
    expect(r).toEqual({ entities: [], native: {}, diagnostics: [] });
  });
});

describe('folder reader with quality folders', () => {
  const dirs: string[] = [];
  afterAll(() => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));
  test('reads quality only when asked', async () => {
    const root = await mkdtemp(join(tmpdir(), 'cura-q-'));
    dirs.push(root);
    await mkdir(join(root, 'quality/m'), { recursive: true });
    await mkdir(join(root, 'definitions'));
    await writeFile(join(root, 'quality/m/a.inst.cfg'), 'x');
    expect((await readCuraResourceFolder(root)).files).toEqual([]);
    const withQ = await readCuraResourceFolder(root, {}, ['definitions', 'quality']);
    expect(withQ.files.map((f) => f.path)).toEqual(['quality/m/a.inst.cfg']);
  });
});

const cura = join(import.meta.dirname, '../../../../.reference/repos/Cura/resources');
describe.skipIf(!existsSync(cura))('real Cura@5bea2f8 resources', () => {
  test('golden: 6 011 quality files import, each with its definition/variant/material as a when', async () => {
    const folder = await readCuraResourceFolder(cura, {}, ['definitions', 'extruders', 'variants', 'quality']);
    expect(folder.diagnostics).toEqual([]);
    const res = readCuraResources(folder.files);
    const r = readCuraQualities(folder.files, res);
    expect(r.entities).toHaveLength(6011);
    expect(r.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    expect(r.diagnostics).toHaveLength(14); // quality layer_height set only by a formula
    for (const e of r.entities) {
      const n = r.native[e.id] as { definition: string; variant?: string; material?: string; quality_type: string };
      const when = (e as { when?: string }).when!;
      expect(when, e.id).toContain(`printer.model == `);
      if (n.variant !== undefined && when.includes('nozzle.id'))
        expect(when).toContain(`nozzle.id == '${n.variant.replace(/\\|'/g, (c) => `\\${c}`)}'`);
      expect(typeof n.quality_type, e.id).toBe('string');
    }
    const s5 = r.entities.find((e) => e.id === 'um_s5_aa0.4_pla_0.15mm') as { when: string; layer_height: number };
    expect(s5.when).toBe(
      "printer.model == 'ultimaker_s5' and nozzle.id == 'AA 0.4' and material.base == 'generic_pla'",
    );
    expect(s5.layer_height).toBe(0.15);
    expect(r.entities.some((e) => e.id === 'dagoma_sigma_0.8_pla_h0.6inst.cf')).toBe(true);
  }, 120_000);
});

describe('a container named __proto__', () => {
  const make = (dir: string, type: string) =>
    ['__proto__', 'normal'].map((n) =>
      file(`${dir}/${n}.inst.cfg`, cfg('name = N\ndefinition = fdmprinter', `type = ${type}\nquality_type = t`)),
    );
  test('keeps its metadata as an own key of native', () => {
    for (const r of [
      readCuraQualities(make('quality', 'quality'), resources),
      readCuraUserChanges(make('quality_changes', 'quality_changes')),
    ]) {
      expect(Object.keys(r.native).sort()).toEqual(['__proto__', 'normal']);
    }
  });
});
