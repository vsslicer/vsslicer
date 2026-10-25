// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ParsedFile } from '@vsslicer/gcode-api';
import { describe, expect, it } from 'vitest';
import { collect, parse, transferList } from '../src/index.ts';
import type { ParseSettings } from '../src/index.ts';
import { fixturesDir, loadManifest, lineScannable, readGolden } from './support/golden.ts';
import { encode, pieces } from './support/run.ts';

const file = (text: string, opts: ParseSettings = {}, size = 1 << 20): Promise<ParsedFile> =>
  collect(parse(pieces(encode(text), size), opts));

const MAGIC = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a],
  jpg: [0xff, 0xd8, 0xff, 0xe0, 0x00],
  qoi: [0x71, 0x6f, 0x69, 0x66, 0x00],
};
const b64 = (bytes: number[]): string => Buffer.from(bytes).toString('base64');
const block = (tag: string, size: string, bytes: number[], len = b64(bytes).length): string =>
  `; ${tag} begin ${size} ${len}\n; ${b64(bytes).slice(0, 4)}\n; ${b64(bytes).slice(4)}\n; ${tag} end\n`;
const G = 'G1 X1 E1\nG1 X2 E1\n';

describe('thumbnails', () => {
  it('extracts PNG, JPG and QOI with size, bytes and offset', async () => {
    const text = `${block('thumbnail', '16x8', MAGIC.png)};\n${block('thumbnail_JPG', '32x16', MAGIC.jpg)}${block('thumbnail_QOI', '48x24', MAGIC.qoi)}${G}`;
    const f = await file(text);
    expect(f.thumbnails.map((t) => [t.format, t.width, t.height, [...t.data]])).toEqual([
      ['png', 16, 8, MAGIC.png],
      ['jpg', 32, 16, MAGIC.jpg],
      ['qoi', 48, 24, MAGIC.qoi],
    ]);
    expect(f.thumbnails[0]?.fileOffset).toBe(0);
    expect(f.thumbnails[1]?.fileOffset).toBe(text.indexOf('; thumbnail_JPG begin'));
    expect(f.diagnostics.map((d) => d.code)).toEqual(['no-slicer-tags']);
  });

  it('leaves a marker and a diagnostic for another format, and reads on', async () => {
    const f = await file(`${block('thumbnail_BIQU', '8x8', MAGIC.png)}${block('thumbnail', '8x8', MAGIC.png)}${G}`);
    expect(f.thumbnails).toHaveLength(1);
    expect(f.markers).toEqual([{ name: 'THUMBNAIL_BIQU', fileOffset: 0, moveIndex: 0 }]);
    expect(f.diagnostics.filter((d) => d.code === 'thumbnail-format')).toHaveLength(1);
  });

  it('rejects wrong magic, bad base64, a wrong length and a block that never ends', async () => {
    const codes = async (text: string) =>
      (await file(text)).diagnostics.map((d) => d.code).filter((c) => c.startsWith('thumbnail'));
    expect(await codes(block('thumbnail_JPG', '8x8', MAGIC.png))).toEqual(['thumbnail-invalid']);
    expect(await codes('; thumbnail begin 8x8 4\n; ***\n; thumbnail end\n')).toEqual(['thumbnail-invalid']);
    expect(await codes(block('thumbnail', '8x8', MAGIC.png, 7))).toEqual(['thumbnail-length']);
    expect(await codes(`; thumbnail begin 8x8 8\n; ${b64(MAGIC.png)}\n${G}`)).toEqual(['thumbnail-unterminated']);
    expect(await codes(`; thumbnail begin 8x8 8\n; ${b64(MAGIC.png)}\n`)).toEqual(['thumbnail-unterminated']);
    expect(await codes('; thumbnail begin 8x8 99999999\n')).toEqual(['thumbnail-unterminated']);
    expect(await codes(`; thumbnail begin 8x8\n; ${b64(MAGIC.png)}\n; thumbnail end\n`)).toEqual([]);
  });

  it('does not take config lines or block markers for thumbnails', async () => {
    const f = await file(
      `; thumbnails = 48x48/PNG\n; thumbnail_size = 50x50\n; THUMBNAIL_BLOCK_START\n; THUMBNAIL_BLOCK_END\n${G}`,
    );
    expect(f.thumbnails).toEqual([]);
    expect(f.diagnostics.map((d) => d.code)).toEqual(['no-slicer-tags']);
  });

  it('survives any input cut and transfers the image buffers with the chunk', async () => {
    const text = `${block('thumbnail', '16x8', MAGIC.png)}${G}`;
    expect((await file(text, {}, 3)).thumbnails).toEqual((await file(text)).thumbnails);
    for await (const c of parse(pieces(encode(text), 1 << 20))) {
      const list = transferList(c);
      expect(list).toHaveLength(4);
      const copy = structuredClone(c, { transfer: list });
      expect([...(copy.thumbnails[0]?.data ?? [])]).toEqual(MAGIC.png);
      expect(c.thumbnails[0]?.data.byteLength).toBe(0);
    }
  });
});

