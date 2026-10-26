// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MoveRole, StateKind } from '@vsslicer/gcode-api';
import { fixturesDir, loadManifest, lineScannable, readGolden } from './support/golden.ts';
import { parseAll, roleHistogram } from './support/parser-summary.ts';
import { encode, pieces, run } from './support/run.ts';
import { collect, parse } from '../src/index.ts';
import { ROLE_BY_NAME } from '../src/domain/tag-tables.ts';

const text = loadManifest().files.filter(lineScannable);
const lines = (path: string): string[] => readFileSync(join(fixturesDir, path), 'utf8').split('\n');

describe('slicer and flavour on the corpus', () => {
  it.each(text)('$path: slicer is what the manifest says, flavour is what the config block says', (file) => {
    const golden = readGolden(file);
    expect(golden['slicer']).toBe(file.slicer.toLowerCase().replaceAll(' ', ''));
    const named = lines(file.path)
      .map((l) => /^; gcode_flavor = (\S+)/.exec(l)?.[1])
      .find((x) => x !== undefined);
    expect(golden['flavour']).toBe(named === 'klipper' || named === 'reprapfirmware' ? named : 'marlin');
  });
});

describe('layers on the corpus', () => {
  // A second opinion that does not use the parser: count the layer-change comments.
  const LAYER_COMMENT = /^;\s*(LAYER_CHANGE|CHANGE_LAYER)\s*$/;
  it.each(text)('$path: layer count equals the number of layer-change comments', (file) => {
    const expected = lines(file.path).filter((l) => LAYER_COMMENT.test(l.trim())).length;
    expect(expected).toBeGreaterThan(20);
    expect(readGolden(file)['layerCount']).toBe(expected);
  });

  it.each(text)('$path: layers are ordered, start inside the file and carry the stated z', async (file) => {
    const { chunks } = await parseAll(readFileSync(join(fixturesDir, file.path)));
    const stated = lines(file.path)
      .map((l) => /^;\s*Z(?:_HEIGHT)?:\s*(\S+)/.exec(l.trim())?.[1])
      .filter((z) => z !== undefined)
      .map(Number);
    const layers = chunks.flatMap((c) => c.layers);
    // PrusaSlicer also states the z of the final `;Z:` lift after the last layer
    expect(layers.map((l) => l.z)).toEqual(stated.slice(0, layers.length));
    const moves = chunks.reduce((n, c) => n + c.moveCount, 0);
    for (const [i, l] of layers.entries()) {
      expect(l.firstMove).toBeLessThan(moves);
      if (i > 0) expect(l.firstMove).toBeGreaterThan(layers[i - 1]?.firstMove ?? -1);
    }
  });
});

describe('roles on the corpus', () => {
  // Independent count: walk the lines, remember the last role tag, count the lines that extrude
  // while moving (E > 0 and X or Y changes; every corpus file uses relative E and absolute XY, and
  // an extruding line that stays in place is a re-prime).
  const TAG = /^;\s*(?:TYPE|FEATURE):\s*(.+?)\s*$/;
  const EXTRUDES = /^G[0-3]\s(?=[^;]*\b[XY]\s*-?[\d.])[^;]*\bE\s*([\d.]+)/;
  it.each(text)('$path: role histogram equals a line scan', (file) => {
    const expected: Record<string, number> = {};
    let role: MoveRole = MoveRole.Unknown;
    let x = NaN;
    let y = NaN;
    const rows = lines(file.path);
    expect(rows.some((l) => l.startsWith('M83'))).toBe(true);
    for (const l of rows) {
      const tag = TAG.exec(l)?.[1];
      const nx = /^G[0-3]\s[^;]*\bX(-?[\d.]+)/.exec(l)?.[1];
      const ny = /^G[0-3]\s[^;]*\bY(-?[\d.]+)/.exec(l)?.[1];
      const moved = (nx !== undefined && Number(nx) !== x) || (ny !== undefined && Number(ny) !== y);
      if (nx !== undefined) x = Number(nx);
      if (ny !== undefined) y = Number(ny);
      if (tag !== undefined) role = ROLE_BY_NAME.get(tag) ?? MoveRole.Unknown;
      else if (moved && Number(EXTRUDES.exec(l)?.[1] ?? 0) > 0) {
        const name = Object.entries(MoveRole).find(([, v]) => v === role)?.[0] ?? '';
        expected[name] = (expected[name] ?? 0) + 1;
      }
    }
    const golden = readGolden(file)['roleHistogram'] as Record<string, number>;
    expect(Object.entries(golden).sort()).toEqual(Object.entries(expected).sort());
    expect(golden['Unknown']).toBeUndefined();
  });

  it.each(text)('$path: every role tag in the file is known', (file) => {
    expect(readGolden(file)['diagnostics']).not.toContain('unknown-role');
  });
});

