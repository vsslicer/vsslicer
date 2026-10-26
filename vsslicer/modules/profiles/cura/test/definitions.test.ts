// SPDX-License-Identifier: AGPL-3.0-or-later
import type { SourceFile } from '@vsslicer/profile-api';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { readCuraResourceFolder } from '../src/adapters/definitions/folder.ts';
import { parseInstCfg } from '../src/adapters/definitions/inst-cfg.ts';
import { readCuraResources, resolveResourceLimits } from '../src/adapters/definitions/read.ts';
import { curaStackValue } from '../src/domain/stack.ts';

const enc = new TextEncoder();
const file = (path: string, content: unknown): SourceFile => ({
  path,
  bytes: enc.encode(typeof content === 'string' ? content : JSON.stringify(content)),
});
const def = (name: string, rest: object = {}) => ({ version: 2, name, ...rest });
const ROOT = def('Root', {
  metadata: { visible: false, author: 'root' },
  settings: {
    machine: {
      type: 'category',
      children: {
        machine_width: { type: 'float', default_value: 100 },
        speed_print: {
          type: 'float',
          default_value: 50,
          children: { speed_wall: { type: 'float', default_value: 30, value: 'speed_print / 2' } },
        },
      },
    },
  },
});
const codes = (r: { diagnostics: { code: string }[] }) => r.diagnostics.map((d) => d.code);

describe('definitions', () => {
  test('inherits deep-merge overrides; value beats a child default_value; metadata is shallow', () => {
    const r = readCuraResources([
      file('definitions/root.def.json', ROOT),
      file('definitions/mid.def.json', def('Mid', { inherits: 'root', overrides: { speed_wall: { value: '7' } } })),
      file(
        'definitions/leaf.def.json',
        def('Leaf', {
          inherits: 'mid',
          metadata: { author: 'leaf' },
          overrides: { speed_wall: { default_value: 1 }, machine_width: { default_value: 200 } },
        }),
      ),
    ]);
    expect(r.diagnostics).toEqual([]);
    const leaf = r.definitions.get('leaf')!;
    expect(leaf.inherits).toBe('mid');
    expect(leaf.metadata).toEqual({ visible: false, author: 'leaf' });
    // Uranium: the merged override keeps mid's `value`, so `default_value: 1` does not show.
    expect(leaf.settings).toEqual({ machine_width: 200, speed_print: 50, speed_wall: { expr: '7' } });
    expect(r.definitions.get('root')!.settings['speed_wall']).toEqual({ expr: 'speed_print / 2' });
  });

  test('a non-string value is a formula in Python spelling', () => {
    const r = readCuraResources([
      file('definitions/root.def.json', ROOT),
      file(
        'definitions/a.def.json',
        def('A', { inherits: 'root', overrides: { speed_print: { value: true }, speed_wall: { value: 3 } } }),
      ),
    ]);
    expect(r.definitions.get('a')!.settings).toMatchObject({
      speed_print: { expr: 'True' },
      speed_wall: { expr: '3' },
    });
  });

  test('suffix is case-insensitive and the id is unquote_plus of the basename', () => {
    const r = readCuraResources([
      file('definitions/root.def.json', ROOT),
      file('extruders/my+ext%31.def.JSON', def('E', { inherits: 'root' })),
      file('definitions/.hidden.def.json', ROOT),
      file('definitions/notes.txt', 'x'),
    ]);
    expect([...r.extruders.keys()]).toEqual(['my ext1']);
    expect([...r.definitions.keys()]).toEqual(['root']);
  });

  test('bad files give diagnostics and the rest import', () => {
    const r = readCuraResources([
      file('definitions/root.def.json', ROOT),
      file('definitions/broken.def.json', '{'),
      file('definitions/v1.def.json', { version: 1, name: 'x' }),
      file('definitions/orphan.def.json', def('O', { inherits: 'nowhere' })),
      file('definitions/child.def.json', def('C', { inherits: 'orphan' })),
      { path: 'definitions/latin1.def.json', bytes: new Uint8Array([0xff]) },
    ]);
    expect([...r.definitions.keys()]).toEqual(['root']);
    expect(codes(r).sort()).toEqual([
      'invalid-json',
      'invalid-json',
      'invalid-json',
      'unknown-parent',
      'unknown-parent',
    ]);
  });
});

