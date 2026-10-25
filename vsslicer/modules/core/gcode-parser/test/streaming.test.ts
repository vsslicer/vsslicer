// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fileSource, parse } from '../src/index.ts';
import { fixturesDir } from './support/golden.ts';
import { encode, pieces, run, strideOk } from './support/run.ts';

const sample = readFileSync(join(fixturesDir, 'orca/cube-marlin.gcode'), 'utf8').slice(0, 120_000);

describe('chunking', () => {
  it('gives the same result for any input piece size, including 1 byte', async () => {
    const whole = await run(sample);
    for (const size of [1, 2, 7, 64, 1000]) {
      const r = await run(sample, {}, size);
      expect(r.moves, `size ${size}`).toEqual(whole.moves);
      expect(r.changes, `size ${size}`).toEqual(whole.changes);
      expect(r.markers, `size ${size}`).toEqual(whole.markers);
      expect(r.e, `size ${size}`).toEqual(whole.e);
    }
    expect(whole.moves.length).toBeGreaterThan(1000);
  });

  it('bounds chunks by move count, numbers them in order and carries state across them', async () => {
    const whole = await run(sample);
    const r = await run(sample, { chunkMoves: 100 }, 333);
    expect(r.chunks.length).toBe(Math.ceil(whole.moves.length / 100) + (whole.moves.length % 100 === 0 ? 1 : 0));
    let next = 0;
    for (const c of r.chunks) {
      expect(c.firstMove).toBe(next);
      expect(c.moveCount).toBeLessThanOrEqual(100);
      expect(strideOk(c)).toBe(true);
      next += c.moveCount;
    }
    expect(r.moves).toEqual(whole.moves);
    expect(r.changes).toEqual(whole.changes);
    expect(r.markers).toEqual(whole.markers);
    expect(r.chunks.at(-1)?.bytesRead).toBe(encode(sample).length);
  });

  it('also ends a chunk by decoded bytes when there are few moves', async () => {
    const text = '; comment line\nM117 hi\n'.repeat(1000);
    const r = await run(text, { chunkBytes: 4096 }, 500);
    expect(r.chunks.length).toBeGreaterThan(3);
    expect(r.markers).toHaveLength(1000);
    expect(r.chunks.map((c) => c.bytesRead)).toEqual([...r.chunks.map((c) => c.bytesRead)].sort((a, b) => a - b));
  });

  it('a line without a final line break is parsed; an empty file gives one empty chunk', async () => {
    expect((await run('G1 X1\nG1 X2')).moves.map((m) => m.x)).toEqual([1, 2]);
    const e = await run('');
    expect(e.chunks).toHaveLength(1);
    expect(e.chunks[0]?.moveCount).toBe(0);
  });

  it('skips a line longer than 1 MiB with a warning and carries on', async () => {
    const r = await run(`G1 X1\n; ${'x'.repeat(3 << 20)}\nG1 X2\n`, {}, 100_000);
    expect(r.moves.map((m) => m.x)).toEqual([1, 2]);
    expect(r.diagnostics.map((d) => d.code)).toEqual(['line-too-long']);
  });

  it('streams a file from disk', async () => {
    const path = join(fixturesDir, 'orca/cube-marlin.gcode');
    let n = 0;
    for await (const c of parse(fileSource(path, 4096))) n += c.moveCount;
    expect(n).toBe((await run(readFileSync(path, 'utf8'))).moves.length);
  });

  it('rejects with the signal reason when aborted', async () => {
    const ctl = new AbortController();
    const it = parse(pieces(encode(sample), 1000), { signal: ctl.signal, chunkMoves: 10 })[Symbol.asyncIterator]();
    await it.next();
    ctl.abort(new Error('stop'));
    await expect(it.next()).rejects.toThrow('stop');
  });
});

describe('4 GiB offsets', () => {
  it('stops with an offset-overflow error instead of wrapping', async () => {
    // lines are 6 bytes; the first starts 12 bytes below the u32 limit
    const r = await run('G1 X1\nG1 X2\nG1 X3\nG1 X4\n', { baseOffset: 0xffffffff - 11 });
    expect(r.moves.map((m) => m.x)).toEqual([1, 2]);
    expect(r.moves.map((m) => m.fileOffset)).toEqual([0xfffffff4, 0xfffffffa]);
    expect(r.diagnostics).toEqual([
      { code: 'offset-overflow', severity: 'error', fileOffset: 0xffffffff, message: expect.stringContaining('4 GiB') },
    ]);
  });
  it('does not consume the rest of the source after the overflow', async () => {
    let pulled = 0;
    async function* src(): AsyncGenerator<Uint8Array> {
      for (;;) {
        pulled++;
        yield encode('G1 X1\n'.repeat(10));
      }
    }
    const out = [];
    for await (const c of parse(src(), { baseOffset: 0xffffffff - 20 })) out.push(c);
    expect(pulled).toBe(1);
    expect(out.at(-1)?.diagnostics[0]?.code).toBe('offset-overflow');
  });
  it('the last byte of the u32 range is still a valid offset', async () => {
    const r = await run('G1 X1\n', { baseOffset: 0xffffffff });
    expect(r.moves[0]?.fileOffset).toBe(0xffffffff);
    expect(r.diagnostics).toEqual([]);
  });
});

describe('memory', () => {
  const MB = 1024 * 1024;
  const size = 100 * MB;
  // Retained chunks are typed arrays, so they show in `arrayBuffers`, not in `heapUsed`: the peakBuffers
  // assertion is the one that catches retention (mutation-checked: keeping every chunk gives >> 64 MB).
  // The 64 MB limit is about 30 chunks' worth, far below the ~100 MB+ a leak would add.
  // set GCODE_SKIP_HEAP_TEST=1 to skip (about 3 s on a laptop)
  it.skipIf(process.env['GCODE_SKIP_HEAP_TEST'] === '1')(
    'parses a 100 MB synthetic stream with bounded memory, dropping each chunk',
    async () => {
      const block = encode(
        'G1 X10.123 Y20.456 E0.01234 F1800\nG1 X11.5 Y20.456 E0.01234\n; layer comment\nM104 S200\nG1 X12.5 Y21 Z0.2 E.01\nG1 X13 E.01\nG1 X14 E.01\nG1 Y22 E.01\nM117 Printing\n',
      );
      async function* source(): AsyncGenerator<Uint8Array> {
        const piece = new Uint8Array(block.length * 1000);
        for (let i = 0; i < 1000; i++) piece.set(block, i * block.length);
        for (let sent = 0; sent < size; sent += piece.length) yield piece;
      }
      globalThis.gc?.();
      const base = process.memoryUsage();
      let peakHeap = 0;
      let peakBuffers = 0;
      let bytes = 0;
      let moves = 0;
      let chunks = 0;
      for await (const c of parse(source())) {
        // the consumer keeps nothing: only counts
        moves += c.moveCount;
        bytes = c.bytesRead;
        chunks++;
        const m = process.memoryUsage();
        peakHeap = Math.max(peakHeap, m.heapUsed - base.heapUsed);
        peakBuffers = Math.max(peakBuffers, m.arrayBuffers - base.arrayBuffers);
      }
      expect(bytes).toBeGreaterThanOrEqual(size);
      expect(moves).toBeGreaterThan(1_000_000);
      expect(chunks).toBeGreaterThan(10);
      expect(peakHeap).toBeLessThan(64 * MB);
      expect(peakBuffers).toBeLessThan(64 * MB);
    },
    60_000,
  );
});
