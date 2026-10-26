// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32 as nodeCrc32 } from 'node:zlib';
import { unzipSync, zipSync } from 'fflate';
import { expect, test } from 'vitest';
import { crc32, withOffset } from '../src/adapters/zip/zipWriter.ts';
import { CorruptZipError, openZip, writeZip } from '../src/index.ts';
import { buildZip } from './support/zipBuilder.ts';

const enc = new TextEncoder();
const dec = (b: Uint8Array): string => new TextDecoder().decode(b);
const text = 'hello 3mf '.repeat(200);
const entries = (method: 0 | 8, descriptor = false) => [
  { name: '[Content_Types].xml', data: '<Types/>', method, descriptor },
  { name: '3D/3dmodel.model', data: text, method, descriptor },
  { name: 'Metadata/plate_1.png', data: new Uint8Array([1, 2, 3]), method, descriptor },
];
const withComment = (zip: Uint8Array, comment: string): Uint8Array => {
  const c = enc.encode(comment);
  const out = new Uint8Array(zip.length + c.length);
  out.set(zip);
  out.set(c, zip.length);
  new DataView(out.buffer).setUint16(zip.length - 2, c.length, true);
  return out;
};

const fixtures: Array<[string, Uint8Array]> = [
  ['stored', buildZip(entries(0))],
  ['deflated', buildZip(entries(8))],
  ['data descriptors', buildZip(entries(8, true))],
  ['zip64', buildZip(entries(8, true), { zip64: true })],
  ['archive comment', withComment(buildZip(entries(8)), 'made by a slicer')],
  ['fflate with comment', zipSync({ 'a.txt': enc.encode(text), 'b/c.txt': enc.encode('x') }, { comment: 'hi' })],
  ['real 3MF fixture', new Uint8Array(readFileSync(new URL('./fixtures/broken/malformed-xml.3mf', import.meta.url)))],
];

