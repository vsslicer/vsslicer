// SPDX-License-Identifier: AGPL-3.0-or-later
import { chmodSync, createWriteStream, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { threadId } from 'node:worker_threads';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { collect, fileSource, parse, parseInWorker, ParseWorkerError } from '../src/index.ts';
import type { Progress } from '../src/index.ts';
import { loadManifest, fixturesDir } from './support/golden.ts';
import { encode, pieces } from './support/run.ts';

const dir = mkdtempSync(join(tmpdir(), 'gcode-worker-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const block =
  'G1 X10.123 Y20.456 E0.01234 F1800\nG1 X11.5 Y20.456 E0.01234\n; layer comment\nM104 S200\nG1 X12.5 Y21 Z0.2 E.01\n';
const big = join(dir, 'big.gcode');
const BIG = 200 * 1024 * 1024;

beforeAll(async () => {
  const w = createWriteStream(big);
  const piece = block.repeat(Math.ceil((8 << 20) / block.length));
  for (let n = 0; n < BIG; n += piece.length) if (!w.write(piece)) await once(w, 'drain');
  w.end();
  await once(w, 'finish');
}, 60_000);

describe('parseInWorker', () => {
  it('returns the same results as in-process for the corpus', async () => {
    expect(threadId).toBe(0); // we are the main thread; the parse below is not
    for (const f of loadManifest().files.filter((f) => f.format === 'gcode')) {
      const path = join(fixturesDir, f.path);
      const here = await collect(parse(fileSource(path)));
      const there = await collect(parseInWorker(path));
      expect(there, f.path).toEqual(here);
    }
  });

  it('parses a byte stream, with progress ending at 100%', async () => {
    const bytes = encode(block.repeat(2000));
    const seen: Progress[] = [];
    const file = await collect(
      parseInWorker(pieces(bytes, 5000), { chunkMoves: 500, total: bytes.length, onProgress: (p) => seen.push(p) }),
    );
    expect(file).toEqual(await collect(parse(pieces(bytes, 5000), { chunkMoves: 500 })));
    expect(seen.length).toBeGreaterThan(3);
    const read = seen.map((p) => p.bytesRead);
    expect(read).toEqual([...read].sort((a, b) => a - b));
    expect(seen.at(-1)).toEqual({ bytesRead: bytes.length, total: bytes.length });
  });

  it('cancels a 200 MB parse within 500 ms and sends nothing more', async () => {
    const ctl = new AbortController();
    const it = parseInWorker(big, { signal: ctl.signal, chunkMoves: 1000 })[Symbol.asyncIterator]();
    await it.next();
    const t = performance.now();
    ctl.abort(new Error('stop'));
    await expect(it.next()).rejects.toThrow('stop');
    expect(performance.now() - t).toBeLessThan(500);
    expect((await it.next()).done).toBe(true);
  });

  it('rejects at once for an already aborted signal', async () => {
    const it = parseInWorker(big, { signal: AbortSignal.abort(new Error('early')) })[Symbol.asyncIterator]();
    await expect(it.next()).rejects.toThrow('early');
  });

  it('does not run ahead of a slow consumer: buffers stay bounded', async () => {
    const MB = 1024 * 1024;
    const base = process.memoryUsage().arrayBuffers;
    let peak = 0;
    let n = 0;
    for await (const c of parseInWorker(big, { chunkMoves: 20_000, maxPendingChunks: 2 })) {
      await new Promise((r) => setTimeout(r, 20)); // slow: the worker would finish the file meanwhile
      peak = Math.max(peak, process.memoryUsage().arrayBuffers - base);
      if (++n === 25) {
        expect(c.bytesRead).toBeLessThan(BIG / 4);
        break;
      }
    }
    expect(peak).toBeLessThan(64 * MB);
  });

  it('gives a typed memory-cap error when the worker exceeds its heap', async () => {
    const path = join(dir, 'markers.gcode');
    const w = createWriteStream(path);
    w.end('M117 a marker that stays in the chunk\n'.repeat(400_000));
    await once(w, 'finish');
    // one huge chunk keeps every marker object on the worker heap
    const err = await collect(
      parseInWorker(path, { memoryCapBytes: 16 << 20, chunkMoves: 1e9, chunkBytes: 2 ** 30 }),
    ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ParseWorkerError);
    expect((err as ParseWorkerError).code).toBe('memory-cap');
  });

  it('surfaces failures: a host source error as is, a worker error as parse-failed with the cause', async () => {
    async function* bad(): AsyncGenerator<Uint8Array> {
      yield encode('G1 X1\n');
      throw new Error('disk gone');
    }
    // the source lives on the host; its failure is the host's own error
    await expect(collect(parseInWorker(bad()))).rejects.toThrow('disk gone');
    // a directory passes stat but cannot be read: the failure happens inside the worker
    const err = await collect(parseInWorker(dir)).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ParseWorkerError);
    expect((err as ParseWorkerError).code).toBe('parse-failed');
    expect(((err as ParseWorkerError).cause as NodeJS.ErrnoException).code).toBe('EISDIR');
  });

  it('rejects a missing path with parse-failed and the ENOENT cause', async () => {
    const err = await collect(parseInWorker(join(dir, 'missing.gcode'))).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ParseWorkerError);
    expect((err as ParseWorkerError).code).toBe('parse-failed');
    expect(((err as ParseWorkerError).cause as NodeJS.ErrnoException).code).toBe('ENOENT');
  });

  it.skipIf(process.platform === 'win32' || process.getuid?.() === 0)(
    'rejects an unreadable file with parse-failed and the EACCES cause',
    async () => {
      const f = join(dir, 'locked.gcode');
      writeFileSync(f, 'G1 X1\n');
      chmodSync(f, 0o000);
      const err = await collect(parseInWorker(f)).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(ParseWorkerError);
      expect((err as ParseWorkerError).code).toBe('parse-failed');
      expect(((err as ParseWorkerError).cause as NodeJS.ErrnoException).code).toBe('EACCES');
    },
  );
});