describe('object labels', () => {
  const objects = async (text: string, opts?: ParseSettings) => (await file(text, opts)).objects;

  it('reads PrusaSlicer / Orca printing object lines into move ranges', async () => {
    const text = [
      'G1 X1 E1',
      '; printing object cube.stl id:70 copy 2',
      'G1 X2 E1',
      'G1 X3 E1',
      '; stop printing object cube.stl id:70 copy 2',
      'G1 X4 E1',
      '; printing object cube.stl id:70 copy 2',
      'G1 X5 E1',
      '; stop printing object cube.stl id:70 copy 2',
      '; printing object a b',
      '; stop printing object a b',
      '; printing object Plain',
      'G1 X6 E1',
      '',
    ].join('\n');
    expect(await objects(text)).toEqual([
      {
        name: 'cube.stl',
        id: '70',
        copy: 2,
        ranges: [
          { firstMove: 1, endMove: 3 },
          { firstMove: 4, endMove: 5 },
        ],
      },
      { name: 'Plain', ranges: [{ firstMove: 5, endMove: 6 }] },
    ]);
  });

  it('reads Marlin M486: S starts, S-1 ends, A names the index', async () => {
    const text =
      'M486 S0\nM486 AShape-Box\nM486 S1\nM486 A"two words"\nM486 S-1\nG1 X1 E1\nM486 S0\nG1 X2 E1\nM486 S1\nG1 X3 E1\nM486 S-1\nG1 X4 E1\nM486 S0\nG1 X5 E1\nM486 S2 ; none\nG1 X6 E1\n';
    expect(await objects(text)).toEqual([
      {
        name: 'Shape-Box',
        id: '0',
        ranges: [
          { firstMove: 1, endMove: 2 },
          { firstMove: 4, endMove: 5 },
        ],
      },
      { name: 'two words', id: '1', ranges: [{ firstMove: 2, endMove: 3 }] },
      { name: '2', id: '2', ranges: [{ firstMove: 5, endMove: 6 }] },
    ]);
    expect((await file(text)).markers.filter((m) => m.name === 'M486')).toHaveLength(10); // still markers: the printer runs them
  });

  it('reads Klipper EXCLUDE_OBJECT_DEFINE / START / END, any case, quoted names', async () => {
    const text = [
      'EXCLUDE_OBJECT_DEFINE NAME=cube CENTER=10,10 POLYGON=[[0,0],[1,1]]',
      'EXCLUDE_OBJECT_DEFINE NAME=unused',
      'EXCLUDE_OBJECT_DEFINE NAME="my part"',
      'exclude_object_start name=cube',
      'G1 X1 E1',
      'EXCLUDE_OBJECT_END NAME=cube',
      'G1 X2 E1',
      'EXCLUDE_OBJECT_START NAME="my part"',
      'G1 X3 E1',
      'EXCLUDE_OBJECT_END',
      '',
    ].join('\n');
    expect(await objects(text)).toEqual([
      { name: 'cube', ranges: [{ firstMove: 0, endMove: 1 }] },
      { name: 'unused', ranges: [] },
      { name: 'my part', ranges: [{ firstMove: 2, endMove: 3 }] },
    ]);
  });

  it('reads Cura ;MESH: until the next mesh, NONMESH or the end', async () => {
    const text =
      ';MESH:a.stl\nG1 X1 E1\nG1 X2 E1\n;MESH:NONMESH\nG1 X3 E1\n;MESH:b.stl\nG1 X4 E1\n;MESH:a.stl\nG1 X5 E1\n';
    expect(await objects(text)).toEqual([
      {
        name: 'a.stl',
        ranges: [
          { firstMove: 0, endMove: 2 },
          { firstMove: 4, endMove: 5 },
        ],
      },
      { name: 'b.stl', ranges: [{ firstMove: 3, endMove: 4 }] },
    ]);
  });

  it('closes a range in a later chunk and merges the chunks', async () => {
    const lines = Array.from({ length: 10 }, (_, i) => `G1 X${i} E1\n`).join('');
    const text = `; printing object a id:1\n${lines}; stop printing object a id:1\nG1 X1 E1\n; printing object a id:1\nG1 X2 E1\n`;
    const whole = await file(text);
    const small = await file(text, { chunkMoves: 3 });
    expect(whole.objects).toEqual([
      {
        name: 'a',
        id: '1',
        ranges: [
          { firstMove: 0, endMove: 10 },
          { firstMove: 11, endMove: 12 },
        ],
      },
    ]);
    expect(small.objects).toEqual(whole.objects);
  });
});

