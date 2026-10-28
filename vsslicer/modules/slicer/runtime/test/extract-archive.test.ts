// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, win32 } from 'node:path';
import { gzipSync } from 'node:zlib';
import { zipSync, type Zippable } from 'fflate';
import { afterAll, describe, expect, test, vi } from 'vitest';
import { ArchiveError, checkSymlinkChains, extractArchive, safeParts } from '../src/adapters/extract-archive.ts';

// A hook run when a sha256 digest is taken, to swap the archive between the check and the extraction.
const digestHook: { run?: () => void } = {};
vi.mock('node:crypto', async (orig) => {
  const m = await orig<typeof import('node:crypto')>();
  return {
    ...m,
    createHash: (alg: string) => {
      const h = m.createHash(alg);
      const digest = h.digest.bind(h) as (enc?: never) => unknown;
      (h as unknown as { digest: unknown }).digest = (enc?: never) => {
        const r = digest(enc);
        digestHook.run?.();
        return r;
      };
      return h;
    },
  };
});

const tmp = mkdtempSync(join(tmpdir(), 'slc13-'));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));
let n = 0;
/** A fresh parent dir per case, so leftovers from a failed extraction are visible. */
const fresh = () => {
  const d = join(tmp, `case${n++}`);
  mkdirSync(d);
  return d;
};
const posix = process.platform !== 'win32';

interface TarEntry {
  name: string;
  type?: string;
  data?: Buffer | string;
  mode?: number;
  link?: string;
  prefix?: string;
  badChecksum?: boolean;
}

function tarHeader(e: TarEntry, size: number): Buffer {
  const h = Buffer.alloc(512);
  h.write(e.name, 0, 100);
  h.write((e.mode ?? 0o644).toString(8).padStart(7, '0'), 100);
  h.write('0000000', 108);
  h.write('0000000', 116);
  h.write(size.toString(8).padStart(11, '0'), 124);
  h.write('00000000000', 136);
  h.write(e.type ?? '0', 156);
  if (e.link) h.write(e.link, 157, 100);
  h.write('ustar\u000000', 257);
  if (e.prefix) h.write(e.prefix, 345, 155);
  h.fill(0x20, 148, 156);
  let sum = 0;
  for (const v of h) sum += v;
  h.write((sum + (e.badChecksum ? 1 : 0)).toString(8).padStart(6, '0') + '\0 ', 148);
  return h;
}

function tarGz(entries: TarEntry[]): string {
  const parts: Buffer[] = [];
  for (const e of entries) {
    const data = Buffer.from(e.data ?? '');
    parts.push(tarHeader(e, data.length), data, Buffer.alloc((512 - (data.length % 512)) % 512));
  }
  parts.push(Buffer.alloc(1024));
  const p = join(tmp, `a${n++}.tar.gz`);
  writeFileSync(p, gzipSync(Buffer.concat(parts), { level: 9 }));
  return p;
}

const ZIP_FILE = (mode: number) => ({ os: 3, attrs: (0o100000 | mode) << 16 });
const ZIP_LINK = { os: 3, attrs: (0o120777 << 16) >>> 0 };
function zip(files: Zippable): string {
  const p = join(tmp, `a${n++}.zip`);
  writeFileSync(p, zipSync(files, { level: 9 }));
  return p;
}

const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
/** extractArchive with the archive's own sha256, as a caller holding a manifest would pass. */
const extract = (a: string, dest: string, limits = {}) => extractArchive(a, dest, limits, { sha256: sha(a) });

async function rejects(archive: string, match: RegExp, limits = {}) {
  const parent = fresh();
  const dest = join(parent, 'out');
  await expect(extract(archive, dest, limits)).rejects.toThrow(match);
  expect(readdirSync(parent)).toEqual([]); // all-or-nothing: no dest, no staging dir left
}

