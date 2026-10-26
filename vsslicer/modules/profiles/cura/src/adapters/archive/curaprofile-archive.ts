// SPDX-License-Identifier: AGPL-3.0-or-later
// `.curaprofile` archives: a zip of flat entries, each named by a profile id and holding that profile's
// serialized `.inst.cfg` text in UTF-8. Layout from Cura@5bea2f8 (LGPL-3.0; the format is re-implemented, no code copied):
//   plugins/CuraProfileReader/CuraProfileReader.py:40-46 reads every name in `archive.namelist()` and
//     decodes it with `serialized.decode("utf-8")`, the entry name being the profile id.
//   plugins/CuraProfileWriter/CuraProfileWriter.py:25-31 writes `zipfile.ZipInfo(profile.getId())` per profile with
//     `archive.writestr(profile_file, serialized)`. A bare ZipInfo keeps Python's defaults, which override the
//     archive's ZIP_DEFLATED: the entry is STORED and dated 1980-01-01 (checked with CPython 3.9 zipfile).
// The same approach as profiles-orca's bundle reader (central directory validated before a byte is inflated,
// streaming inflate capped at the declared size), not shared code. An archive is untrusted input.
import { Inflate } from 'fflate';

export interface CuraArchiveLimits {
  /** Most entries, directories included. */
  maxEntries: number;
  /** Longest entry name in UTF-8 bytes. */
  maxNameBytes: number;
  /** Most uncompressed bytes in one entry. */
  maxEntryBytes: number;
  /** Most uncompressed bytes over all entries. */
  maxTotalBytes: number;
}

export const CURA_ARCHIVE_LIMITS: Readonly<CuraArchiveLimits> = Object.freeze({
  maxEntries: 1000,
  maxNameBytes: 1024,
  maxEntryBytes: 16 * 1024 * 1024,
  maxTotalBytes: 64 * 1024 * 1024,
});

/** Format ceilings without ZIP64: a passed limit above these could not be honoured. */
const LIMIT_CEILINGS: CuraArchiveLimits = {
  maxEntries: 0xfffe,
  maxNameBytes: 0xffff,
  maxEntryBytes: 0xfffffffe,
  maxTotalBytes: Number.MAX_SAFE_INTEGER,
};

/** Highest uncompressed:compressed ratio for a deflated entry over {@link RATIO_FLOOR_BYTES}. */
export const MAX_COMPRESSION_RATIO = 100;
/** Entries smaller than this skip the ratio check. */
export const RATIO_FLOOR_BYTES = 64 * 1024;

export class CuraArchiveError extends Error {
  override name = 'CuraArchiveError';
}

/** One profile in the archive: its id (the entry name) and its serialized `.inst.cfg` text. */
export interface CuraProfileEntry {
  id: string;
  text: string;
}

const fail = (why: string): never => {
  throw new CuraArchiveError(why);
};
const utf8 = new TextDecoder('utf-8', { fatal: true });
const encoder = new TextEncoder();
const shown = (name: string): string => JSON.stringify(name.slice(0, 80));
const nameKey = (name: string): string => name.normalize('NFC').toLowerCase();

/** Validates caller-passed limits (finite positive integers within the zip format) and fills in defaults. */
export function resolveLimits(limits: Partial<CuraArchiveLimits> = {}): CuraArchiveLimits {
  const out = { ...CURA_ARCHIVE_LIMITS };
  for (const key of Object.keys(CURA_ARCHIVE_LIMITS) as (keyof CuraArchiveLimits)[]) {
    const v = limits[key];
    if (v === undefined) continue;
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 1 || v > LIMIT_CEILINGS[key])
      fail(`limit ${key} must be an integer from 1 to ${LIMIT_CEILINGS[key]}, got ${String(v)}`);
    out[key] = v;
  }
  return out;
}

