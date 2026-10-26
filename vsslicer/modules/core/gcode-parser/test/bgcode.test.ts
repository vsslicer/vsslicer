// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BgcodeMetadata } from '@vsslicer/gcode-bgcode';
import { describe, expect, it } from 'vitest';
import { bgcodeSource, collect, parse } from '../src/index.ts';
import { fixturesDir, loadManifest } from './support/golden.ts';
import { pieces } from './support/run.ts';

const bytes = (path: string): Uint8Array => new Uint8Array(readFileSync(join(fixturesDir, path)));
const pairs = loadManifest()
  .files.filter((f) => f.format === 'bgcode')
  .map((f) => f.path.replace(/\.bgcode$/, ''));

describe('bgcodeSource', () => {
  it('has both corpus pairs', () => expect(pairs).toHaveLength(2));

  it.each(pairs)('%s: opening the .bgcode gives the same ParsedFile as its .gcode twin', async (base) => {
    const fromBinary = await collect(parse(bgcodeSource(pieces(bytes(`${base}.bgcode`), 4096))));
    const fromText = await collect(parse(pieces(bytes(`${base}.twin.gcode`), 64 * 1024)));
    expect(fromBinary.moveCount).toBeGreaterThan(1000);
    expect(fromBinary).toEqual(fromText);
  });

  it('reports the metadata and no diagnostics for a good file', async () => {
    let meta: BgcodeMetadata | undefined;
    const diagnostics: string[] = [];
    const src = bgcodeSource(pieces(bytes(`${pairs[0]}.bgcode`), 4096), {
      onMetadata: (m) => (meta = m),
      onDiagnostic: (d) => diagnostics.push(d.code),
    });
    await collect(parse(src));
    expect(meta?.thumbnails).toHaveLength(2);
    expect(diagnostics).toEqual([]);
  });

  it('covers a Slicer3 JSON block (synthetic file)', async () => {
    // uncompressed, checksum-less: header, a JSON slicer block, a G-code block
    const block = (type: number, encoding: number, body: string): Buffer => {
      const b = Buffer.alloc(10 + body.length);
      b.writeUInt16LE(type, 0);
      b.writeUInt32LE(body.length, 4);
      b.writeUInt16LE(encoding, 8);
      b.write(body, 10);
      return b;
    };
    const file = Buffer.concat([
      Buffer.from([0x47, 0x43, 0x44, 0x45, 1, 0, 0, 0, 0, 0]),
      block(2, 1, '{"a":1}'),
      block(1, 0, 'G90\nG1 X1 Y1 E1\nG1 X2 Y2 E2\n'),
    ]);
    let meta: BgcodeMetadata | undefined;
    const parsed = await collect(
      parse(bgcodeSource(pieces(new Uint8Array(file), 7), { onMetadata: (m) => (meta = m) })),
    );
    expect(meta?.slicerJson).toBe('{"a":1}');
    expect(parsed.moveCount).toBe(2);
  });

  it('reports the decoded-text offset with each diagnostic (truncated file)', async () => {
    const body = 'G90\nG1 X1 Y1 E1\n';
    const head = Buffer.from([0x47, 0x43, 0x44, 0x45, 1, 0, 0, 0, 0, 0]);
    const b = Buffer.alloc(10 + body.length);
    b.writeUInt32LE(body.length, 4);
    b.write(body, 10);
    b.writeUInt16LE(1, 0);
    const second = Buffer.from(b);
    // a whole block, then a second one cut off after 4 bytes of its body
    const file = new Uint8Array(Buffer.concat([head, b, second.subarray(0, 14)]));
    const seen: [string, number, number][] = [];
    let total = 0;
    for await (const t of bgcodeSource(pieces(file, 7), { onDiagnostic: (d, at) => seen.push([d.code, at, total]) }))
      total += t.byteLength;
    // the offset is the text yielded when the problem was reported (the block's own text)
    expect(seen).toHaveLength(1);
    expect(seen[0]?.[0]).toBe('truncated');
    expect(seen[0]?.[1]).toBe(seen[0]?.[2]);
    expect(seen[0]?.[1]).toBeGreaterThanOrEqual(body.length);
  });
});
