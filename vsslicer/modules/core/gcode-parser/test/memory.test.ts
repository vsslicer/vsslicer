// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { parse } from '../src/index.ts';
import { encode } from './support/run.ts';

// Own file so no other test shares the worker's heap; vitest.config.ts runs it with --expose-gc.

describe('memory', () => {
  const MB = 1024 * 1024;
  const size = 100 * MB;
  const gc = (): void => {
    if (!globalThis.gc) throw new Error('run with --expose-gc (see vitest.config.ts)');
    globalThis.gc();
  };
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
      gc();
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
        // Collect before measuring: dropped chunks are garbage until GC runs, and when that happens
        // depends on machine load. What survives a collection is retention, which is what we test.
        if (chunks % 8 === 0) {
          gc();
          const m = process.memoryUsage();
          peakHeap = Math.max(peakHeap, m.heapUsed - base.heapUsed);
          peakBuffers = Math.max(peakBuffers, m.arrayBuffers - base.arrayBuffers);
        }
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
