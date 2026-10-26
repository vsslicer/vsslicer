// SPDX-License-Identifier: AGPL-3.0-or-later
import { deflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { collect, parse } from '../src/index.ts';
import { CorruptZipError, SizeCapExceededError, gcode3mfEntries, gcode3mfSource } from '../src/gcode-3mf.ts';

interface Item {
  name: string;
  data: Uint8Array;
  deflate?: boolean;
  descriptor?: boolean;
}

/** A minimal zip writer; `zip64` puts sizes and offsets in extra fields and adds the zip64 end records. */
function zip(items: Item[], zip64 = false): Uint8Array {
  const parts: Buffer[] = [];
  const cd: Buffer[] = [];
  let at = 0;
  const push = (b: Buffer): void => {
    parts.push(b);
    at += b.length;
  };
  for (const it of items) {
    const name = Buffer.from(it.name);
    const packed = it.deflate ? deflateRawSync(it.data) : Buffer.from(it.data);
    const method = it.deflate ? 8 : 0;
    const flags = it.descriptor ? 8 : 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(flags, 6);
    local.writeUInt16LE(method, 8);
    if (!it.descriptor) {
      local.writeUInt32LE(packed.length, 18);
      local.writeUInt32LE(it.data.length, 22);
    }
    local.writeUInt16LE(name.length, 26);
    const offset = at;
    push(local);
    push(name);
    push(Buffer.from(packed));
    if (it.descriptor) {
      const d = Buffer.alloc(16);
      d.writeUInt32LE(0x08074b50, 0);
      d.writeUInt32LE(packed.length, 8);
      d.writeUInt32LE(it.data.length, 12);
      push(d);
    }
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(zip64 ? 45 : 20, 6);
    c.writeUInt16LE(flags, 8);
    c.writeUInt16LE(method, 10);
    c.writeUInt16LE(name.length, 28);
    let extra = Buffer.alloc(0);
    if (zip64) {
      extra = Buffer.alloc(28);
      extra.writeUInt16LE(1, 0);
      extra.writeUInt16LE(24, 2);
      extra.writeBigUInt64LE(BigInt(it.data.length), 4);
      extra.writeBigUInt64LE(BigInt(packed.length), 12);
      extra.writeBigUInt64LE(BigInt(offset), 20);
      c.writeUInt32LE(0xffffffff, 20);
      c.writeUInt32LE(0xffffffff, 24);
      c.writeUInt32LE(0xffffffff, 42);
    } else {
      c.writeUInt32LE(packed.length, 20);
      c.writeUInt32LE(it.data.length, 24);
      c.writeUInt32LE(offset, 42);
    }
    c.writeUInt16LE(extra.length, 30);
    cd.push(c, name, extra);
  }
  const cdStart = at;
  for (const b of cd) push(b);
  const cdSize = at - cdStart;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  if (zip64) {
    const rec = Buffer.alloc(56);
    rec.writeUInt32LE(0x06064b50, 0);
    rec.writeBigUInt64LE(44n, 4);
    rec.writeBigUInt64LE(BigInt(items.length), 24);
    rec.writeBigUInt64LE(BigInt(items.length), 32);
    rec.writeBigUInt64LE(BigInt(cdSize), 40);
    rec.writeBigUInt64LE(BigInt(cdStart), 48);
    const loc = Buffer.alloc(20);
    loc.writeUInt32LE(0x07064b50, 0);
    loc.writeBigUInt64LE(BigInt(at), 8);
    loc.writeUInt32LE(1, 16);
    push(rec);
    push(loc);
    eocd.writeUInt16LE(0xffff, 8);
    eocd.writeUInt16LE(0xffff, 10);
    eocd.writeUInt32LE(0xffffffff, 12);
    eocd.writeUInt32LE(0xffffffff, 16);
  } else {
    eocd.writeUInt16LE(items.length, 8);
    eocd.writeUInt16LE(items.length, 10);
    eocd.writeUInt32LE(cdSize, 12);
    eocd.writeUInt32LE(cdStart, 16);
  }
  push(eocd);
  return new Uint8Array(Buffer.concat(parts));
}

const gcode = 'G90\nM83\n;LAYER_CHANGE\n;Z:0.2\nG1 X10 Y10 E1 F1200\nG1 X20 Y10 E1\n'.repeat(3000);
const bytes = new TextEncoder().encode(gcode);
const all = async (src: AsyncIterable<Uint8Array>): Promise<Uint8Array[]> => {
  const out: Uint8Array[] = [];
  for await (const c of src) out.push(c);
  return out;
};
const readAll = async (src: AsyncIterable<Uint8Array>): Promise<string> => Buffer.concat(await all(src)).toString();

const variants: [string, Item, boolean][] = [
  ['stored', { name: 'Metadata/plate_1.gcode', data: bytes }, false],
  ['deflated', { name: 'Metadata/plate_1.gcode', data: bytes, deflate: true }, false],
  [
    'deflated with data descriptor',
    { name: 'Metadata/plate_1.gcode', data: bytes, deflate: true, descriptor: true },
    false,
  ],
  ['stored with data descriptor', { name: 'Metadata/plate_1.gcode', data: bytes, descriptor: true }, false],
  ['deflated, zip64', { name: 'Metadata/plate_1.gcode', data: bytes, deflate: true }, true],
  ['stored, zip64, descriptor', { name: 'Metadata/plate_1.gcode', data: bytes, descriptor: true }, true],
];

describe('gcode3mfSource', () => {
  it.each(variants)('%s: yields the entry text, in pieces, and it parses', async (_, item, z64) => {
    const archive = zip([{ name: 'Metadata/plate_1.png', data: new Uint8Array(5) }, item], z64);
    expect(gcode3mfEntries(archive)).toEqual(['Metadata/plate_1.gcode']);
    const pieces = await all(gcode3mfSource(archive, 'Metadata/plate_1.gcode'));
    expect(pieces.length).toBeGreaterThan(1);
    expect(Buffer.concat(pieces).toString()).toBe(gcode);
    const parsed = await collect(parse(gcode3mfSource(archive, 'Metadata/plate_1.gcode')));
    expect(parsed.moveCount).toBe(6000);
  });

  const good = zip([{ name: 'Metadata/plate_1.gcode', data: bytes, deflate: true }]);

  it('a truncated zip is a CorruptZipError', async () => {
    await expect(
      readAll(gcode3mfSource(good.subarray(0, good.length - 40), 'Metadata/plate_1.gcode')),
    ).rejects.toBeInstanceOf(CorruptZipError);
  });

  it('garbage, an empty file and a missing entry are CorruptZipError', async () => {
    await expect(readAll(gcode3mfSource(new Uint8Array(100).fill(7), 'x'))).rejects.toBeInstanceOf(CorruptZipError);
    await expect(readAll(gcode3mfSource(new Uint8Array(0), 'x'))).rejects.toBeInstanceOf(CorruptZipError);
    await expect(readAll(gcode3mfSource(good, 'Metadata/plate_2.gcode'))).rejects.toMatchObject({
      code: 'corrupt-zip',
    });
  });

  it('damaged deflate data is a CorruptZipError', async () => {
    const bad = good.slice();
    bad.fill(0xff, 60, 120);
    await expect(readAll(gcode3mfSource(bad, 'Metadata/plate_1.gcode'))).rejects.toBeInstanceOf(CorruptZipError);
  });

  it('an entry over the cap is a SizeCapExceededError', async () => {
    await expect(
      readAll(gcode3mfSource(good, 'Metadata/plate_1.gcode', { maxEntryBytes: 1000 })),
    ).rejects.toBeInstanceOf(SizeCapExceededError);
  });
});
