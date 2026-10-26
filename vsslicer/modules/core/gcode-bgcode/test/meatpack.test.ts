// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  decodeGcodeBlocks,
  deflateCodec,
  heatshrink11Codec,
  heatshrink12Codec,
  meatpackDecode,
  readBgcode,
  type GcodeEvent,
} from '../src/index.ts';

const fixture = (n: string) => new Uint8Array(readFileSync(new URL(`./fixtures/prusaslicer/${n}`, import.meta.url)));
const codecs = [deflateCodec, heatshrink11Codec, heatshrink12Codec];
const text = (b: Uint8Array) => Buffer.from(b).toString('latin1');

async function decodeFile(bytes: Uint8Array): Promise<GcodeEvent[]> {
  const out: GcodeEvent[] = [];
  const src = (async function* () {
    for (let i = 0; i < bytes.length; i += 4096) yield bytes.subarray(i, i + 4096);
  })();
  for await (const e of decodeGcodeBlocks(readBgcode(src, codecs))) out.push(e);
  return out;
}

/**
 * Test-only MeatPack encoder, after libbgcode's MPBinarizer::binarize_line (default flags plus OmitWhitespaces).
 * `comments` keeps ';' lines as plain bytes (encoding 2); otherwise they are dropped (encoding 1).
 */
function encode(lines: string[], comments: boolean): Uint8Array {
  const val: Record<string, number> = { '.': 10, '\n': 12, G: 13, X: 14, E: 11 };
  for (let d = 0; d < 10; d++) val[String(d)] = d;
  const out: number[] = [0xff, 0xff, 251, 0xff, 0xff, 247];
  let packing = true;
  for (const raw of lines) {
    if (raw.trimStart().startsWith(';')) {
      if (!comments) continue;
      if (packing) out.push(0xff, 0xff, 250);
      packing = false;
      out.push(...Buffer.from(raw + '\n'));
      continue;
    }
    const line = (/^G\d/.test(raw) ? raw.replaceAll(' ', '') : raw) + '\n'; // only G lines lose their spaces
    if (!packing) out.push(0xff, 0xff, 251, 0xff, 0xff, 247);
    packing = true;
    for (let i = 0; i < line.length; i += 2) {
      const a = line[i]!;
      const b = line[i + 1] ?? '\n';
      const pa = a in val;
      const pb = b in val;
      if (pa && pb) out.push((val[b]! << 4) | val[a]!);
      else if (pa) out.push(0xf0 | val[a]!, b.charCodeAt(0));
      else if (pb) out.push((val[b]! << 4) | 0x0f, a.charCodeAt(0));
      else out.push(0xff, a.charCodeAt(0), b.charCodeAt(0));
    }
  }
  return Uint8Array.from(out);
}

describe('fixtures decode to PrusaSlicer text', () => {
  /**
   * Equality, strictest that holds. The reference .gcode also holds the header, thumbnail and config comments
   * that live in the metadata/thumbnail blocks, so it is longer than the G-code blocks: the decoded G-code must
   * appear in it byte for byte. mini_cube_b: as one contiguous run. mini_cube_ps2.8.1: the stream also holds bare
   * `;` / `; ` comment lines that the reference text lacks (they are in the bgcode, plain bytes between MeatPack
   * commands, not a decoder artefact); with those lines removed, the rest is a byte-identical prefix of the
   * reference from its first G-code line.
   */
  const decoded = async (name: string) => {
    const ev = await decodeFile(fixture(name));
    expect(ev.filter((e) => e.kind === 'diagnostic')).toEqual([]);
    const parts = ev.flatMap((e) => (e.kind === 'gcode' ? [e.text] : []));
    expect(parts.length).toBeGreaterThan(0);
    return text(Buffer.concat(parts));
  };

  it('mini_cube_b.bgcode (10 blocks) is contiguous in its reference', async () => {
    const dec = await decoded('mini_cube_b.bgcode');
    expect(dec.length).toBeGreaterThan(600_000);
    expect(text(fixture('mini_cube_b_ref.gcode')).includes(dec)).toBe(true);
  });

  it('mini_cube_ps2.8.1.bgcode (MeatPack with comments) matches its reference prefix', async () => {
    const dec = await decoded('mini_cube_ps2.8.1.bgcode');
    const lines = dec.split('\n');
    expect(lines.filter((l) => /^; ?$/.test(l))).toHaveLength(5);
    const rest = lines.filter((l) => !/^; ?$/.test(l)).join('\n');
    const ref = text(fixture('mini_cube_ps2.8.1_ref.gcode'));
    expect(ref.slice(ref.indexOf('M73 P0 R3')).startsWith(rest)).toBe(true);
    expect(rest.length).toBeGreaterThan(50_000);
  });
});

describe('without comments (encoding 1) vector', () => {
  const src = ['; dropped', 'G1 X10.5 Y-3 E0.25 F1800', 'M104 S215', 'G92 E0', '; also dropped', 'G28 W'];
  it('round-trips with libbgcode re-spacing, comments gone', () => {
    // Re-spacing only touches G lines: M104 S215 keeps its text, G1 parameters are separated by one space.
    expect(text(meatpackDecode(encode(src, false)))).toBe('G1 X10.5 Y-3 E0.25 F1800\nM104 S215\nG92 E0\nG28 W\n');
  });
  it('with comments (encoding 2) keeps the comment lines verbatim', () => {
    expect(text(meatpackDecode(encode(src, true)))).toBe(
      '; dropped\nG1 X10.5 Y-3 E0.25 F1800\nM104 S215\nG92 E0\n; also dropped\nG28 W\n',
    );
  });
  it('handles an unpackable character in either nibble and a lone newline', () => {
    expect(text(meatpackDecode(encode(['G1 X1 Y2*5', 'M117 Hi'], false)))).toBe('G1 X1 Y2*5\nM117 Hi\n');
  });
});

describe('corrupted input', () => {
  it('truncated full-width character throws', () => {
    expect(() => meatpackDecode(Uint8Array.of(0xff, 0xff, 251, 0xf0 | 0x01))).toThrow(/full-width/);
    expect(() => meatpackDecode(Uint8Array.of(0xff, 0xff))).toThrow(/command/);
  });
  it('random garbage terminates and either decodes or throws', () => {
    let seed = 1;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 8;
    for (let i = 0; i < 200; i++) {
      const b = Uint8Array.from({ length: 5000 }, () => (rnd() % 4 === 0 ? 0xff : rnd() & 0xff));
      try {
        expect(meatpackDecode(b).length).toBeLessThanOrEqual(4 * b.length);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    }
  }, 60_000); // hang guard only
  it('a corrupt MeatPack block in a file gives decode-failed and no gcode event', async () => {
    // Replace a MeatPack-with-comments fixture's payload by building the stream through decodeGcodeBlocks directly.
    const bad = Uint8Array.of(0xff, 0xff, 251, 0x0f);
    const block = {
      type: 1 as const,
      compression: 0 as const,
      uncompressedSize: 4,
      compressedSize: 4,
      params: { type: 1 as const, encoding: 1 },
      data: bad,
      offset: 123,
    };
    const ev: GcodeEvent[] = [];
    for await (const e of decodeGcodeBlocks(
      (async function* () {
        yield { kind: 'block' as const, block };
      })(),
    ))
      ev.push(e);
    expect(ev.map((e) => e.kind)).toEqual(['block', 'diagnostic']);
    expect(ev[1]).toMatchObject({ diagnostic: { code: 'decode-failed', offset: 123 } });
  });
});
