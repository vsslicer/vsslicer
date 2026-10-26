// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';
import { inflateSync } from 'fflate';
import { expect, test } from 'vitest';
import { openZip } from '../src/adapters/zip/fflateZip.ts';
import { CorruptZipError, SizeCapExceededError } from '../src/index.ts';
import { buildZip } from './support/zipBuilder.ts';

const text = 'hello 3mf '.repeat(200);
const broken = (name: string): Uint8Array =>
  new Uint8Array(readFileSync(new URL(`./fixtures/broken/${name}`, import.meta.url)));
const dec = (b: Uint8Array): string => new TextDecoder().decode(b);

test.each([
  ['stored', { method: 0 as const }, {}],
  ['deflated', { method: 8 as const }, {}],
  ['deflated with data descriptor', { descriptor: true }, {}],
  ['zip64 stored', { method: 0 as const }, { zip64: true }],
  ['zip64 deflated with descriptor', { descriptor: true }, { zip64: true }],
])('reads %s entries', (_, entry, options) => {
  const zip = openZip(
    buildZip(
      [
        { name: 'a.txt', data: text, ...entry },
        { name: 'b/c.txt', data: 'x', ...entry },
      ],
      options,
    ),
  );
  expect(zip.entries.map((e) => [e.name, e.size])).toEqual([
    ['a.txt', text.length],
    ['b/c.txt', 1],
  ]);
  expect(dec(zip.inflated('a.txt'))).toBe(text);
  expect(dec(zip.inflated('b/c.txt'))).toBe('x');
});

test('raw bytes are the still-compressed data', () => {
  const zip = openZip(buildZip([{ name: 'a.txt', data: text }]));
  const raw = zip.raw('a.txt');
  expect(raw.length).toBe(zip.entries[0]!.compressedSize);
  expect(raw.length).toBeLessThan(text.length);
  expect(dec(inflateSync(raw))).toBe(text);
});

test('a truncated archive is a CorruptZipError', () => {
  expect(() => openZip(broken('corrupt-zip.3mf'))).toThrow(CorruptZipError);
  expect(() => openZip(new Uint8Array(3))).toThrow(CorruptZipError);
});

test('a declared size above the cap is refused before inflating, others still read', () => {
  const zip = openZip(broken('zip-bomb.3mf'), { maxEntryBytes: 1024 * 1024, maxTotalBytes: 8 * 1024 ** 3 });
  expect(zip.entries.find((e) => e.name === '3D/3dmodel.model')?.size).toBe(4 * 1024 ** 3 - 1);
  expect(() => zip.inflated('3D/3dmodel.model')).toThrow(SizeCapExceededError);
  expect(zip.inflated('_rels/.rels').length).toBeGreaterThan(0);
});

test('a deflate stream that disagrees with its declared size is corrupt', () => {
  const small = openZip(buildZip([{ name: 'a', data: text, declaredSize: 10 }]));
  expect(() => small.inflated('a')).toThrow(CorruptZipError);
  const big = openZip(buildZip([{ name: 'a', data: text, declaredSize: text.length + 5 }]));
  expect(() => big.inflated('a')).toThrow(CorruptZipError);
});

// Hang guard only: a regression inflates 256 MiB or loops, far past this. No wall-time assertion.
const HANG_GUARD_MS = 30_000;
test(
  'a deflate stream far bigger than its declared size is stopped quickly',
  () => {
    // 256 MiB of zeros deflates to ~256 KiB; declared size is 10. Whole-stream inflate would allocate 256 MiB.
    const bomb = deflateRawSync(new Uint8Array(256 * 1024 * 1024));
    const zip = buildZip([{ name: 'a', data: bomb, method: 0, declaredSize: 10 }]);
    const dv = new DataView(zip.buffer, zip.byteOffset);
    dv.setUint16(8, 8, true); // local header method
    for (let i = zip.length - 22; i >= 0; i--) {
      if (dv.getUint32(i, true) === 0x02014b50) {
        dv.setUint16(i + 10, 8, true); // central directory method
        break;
      }
    }
    const before = process.memoryUsage().arrayBuffers;
    expect(() => openZip(zip).inflated('a')).toThrow(CorruptZipError);
    // Whole-stream inflate would allocate 256 MiB; a bounded one stays far below.
    expect(process.memoryUsage().arrayBuffers - before).toBeLessThan(64 * 1024 * 1024);
  },
  HANG_GUARD_MS,
);

test('declared sizes over the total cap are refused at open, before any inflation', () => {
  const entry = (i: number) => ({ name: `Metadata/pad${i}.bin`, data: new Uint8Array(10), declaredSize: 300_000_000 });
  const zip = buildZip([0, 1, 2, 3].map(entry));
  expect(() => openZip(zip)).toThrow(SizeCapExceededError);
  // Each entry is under the per-entry cap, and 3 x 300 MB fits under the 1 GiB default.
  expect(openZip(buildZip([0, 1, 2].map(entry))).entries).toHaveLength(3);
  expect(() => openZip(buildZip([entry(0)]), { maxTotalBytes: 299_999_999 })).toThrow(SizeCapExceededError);
});