describe('extractArchive: zip', () => {
  test('files, dirs, exec bits and an in-target symlink', async () => {
    const dest = join(fresh(), 'out');
    const a = zip({
      'bin/': {},
      'bin/engine': [Buffer.from('#!/bin/sh\n'), ZIP_FILE(0o4755)],
      'share/readme.txt': [Buffer.from('hi'), ZIP_FILE(0o644)],
      'bin/readme': [Buffer.from('../share/readme.txt'), ZIP_LINK],
    });
    const r = await extract(a, dest);
    expect(r).toEqual({ format: 'zip', entries: 4, bytes: 12 });
    expect(readFileSync(join(dest, 'bin/readme'), 'utf8')).toBe('hi');
    if (posix) {
      expect(statSync(join(dest, 'bin/engine')).mode & 0o7777).toBe(0o755); // setuid dropped
      expect(statSync(join(dest, 'share/readme.txt')).mode & 0o777).toBe(0o644);
      expect(readlinkSync(join(dest, 'bin/readme'))).toBe('../share/readme.txt');
    }
  });

  test.each([
    ['../evil', /traversal/],
    ['a/../../evil', /traversal/],
    ['/etc/evil', /absolute/],
    ['C:/evil', /absolute/],
    ['a\\..\\evil', /bad character/],
  ])('refuses entry %s', async (name, match) => {
    await rejects(zip({ 'ok.txt': Buffer.from('x'), [name]: Buffer.from('x') }), match);
  });

  test('refuses symlinks that escape, directly or absolutely', async () => {
    await rejects(zip({ l: [Buffer.from('../../etc/passwd'), ZIP_LINK] }), /escapes/);
    await rejects(zip({ l: [Buffer.from('/etc/passwd'), ZIP_LINK] }), /absolute target/);
  });

  test('refuses device files', async () => {
    await rejects(zip({ dev: [Buffer.from(''), { os: 3, attrs: 0o020666 << 16 }] }), /device/);
  });

  test('refuses a corrupted entry by CRC', async () => {
    const a = zip({ f: [Buffer.from('hello world'), { level: 0 }] });
    const b = readFileSync(a);
    const i = b.indexOf('hello world');
    b[i] = b[i]! ^ 1;
    writeFileSync(a, b);
    await rejects(a, /CRC/);
  });

  test('refuses a zip bomb past 1 MiB at the default 1000:1', async () => {
    await rejects(zip({ bomb: new Uint8Array(32 * 1024 ** 2) }), /ratio/);
  });

  test('refuses entries that share compressed data (overlapping bomb)', async () => {
    // one stored entry 'a', then a second central-directory record 'b' pointing at the same local data
    const b = readFileSync(zip({ a: [Buffer.from('payload'), { level: 0 }] }));
    const eocd = b.length - 22;
    const cdOff = b.readUInt32LE(eocd + 16);
    const cdEntry = b.subarray(cdOff, eocd);
    const dup = Buffer.from(cdEntry);
    dup.write('b', 46);
    const end = Buffer.from(b.subarray(eocd));
    end.writeUInt16LE(2, 8);
    end.writeUInt16LE(2, 10);
    end.writeUInt32LE(cdEntry.length * 2, 12);
    const p = join(tmp, `a${n++}.zip`);
    writeFileSync(p, Buffer.concat([b.subarray(0, eocd), dup, end]));
    await rejects(p, /overlap/);
  });

  test('ratio limit counts inflated bytes, not wall time', async () => {
    const a = zip({ f: new Uint8Array(4 * 1024 ** 2) }); // ~1000:1
    await rejects(a, /ratio over 10:1/, { maxRatio: 10 });
    // at the 1 MiB floor any ratio passes; one byte more is refused
    const floor = zip({ f: new Uint8Array(1024 ** 2) });
    expect((await extract(floor, join(fresh(), 'out'))).bytes).toBe(1024 ** 2);
    await rejects(zip({ f: new Uint8Array(1024 ** 2 + 1) }), /ratio/);
  });

  test('entry, file, total and path bounds', async () => {
    const four = zip({ a: Buffer.from('1'), b: Buffer.from('2'), c: Buffer.from('3'), d: Buffer.from('4') });
    await rejects(four, /more than 3 entries/, { maxEntries: 3 });
    expect((await extract(four, join(fresh(), 'out'), { maxEntries: 4 })).entries).toBe(4);
    await rejects(zip({ f: Buffer.alloc(11) }), /larger than 10/, { maxFileBytes: 10 });
    await rejects(zip({ f: Buffer.alloc(6), g: Buffer.alloc(6) }), /11 bytes in total/, { maxTotalBytes: 11 });
    await rejects(zip({ ['x'.repeat(65)]: Buffer.from('') }), /longer than 64/, { maxPathBytes: 64 });
  });
});

