// SPDX-License-Identifier: AGPL-3.0-or-later
import { Inflate } from 'fflate';
import type { ZipArchive, ZipEntry } from '../../application/zipArchive.ts';
import { CorruptZipError, SizeCapExceededError } from '../../domain/errors.ts';

/** Per-entry cap on uncompressed bytes. */
export const DEFAULT_MAX_ENTRY_BYTES = 512 * 1024 * 1024;

/** Cap on the summed declared uncompressed bytes of all entries, checked at open. */
export const DEFAULT_MAX_TOTAL_BYTES = 1024 * 1024 * 1024;

const INPUT_SLICE = 64 * 1024;
const utf8 = new TextDecoder();
const ZIP64 = 0xffffffff;

function corrupt(why: string): CorruptZipError {
  return new CorruptZipError({ cause: new Error(why) });
}

/**
 * Reads the central directory (ZIP64 included) and serves entries lazily. The central directory is the
 * single source of sizes, so data descriptors need no special case. fflate only inflates.
 * shortcut: CRC-32 is recorded but not verified, add when a damaged-but-inflatable file shows up.
 */
export function openZip(
  data: Uint8Array,
  options: { maxEntryBytes?: number; maxTotalBytes?: number } = {},
): ZipArchive {
  const cap = options.maxEntryBytes ?? DEFAULT_MAX_ENTRY_BYTES;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const need = (at: number, len: number): void => {
    if (at < 0 || at + len > data.length) throw corrupt('record outside the file');
  };
  const u16 = (at: number): number => {
    need(at, 2);
    return view.getUint16(at, true);
  };
  const u32 = (at: number): number => {
    need(at, 4);
    return view.getUint32(at, true);
  };
  const u64 = (at: number): number => {
    need(at, 8);
    const v = view.getBigUint64(at, true);
    if (v > BigInt(Number.MAX_SAFE_INTEGER)) throw corrupt('64-bit value too large');
    return Number(v);
  };

  let eocd = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw corrupt('no end of central directory');
  let count = u16(eocd + 10);
  let cdOffset = u32(eocd + 16);
  if (count === 0xffff || cdOffset === ZIP64) {
    const loc = eocd - 20;
    if (loc < 0 || u32(loc) !== 0x07064b50) throw corrupt('missing ZIP64 locator');
    const z = u64(loc + 8);
    if (u32(z) !== 0x06064b50) throw corrupt('bad ZIP64 end record');
    count = u64(z + 32);
    cdOffset = u64(z + 48);
  }

  const entries: ZipEntry[] = [];
  let p = cdOffset;
  for (let n = 0; n < count; n++) {
    if (u32(p) !== 0x02014b50) throw corrupt('bad central directory record');
    const flags = u16(p + 8);
    let compressedSize = u32(p + 20);
    let size = u32(p + 24);
    const nameLen = u16(p + 28);
    const extraLen = u16(p + 30);
    const commentLen = u16(p + 32);
    let localHeaderOffset = u32(p + 42);
    need(p + 46, nameLen + extraLen);
    if (flags & 1) throw corrupt('encrypted entries are not supported');
    for (let x = p + 46 + nameLen, end = x + extraLen; x + 4 <= end;) {
      const id = u16(x);
      const len = u16(x + 2);
      if (id === 1) {
        let f = x + 4;
        if (size === ZIP64) {
          size = u64(f);
          f += 8;
        }
        if (compressedSize === ZIP64) {
          compressedSize = u64(f);
          f += 8;
        }
        if (localHeaderOffset === ZIP64) localHeaderOffset = u64(f);
      }
      x += 4 + len;
    }
    entries.push({
      name: utf8.decode(data.subarray(p + 46, p + 46 + nameLen)),
      method: u16(p + 10),
      crc32: u32(p + 16),
      compressedSize,
      size,
      localHeaderOffset,
    });
    p += 46 + nameLen + extraLen + commentLen;
  }

  // Inflation never exceeds the declared size, so the declared sum bounds memory; refuse before any allocation.
  const maxTotal = options.maxTotalBytes ?? DEFAULT_MAX_TOTAL_BYTES;
  if (entries.reduce((n, e) => n + e.size, 0) > maxTotal) throw new SizeCapExceededError('the package', maxTotal);

  const byName = new Map(entries.map((e) => [e.name, e]));
  const find = (name: string): ZipEntry => {
    const e = byName.get(name);
    if (!e) throw corrupt(`no entry "${name}"`);
    return e;
  };
  const raw = (name: string): Uint8Array => {
    const e = find(name);
    const h = e.localHeaderOffset;
    if (u32(h) !== 0x04034b50) throw corrupt(`bad local header for "${name}"`);
    const start = h + 30 + u16(h + 26) + u16(h + 28);
    need(start, e.compressedSize);
    return data.subarray(start, start + e.compressedSize);
  };

  return {
    entries,
    raw,
    inflated(name) {
      const e = find(name);
      if (e.size > cap) throw new SizeCapExceededError(`"${name}"`, cap);
      const packed = raw(name);
      if (e.method === 0) {
        if (packed.length !== e.size) throw corrupt(`"${name}" stored size mismatch`);
        return packed;
      }
      if (e.method !== 8) throw corrupt(`"${name}" uses unsupported method ${e.method}`);
      // Streamed so a deflate stream that outgrows its declared size is stopped, not buffered.
      const out = new Uint8Array(e.size);
      let at = 0;
      try {
        const inflate = new Inflate((chunk) => {
          if (at + chunk.length > e.size) throw corrupt(`"${name}" inflates past its declared size`);
          out.set(chunk, at);
          at += chunk.length;
        });
        // Small slices bound what one push can produce (deflate expands at most ~1032x), so the size check
        // above fires before memory grows; one push of the whole stream would inflate it all first.
        for (let i = 0; i < packed.length; i += INPUT_SLICE) {
          inflate.push(packed.subarray(i, i + INPUT_SLICE), i + INPUT_SLICE >= packed.length);
        }
        if (packed.length === 0) inflate.push(packed, true);
      } catch (cause) {
        throw cause instanceof CorruptZipError ? cause : new CorruptZipError({ cause });
      }
      if (at !== e.size) throw corrupt(`"${name}" inflates short of its declared size`);
      return out;
    },
  };
}
