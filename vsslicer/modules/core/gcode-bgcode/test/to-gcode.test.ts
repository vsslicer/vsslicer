// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  bgcodeToGcode,
  decodeGcodeBlocks,
  deflateCodec,
  heatshrink11Codec,
  heatshrink12Codec,
  readBgcode,
  type BgcodeMetadata,
} from '../src/index.ts';

const fixture = (n: string) => new Uint8Array(readFileSync(new URL(`./fixtures/prusaslicer/${n}`, import.meta.url)));
const codecs = [deflateCodec, heatshrink11Codec, heatshrink12Codec];

async function convert(bytes: Uint8Array) {
  const parts: Uint8Array[] = [];
  let metadata!: BgcodeMetadata;
  const src = (async function* () {
    for (let i = 0; i < bytes.length; i += 4096) yield bytes.subarray(i, i + 4096);
  })();
  for await (const e of bgcodeToGcode(decodeGcodeBlocks(readBgcode(src, codecs)))) {
    if (e.kind === 'text') parts.push(e.text);
    else if (e.kind === 'metadata') metadata = e.metadata;
    else throw new Error(e.diagnostic.message);
  }
  return { text: Buffer.concat(parts).toString('latin1'), metadata };
}

describe.each(['mini_cube_b', 'mini_cube_ps2.8.1'])('%s', (name) => {
  it('decodes to its .gcode twin line for line', async () => {
    const { text } = await convert(fixture(`${name}.bgcode`));
    const ref = Buffer.from(fixture(`${name}_ref.gcode`)).toString('latin1');
    expect(text.split('\n')).toEqual(ref.split('\n'));
  });

  it('exposes every metadata block', async () => {
    const { metadata: m } = await convert(fixture(`${name}.bgcode`));
    expect(m.file[0]?.[0]).toBe('Producer');
    expect(m.printer.map(([k]) => k)).toContain('printer_model');
    expect(m.print.map(([k]) => k)).toContain('filament used [mm]');
    expect(m.slicer.length).toBeGreaterThan(100);
    expect(m.thumbnails).toHaveLength(2);
    expect(m.slicerJson).toBeUndefined();
  });
});

describe('Slicer3 JSON block', () => {
  // Uncompressed, checksum-less file: one JSON slicer block and one G-code block.
  const block = (type: number, encoding: number, body: string) => {
    const b = Buffer.alloc(8 + 2 + body.length);
    b.writeUInt16LE(type, 0);
    b.writeUInt32LE(body.length, 4);
    b.writeUInt16LE(encoding, 8);
    b.write(body, 10);
    return b;
  };
  const file = Buffer.concat([
    Buffer.from([0x47, 0x43, 0x44, 0x45, 1, 0, 0, 0, 0, 0]),
    block(3, 0, 'printer_model=X\n'),
    block(2, 1, '{"a":1}'),
    block(1, 0, 'G28\n\n;\nG1 X1\n'),
  ]);

  it('is exposed raw and written as prusaslicer_json_config', async () => {
    const { text, metadata } = await convert(new Uint8Array(file));
    expect(metadata.slicerJson).toBe('{"a":1}');
    expect(text).toBe(
      '; printer_model = X\n\nG28\nG1 X1\n\n\n; prusaslicer_json_config = begin\n; {"a":1}\n; prusaslicer_json_config = end\n',
    );
  });
});