/** The reason an entry name is unsafe, or undefined. Names stay in memory, so colons and trailing dots/spaces (valid Cura ids) pass; a caller that writes them to disk sanitises there. */
export function unsafeEntryName(name: string): string | undefined {
  if (name.length === 0) return 'empty name';
  if (name.includes('\0')) return 'NUL in name';
  if (name.includes('\\')) return 'backslash in name';
  if (name.startsWith('/')) return 'absolute path';
  if (name.split('/').some((s) => /^[. ]*$/.test(s))) return 'empty, "." or ".." segment'; // single-class star: linear
  return undefined;
}

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Reads every file entry of a `.curaprofile` into memory, in archive order. The whole central directory is checked
 * (count, names, symlinks, sizes, overlaps) before anything is inflated, and inflation stops at the declared size.
 * Nothing touches disk. Directory entries are skipped, as Cura's reader gets no profile from them.
 */
export function readCuraProfileArchive(data: Uint8Array, limits?: Partial<CuraArchiveLimits>): CuraProfileEntry[] {
  const lim = resolveLimits(limits);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const need = (at: number, len: number): void => {
    if (at < 0 || at + len > data.length) fail('corrupt archive: record outside the file');
  };
  const u16 = (at: number): number => (need(at, 2), view.getUint16(at, true));
  const u32 = (at: number): number => (need(at, 4), view.getUint32(at, true));

  let eocd = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  // shortcut: Cura 2.1's bare-text profiles (the BadZipFile fallback, CuraProfileReader.py:54-58) are not read here;
  // a caller can hand such a file straight to the .inst.cfg parser.
  if (eocd < 0) fail('not a zip archive: no end of central directory');
  if (eocd + 22 + u16(eocd + 20) !== data.length)
    fail('corrupt archive: end of central directory does not end the file');
  const count = u16(eocd + 10);
  const cdOffset = u32(eocd + 16);
  // shortcut: ZIP64 is refused; profiles are far below 4 GiB.
  if (count === 0xffff || cdOffset === 0xffffffff) fail('ZIP64 archives are not supported');
  if (count > lim.maxEntries) fail(`archive has ${count} entries, over the limit of ${lim.maxEntries}`);

  interface Entry {
    name: string;
    dir: boolean;
    method: number;
    compressedSize: number;
    size: number;
    crc: number;
    start: number;
  }
  const entries: Entry[] = [];
  const seen = new Set<string>();
  let total = 0;
  for (let n = 0, p = cdOffset; n < count; n++) {
    if (u32(p) !== 0x02014b50) fail('corrupt archive: bad central directory record');
    const flags = u16(p + 8);
    const method = u16(p + 10);
    const crc = u32(p + 16);
    const compressedSize = u32(p + 20);
    const size = u32(p + 24);
    const nameLen = u16(p + 28);
    const extraLen = u16(p + 30);
    const commentLen = u16(p + 32);
    const attrs = u32(p + 38);
    const localOffset = u32(p + 42);
    if (nameLen > lim.maxNameBytes)
      fail(`entry ${n} has a ${nameLen}-byte name, over the limit of ${lim.maxNameBytes}`);
    need(p + 46, nameLen);
    let name = '';
    try {
      name = utf8.decode(data.subarray(p + 46, p + 46 + nameLen));
    } catch {
      fail(`entry ${n} has a name that is not UTF-8`);
    }
    const dir = name.endsWith('/');
    const why = unsafeEntryName(dir ? name.slice(0, -1) : name);
    if (why) fail(`unsafe entry ${shown(name)}: ${why}`);
    // Unix modes sit in the high 16 bits; S_IFLNK is 0o120000.
    if (((attrs >>> 16) & 0o170000) === 0o120000) fail(`unsafe entry ${shown(name)}: symbolic link`);
    if (flags & 1) fail(`entry ${shown(name)} is encrypted`);
    if (!dir && method !== 0 && method !== 8)
      fail(`entry ${shown(name)} uses unsupported compression method ${method}`);
    const key = nameKey(name);
    if (seen.has(key)) fail(`duplicate entry ${shown(name)}`);
    seen.add(key);
    if (size > lim.maxEntryBytes)
      fail(`entry ${shown(name)} declares ${size} bytes, over the limit of ${lim.maxEntryBytes}`);
    if (method === 8 && size > RATIO_FLOOR_BYTES && size > compressedSize * MAX_COMPRESSION_RATIO)
      fail(`entry ${shown(name)} compresses more than ${MAX_COMPRESSION_RATIO}:1, refused as a zip bomb`);
    total += size;
    if (total > lim.maxTotalBytes) fail(`entries declare more than ${lim.maxTotalBytes} bytes in total`);
    if (u32(localOffset) !== 0x04034b50) fail(`corrupt archive: bad local header for ${shown(name)}`);
    // shortcut: the local header's own name and sizes are not compared with the central directory, which alone is used.
    const start = localOffset + 30 + u16(localOffset + 26) + u16(localOffset + 28);
    need(start, compressedSize);
    entries.push({ name, dir, method, compressedSize, size, crc, start });
    p += 46 + nameLen + extraLen + commentLen;
  }

  // Overlapping data ranges let a small archive inflate the same bytes many times over.
  const byStart = [...entries].sort((a, b) => a.start - b.start);
  for (let i = 1; i < byStart.length; i++) {
    const prev = byStart[i - 1]!;
    if (byStart[i]!.start < prev.start + prev.compressedSize) fail(`entries overlap at ${shown(prev.name)}`);
  }

  const out: CuraProfileEntry[] = [];
  for (const e of entries) {
    if (e.dir) continue;
    const bytes = inflate(data.subarray(e.start, e.start + e.compressedSize), e);
    if (crc32(bytes) !== e.crc) fail(`entry ${shown(e.name)} is damaged: CRC-32 mismatch`);
    try {
      out.push({ id: e.name, text: utf8.decode(bytes) });
    } catch {
      fail(`entry ${shown(e.name)} is not UTF-8 text`);
    }
  }
  return out;
}

