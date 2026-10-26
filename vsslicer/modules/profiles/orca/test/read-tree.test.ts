// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { loadProfileTree, MAX_TREE_DIRS_DEEP } from '../src/adapters/tree/load-tree.ts';
import { readOrcaTree, TREE_LIMITS, type TreeLimits } from '../src/adapters/tree/read-tree.ts';

const enc = new TextEncoder();
const files = (m: Record<string, unknown>) =>
  Object.entries(m).map(([path, v]) => ({ path, bytes: enc.encode(typeof v === 'string' ? v : JSON.stringify(v)) }));

/** A vendor `V` whose index lists `filament_list` entries named after their file stems. */
function vendor(presets: Record<string, unknown>, list = 'filament_list', id = 'V') {
  const index = {
    name: id,
    version: '01.00.00.00',
    [list]: Object.keys(presets).map((n) => ({ name: n, sub_path: `f/${n}.json` })),
  };
  return {
    [`${id}.json`]: index,
    ...Object.fromEntries(Object.entries(presets).map(([n, p]) => [`${id}/f/${n}.json`, p])),
  };
}
const fil = (name: string, extra: Record<string, unknown> = {}) => ({
  type: 'filament',
  name,
  instantiation: 'true',
  ...extra,
});
const read = (m: Record<string, unknown>, limits?: Partial<TreeLimits>) => readOrcaTree(files(m), limits);
const preset = (t: ReturnType<typeof readOrcaTree>, name: string) => t.presets.find((p) => p.name === name);
const codes = (t: ReturnType<typeof readOrcaTree>) => t.diagnostics.map((d) => d.code);

/** A chain p0 <- p1 <- ... <- p(n-1), each inheriting the previous one. */
const chain = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [`p${i}`, fil(`p${i}`, i ? { inherits: `p${i - 1}` } : {})]));