describe('config block', () => {
  const config = async (text: string) => (await file(text)).config;

  it('reads the PrusaSlicer block verbatim', async () => {
    const text = `${G}; prusaslicer_config = begin\n; a = 1\n; b = x = y; z\n; empty =\n; spaced = v  \n;\n; notes = "a\\nb"\n; prusaslicer_config = end\n; later = 1\n`;
    expect(await config(text)).toEqual({ a: '1', b: 'x = y; z', empty: '', spaced: 'v  ', notes: '"a\\nb"' });
  });

  it('reads the Orca / Bambu block, even when cut into tiny pieces', async () => {
    const text = `; CONFIG_BLOCK_START\n; accel = 1\n; thumbnails = 48x48/PNG\n; CONFIG_BLOCK_END\n${G}`;
    const expected = { accel: '1', thumbnails: '48x48/PNG' };
    expect(await config(text)).toEqual(expected);
    expect((await file(text, {}, 2)).config).toEqual(expected);
  });

  it('ends an unterminated block at the first command and has no config otherwise', async () => {
    expect(await config('; CONFIG_BLOCK_START\n; a = 1\nG1 X1 E1\n; b = 2\n')).toEqual({ a: '1' });
    expect(await config('; a = 1\n; b = 2\n')).toEqual({});
  });

  it('reads Cura ;SETTING_3 lines (JSON cut at 80 characters, backslash and newline escaped again)', async () => {
    const ini = (extra: string) =>
      `[general]\nversion = 4\nname = q\n\n[metadata]\ntype = quality_changes\n\n[values]\n${extra}`;
    const json = JSON.stringify({
      global_quality: ini('layer_height = 0.2\nsupport_enable = True\n'),
      extruder_quality: [ini('layer_height = 0.1\nmaterial = a\\b\n')],
    });
    const escaped = json.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    const lines = escaped.match(/.{1,69}/gs)?.map((s) => `;SETTING_3 ${s}`) ?? [];
    const text = `;Generated with Cura_SteamEngine 5\n${G}${lines.join('\n')}\n`;
    expect(await config(text)).toEqual({ layer_height: '0.2', support_enable: 'True', material: 'a\\b' });
    expect((await file(`${G};SETTING_3 {broken\n`)).diagnostics.map((d) => d.code)).toContain('config-invalid');
  });

  it('keeps a key called __proto__ as data', async () => {
    const c = await config('; CONFIG_BLOCK_START\n; __proto__ = x\n; CONFIG_BLOCK_END\n');
    expect(Object.keys(c)).toEqual(['__proto__']);
    expect(Object.getPrototypeOf(c)).toBe(Object.prototype);
  });
});

// A second opinion that does not use the parser's metadata code: grep the fixture text, decode
// the thumbnails with Buffer, and compare with the golden JSON.
describe('golden metadata matches an independent read of the fixtures', () => {
  // SuperSlicer 2.3 labels objects and states its config differently; the golden harness covers it
  const text = loadManifest().files.filter((f) => lineScannable(f) && f.slicer !== 'SuperSlicer');
  const read = (path: string) => readFileSync(join(fixturesDir, path), 'utf8').split('\n');

  it.each(text)('$path: thumbnails', (f) => {
    const lines = read(f.path);
    const golden = readGolden(f)['thumbnails'] as {
      format: string;
      width: number;
      height: number;
      bytes: number;
      sha256: string;
    }[];
    const heads = lines.flatMap((l, i) => {
      const m = /^;\s*thumbnail(?:_(\w+))? begin (\d+)x(\d+)/.exec(l);
      if (!m) return [];
      const body = lines
        .slice(i + 1, i + 1 + lines.slice(i + 1).findIndex((x) => /^;\s*thumbnail\S* end/.test(x)))
        .map((x) => x.slice(1).trim())
        .join('');
      const bytes = Buffer.from(body, 'base64');
      return [
        {
          format: (m[1] ?? 'png').toLowerCase(),
          width: Number(m[2]),
          height: Number(m[3]),
          bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
        },
      ];
    });
    expect(golden).toEqual(heads);
  });

  it.each(text)('$path: object names and range counts', (f) => {
    const lines = read(f.path);
    const named = new Set(
      lines.map((l) => /^; printing object (.*?)(?: id:\S+)?(?: copy \d+)?$/.exec(l)?.[1]).filter(Boolean),
    );
    for (const l of lines) named.add(/^M486 A(.+?)\s*(;.*)?$/.exec(l)?.[1]);
    named.delete(undefined);
    const golden = readGolden(f)['objects'] as { name: string; ranges: number }[];
    expect(new Set(golden.map((o) => o.name))).toEqual(named);
    const starts = lines.filter((l) => l.startsWith('; printing object ')).length;
    const m486Starts = lines.filter((l) => /^M486 S\d/.test(l)).length;
    expect(golden.reduce((n, o) => n + o.ranges, 0)).toBeLessThanOrEqual(starts + m486Starts);
    if (starts > 0) expect(golden.reduce((n, o) => n + o.ranges, 0)).toBeGreaterThan(0);
  });

  it.each(text)('$path: config key count', (f) => {
    const lines = read(f.path);
    const from = lines.findIndex((l) => /^; (CONFIG_BLOCK_START|\w+_config = begin)/.test(l));
    const to = lines.findIndex((l) => /^; (CONFIG_BLOCK_END|\w+_config = end)/.test(l));
    const keys = new Set(
      lines
        .slice(from + 1, to)
        .flatMap((l) => (l.startsWith('; ') && l.includes(' = ') ? [l.slice(2, l.indexOf(' = '))] : [])),
    );
    expect(from).toBeGreaterThanOrEqual(0);
    expect((readGolden(f)['config'] as { keys: number }).keys).toBe(keys.size);
  });
});