describe('variants', () => {
  test('=expr is kept verbatim, never evaluated; literals stay strings', () => {
    const text =
      '[general]\ndefinition = m\nname = AA 0.4\nversion = 4\n\n[metadata]\nhardware_type = nozzle\ntype = variant\n\n' +
      '[values]\nspeed_print = 70\nspeed_wall = =math.ceil(speed_print * 30 / 70)\nhostile = =__import__("os").system("x")\n' +
      'machine_start_gcode = G28\n\tG1 X=0 ; a=b\n\n';
    const r = readCuraResources([file('variants/m/m_aa04.inst.cfg', text)]);
    expect(r.diagnostics).toEqual([]);
    expect(r.variants.get('m_aa04')).toEqual({
      id: 'm_aa04',
      file: 'variants/m/m_aa04.inst.cfg',
      name: 'AA 0.4',
      definition: 'm',
      metadata: { hardware_type: 'nozzle', type: 'variant' },
      settings: {
        speed_print: '70',
        speed_wall: { expr: 'math.ceil(speed_print * 30 / 70)' },
        hostile: { expr: '__import__("os").system("x")' },
        machine_start_gcode: 'G28\nG1 X=0 ; a=b',
      },
    });
  });

  test('missing [general] fields or another version is a diagnostic', () => {
    const r = readCuraResources([
      file('variants/a.inst.cfg', '[general]\nversion = 4\n'),
      file('variants/b.inst.cfg', '[general]\ndefinition = m\nversion = 3\n'),
    ]);
    expect(r.variants.size).toBe(0);
    expect(codes(r)).toEqual(['malformed-line', 'malformed-line']);
  });

  test('parseInstCfg: a repeated header replaces the section; lines before a header are ignored', () => {
    const cfg = parseInstCfg('x = 1\n[a]\nk = 1\n[a]\nj = 2\r\n');
    expect([...cfg]).toEqual([['a', new Map([['j', '2']])]]);
  });
});

describe('stack order', () => {
  test('definition < extruder < variant < quality < user, on a hand-built machine', () => {
    const r = readCuraResources([
      file('definitions/root.def.json', ROOT),
      file(
        'definitions/fdmextruder.def.json',
        def('Ext base', {
          settings: { s: { children: { machine_nozzle_size: { type: 'float', default_value: 0.4 } } } },
        }),
      ),
      file(
        'definitions/m.def.json',
        def('M', { inherits: 'root', overrides: { machine_width: { default_value: 220 } } }),
      ),
      file(
        'extruders/m_e0.def.json',
        def('E0', { inherits: 'fdmextruder', metadata: { machine: 'm', position: '0' } }),
      ),
      file(
        'variants/m/m_06.inst.cfg',
        '[general]\ndefinition = m\nname = 0.6\nversion = 4\n[values]\nmachine_nozzle_size = 0.6\nspeed_print = 40\nspeed_wall = =speed_print\n',
      ),
    ]);
    const global = { definition: r.definitions.get('m')!.settings };
    const extruder = {
      definition: r.extruders.get('m_e0')!.settings,
      variant: r.variants.get('m_06')!.settings,
      quality: { speed_print: 45, speed_wall: null },
      user: { speed_print: 60 },
    };
    expect(curaStackValue('machine_width', extruder, global)).toBe(220); // machine definition via the global stack
    expect(curaStackValue('machine_nozzle_size', extruder, global)).toBe('0.6'); // variant over extruder definition
    expect(curaStackValue('machine_nozzle_size', { definition: extruder.definition }, global)).toBe(0.4);
    expect(curaStackValue('speed_print', extruder, global)).toBe(60); // user over quality over variant
    expect(curaStackValue('speed_print', { ...extruder, user: {} }, global)).toBe(45);
    // A null (Python None) falls through to the next slot: quality's null, then the variant's formula.
    expect(curaStackValue('speed_wall', extruder, global)).toEqual({ expr: 'speed_print' });
    expect(curaStackValue('missing', extruder, global)).toBeUndefined();
  });
});