describe('Prusa-compatible tags', () => {
  it('reads roles, layers and the z after the change', async () => {
    const r = await run(
      ';TYPE:Custom\nG1 X1 Y1 E1\n;LAYER_CHANGE\n;Z:0.2\n;HEIGHT:0.2\nG1 Z0.2\n;TYPE:External perimeter\nG1 X2 E1\n;TYPE:Skirt/Brim\nG1 X3 E1\n',
    );
    expect(r.moves.map((m) => m.role)).toEqual([
      MoveRole.Custom,
      MoveRole.Custom,
      MoveRole.ExternalPerimeter,
      MoveRole.Skirt,
    ]);
    expect(r.chunks.flatMap((c) => c.layers)).toEqual([{ z: 0.2, firstMove: 1 }]);
  });
  it('a role name it does not know is Unknown with one warning per name', async () => {
    const r = await run(';TYPE:Wobble\nG1 X1 E1\n;TYPE:Wobble\nG1 X2 E1\n;TYPE:Perimeter\nG1 X3 E1\n');
    expect(r.moves.map((m) => m.role)).toEqual([MoveRole.Unknown, MoveRole.Unknown, MoveRole.Perimeter]);
    expect(r.diagnostics.map((d) => d.code)).toEqual(['unknown-role']);
  });
});

describe('Bambu tags', () => {
  it('reads FEATURE and CHANGE_LAYER with Z_HEIGHT', async () => {
    const r = await run(
      '; BambuStudio 02.08.02.61\n; CHANGE_LAYER\n; Z_HEIGHT: 0.2\n; LAYER_HEIGHT: 0.2\nG1 X1 E1\n; FEATURE: Outer wall\nG1 X2 E1\n; FEATURE: Floating vertical shell\nG1 X3 E1\n',
    );
    expect(r.chunks.at(-1)?.slicer).toBe('bambustudio');
    expect(r.moves.map((m) => m.role)).toEqual([MoveRole.Unknown, MoveRole.ExternalPerimeter, MoveRole.Perimeter]);
    expect(r.chunks.flatMap((c) => c.layers)).toEqual([{ z: 0.2, firstMove: 0 }]);
  });
});