const INPUT_SLICE = 64 * 1024;

/** Inflates one entry, stopping as soon as the output passes its declared size (already capped by the limits). */
function inflate(packed: Uint8Array, e: { name: string; method: number; size: number }): Uint8Array {
  if (e.method === 0) {
    if (packed.length !== e.size) fail(`entry ${shown(e.name)}: stored size does not match its declared size`);
    return packed.slice();
  }
  const out = new Uint8Array(e.size);
  let at = 0;
  try {
    const stream = new Inflate((chunk) => {
      if (at + chunk.length > e.size)
        fail(`entry ${shown(e.name)} inflates past its declared size, refused as a zip bomb`);
      out.set(chunk, at);
      at += chunk.length;
    });
    // Small slices bound one push's output (deflate expands at most ~1032x), so the check fires before memory grows.
    for (let i = 0; i < packed.length; i += INPUT_SLICE) {
      stream.push(packed.subarray(i, i + INPUT_SLICE), i + INPUT_SLICE >= packed.length);
    }
    if (packed.length === 0) stream.push(packed, true);
  } catch (cause) {
    if (cause instanceof CuraArchiveError) throw cause;
    fail(`entry ${shown(e.name)} is not valid deflate data`);
  }
  if (at !== e.size) fail(`entry ${shown(e.name)} inflates short of its declared size`);
  return out;
}

// ZipFile._open_to_write sets this when a ZipInfo has none (CPython zipfile/__init__.py:1851-1852; spike PRF-111).
const CURA_ENTRY_ATTRS = 0o600 << 16;

/**
 * A STORED zip as Python's `ZipFile` writes a bare `ZipInfo`: version 2.0 from FAT, no flags (UTF-8 flag for a non-ASCII
 * name), 1980-01-01 00:00, `0o600` attributes. Written by hand because fflate's `zipSync` collects entries in a plain
 * object, which loses an entry named `__proto__`.
 */
