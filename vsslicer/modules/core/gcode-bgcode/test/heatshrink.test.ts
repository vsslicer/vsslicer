// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BlockType,
  deflateCodec,
  heatshrink11Codec,
  heatshrink12Codec,
  heatshrinkDecode,
  readBgcode,
  type Block,
} from '../src/index.ts';

const fixture = (n: string) => readFileSync(new URL(`./fixtures/prusaslicer/${n}`, import.meta.url));

async function gcodeBlocks(file: string): Promise<Block[]> {
  const bytes = fixture(file);
  const out: Block[] = [];
  const codecs = [deflateCodec, heatshrink11Codec, heatshrink12Codec];
  for await (const e of readBgcode(
    (async function* () {
      yield bytes;
    })(),
    codecs,
  )) {
    if (e.kind === 'diagnostic') throw new Error(e.diagnostic.message);
    if (e.kind === 'block' && e.block.type === BlockType.GCode) out.push(e.block);
  }
  return out;
}

/** Independent reference encoder (greedy longest match), written from the stream format, not from the decoder. */
function encode(input: Uint8Array, windowBits: number, lookaheadBits: number): Uint8Array {
  const bits: number[] = [];
  const put = (v: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1);
  };
  const maxBack = 1 << windowBits;
  const maxLen = 1 << lookaheadBits;
  for (let i = 0; i < input.length;) {
    let bestLen = 0;
    let bestBack = 0;
    for (let b = 1; b <= Math.min(i, maxBack); b++) {
      let l = 0;
      while (l < maxLen && i + l < input.length && input[i + l] === input[i + l - b]) l++;
      if (l > bestLen) [bestLen, bestBack] = [l, b];
    }
    if (bestLen >= 3) {
      put(0, 1);
      put(bestBack - 1, windowBits);
      put(bestLen - 1, lookaheadBits);
      i += bestLen;
    } else {
      put(1, 1);
      put(input[i]!, 8);
      i++;
    }
  }
  const out = new Uint8Array(Math.ceil(bits.length / 8));
  bits.forEach((b, i) => (out[i >> 3]! |= b << (7 - (i & 7))));
  return out;
}