describe('Cura tags (no corpus file yet, inline samples)', () => {
  const sample = [
    ';FLAVOR:Marlin',
    ';TIME:100',
    ';Generated with Cura_SteamEngine 5.7.0',
    ';LAYER_COUNT:2',
    ';LAYER:0',
    'G0 F600 X5 Y5 Z0.3',
    ';TYPE:WALL-OUTER',
    ';MESH:cube.stl',
    'G1 F1500 X10 Y5 E0.5',
    ';TYPE:SKIN',
    'G1 X10 Y10 E1',
    ';LAYER:1',
    ';TYPE:FILL',
    'G0 X5 Y5 Z0.8',
    'G1 X6 Y5 Z0.6 E1.1',
    ';TYPE:SUPPORT-INTERFACE',
    'G1 X7 Y5 E1.2',
    ';TYPE:PRIME-TOWER',
    'G1 X8 Y5 E1.3',
    '',
  ].join('\n');

  it('detects Cura, reads roles and layers, takes the layer z from the first extrusion', async () => {
    const r = await run(sample);
    expect(r.chunks.at(-1)?.slicer).toBe('cura');
    expect(r.moves.map((m) => m.role)).toEqual([
      MoveRole.Unknown,
      MoveRole.ExternalPerimeter,
      MoveRole.SolidInfill,
      MoveRole.InternalInfill,
      MoveRole.InternalInfill,
      MoveRole.SupportMaterialInterface,
      MoveRole.WipeTower,
    ]);
    // layer 0: no z-hop, the first move's z (0.3); layer 1: the z-hop travel to 0.8 does not count
    expect(r.chunks.flatMap((c) => c.layers)).toEqual([
      { z: 0.3, firstMove: 0 },
      { z: 0.6, firstMove: 3 },
    ]);
    expect(r.all).toEqual([]);
  });

  it('with the layers split over chunks, each chunk lists the layers that start in it', async () => {
    const r = await run(sample, { chunkMoves: 3 });
    for (const c of r.chunks) {
      for (const l of c.layers) {
        expect(l.firstMove).toBeGreaterThanOrEqual(c.firstMove);
        expect(l.firstMove).toBeLessThan(c.firstMove + Math.max(1, c.moveCount));
      }
    }
    expect(r.chunks.flatMap((c) => c.layers).map((l) => l.firstMove)).toEqual([0, 3]);
  });

  it('maps every Cura TYPE name', async () => {
    const names = ['WALL-OUTER', 'WALL-INNER', 'SKIN', 'FILL', 'SUPPORT', 'SUPPORT-INTERFACE', 'SKIRT', 'PRIME-TOWER'];
    const r = await run(names.map((n, i) => `;TYPE:${n}\nG1 X${i + 1} E1\n`).join(''));
    expect(r.moves.map((m) => m.role)).toEqual([
      MoveRole.ExternalPerimeter,
      MoveRole.Perimeter,
      MoveRole.SolidInfill,
      MoveRole.InternalInfill,
      MoveRole.SupportMaterial,
      MoveRole.SupportMaterialInterface,
      MoveRole.Skirt,
      MoveRole.WipeTower,
    ]);
  });
});

describe('no tags', () => {
  it('parses with role Unknown and one diagnostic saying why', async () => {
    const r = await run('G1 X1 E1\nG1 X2 E1\n; just a comment\nG1 X3 E1\n');
    expect(r.moves.map((m) => m.role)).toEqual([MoveRole.Unknown, MoveRole.Unknown, MoveRole.Unknown]);
    expect(r.chunks.flatMap((c) => c.layers)).toEqual([]);
    expect(r.all).toEqual([
      {
        code: 'no-slicer-tags',
        severity: 'info',
        fileOffset: 'G1 X1 E1\nG1 X2 E1\n; just a comment\nG1 X3 E1\n'.length,
        message: expect.stringContaining('no role tags'),
      },
    ]);
    expect(r.all[0]?.message).toContain('layer tags');
  });
  it('says only what is missing when the file has some tags', async () => {
    const roles = await run(';TYPE:Perimeter\nG1 X1 E1\n');
    expect(roles.all[0]?.message).toMatch(/^no layer tags/);
    const layers = await run(';LAYER_CHANGE\n;Z:0.2\nG1 X1 E1\n');
    expect(layers.all[0]?.message).toMatch(/^no role tags/);
  });
  it('is silent for a file without moves', async () => {
    expect((await run('; nothing here\n')).all).toEqual([]);
  });
});