describe('extractArchive: tar.gz', () => {
  test('files, dirs, exec bits, ustar prefix and an in-target symlink', async () => {
    const dest = join(fresh(), 'out');
    const a = tarGz([
      { name: 'pkg/', type: '5', mode: 0o755 },
      { name: 'engine', prefix: 'pkg/bin', data: '#!/bin/sh\n', mode: 0o755 },
      { name: 'pkg/lib.so', data: 'lib', mode: 0o644 },
      { name: 'pkg/bin/lib', type: '2', link: '../lib.so' },
    ]);
    expect(await extract(a, dest)).toEqual({ format: 'tar.gz', entries: 4, bytes: 13 });
    expect(readFileSync(join(dest, 'pkg/bin/lib'), 'utf8')).toBe('lib');
    if (posix) expect(statSync(join(dest, 'pkg/bin/engine')).mode & 0o777).toBe(0o755);
  });

  test('pax path records override the header name', async () => {
    const long = `${'d'.repeat(120)}/file`;
    const rec = (k: string, v: string) => {
      const body = ` ${k}=${v}\n`;
      let len = body.length;
      while (String(len).length + body.length !== len) len = String(len).length + body.length;
      return `${len}${body}`;
    };
    const dest = join(fresh(), 'out');
    await extract(
      tarGz([
        { name: 'PaxHeader', type: 'x', data: rec('path', long) },
        { name: 'short', data: 'x' },
      ]),
      dest,
    );
    expect(readFileSync(join(dest, long), 'utf8')).toBe('x');
  });

  test.each([
    [[{ name: '../evil', data: 'x' }], /traversal/],
    [[{ name: '/etc/evil', data: 'x' }], /absolute/],
    [[{ name: 'l', type: '2', link: '../../x' }], /escapes/],
    [[{ name: 'l', type: '2', link: '/etc/passwd' }], /absolute target/],
    // lexically inside, really outside: sub/c -> .. then sub/e -> c/../..
    [
      [
        { name: 'sub/c', type: '2', link: '..' },
        { name: 'sub/e', type: '2', link: 'c/../..' },
      ],
      /escapes|dangling/,
    ],
    // a file written through a symlink entry: symlinks are created last, so this collides instead
    [
      [
        { name: 'a', type: '2', link: 'b' },
        { name: 'a/x', data: 'x' },
      ],
      /inside a symlink/,
    ],
    // reviewer's chain: d resolves to the parent of the staging dir; d/newdir/evil must not be created there
    [
      [
        { name: 'sub/', type: '5' },
        { name: 'sub/c', type: '2', link: '..' },
        { name: 'd', type: '2', link: 'sub/c/..' },
        { name: 'd/newdir/evil', type: '2', link: 'x' },
      ],
      /inside a symlink/,
    ],
    // the same chain with names aliased by Unicode normalisation (NFC link, NFD child): APFS treats them as one
    [
      [
        { name: 'sub/', type: '5' },
        { name: 'sub/c', type: '2', link: '..' },
        { name: 'é', type: '2', link: 'sub/c/..' },
        { name: 'é/newdir/evil', type: '2', link: 'x' },
      ],
      /not a real directory|escapes|dangling/,
    ],
    // case-only alias: on a case-sensitive volume D and d are distinct, so this passes trivially there
    [
      [
        { name: 'sub/', type: '5' },
        { name: 'sub/c', type: '2', link: '..' },
        { name: 'D', type: '2', link: 'sub/c/..' },
        { name: 'd/newdir/evil', type: '2', link: 'x' },
      ],
      /not a real directory|escapes|dangling/,
    ],
    [[{ name: 'h', type: '1', link: 'x' }], /hard links/],
    [[{ name: 'c', type: '3' }], /device/],
    [[{ name: 'f', type: '6' }], /device/],
    [[{ name: 'f', data: 'x', badChecksum: true }], /checksum/],
    [
      [
        { name: 'f', data: 'x' },
        { name: 'f', data: 'y' },
      ],
      /duplicate/,
    ],
  ] as [TarEntry[], RegExp][])('refuses %j', async (entries, match) => {
    await rejects(tarGz([{ name: 'ok.txt', data: 'ok' }, ...entries]), match);
  });

  test('refuses a gzip bomb at the default 1000:1', async () => {
    await rejects(tarGz([{ name: 'bomb', data: Buffer.alloc(32 * 1024 ** 2) }]), /ratio/);
  });

  test('refuses truncated input and leaves nothing', async () => {
    const a = tarGz([{ name: 'f', data: randomBytes(100_000) }]);
    writeFileSync(a, readFileSync(a).subarray(0, 200));
    await rejects(a, /gzip|truncated/);
  });

  test('entry and file bounds', async () => {
    const files = Array.from({ length: 5 }, (_, i) => ({ name: `f${i}`, data: 'x' }));
    await rejects(tarGz(files), /more than 4 entries/, { maxEntries: 4 });
    await rejects(tarGz([{ name: 'f', data: Buffer.alloc(11) }]), /larger than 10/, { maxFileBytes: 10 });
  });
});

