// SPDX-License-Identifier: AGPL-3.0-or-later
import { deflateSync, unzipSync } from 'fflate';
import { describe, expect, test } from 'vitest';
import {
  CURA_ARCHIVE_LIMITS,
  CuraArchiveError,
  readCuraProfileArchive,
  resolveLimits,
  writeCuraProfileArchive,
} from '../src/adapters/archive/curaprofile-archive.ts';

const enc = new TextEncoder();

interface RawEntry {
  name: string;
  data?: Uint8Array;
  deflate?: boolean;
  /** Overrides the declared uncompressed size. */
  size?: number;
  attrs?: number;
}

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** A minimal zip writer for hostile archives: any name, any attrs, any declared size. */
function rawZip(entries: RawEntry[]): Uint8Array {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const e of entries) {
    const data = e.data ?? new Uint8Array();
    const packed = e.deflate ? deflateSync(data) : data;
    const name = enc.encode(e.name);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + packed.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(8, e.deflate ? 8 : 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, packed.length, true);
    lv.setUint32(22, e.size ?? data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(packed, 30 + name.length);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(10, e.deflate ? 8 : 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, packed.length, true);
    cv.setUint32(24, e.size ?? data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(38, e.attrs ?? 0, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const cdSize = centrals.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + cdSize + 22);
  let at = 0;
  for (const part of [...locals, ...centrals, eocd]) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

const profile = (id: string, extra = ''): { id: string; text: string } => ({
  id,
  text: `[general]\nversion = 4\nname = ${id}\ndefinition = fdmprinter\n\n[metadata]\ntype = quality_changes\n${extra}`,
});
const named = (n: number): RawEntry[] =>
  Array.from({ length: n }, (_, i) => ({ name: `p${i}`, data: enc.encode('x') }));
const refuses = (bytes: Uint8Array, message: RegExp, limits?: Parameters<typeof readCuraProfileArchive>[1]) =>
  expect(() => readCuraProfileArchive(bytes, limits)).toThrow(
    expect.objectContaining({ name: 'CuraArchiveError', message: expect.stringMatching(message) }),
  );

describe('round trip and upstream layout', () => {
  test('writes one STORED entry per profile, named by its id, holding UTF-8 text; reads them back in order', () => {
    const profiles = [profile('custom_ő_1'), profile('custom_extruder_1', 'position = 0\n')];
    const bytes = writeCuraProfileArchive(profiles);
    expect(readCuraProfileArchive(bytes)).toEqual(profiles);
    // Method field of the first local header: 0 (STORED), as a bare Python ZipInfo writes.
    expect(new DataView(bytes.buffer, bytes.byteOffset).getUint16(8, true)).toBe(0);
    expect(Object.keys(unzipSync(bytes))).toEqual(['custom_ő_1', 'custom_extruder_1']);
  });

  test('is deterministic', () => {
    expect(writeCuraProfileArchive([profile('a')])).toEqual(writeCuraProfileArchive([profile('a')]));
  });

  test('reads deflated entries, as other zip tools write them, and skips directory entries', () => {
    const text = profile('q').text.repeat(20);
    const bytes = rawZip([{ name: 'dir/' }, { name: 'dir/q', data: enc.encode(text), deflate: true }]);
    expect(readCuraProfileArchive(bytes)).toEqual([{ id: 'dir/q', text }]);
  });
});

describe('Cura ids with a colon or a trailing dot or space', () => {
  test.each(['ultimaker_s5_draft:_pla.', 'um3:custom', 'abc ', 'v1.', 'C:x'])('%s round-trips', (id) => {
    const bytes = writeCuraProfileArchive([{ id, text: 'x' }]);
    expect(readCuraProfileArchive(bytes)).toEqual([{ id, text: 'x' }]);
  });
});

describe('hostile archives are refused with a message', () => {
  test.each([
    ['../evil', /\.\./],
    ['a/../../evil', /\.\./],
    ['/etc/passwd', /absolute path/],
    ['a\\..\\evil', /backslash/],
  ])('path %s', (name, why) => refuses(rawZip([{ name, data: enc.encode('x') }]), why));

  test('symbolic link', () =>
    refuses(rawZip([{ name: 'link', data: enc.encode('/etc/passwd'), attrs: (0o120777 << 16) >>> 0 }]), /symbolic/));

  test('10 000 entries', () => refuses(rawZip(named(10_000)), /10000 entries, over the limit of 1000/));

  test('zip bomb: deflate that inflates past its declared size stops at the declared size', () =>
    refuses(rawZip([{ name: 'b', data: new Uint8Array(1 << 20), deflate: true, size: 1000 }]), /inflates past/));

  test('zip bomb: compression ratio over 100:1', () =>
    refuses(rawZip([{ name: 'b', data: new Uint8Array(1 << 20), deflate: true }]), /zip bomb/));

  test('declared and actual sizes must agree', () => {
    refuses(rawZip([{ name: 's', data: enc.encode('abc'), size: 2 }]), /stored size/);
    refuses(rawZip([{ name: 'd', data: enc.encode('abcabc'), deflate: true, size: 9 }]), /short of/);
  });

  test('duplicate names, case-folded', () =>
    refuses(
      rawZip([
        { name: 'Abc', data: enc.encode('x') },
        { name: 'abc', data: enc.encode('y') },
      ]),
      /duplicate/,
    ));

  test('non-UTF-8 content and non-zip input', () => {
    refuses(rawZip([{ name: 'x', data: Uint8Array.of(0xff, 0xfe) }]), /not UTF-8/);
    refuses(enc.encode('[general]\nversion = 4\n'), /not a zip/);
  });

  test('the writer refuses unsafe ids, duplicates and directories', () => {
    for (const id of ['../x', '/x', 'x/', '', 'a\\b'])
      expect(() => writeCuraProfileArchive([profile(id)])).toThrow(CuraArchiveError);
    expect(() => writeCuraProfileArchive([profile('a'), profile('A')])).toThrow(/duplicate/);
  });
});

describe('limits at the bound and one over', () => {
  test('entries: 1000 read and written, 1001 refused by both', () => {
    expect(readCuraProfileArchive(rawZip(named(1000)))).toHaveLength(1000);
    refuses(rawZip(named(1001)), /1001 entries/);
    const many = Array.from({ length: 1001 }, (_, i) => ({ id: `p${i}`, text: 'x' }));
    expect(readCuraProfileArchive(writeCuraProfileArchive(many.slice(0, 1000)))).toHaveLength(1000);
    expect(() => writeCuraProfileArchive(many)).toThrow(/1001 profiles/);
  });

  test('name bytes: 1024 accepted, 1025 refused; counted in UTF-8 bytes', () => {
    const at = 'ő'.repeat(512); // 1024 bytes, 512 characters
    expect(readCuraProfileArchive(rawZip([{ name: at, data: enc.encode('x') }]))[0]!.id).toBe(at);
    refuses(rawZip([{ name: `${at}a`, data: enc.encode('x') }]), /1025-byte name/);
    expect(() => writeCuraProfileArchive([{ id: at, text: 'x' }])).not.toThrow();
    expect(() => writeCuraProfileArchive([{ id: `${at}a`, text: 'x' }])).toThrow(/1025 bytes/);
  });

  test('entry bytes: 16 MiB accepted, one more refused by reader and writer', () => {
    const max = CURA_ARCHIVE_LIMITS.maxEntryBytes;
    const text = 'a'.repeat(max);
    expect(readCuraProfileArchive(writeCuraProfileArchive([{ id: 'big', text }]))[0]!.text.length).toBe(max);
    refuses(rawZip([{ name: 'big', data: new Uint8Array(max + 1).fill(0x61) }]), /declares 16777217 bytes/);
    expect(() => writeCuraProfileArchive([{ id: 'big', text: `${text}a` }])).toThrow(/16777217 bytes/);
  });

  test('total bytes: at the limit accepted, one byte over refused (smaller passed limits)', () => {
    const limits = { maxTotalBytes: 10 };
    const entries = (last: number) => [
      { name: 'a', data: enc.encode('12345') },
      { name: 'b', data: enc.encode('6789X'.slice(0, last)) },
    ];
    expect(readCuraProfileArchive(rawZip(entries(5)), limits)).toHaveLength(2);
    refuses(rawZip([...entries(5), { name: 'c', data: enc.encode('!') }]), /more than 10 bytes/, limits);
    expect(() =>
      writeCuraProfileArchive(
        [
          { id: 'a', text: '123456' },
          { id: 'b', text: '12345' },
        ],
        limits,
      ),
    ).toThrow(/over 10 bytes/);
  });

  test('passed limits must be positive finite integers within the zip format', () => {
    for (const bad of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 0x10000])
      expect(() => resolveLimits({ maxEntries: bad })).toThrow(/maxEntries must be an integer/);
    expect(() => resolveLimits({ maxEntryBytes: '5' as unknown as number })).toThrow(CuraArchiveError);
    expect(() => readCuraProfileArchive(new Uint8Array(), { maxNameBytes: 0 })).toThrow(/maxNameBytes/);
    expect(() => writeCuraProfileArchive([], { maxTotalBytes: -1 })).toThrow(/maxTotalBytes/);
    expect(resolveLimits({ maxEntries: 5 })).toEqual({ ...CURA_ARCHIVE_LIMITS, maxEntries: 5 });
  });
});

describe('entry names from ids', () => {
  test.each(['__proto__', 'constructor', 'toString'])('%s is written under its own name', (id) => {
    expect(readCuraProfileArchive(writeCuraProfileArchive([{ id, text: 'x' }]))).toEqual([{ id, text: 'x' }]);
  });
  test('entries carry the 0o600 external attributes Cura writes', () => {
    const b = writeCuraProfileArchive([{ id: 'a', text: 'x' }]);
    const v = new DataView(b.buffer, b.byteOffset);
    const cd = v.getUint32(b.length - 22 + 16, true);
    expect(v.getUint32(cd + 38, true)).toBe(0o600 * 65536);
  });
});