const unzipT = (zip: Uint8Array): void => {
  const dir = mkdtempSync(join(tmpdir(), 'vwr8-'));
  try {
    writeFileSync(join(dir, 'a.zip'), zip);
    execFileSync('unzip', ['-tq', join(dir, 'a.zip')], { stdio: 'pipe' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test.each(fixtures)('an unchanged %s archive is written back byte for byte', (_, zip) => {
  expect(writeZip(zip)).toEqual(zip);
});

test.each(fixtures)('a %s archive with one entry replaced and one added stays valid', (_, zip) => {
  const before = openZip(zip);
  const [first, ...rest] = before.entries;
  const out = writeZip(
    zip,
    new Map([
      [first!.name, enc.encode('replaced')],
      ['Metadata/new.config', enc.encode(text)],
    ]),
  );
  const after = openZip(out);
  expect(after.entries.map((e) => e.name)).toEqual([...before.entries.map((e) => e.name), 'Metadata/new.config']);
  expect(dec(after.inflated(first!.name))).toBe('replaced');
  expect(after.entries[0]!.method).toBe(8);
  expect(dec(after.inflated('Metadata/new.config'))).toBe(text);
  for (const e of rest) expect(after.raw(e.name)).toEqual(before.raw(e.name));
  expect(Object.keys(unzipSync(out))).toHaveLength(before.entries.length + 1);
  unzipT(out);
});

test('the archive comment survives a rewrite', () => {
  const zip = withComment(buildZip(entries(8)), 'keep me');
  const out = writeZip(zip, new Map([['x', enc.encode('y')]]));
  expect(dec(out.subarray(out.length - 7))).toBe('keep me');
  unzipT(out);
});

test('crc32 matches zlib', () => {
  for (const s of ['', 'a', text]) expect(crc32(enc.encode(s))).toBe(nodeCrc32(enc.encode(s)));
});

test('65535 entries switch to ZIP64 end records', () => {
  const many = new Map(Array.from({ length: 0xffff }, (_, i) => [`e${i}`, new Uint8Array(0)]));
  const out = writeZip(buildZip([]), many);
  const v = new DataView(out.buffer, out.byteOffset);
  expect(v.getUint16(out.length - 22 + 10, true)).toBe(0xffff);
  expect(v.getUint32(out.length - 42, true)).toBe(0x07064b50);
  const zip = openZip(out);
  expect(zip.entries).toHaveLength(0xffff);
  expect(zip.inflated('e65534')).toEqual(new Uint8Array(0));
  unzipT(out);
}, 30_000); // 65535 deflates: ~1 s idle, over the 5 s default under load

test('offsets past 4 GiB move into a ZIP64 field', () => {
  const big = 2 ** 32 + 5;
  const offsetOf = (zip: Uint8Array): number =>
    openZip(withEnd(withOffset(centralOf(zip), big))).entries[0]!.localHeaderOffset;
  // A plain record gains a ZIP64 field; a ZIP64 record has its slot patched.
  expect(offsetOf(buildZip([{ name: 'a', data: 'x' }]))).toBe(big);
  expect(offsetOf(buildZip([{ name: 'a', data: 'x' }], { zip64: true }))).toBe(big);
});

test('garbage is a CorruptZipError', () => {
  expect(() => writeZip(new Uint8Array(30))).toThrow(CorruptZipError);
});

const u32at = (z: Uint8Array, at: number, n: number): void =>
  new DataView(z.buffer, z.byteOffset).setUint32(at, n, true);
const centralAt = (z: Uint8Array, i: number): number => {
  const v = new DataView(z.buffer, z.byteOffset);
  let p = v.getUint32(z.length - 22 + 16, true);
  for (let k = 0; k < i; k++)
    p += 46 + v.getUint16(p + 28, true) + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
  return p;
};
const two = (): Uint8Array =>
  buildZip([
    { name: 'a.txt', data: 'A'.repeat(300), method: 0 },
    { name: 'b.txt', data: 'B'.repeat(300), method: 0 },
  ]);

test('two entries sharing one local header are rejected', () => {
  const z = two();
  u32at(z, centralAt(z, 1) + 42, 0);
  expect(() => writeZip(z)).toThrow(CorruptZipError);
});

test('an entry whose sizes run into the next entry is rejected', () => {
  const z = two();
  u32at(z, centralAt(z, 0) + 20, 400);
  expect(() => writeZip(z)).toThrow(CorruptZipError);
});

test('an entry offset planted inside another entry data is rejected', () => {
  const z = buildZip([
    {
      name: 'a.txt',
      data: new Uint8Array([...new Array(50).fill(0x41), 0x50, 0x4b, 3, 4, ...new Array(100).fill(0x41)]),
      method: 0,
    },
    { name: 'b.txt', data: 'B', method: 0 },
  ]);
  u32at(z, centralAt(z, 1) + 42, z.indexOf(0x50, 30 + 5 + 50));
  expect(() => writeZip(z)).toThrow(CorruptZipError);
});

test('duplicate entry names are rejected', () => {
  const z = buildZip([
    { name: 'a.txt', data: '1' },
    { name: 'a.txt', data: '2' },
  ]);
  expect(() => writeZip(z, new Map([['a.txt', enc.encode('X')]]))).toThrow(CorruptZipError);
});

test('a null change removes an entry', () => {
  const out = writeZip(two(), new Map([['a.txt', null]]));
  expect(openZip(out).entries.map((e) => e.name)).toEqual(['b.txt']);
});

/** The central record of a one-entry archive. */
function centralOf(zip: Uint8Array): Uint8Array {
  const v = new DataView(zip.buffer, zip.byteOffset);
  for (let i = 0; i < zip.length - 4; i++) {
    if (v.getUint32(i, true) === 0x02014b50) {
      const len = 46 + v.getUint16(i + 28, true) + v.getUint16(i + 30, true) + v.getUint16(i + 32, true);
      return zip.slice(i, i + len);
    }
  }
  throw new Error('no central record');
}

/** A central directory alone with a plain end record, enough for openZip to list entries. */
function withEnd(central: Uint8Array): Uint8Array {
  const out = new Uint8Array(central.length + 22);
  out.set(central);
  const v = new DataView(out.buffer);
  v.setUint32(central.length, 0x06054b50, true);
  v.setUint16(central.length + 8, 1, true);
  v.setUint16(central.length + 10, 1, true);
  v.setUint32(central.length + 12, central.length, true);
  return out;
}
