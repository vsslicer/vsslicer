// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Chunk } from '@vsslicer/gcode-api';
import { describe, expect, it } from 'vitest';
import { collect, parse } from '../src/index.ts';
import { encode, pieces } from './support/run.ts';

async function* one(c: Chunk): AsyncGenerator<Chunk> {
  yield c;
}

describe('collect with huge arrays', () => {
  it('joins 300,000 marker lines parsed from a file', async () => {
    const text = 'M400\n'.repeat(300_000);
    const file = await collect(parse(pieces(encode(text), 1 << 20)));
    expect(file.markers.length).toBe(300_000);
  });

  it('joins a chunk with 1,000,000 markers, layers, diagnostics and object ranges', async () => {
    const n = 1_000_000;
    const c: Chunk = {
      slicer: 'unknown',
      firstMove: 0,
      moveCount: 0,
      moves: new ArrayBuffer(0),
      extrusion: new ArrayBuffer(0),
      stateChanges: new ArrayBuffer(0),
      layers: [],
      markers: Array.from({ length: n }, (_, i) => ({ name: 'M400', fileOffset: i, moveIndex: 0 })),
      diagnostics: [],
      thumbnails: [],
      objects: [{ name: 'a', ranges: Array.from({ length: n }, (_, i) => ({ start: i, end: i + 1 })) }],
      config: {},
    } as unknown as Chunk;
    const file = await collect(one(c));
    expect(file.markers.length).toBe(n);
    expect(file.objects[0]?.ranges.length).toBe(n);
    // a second chunk with the same object appends to the first's ranges
    const both = await collect(
      (async function* () {
        yield c;
        yield c;
      })(),
    );
    expect(both.markers.length).toBe(2 * n);
    expect(both.objects[0]?.ranges.length).toBe(2 * n);
  });
});
