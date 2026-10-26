// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';
import {
  BlockType,
  Compression,
  crc32,
  deflateCodec,
  heatshrink11Codec,
  readBgcode,
  type BgcodeEvent,
  type Block,
  type Codec,
} from '../src/index.ts';

const collect = async (bytes: Uint8Array, codecs: Codec[] = [deflateCodec], chunk = bytes.length) => {
  const out: BgcodeEvent[] = [];
  const src = (async function* () {
    for (let i = 0; i < bytes.length; i += chunk) yield bytes.subarray(i, i + chunk);
  })();
  for await (const e of readBgcode(src, codecs)) out.push(e);
  return out;
};
const blocks = (ev: BgcodeEvent[]) => ev.flatMap((e) => (e.kind === 'block' ? [e.block] : []));
const codes = (ev: BgcodeEvent[]) => ev.flatMap((e) => (e.kind === 'diagnostic' ? [e.diagnostic.code] : []));

/** Hand-built v1 file with CRC32: one uncompressed file-metadata block, then `extra`. */
function build(header: number[] = [], extra: Uint8Array = new Uint8Array(0), checksum = 1) {
  const le = (n: number, size: number) => Array.from({ length: size }, (_, i) => (n >>> (8 * i)) & 0xff);
  const payload = [...Buffer.from('Producer=x\n')];
  const blk = Uint8Array.from([...le(0, 2), ...le(0, 2), ...le(payload.length, 4), ...le(0, 2), ...payload]);
  const crc = checksum ? le(crc32(blk), 4) : [];
  return Uint8Array.from([
    ...Buffer.from('GCDE'),
    ...le(1, 4),
    ...le(checksum, 2),
    ...(header.length ? header : [...blk, ...crc]),
    ...extra,
  ]);
}

describe.each(['mini_cube_ps2.8.1.bgcode', 'mini_cube_b.bgcode'])('PrusaSlicer fixture %s', (name) => {
  it('parses the header and all six block types, CRC clean', async () => {
    const ev = await collect(
      new Uint8Array(readFileSync(new URL(`./fixtures/prusaslicer/${name}`, import.meta.url))),
      undefined,
      777,
    );
    const types = new Set(blocks(ev).map((b) => b.type));
    expect(
      types.has(BlockType.PrinterMetadata) && types.has(BlockType.Thumbnail) && types.has(BlockType.PrintMetadata),
    ).toBe(true);
    expect(types.has(BlockType.SlicerMetadata) && types.has(BlockType.GCode)).toBe(true);
    if (name.includes('ps2')) expect(types.has(BlockType.FileMetadata)).toBe(true);
    expect(ev[0]).toEqual({ kind: 'header', header: { version: 1, checksumType: 1 } });
    // Deflate decodes; Heatshrink G-code has no codec yet (GCP-12): only that diagnostic appears
    expect(new Set(codes(ev))).toEqual(new Set(['unsupported-compression']));
    const slicer = blocks(ev).find((b) => b.type === BlockType.SlicerMetadata)!;
    expect(new TextDecoder().decode(slicer.data)).toContain('=');
    expect(blocks(ev).find((b) => b.type === BlockType.Thumbnail)!.params).toMatchObject({ type: 5, width: 16 });
    expect(blocks(ev).find((b) => b.type === BlockType.GCode)!.data).toBeUndefined();
  });
});

describe('typed diagnostics', () => {
  it('reports a CRC failure and still yields the block', async () => {
    const f = build();
    f[f.length - 1] = ~f[f.length - 1]!;
    const ev = await collect(f);
    expect(codes(ev)).toEqual(['crc-mismatch']);
    expect(blocks(ev)).toHaveLength(1);
  });

  it('reports an unknown block type and stops', async () => {
    const f = build([], Uint8Array.of(9, 0, 0, 0, 0, 0, 0, 0));
    expect(codes(await collect(f))).toEqual(['unknown-block-type']);
  });

  it('reports an unknown compression and stops', async () => {
    const f = build([], Uint8Array.of(1, 0, 9, 0, 0, 0, 0, 0));
    expect(codes(await collect(f))).toEqual(['unknown-compression']);
  });

  it('reports a truncated block', async () => {
    const f = build();
    const ev = await collect(f.subarray(0, f.length - 6));
    expect(codes(ev)).toEqual(['truncated']);
    expect(blocks(ev)).toHaveLength(0);
  });
});

describe('Codec port', () => {
  it('hands the compressed payload to the codec registered for its compression', async () => {
    const fake: Codec = { compression: Compression.Heatshrink12, decode: (d, n) => new Uint8Array(n).fill(d[0]!) };
    const raw = new Uint8Array(
      readFileSync(new URL('./fixtures/prusaslicer/mini_cube_ps2.8.1.bgcode', import.meta.url)),
    );
    const ev = await collect(raw, [deflateCodec, fake]);
    const g = blocks(ev).find((b): b is Block => b.type === BlockType.GCode)!;
    expect(g.data).toHaveLength(g.uncompressedSize);
    expect(codes(ev)).toEqual([]);
  });

  it('turns a throwing codec into decode-failed', async () => {
    const bad: Codec = {
      compression: Compression.Deflate,
      decode: () => {
        throw new Error('boom');
      },
    };
    const raw = new Uint8Array(
      readFileSync(new URL('./fixtures/prusaslicer/mini_cube_ps2.8.1.bgcode', import.meta.url)),
    );
    expect(codes(await collect(raw, [bad]))).toContain('decode-failed');
  });
});