describe('extractArchive: tar.gz sha256 and size bound', () => {
  const bomb = () => tarGz([{ name: 'bomb', data: Buffer.alloc(4 * 1024 ** 2) }]);

  test('refuses a tar.gz without a sha256, and leaves nothing', async () => {
    const parent = fresh();
    await expect(extractArchive(bomb(), join(parent, 'out'))).rejects.toThrow(/needs a sha256/);
    expect(readdirSync(parent)).toEqual([]);
  });

  test('refuses a wrong sha256 for tar.gz and zip before extracting', async () => {
    for (const a of [tarGz([{ name: 'f', data: 'x' }]), zip({ f: Buffer.from('x') })]) {
      const parent = fresh();
      await expect(extractArchive(a, join(parent, 'out'), {}, { sha256: '0'.repeat(64) })).rejects.toThrow(
        /does not match/,
      );
      expect(readdirSync(parent)).toEqual([]);
    }
    await expect(extractArchive('x', join(fresh(), 'out'), {}, { sha256: 'zz' })).rejects.toThrow(RangeError);
  });

  test('a tar.gz bomb over the ratio is refused even with a matching sha256', async () => {
    await rejects(bomb(), /ratio over 10:1/, { maxRatio: 10 });
  });
});

// Needs a volume where NFC and NFD names are one file (APFS, HFS+; NTFS does not normalise): probe it.
const aliasing = (() => {
  const d = mkdtempSync(join(tmp, 'alias-'));
  writeFileSync(join(d, '\u00e9'), '');
  return readdirSync(d).length === 1 && statSync(join(d, 'e\u0301'), { throwIfNoEntry: false }) !== undefined;
})();
describe.skipIf(!aliasing)('extractArchive: aliased names', () => {
  test('a normalisation collision is an ArchiveError, in zip and tar.gz, without the gzip label', async () => {
    const nfc = '\u00e9';
    const nfd = 'e\u0301';
    await rejects(zip({ [nfc]: Buffer.from('1'), [nfd]: Buffer.from('2') }), /collides/);
    const err = await extract(
      tarGz([
        { name: nfc, data: '1' },
        { name: nfd, data: '2' },
      ]),
      join(fresh(), 'out'),
    ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ArchiveError);
    expect((err as Error).message).toMatch(/collides/);
    expect((err as Error).message).not.toMatch(/gzip/);
  });

  test.each([
    [
      'a file and a symlink',
      [
        { name: '\u00e9', data: '1' },
        { name: 'e\u0301', type: '2', link: 'x' },
      ],
    ],
    [
      'two symlinks',
      [
        { name: '\u00e9', type: '2', link: 'x' },
        { name: 'e\u0301', type: '2', link: 'x' },
      ],
    ],
  ])('a normalisation collision of %s is an ArchiveError', async (_n, entries) => {
    const err = await extract(tarGz([...entries, { name: 'x', data: 'x' }]), join(fresh(), 'out')).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ArchiveError);
    expect((err as Error).message).toMatch(/collides/);
  });
});

// Case aliasing: NTFS and default APFS fold case, ext4 does not: probe it.
const caseFolds = (() => {
  const d = mkdtempSync(join(tmp, 'case-'));
  writeFileSync(join(d, 'A'), '');
  return statSync(join(d, 'a'), { throwIfNoEntry: false }) !== undefined;
})();
describe.skipIf(!caseFolds)('extractArchive: case-aliased names', () => {
  test('A and a are an ArchiveError, in zip and tar.gz, without the gzip label', async () => {
    await rejects(zip({ A: Buffer.from('1'), a: Buffer.from('2') }), /collides/);
    const err = await extract(
      tarGz([
        { name: 'A', data: '1' },
        { name: 'a', data: '2' },
      ]),
      join(fresh(), 'out'),
    ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ArchiveError);
    expect((err as Error).message).toMatch(/collides/);
    expect((err as Error).message).not.toMatch(/gzip/);
  });
});