describe('heatshrinkDecode', () => {
  it('decodes a hand-built stream: literal "a", then a back-reference of 5 at distance 1 (overlapping)', () => {
    // bits: 1 01100001 | 0 000000000000 0100 (12-4: index 0 -> back 1, count 4 -> 5 bytes), zero-padded
    const stream = Uint8Array.from([0b10110000, 0b10000000, 0b00000001, 0b00000000]);
    expect(new TextDecoder().decode(heatshrinkDecode(stream, 6, 12, 4))).toBe('aaaaaa');
  });

  it.each([
    [11, 4],
    [12, 4],
  ])('round-trips the %i-%i reference encoder over text with repeats', (w, l) => {
    const text = new TextEncoder().encode(
      'G1 X10 Y10 E0.5\n'.repeat(300) + 'M104 S200\n'.repeat(50) + 'abc'.repeat(200),
    );
    const wide = Uint8Array.from({ length: 5000 }, (_, i) => (i * 7 + (i >> 5)) & 0xff);
    for (const input of [text, wide, new Uint8Array(0), Uint8Array.of(7)])
      expect(heatshrinkDecode(encode(input, w, l), input.length, w, l)).toEqual(input);
  });

  it('decodes the 12-4 G-code blocks of mini_cube_b to MeatPack bytes that carry the reference comments verbatim', async () => {
    // Both fixtures use MeatPack-with-comments (encoding 2), so the raw bytes cannot equal the text
    // G-code until GCP-13; but MeatPack leaves comment lines as plain ASCII, which the reference file
    // gives us as an independent check of the decoded bytes.
    const blocks = await gcodeBlocks('mini_cube_b.bgcode');
    expect(blocks.length).toBe(10);
    expect(blocks.every((b) => b.compression === 3 && b.params.type === 1 && b.params.encoding === 2)).toBe(true);
    const decoded = Buffer.concat(blocks.map((b) => b.data!)).toString('latin1');
    const lines = fixture('mini_cube_b_ref.gcode').toString('utf8').split('\n');
    const start = lines.findIndex((l) => /^[GM]\d/.test(l));
    const end = lines.findIndex((l) => l.startsWith('; prusaslicer_config'));
    const comments = lines.slice(start, end).filter((l) => l.startsWith(';') && l.length > 12);
    expect(comments.length).toBeGreaterThan(5);
    for (const c of comments.slice(0, 40)) expect(decoded).toContain(c.slice(1).trim());
  });

  it('decodes mini_cube_ps2.8.1 12-4 blocks to the declared sizes', async () => {
    const blocks = await gcodeBlocks('mini_cube_ps2.8.1.bgcode');
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) expect(b.data!.length).toBe(b.uncompressedSize);
  });

  it('re-encoding a fixture block with the reference encoder and 11-4 round-trips', async () => {
    const [block] = await gcodeBlocks('mini_cube_b.bgcode');
    const raw = block!.data!.subarray(0, 8000);
    expect(heatshrinkDecode(encode(raw, 11, 4), raw.length, 11, 4)).toEqual(raw);
  });

  describe('corruption', () => {
    it('rejects a reference before the start of the output', () => {
      // tag 0, index 11 -> back 12, count 0 -> 1, with nothing decoded yet
      const stream = Uint8Array.from([0b00000000, 0b01011000, 0b00000000]);
      expect(() => heatshrinkDecode(stream, 10, 12, 4)).toThrow(/before the start/);
    });
    it('rejects a reference that runs past the declared size', () => {
      const good = encode(new TextEncoder().encode('abcabcabcabcabc'), 12, 4);
      expect(() => heatshrinkDecode(good, 7, 12, 4)).toThrow();
    });
    it('rejects a truncated stream and trailing data', () => {
      const good = encode(new TextEncoder().encode('hello hello hello'), 12, 4);
      expect(() => heatshrinkDecode(good.subarray(0, 4), 17, 12, 4)).toThrow(/ends after/);
      expect(() => heatshrinkDecode(Uint8Array.of(...good, 0xff, 0xff), 17, 12, 4)).toThrow(/unused/);
    });
    it('terminates promptly on random bytes and on a huge declared size with tiny input', () => {
      const t = Date.now();
      let seed = 1;
      for (let k = 0; k < 200; k++) {
        const junk = Uint8Array.from({ length: 300 }, () => ((seed = (seed * 1103515245 + 12345) >>> 0) >> 16) & 0xff);
        try {
          heatshrinkDecode(junk, 1000, 12, 4);
        } catch {
          /* expected */
        }
      }
      expect(() => heatshrinkDecode(new Uint8Array(100), 1 << 20, 12, 4)).toThrow();
      expect(Date.now() - t).toBeLessThan(2000);
    });
    it('reports decode-failed through the reader and keeps going', async () => {
      const bytes = Uint8Array.from(fixture('mini_cube_b.bgcode'));
      // Find the first G-code block (type 1, compression 3) and zero part of its payload.
      let off = 10;
      const dv = new DataView(bytes.buffer);
      for (;;) {
        const type = dv.getUint16(off, true);
        const comp = dv.getUint16(off + 2, true);
        const csize = comp ? dv.getUint32(off + 8, true) : dv.getUint32(off + 4, true);
        if (type === 1) {
          bytes.fill(0xff, off + 12 + 2 + 10, off + 12 + 2 + 40);
          break;
        }
        off += (comp ? 12 : 8) + (type === 5 ? 6 : 2) + csize + 4;
      }
      const codes: string[] = [];
      for await (const e of readBgcode(
        (async function* () {
          yield bytes;
        })(),
        [deflateCodec, heatshrink12Codec],
      ))
        if (e.kind === 'diagnostic') codes.push(e.diagnostic.code);
      expect(codes).toContain('decode-failed');
    });
  });
});