describe('readOrcaTree: resolution', () => {
  test('parent, then includes in order, then own keys', () => {
    const t = read(
      vendor({
        base: fil('base', { instantiation: 'false', k: ['parent'], only_parent: ['p'] }),
        inc1: fil('inc1', { instantiation: 'false', k: ['inc1'], from_inc: ['1'], only_inc1: ['i'] }),
        inc2: fil('inc2', { instantiation: 'false', k: ['inc2'], from_inc: ['2'] }),
        child: fil('child', { inherits: 'base', include: ['inc1', 'inc2'], k: ['own'] }),
        child2: fil('child2', { inherits: 'base', include: 'inc1' }),
      }),
    );
    expect(t.diagnostics).toEqual([]);
    expect(preset(t, 'child')!.settings).toEqual({ k: ['own'], only_parent: ['p'], from_inc: ['2'], only_inc1: ['i'] });
    // without own keys the include wins over the parent; a bare string is one include (PresetBundle.cpp:8273-8276)
    expect(preset(t, 'child2')!.settings.k).toEqual(['inc1']);
    expect(preset(t, 'base')!.abstract).toBe(true);
    expect(preset(t, 'child')).toMatchObject({ abstract: false, inherits: 'base', includes: ['inc1', 'inc2'] });
  });

  test('an include sees its own parent', () => {
    const t = read(
      vendor({
        root: fil('root', { instantiation: 'false', deep: ['r'] }),
        tpl: fil('tpl', { instantiation: 'false', inherits: 'root' }),
        c: fil('c', { include: ['tpl'] }),
      }),
    );
    expect(preset(t, 'c')!.settings).toEqual({ deep: ['r'] });
  });

  test('nil becomes null and replaces the parent value', () => {
    const t = read(
      vendor({
        b: fil('b', { r: ['0.8', '0.8'], s: ['1'], kept: ['x'] }),
        c: fil('c', { inherits: 'b', r: ['nil', '0.4'], s: 'nil' }),
      }),
    );
    expect(preset(t, 'c')!.settings).toEqual({ r: [null, '0.4'], s: null, kept: ['x'] });
  });

  test('setting_id and filament_id are external ids; filament_id is inherited, setting_id is not', () => {
    const t = read(
      vendor({
        base: fil('base', { instantiation: 'false', setting_id: 'GFSA00', filament_id: 'GFA00' }),
        c: fil('c', { inherits: 'base', setting_id: 'GFSA00_01' }),
        d: fil('d', { inherits: 'base', filament_id: 'OWN' }),
      }),
    );
    expect(preset(t, 'base')!.external_ids).toEqual({ setting_id: 'GFSA00', filament_id: 'GFA00' });
    expect(preset(t, 'c')!.external_ids).toEqual({ setting_id: 'GFSA00_01', filament_id: 'GFA00' });
    expect(preset(t, 'd')!.external_ids).toEqual({ filament_id: 'OWN' });
    expect(preset(t, 'c')!.settings).toEqual({});
  });

  test('a nameless or g-code template without instantiation is abstract and named by its index entry', () => {
    const t = read(
      vendor(
        {
          'X start_gcode': { type: 'machine', machine_start_gcode: 'G28' },
          M: { type: 'machine', name: 'M', instantiation: 'true', include: ['X start_gcode'] },
        },
        'machine_list',
      ),
    );
    expect(preset(t, 'X start_gcode')!.abstract).toBe(true);
    expect(preset(t, 'M')!.settings).toEqual({ machine_start_gcode: 'G28' });
  });

  test('OrcaFilamentLibrary filaments are fallback parents for other vendors', () => {
    const t = read({
      ...vendor(
        { lib: fil('lib', { instantiation: 'false', filament_id: 'OGFL99', t: ['200'] }) },
        'filament_list',
        'OrcaFilamentLibrary',
      ),
      ...vendor({ c: fil('c', { inherits: 'lib' }) }),
    });
    expect(t.vendors.map((v) => v.id)).toEqual(['OrcaFilamentLibrary', 'V']);
    expect(preset(t, 'c')).toMatchObject({
      vendor: 'V',
      settings: { t: ['200'] },
      external_ids: { filament_id: 'OGFL99' },
    });
  });

  test('a JSON key named __proto__ stays data', () => {
    const t = read(
      vendor({ c: '{"type":"filament","name":"c","instantiation":"true","__proto__":{"polluted":["1"]}}' }),
    );
    const s = preset(t, 'c')!.settings;
    expect(Object.getPrototypeOf(s)).toBe(Object.prototype);
    expect(Object.keys(s)).toEqual(['__proto__']);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('readOrcaTree: diagnostics', () => {
  test('invalid JSON, unknown type and a missing include name their file; the rest import', () => {
    const t = read(
      vendor({
        bad: '{ "type": "filament", ',
        odd: { type: 'printer', name: 'odd' },
        miss: fil('miss', { include: ['nowhere'], k: ['1'] }),
        ok: fil('ok'),
      }),
    );
    expect(t.diagnostics.map((d) => [d.code, d.file])).toEqual([
      ['invalid-json', 'V/f/bad.json'],
      ['unknown-type', 'V/f/odd.json'],
      ['missing-include', 'V/f/miss.json'],
    ]);
    expect(t.presets.map((p) => p.name)).toEqual(['miss', 'ok']);
    expect(preset(t, 'miss')!.settings).toEqual({ k: ['1'] });
  });

  test('an unknown or empty parent drops the preset and its children', () => {
    const t = read(
      vendor({ a: fil('a', { inherits: 'ghost' }), b: fil('b', { inherits: 'a' }), e: fil('e', { inherits: '' }) }),
    );
    expect(t.presets).toEqual([]);
    expect(codes(t)).toEqual(['unknown-parent', 'unknown-parent', 'unknown-parent']);
  });

  test('an invalid vendor index and a missing preset file', () => {
    const t = read({ 'A.json': '[1]', 'B.json': { filament_list: [{ name: 'x', sub_path: 'f/x.json' }, 7] } });
    expect(t.diagnostics.map((d) => [d.code, d.file])).toEqual([
      ['invalid-json', 'A.json'],
      ['missing-file', 'B.json'],
      ['invalid-json', 'B.json'],
    ]);
  });
});

describe('readOrcaTree: bounds', () => {
  test('inherits cycle and self-include end with a diagnostic', () => {
    const t = read(
      vendor({
        a: fil('a', { inherits: 'b' }),
        b: fil('b', { inherits: 'a' }),
        s: fil('s', { include: ['s'], k: ['1'] }),
      }),
    );
    expect(t.diagnostics.map((d) => [d.code, d.file])).toEqual([
      ['cycle', 'V/f/b.json'],
      ['unknown-parent', 'V/f/a.json'],
      ['cycle', 'V/f/s.json'],
    ]);
    expect(t.presets.map((p) => p.name)).toEqual(['s']);
    expect(preset(t, 's')!.settings).toEqual({ k: ['1'] });
  });

  test('include cycle through two templates', () => {
    const t = read(vendor({ x: fil('x', { include: ['y'], kx: ['1'] }), y: fil('y', { include: ['x'], ky: ['1'] }) }));
    expect(codes(t)).toEqual(['cycle']);
    expect(preset(t, 'x')!.settings).toEqual({ ky: ['1'], kx: ['1'] });
  });

  test('chain depth is capped whatever the listing order', () => {
    expect(read(vendor(chain(5)), { maxDepth: 5 }).presets).toHaveLength(5);
    const reversed = Object.fromEntries(Object.entries(chain(6)).reverse());
    for (const c of [chain(6), reversed]) {
      const t = read(vendor(c), { maxDepth: 5 });
      expect(t.presets.map((p) => p.name).sort()).toEqual(['p0', 'p1', 'p2', 'p3', 'p4']);
      expect(t.diagnostics).toEqual([expect.objectContaining({ code: 'limit', file: 'V/f/p5.json' })]);
    }
  });

  test('a long chain listed child-first does not recurse past the cap', () => {
    const t = read(vendor(Object.fromEntries(Object.entries(chain(20_000)).reverse())));
    expect(t.presets).toHaveLength(TREE_LIMITS.maxDepth);
    expect(t.diagnostics.every((d) => d.code === 'limit')).toBe(true);
  });

  test('includes per preset are capped', () => {
    const t = read(vendor({ t: fil('t'), c: fil('c', { include: ['t', 't', 't'] }) }), { maxIncludes: 2 });
    expect(t.presets.map((p) => p.name)).toEqual(['t']);
    expect(t.diagnostics[0]).toMatchObject({ code: 'limit', file: 'V/f/c.json' });
  });

  test('merge steps are capped across the call', () => {
    const keys = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`k${i}`, ['1']]));
    const m = vendor({ t: fil('t', keys), a: fil('a', { include: ['t', 't'] }), b: fil('b', { include: ['t', 't'] }) });
    // t's 50 keys are charged once when its entry is read, then 50 + 100 + 100 while flattening
    expect(read(m, { maxMergeSteps: 300 }).diagnostics).toEqual([]);
    const t = read(m, { maxMergeSteps: 299 });
    expect(codes(t)).toEqual(['limit']);
    expect(t.presets.map((p) => p.name)).toEqual(['t', 'a']);
  });

  test('one big file listed many times is charged per listing', () => {
    const keys = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`k${i}`, ['1']]));
    // nameless and no instantiation: each entry is a distinct template named by its index entry
    const index = { filament_list: Array.from({ length: 200 }, (_, i) => ({ name: `t${i}`, sub_path: 'f/big.json' })) };
    const t = read({ 'V.json': index, 'V/f/big.json': keys }, { maxMergeSteps: 50_000 });
    expect(t.diagnostics).toEqual([expect.objectContaining({ code: 'limit', file: 'V/f/big.json' })]);
    expect(t.diagnostics[0]!.message).toMatch(/index entries carry more than 50000 keys/);
    expect(t.presets).toEqual([]);
  });

  test('the default merge budget stops a fan-out from a small input', () => {
    // one 20k-key parent (~300 KB) and 450 one-line children: 9M copies against the 8M default
    const keys = Object.fromEntries(Array.from({ length: 20_000 }, (_, i) => [`k${i}`, 1]));
    const kids = Object.fromEntries(Array.from({ length: 450 }, (_, i) => [`c${i}`, fil(`c${i}`, { inherits: 'p' })]));
    const t = read(vendor({ p: fil('p', keys), ...kids }));
    expect(codes(t)).toEqual(['limit']);
    expect(t.presets.length).toBeLessThanOrEqual(TREE_LIMITS.maxMergeSteps / 20_000);
  });

  test('file size, file count and total bytes are capped', () => {
    const m = vendor({ a: fil('a'), b: fil('b') });
    const big = read(m, { maxFileBytes: 60 });
    expect(big.diagnostics.filter((d) => d.code === 'limit').map((d) => d.file)).toEqual(['V.json']);
    expect(read(m, { maxFiles: 2 }).diagnostics[0]).toMatchObject({ code: 'limit' });
    expect(read(m, { maxFiles: 2 }).presets).toHaveLength(1);
    const total = files(m).reduce((n, f) => n + f.bytes.length, 0);
    expect(read(m, { maxTotalBytes: total }).presets).toHaveLength(2);
    expect(read(m, { maxTotalBytes: total - 1 }).presets).toHaveLength(1);
  });

  test('index entries are capped across the call, even when they repeat one file', () => {
    const index = { filament_list: Array.from({ length: 5 }, () => ({ name: 'a', sub_path: 'f/a.json' })) };
    const t = read({ 'V.json': index, 'V/f/a.json': fil('a') }, { maxFiles: 3 });
    expect(codes(t)).toEqual(['duplicate', 'duplicate', 'limit']);
  });

  test('unsafe paths and case or Unicode aliases are refused', () => {
    const t = read({
      'V.json': {
        filament_list: [
          { name: 'up', sub_path: '../W/f/a.json' },
          { name: 'x', sub_path: 'f/./a.json' },
        ],
      },
      'W/f/a.json': fil('a'),
      '/abs.json': {},
      'v.JSON': {},
      'V/f/café.json': fil('c1'),
      'V/f/café.json': fil('c2'),
    });
    expect(t.diagnostics.map((d) => [d.code, d.file])).toEqual([
      ['unsafe-path', '/abs.json'],
      ['duplicate', 'v.JSON'],
      ['duplicate', 'V/f/café.json'],
      ['unsafe-path', 'V.json'],
      ['unsafe-path', 'V.json'],
    ]);
    expect(t.presets).toEqual([]);
  });

  test('limits must be positive integers within the defaults', () => {
    for (const bad of [0, -1, 1.5, Number.NaN, Infinity, TREE_LIMITS.maxDepth + 1])
      expect(() => readOrcaTree([], { maxDepth: bad })).toThrow(RangeError);
  });
});