describe('bounds', () => {
  test('limits must be positive integers', () => {
    for (const bad of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => resolveResourceLimits({ maxFiles: bad })).toThrow(RangeError);
    }
  });

  test('an inherits cycle is reported, not followed', () => {
    const r = readCuraResources([
      file('definitions/a.def.json', def('A', { inherits: 'b' })),
      file('definitions/b.def.json', def('B', { inherits: 'a' })),
      file('definitions/self.def.json', def('S', { inherits: 'self' })),
    ]);
    expect(r.definitions.size).toBe(0);
    expect(r.diagnostics.map((d) => d.message)).toContain('inherits loop: a → b → a');
    expect(r.diagnostics.map((d) => d.message)).toContain('inherits loop: self → self');
  });

  test('an inherits chain over maxInheritsDepth is refused in any input order', () => {
    const chain = (n: number) =>
      Array.from({ length: n + 1 }, (_, i) =>
        file(`definitions/d${i}.def.json`, i === 0 ? ROOT : def(`D${i}`, { inherits: `d${i - 1}` })),
      );
    for (const files of [chain(5), chain(5).reverse()]) {
      const r = readCuraResources(files, { maxInheritsDepth: 3 });
      expect([...r.definitions.keys()].sort()).toEqual(['d0', 'd1', 'd2', 'd3']);
      expect(r.diagnostics.find((d) => d.file === 'definitions/d4.def.json')!.message).toMatch(/longer than 3/);
    }
    // A 100 000-long chain, leaf first: no stack overflow, linear work.
    const long = chain(100_000).reverse();
    const r = readCuraResources(long, { maxFiles: 200_000 });
    expect(r.definitions.size).toBe(33);
  });

  test('JSON nested past maxJsonDepth is refused before it is parsed or walked', () => {
    let tree = '{"type":"float","default_value":1}';
    for (let i = 0; i < 20_000; i++) tree = `{"type":"category","children":{"k${i}":${tree}}}`;
    const text = `{"version":2,"name":"Deep","settings":{"top":${tree}}}`;
    const r = readCuraResources([file('definitions/deep.def.json', text)]);
    expect(r.definitions.size).toBe(0);
    expect(r.diagnostics[0]!.message).toMatch(/nested deeper than 64/);
    // Brackets inside strings do not count.
    const r2 = readCuraResources([file('definitions/s.def.json', def('[[[[{{{{', { metadata: { x: '\\"[[[' } }))], {
      maxJsonDepth: 3,
    });
    expect(r2.diagnostics).toEqual([]);
  });

  test('file count, file size and total size are capped across one call', () => {
    const files = Array.from({ length: 5 }, (_, i) => file(`definitions/r${i}.def.json`, def(`R${i}`)));
    expect(readCuraResources(files, { maxFiles: 3 }).definitions.size).toBe(3);
    const size = files[0]!.bytes.length;
    const big = readCuraResources([...files, file('definitions/big.def.json', def('x'.repeat(100)))], {
      maxFileBytes: size + 10,
    });
    expect(big.definitions.size).toBe(5);
    expect(big.diagnostics[0]!.file).toBe('definitions/big.def.json');
    const total = readCuraResources(files, { maxTotalBytes: size * 2 + 1 });
    expect(total.definitions.size).toBe(2);
    expect(codes(total)).toEqual(['unreadable-folder']);
  });

  test('resolved entries are budgeted: children copying a wide parent stop at maxResolvedEntries', () => {
    const wide = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`k${i}`, { default_value: i }]));
    const files = [
      file('definitions/root.def.json', def('Root', { settings: wide })),
      ...Array.from({ length: 50 }, (_, i) => file(`definitions/c${i}.def.json`, def(`C${i}`, { inherits: 'root' }))),
    ];
    const r = readCuraResources(files, { maxResolvedEntries: 20_000 });
    expect(r.definitions.size).toBe(11);
    expect(r.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(1);
  });

  test('case, Unicode and folder aliases of one id are read once', () => {
    const r = readCuraResources([
      file('definitions/café.def.json', def('First')),
      file('definitions/CAFÉ.def.json', def('Case and NFD alias')),
      file('extruders/café.def.json', def('Other folder, same namespace')),
      file('variants/a/v.inst.cfg', '[general]\ndefinition = m\nversion = 4\n'),
      file('variants/b/V.inst.cfg', '[general]\ndefinition = n\nversion = 4\n'),
    ]);
    expect([...r.definitions.values()].map((d) => d.name)).toEqual(['First']);
    expect(r.extruders.size).toBe(0);
    expect(r.variants.get('v')!.definition).toBe('m');
    expect(r.diagnostics.map((d) => d.code)).toEqual(['unreadable-folder', 'unreadable-folder', 'unreadable-folder']);
  });
});