describe.skipIf(!posix)('extractArchive: the verified bytes are the extracted bytes', () => {
  test.each([
    ['tar.gz', () => tarGz([{ name: 'good', data: 'g' }]), () => tarGz([{ name: 'evil', data: 'e' }])],
    ['zip', () => zip({ good: Buffer.from('g') }), () => zip({ evil: Buffer.from('e') })],
  ])('%s swapped on disk after the digest is still extracted from the checked file', async (_f, mk, mkEvil) => {
    const good = mk();
    const evil = mkEvil();
    const sum = sha(good);
    digestHook.run = () => renameSync(evil, good);
    const parent = fresh();
    try {
      await extractArchive(good, join(parent, 'out'), {}, { sha256: sum });
    } finally {
      digestHook.run = undefined;
    }
    expect(readdirSync(join(parent, 'out'))).toEqual(['good']);
  });
});

describe.skipIf(!posix || process.getuid?.() === 0)('extractArchive: the handle is closed when staging fails', () => {
  test('a parent that cannot be written leaves no open descriptor', async () => {
    const parent = fresh();
    chmodSync(parent, 0o500);
    const fds = () => readdirSync('/dev/fd').length;
    const archive = zip({ f: Buffer.from('x') });
    const before = fds();
    try {
      await expect(extractArchive(archive, join(parent, 'out'))).rejects.toThrow(/EACCES/);
    } finally {
      chmodSync(parent, 0o700);
    }
    expect(fds()).toBe(before);
  });
});

describe('checkSymlinkChains (the archive alone, on every OS)', () => {
  const check = (links: Record<string, string>) => () => checkSymlinkChains(new Map(Object.entries(links)), 1e6);

  test('the Windows gap: win32 resolves the chain lexically to the root, POSIX steps out', () => {
    // what the lexical guard and, on Windows, the file system see: inside
    expect(win32.resolve('C:\\d\\sub', 'c/../..')).toBe('C:\\d');
    // what a POSIX kernel sees, following sub/c -> .. first
    expect(check({ 'sub/c': '..', 'sub/e': 'c/../..' })).toThrow(/escapes/);
  });

  test.each([
    [{ 'sub/c': '..', d: 'sub/c/..' }, /escapes/],
    [{ a: 'b', b: 'c/../..', c: '.' }, /escapes/],
    [{ l: '../x' }, /escapes/],
    [{ l: '/etc' }, /escapes/],
    [{ a: 'x/../../b' }, /escapes/], // transiently above the root
    [{ a: 'b', b: 'a' }, /loops/],
  ])('refuses %j', (links, match) => expect(check(links)).toThrow(match));

  test.each([
    [{ 'sub/c': '..', 'sub/e': 'c/x' }],
    [{ 'F.framework/Versions/Current': 'A', 'F.framework/F': 'Versions/Current/F' }],
    [{ 'a/b/l': '../../a/./b/../b/x' }],
  ])('passes %j', (links) => expect(check(links)).not.toThrow());

  test('bounds the work', () => {
    expect(() => checkSymlinkChains(new Map([['l', 'a/'.repeat(100)]]), 50)).toThrow(/too long/);
  });
});

describe('extractArchive: inputs', () => {
  test('refuses an existing destination and unknown formats', async () => {
    const parent = fresh();
    await expect(extractArchive(zip({ f: Buffer.from('') }), parent)).rejects.toThrow(/already exists/);
    const junk = join(tmp, 'junk.bin');
    writeFileSync(junk, 'not an archive');
    await expect(extractArchive(junk, join(parent, 'out'))).rejects.toThrow(ArchiveError);
  });

  test.each([0, -1, 1.5, NaN, Infinity, 101_000])('refuses maxEntries %s', async (v) => {
    await expect(extractArchive('x', join(fresh(), 'out'), { maxEntries: v })).rejects.toThrow(RangeError);
  });

  test('safeParts normalises dot and empty components', () => {
    expect(safeParts('./a//b/./c/', 4096)).toEqual(['a', 'b', 'c']);
    expect(() => safeParts('./', 4096)).toThrow(/empty/);
    expect(() => safeParts('a\0b', 4096)).toThrow(/bad character/);
  });
});