describe('flavour', () => {
  const m203 = 'M203 X6000\nG1 X1 E1\n';
  const maxFeed = async (src: string, opts = {}): Promise<number | undefined> =>
    (await run(src, opts)).changes.find((c) => c.kind === StateKind.MaxFeedrate)?.value;

  it('is read from the config block and decides units from that line on', async () => {
    expect(await maxFeed(`; gcode_flavor = reprapfirmware\n${m203}`)).toBe(100);
    expect(await maxFeed(`; gcode_flavor = marlin2\n${m203}`)).toBe(6000);
    expect(await maxFeed(`; gcode_flavor = klipper\n${m203}`)).toBe(6000);
    expect(await maxFeed(`${m203}; gcode_flavor = reprapfirmware\n`)).toBe(6000); // too late for the earlier line
  });
  it('is read from Cura ;FLAVOR:', async () => {
    expect(await maxFeed(`;FLAVOR:RepRap\n${m203}`)).toBe(100);
  });
  it('the flavour option overrides what the file says', async () => {
    expect(await maxFeed(`; gcode_flavor = marlin\n${m203}`, { flavour: 'reprapfirmware' })).toBe(100);
    expect(await maxFeed(`; gcode_flavor = reprapfirmware\n${m203}`, { flavour: 'marlin' })).toBe(6000);
  });
  it('defaults to marlin', async () => {
    expect(await maxFeed(m203)).toBe(6000);
  });
  it('names the stated flavour in ParsedFile.flavourName, as written, the last one winning', async () => {
    const name = async (src: string, opts = {}): Promise<string | undefined> =>
      (await collect(parse(pieces(encode(src), 1 << 20), opts))).flavourName;
    expect(await name(`;FLAVOR:Klipper\n${m203}`)).toBe('Klipper');
    expect(await name(`;FLAVOR:Griffin\n${m203}`)).toBe('Griffin');
    expect(await name(`; gcode_flavor = marlin2\n${m203}`)).toBe('marlin2');
    expect(await name(`;FLAVOR:Marlin\n${m203}; gcode_flavor = klipper\n`)).toBe('klipper');
    expect(await name(`; gcode_flavor = klipper\n${m203}`, { flavour: 'marlin' })).toBe('klipper');
    expect(await name(`;FLAVOR:\n${m203}`)).toBeUndefined();
    expect(await name(m203)).toBeUndefined();
  });
  it('carries the name into chunks after the one that read it', async () => {
    const { chunks } = await run(`;FLAVOR:Klipper\n${'G1 X1 E1\n'.repeat(5)}`, { chunkMoves: 2 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.map((c) => c.flavourName)).toEqual(chunks.map(() => 'Klipper'));
  });
});

describe('slicer detection', () => {
  const detect = async (header: string): Promise<string | undefined> =>
    (await run(`${header}\nG1 X1 E1\n`)).chunks.at(-1)?.slicer;
  it('reads the producer from the header lines', async () => {
    expect(await detect('; generated by PrusaSlicer 2.9.0 on 2025-03-06')).toBe('prusaslicer');
    expect(await detect('; generated by SuperSlicer 2.5.59 on 2023-01-01')).toBe('superslicer');
    expect(await detect('; generated by OrcaSlicer 2.5.0')).toBe('orcaslicer');
    expect(await detect('; HEADER_BLOCK_START\n; BambuStudio 02.08.02.61')).toBe('bambustudio');
    expect(await detect(';Generated with Cura_SteamEngine 5.7.0')).toBe('cura');
    expect(await detect('; generated by Slic3r 1.3.0')).toBe('unknown');
    expect(await detect('; written by hand')).toBe('unknown');
  });
  it('ignores a producer line far down the file (a comment in a start script)', async () => {
    const filler = '; filler\n'.repeat(200);
    expect(await detect(`${filler}; generated by PrusaSlicer 2.9.0`)).toBe('unknown');
  });
  it('first producer wins', async () => {
    expect(await detect('; generated by OrcaSlicer 2.5.0\n; generated by PrusaSlicer 2.9.0')).toBe('orcaslicer');
  });
  it('comes through byte-by-byte input too', async () => {
    const r = await run('; generated by PrusaSlicer 2.9.0\n;TYPE:Perimeter\nG1 X1 E1\n', {}, 1);
    expect(r.chunks.at(-1)?.slicer).toBe('prusaslicer');
    expect(r.moves[0]?.role).toBe(MoveRole.Perimeter);
  });
});

describe('roleHistogram helper', () => {
  it('counts extruding moves only', async () => {
    const { chunks } = await parseAll(encode(';TYPE:Perimeter\nG1 X1 E1\nG1 X2\nG1 E-1\nG1 X3 E1\n'));
    expect(roleHistogram(chunks)).toEqual({ Perimeter: 2 });
  });
});