describe('truncation at every offset', () => {
  const full = build([], build().subarray(10)); // header + block + identical second block
  const blockLen = (full.length - 10) / 2;
  it('yields exactly one truncated unless cut on a block boundary', async () => {
    for (let n = 0; n < full.length; n++) {
      const ev = await collect(full.subarray(0, n), [deflateCodec], 3);
      const boundary = n === 10 || n === 10 + blockLen;
      expect(codes(ev), `cut ${n}`).toEqual(boundary ? [] : ['truncated']);
    }
  });

  it('reads a 20 MB block in 4 KB chunks', async () => {
    const le = (n: number, size: number) => Array.from({ length: size }, (_, i) => (n >>> (8 * i)) & 0xff);
    const size = 20 * 1024 * 1024;
    const blk = new Uint8Array(8 + 2 + size);
    blk.set([...le(0, 2), ...le(0, 2), ...le(size, 4)]);
    const bytes = Uint8Array.from([...Buffer.from('GCDE'), ...le(1, 4), ...le(1, 2)]);
    const all = new Uint8Array(bytes.length + blk.length + 4);
    all.set(bytes);
    all.set(blk, bytes.length);
    all.set(le(crc32(blk), 4), bytes.length + blk.length);
    // Bytes copied by Uint8Array.set: linear reassembly copies each byte about once; re-joining the
    // buffer on every chunk would copy about size^2 / 8 KiB.
    const orig = Uint8Array.prototype.set;
    let copied = 0;
    const spy = vi.spyOn(Uint8Array.prototype, 'set').mockImplementation(function (this: Uint8Array, a, off) {
      copied += (a as ArrayLike<number>).length;
      return orig.call(this, a, off);
    });
    let ev: BgcodeEvent[];
    try {
      ev = await collect(all, [deflateCodec], 4096);
    } finally {
      spy.mockRestore();
    }
    expect(codes(ev)).toEqual([]);
    expect(blocks(ev)[0]?.data?.length).toBe(size);
    expect(copied).toBeLessThan(3 * size);
  }, 60_000); // hang guard only
});

describe('block size bounds (GCP-76)', () => {
  const le = (n: number, size: number) => Array.from({ length: size }, (_, i) => Math.floor(n / 2 ** (8 * i)) & 0xff);
  /** One compressed G-code block with no checksum (header checksum type 0). */
  const file = (compression: number, uncompressed: number, payload: Uint8Array) =>
    Uint8Array.from([
      ...Buffer.from('GCDE'),
      ...le(1, 4),
      ...le(0, 2),
      ...le(1, 2),
      ...le(compression, 2),
      ...le(uncompressed, 4),
      ...le(payload.length, 4),
      ...le(0, 2),
      ...payload,
    ]);
  const spy = (decode: Codec['decode']) => {
    const calls: number[] = [];
    return { calls, decode: (d: Uint8Array, s: number) => (calls.push(s), decode(d, s)) };
  };
  const mb = () => process.memoryUsage().arrayBuffers / 2 ** 20;

  it('does not allocate for a 4-byte Heatshrink block claiming 4 GB', async () => {
    const before = mb();
    const ev = await collect(file(2, 0xffffffff, Uint8Array.of(1, 2, 3, 4)), [heatshrink11Codec]);
    expect(codes(ev)).toEqual(['block-too-large']);
    expect(blocks(ev)[0]!.data).toBeUndefined();
    expect(mb() - before).toBeLessThan(5);
  });

  it('rejects a Heatshrink block claiming more than 16x its compressed size, before the codec runs', async () => {
    const s = spy(() => new Uint8Array(0));
    const ev = await collect(file(2, 65, new Uint8Array(4)), [
      { compression: Compression.Heatshrink11, decode: s.decode },
    ]);
    expect(codes(ev)).toEqual(['block-too-large']);
    expect(s.calls).toEqual([]);
  });

  it('rejects any compressed block declaring more than 64 MiB', async () => {
    const ev = await collect(file(1, 64 * 2 ** 20 + 1, new Uint8Array(8)), [deflateCodec]);
    expect(codes(ev)).toEqual(['block-too-large']);
  });

  it('stops inflating at the declared size instead of expanding a deflate bomb', async () => {
    const bomb = deflateSync(Buffer.alloc(210 * 2 ** 20), { level: 9 });
    const before = mb();
    const ev = await collect(file(1, 100, bomb), [deflateCodec]);
    expect(codes(ev)).toEqual(['decode-failed']);
    expect(mb() - before).toBeLessThan(5);
  });
});