describe('loadProfileTree', () => {
  test('never follows symlinks and caps size, count and depth', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'prf27-'));
    try {
      const root = join(dir, 'profiles');
      await mkdir(join(root, 'V', 'f'), { recursive: true });
      await writeFile(join(dir, 'secret.json'), '{"secret":1}');
      await writeFile(join(root, 'V.json'), '{}');
      await writeFile(join(root, 'V', 'f', 'a.json'), '{"a":1}');
      await writeFile(join(root, 'V', 'f', 'big.json'), 'x'.repeat(100));
      await writeFile(join(root, 'V', 'f', 'notes.txt'), 'skip');
      await symlink(join(dir, 'secret.json'), join(root, 'V', 'f', 'link.json'));
      await symlink(dir, join(root, 'V', 'up'));
      let deep = root;
      for (let i = 0; i <= MAX_TREE_DIRS_DEEP; i++) await mkdir((deep = join(deep, `d${i}`)));
      await writeFile(join(deep, 'deep.json'), '{}');

      const r = await loadProfileTree(root, { maxFileBytes: 50 });
      expect(r.files.map((f) => f.path).sort()).toEqual(['V.json', 'V/f/a.json']);
      expect(r.diagnostics.map((d) => [d.code, d.file]).sort()).toEqual(
        [
          ['limit', 'V/f/big.json'],
          ['unsafe-path', 'V/f/link.json'],
          ['unsafe-path', 'V/up'],
          ['limit', `${Array.from({ length: MAX_TREE_DIRS_DEEP + 1 }, (_, i) => `d${i}`).join('/')}`],
        ].sort(),
      );
      expect((await loadProfileTree(root, { maxFiles: 1 })).files).toHaveLength(1);
      expect((await loadProfileTree(root, { maxTotalBytes: 5 })).files.length).toBeLessThan(2);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

const repos = fileURLToPath(new URL('../../../../.reference/repos/', import.meta.url));
const orca = join(repos, 'OrcaSlicer/resources/profiles');
const bambu = join(repos, 'BambuStudio/resources/profiles');

describe('golden counts (local .reference clones)', () => {
  test.skipIf(!existsSync(orca))(
    'OrcaSlicer@09aa0114: 70 vendors plus OrcaFilamentLibrary',
    async () => {
      const { files: f, diagnostics } = await loadProfileTree(orca);
      expect(diagnostics).toEqual([]);
      const t = readOrcaTree(f);
      expect(t.vendors).toHaveLength(71);
      expect(t.vendors.map((v) => v.id)).toContain('OrcaFilamentLibrary');
      expect(new Set(t.presets.map((p) => p.vendor)).size).toBe(71);
      expect(t.presets).toHaveLength(14_343);
      expect(t.diagnostics).toEqual([]);
    },
    60_000,
  );

  test.skipIf(!existsSync(bambu))(
    'BambuStudio@79df7ae: 12 vendors',
    async () => {
      const { files: f, diagnostics } = await loadProfileTree(bambu);
      expect(diagnostics).toEqual([]);
      const t = readOrcaTree(f);
      expect(t.vendors).toHaveLength(12);
      expect(t.presets).toHaveLength(3_558);
      expect(t.diagnostics).toEqual([]);
    },
    60_000,
  );
});