function storedZip(files: { name: Uint8Array; bytes: Uint8Array; crc: number }[]): Uint8Array {
  const locals = files.reduce((n, f) => n + 30 + f.name.length + f.bytes.length, 0);
  const centrals = files.reduce((n, f) => n + 46 + f.name.length, 0);
  const out = new Uint8Array(locals + centrals + 22);
  const v = new DataView(out.buffer);
  let at = 0;
  let cd = locals;
  for (const f of files) {
    const flags = f.name.some((b) => b > 127) ? 0x800 : 0;
    v.setUint32(at, 0x04034b50, true);
    v.setUint16(at + 4, 20, true);
    v.setUint16(at + 6, flags, true);
    v.setUint16(at + 12, 0x21, true); // date 1980-01-01; method and time are 0
    v.setUint32(at + 14, f.crc, true);
    v.setUint32(at + 18, f.bytes.length, true);
    v.setUint32(at + 22, f.bytes.length, true);
    v.setUint16(at + 26, f.name.length, true);
    out.set(f.name, at + 30);
    out.set(f.bytes, at + 30 + f.name.length);
    v.setUint32(cd, 0x02014b50, true);
    v.setUint16(cd + 4, 20, true);
    v.setUint16(cd + 6, 20, true);
    v.setUint16(cd + 8, flags, true);
    v.setUint16(cd + 14, 0x21, true);
    v.setUint32(cd + 16, f.crc, true);
    v.setUint32(cd + 20, f.bytes.length, true);
    v.setUint32(cd + 24, f.bytes.length, true);
    v.setUint16(cd + 28, f.name.length, true);
    v.setUint32(cd + 38, CURA_ENTRY_ATTRS, true);
    v.setUint32(cd + 42, at, true);
    out.set(f.name, cd + 46);
    at += 30 + f.name.length + f.bytes.length;
    cd += 46 + f.name.length;
  }
  v.setUint32(cd, 0x06054b50, true);
  v.setUint16(cd + 8, files.length, true);
  v.setUint16(cd + 10, files.length, true);
  v.setUint32(cd + 12, centrals, true);
  v.setUint32(cd + 16, locals, true);
  return out;
}

/** Writes profiles as Cura does: one STORED entry per profile, named by its id, holding its UTF-8 text. */
export function writeCuraProfileArchive(
  profiles: readonly CuraProfileEntry[],
  limits?: Partial<CuraArchiveLimits>,
): Uint8Array {
  const lim = resolveLimits(limits);
  if (profiles.length > lim.maxEntries) fail(`${profiles.length} profiles, over the limit of ${lim.maxEntries}`);
  const files: { name: Uint8Array; bytes: Uint8Array; crc: number }[] = [];
  const taken = new Set<string>();
  let total = 0;
  for (const { id, text } of profiles) {
    const why = unsafeEntryName(id) ?? (id.endsWith('/') ? 'directory name' : undefined);
    if (why) fail(`unsafe profile id ${shown(id)}: ${why}`);
    const nameBytes = encoder.encode(id).length;
    if (nameBytes > lim.maxNameBytes)
      fail(`profile id ${shown(id)} is ${nameBytes} bytes, over the limit of ${lim.maxNameBytes}`);
    if (taken.has(nameKey(id))) fail(`duplicate profile id ${shown(id)}`);
    taken.add(nameKey(id));
    const bytes = encoder.encode(text);
    if (bytes.length > lim.maxEntryBytes)
      fail(`profile ${shown(id)} is ${bytes.length} bytes, over the limit of ${lim.maxEntryBytes}`);
    total += bytes.length;
    if (total > lim.maxTotalBytes) fail(`profiles are over ${lim.maxTotalBytes} bytes in total`);
    files.push({ name: encoder.encode(id), bytes, crc: crc32(bytes) });
  }
  return storedZip(files);
}