describe('readCuraResourceFolder', () => {
  const dirs: string[] = [];
  afterAll(() => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));
  const tree = async () => {
    const root = await mkdtemp(join(tmpdir(), 'prf30-'));
    dirs.push(root);
    await mkdir(join(root, 'definitions'));
    await mkdir(join(root, 'variants/m/deeper'), { recursive: true });
    await writeFile(join(root, 'definitions/root.def.json'), JSON.stringify(ROOT));
    await writeFile(join(root, 'variants/m/v.inst.cfg'), '[general]\ndefinition = root\nversion = 4\n');
    return root;
  };

  test('reads the three folders, sorted, skipping dot names', async () => {
    const root = await tree();
    await writeFile(join(root, 'definitions/.x.def.json'), '{');
    const { files, diagnostics } = await readCuraResourceFolder(root);
    expect(diagnostics).toEqual([]);
    expect(files.map((f) => f.path)).toEqual(['definitions/root.def.json', 'variants/m/v.inst.cfg']);
  });

  test('symbolic links are never followed, to files or folders', async () => {
    const root = await tree();
    const outside = await mkdtemp(join(tmpdir(), 'prf30-out-'));
    dirs.push(outside);
    await writeFile(join(outside, 'secret.def.json'), JSON.stringify(def('Secret')));
    await symlink(join(outside, 'secret.def.json'), join(root, 'definitions/secret.def.json'));
    await symlink(root, join(root, 'variants/m/loop'));
    const { files, diagnostics } = await readCuraResourceFolder(root);
    expect(files.map((f) => f.path)).toEqual(['definitions/root.def.json', 'variants/m/v.inst.cfg']);
    expect(diagnostics.map((d) => d.message)).toEqual(['symbolic link not followed', 'symbolic link not followed']);
  });

  test('a top folder that is a symbolic link is not followed', async () => {
    const root = await mkdtemp(join(tmpdir(), 'prf30-'));
    const outside = await mkdtemp(join(tmpdir(), 'prf30-out-'));
    dirs.push(root, outside);
    await writeFile(join(outside, 'secret.def.json'), JSON.stringify(def('Secret')));
    await symlink(outside, join(root, 'definitions'));
    const { files, diagnostics } = await readCuraResourceFolder(root);
    expect(files).toEqual([]);
    expect(diagnostics.map((d) => [d.file, d.message])).toEqual([
      ['definitions', 'symbolic link not followed'],
      [root, 'no definitions, extruders or variants folder'],
    ]);
  });

  test('entry count, folder depth and file size are capped', async () => {
    const root = await tree();
    await writeFile(join(root, 'variants/m/deeper/w.inst.cfg'), '[general]\ndefinition = root\nversion = 4\n');
    const depth = await readCuraResourceFolder(root, { maxFolderDepth: 1 });
    expect(depth.files.map((f) => f.path)).not.toContain('variants/m/deeper/w.inst.cfg');
    expect(depth.diagnostics[0]!.message).toMatch(/deeper than 1/);
    const count = await readCuraResourceFolder(root, { maxFiles: 2 });
    expect(count.diagnostics[0]!.message).toMatch(/more than 2 entries/);
    const size = await readCuraResourceFolder(root, { maxFileBytes: 50 });
    expect(size.files.map((f) => f.path)).toEqual(['variants/m/v.inst.cfg', 'variants/m/deeper/w.inst.cfg']);
    const total = await readCuraResourceFolder(root, { maxTotalBytes: 100 });
    expect(total.files).toEqual([]);
  });

  test('a root without resource folders is a diagnostic', async () => {
    const root = await mkdtemp(join(tmpdir(), 'prf30-empty-'));
    dirs.push(root);
    expect((await readCuraResourceFolder(root)).diagnostics[0]!.message).toMatch(/no definitions/);
  });
});

const cura = join(import.meta.dirname, '../../../../.reference/repos/Cura/resources');
describe.skipIf(!existsSync(cura))('real Cura@5bea2f8 resources', () => {
  test('golden counts: 706 definitions, 544 extruders, 1 741 variants, no errors', async () => {
    const folder = await readCuraResourceFolder(cura);
    expect(folder.diagnostics).toEqual([]);
    const r = readCuraResources(folder.files);
    expect([r.definitions.size, r.extruders.size, r.variants.size]).toEqual([706, 544, 1741]);
    expect(r.diagnostics.filter((d) => d.severity !== 'info')).toEqual([]);
    const s5 = r.definitions.get('ultimaker_s5')!;
    expect(s5.metadata['machine_extruder_trains']).toEqual({
      '0': 'ultimaker_s5_extruder_left',
      '1': 'ultimaker_s5_extruder_right',
    });
    expect(r.variants.get('ultimaker_s5_aa04')!.settings['speed_wall']).toEqual({
      expr: 'math.ceil(speed_print * 30 / 70)',
    });
  }, 60_000);
});
