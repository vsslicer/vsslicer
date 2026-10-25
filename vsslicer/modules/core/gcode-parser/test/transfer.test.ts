// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MOVE_STRIDE, STATE_CHANGE_STRIDE } from '@vsslicer/gcode-api';
import { describe, expect, it } from 'vitest';
import { collect, parse, transferList } from '../src/index.ts';
import { fixturesDir } from './support/golden.ts';
import { encode, pieces } from './support/run.ts';

const text = readFileSync(join(fixturesDir, 'orca/cube-marlin.gcode'), 'utf8').slice(0, 200_000);
const bytes = encode(text);

describe('transferable output', () => {
  it('gives exact-length buffers and detaches them on transfer, the copy reading the same', async () => {
    let n = 0;
    for await (const c of parse(pieces(bytes, 4096), { chunkMoves: 300 })) {
      expect(c.moves.byteLength).toBe(c.moveCount * MOVE_STRIDE);
      expect(c.extrusion.byteLength).toBe(c.moveCount * 4);
      expect(c.stateChanges.byteLength % STATE_CHANGE_STRIDE).toBe(0);
      const before = [c.moves, c.extrusion, c.stateChanges].map((b) => new Uint8Array(b.slice(0)));
      const sizes = transferList(c).map((b) => b.byteLength);
      const copy = structuredClone(c, { transfer: transferList(c) });
      expect([c.moves, c.extrusion, c.stateChanges].map((b) => b.byteLength)).toEqual([0, 0, 0]);
      expect([copy.moves, copy.extrusion, copy.stateChanges].map((b) => b.byteLength)).toEqual(sizes);
      expect([copy.moves, copy.extrusion, copy.stateChanges].map((b) => new Uint8Array(b))).toEqual(before);
      n++;
    }
    expect(n).toBeGreaterThan(2);
  });

  it('ends without an empty chunk', async () => {
    const chunks = [];
    for await (const c of parse(pieces(bytes, 4096), { chunkMoves: 300 })) chunks.push(c);
    expect(chunks.at(-1)?.moveCount).toBeGreaterThan(0);
    // a final chunk exists without moves only to carry something
    for await (const c of parse(pieces(encode('G1 X1\nG1 X2\n'), 100), { chunkMoves: 2 })) {
      expect(c.moveCount + c.markers.length + c.diagnostics.length + c.stateChanges.byteLength).toBeGreaterThan(0);
    }
  });

  it('carries final diagnostics in the last chunk', async () => {
    const chunks = [];
    for await (const c of parse(pieces(encode('G1 X1\nG1 X2\n'), 100), { chunkMoves: 2 })) chunks.push(c);
    expect(chunks.map((c) => c.moveCount)).toEqual([2, 0]);
    expect(chunks[1]?.diagnostics.map((d) => d.code)).toEqual(['no-slicer-tags']);
  });
});

describe('collect', () => {
  it('assembles the layer table, markers and diagnostics across chunk boundaries', async () => {
    const whole = await collect(parse(pieces(bytes, 4096)));
    const split = await collect(parse(pieces(bytes, 777), { chunkMoves: 250 }));
    expect(split.moves.length).toBeGreaterThan(3);
    expect(split.moves.reduce((a, b) => a + b.byteLength, 0)).toBe(split.moveCount * MOVE_STRIDE);
    expect(split.moveCount).toBe(whole.moveCount);
    expect(split.layers).toEqual(whole.layers);
    expect(split.markers).toEqual(whole.markers);
    expect(split.diagnostics).toEqual(whole.diagnostics);
    expect(split.slicer).toBe('orcaslicer');
    expect(split.layers.length).toBeGreaterThan(1);
    const starts = split.layers.map((l) => l.firstMove);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    // at least one layer starts in a later chunk than the first
    expect(starts.some((s) => s >= 250)).toBe(true);
  });

  it('gives an empty ParsedFile for no bytes', async () => {
    expect(await collect(parse(pieces(new Uint8Array(0), 1)))).toMatchObject({ moveCount: 0, layers: [], moves: [] });
  });
});
