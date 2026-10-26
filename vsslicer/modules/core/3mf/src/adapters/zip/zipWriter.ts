// SPDX-License-Identifier: AGPL-3.0-or-later
import { deflateSync } from 'fflate';
import { CorruptZipError } from '../../domain/errors.ts';

const BIG = 0xffffffff;
const enc = new TextEncoder();
const utf8 = new TextDecoder();

function corrupt(why: string): CorruptZipError {
  return new CorruptZipError({ cause: new Error(why) });
}

// fflate keeps its CRC-32 private; node:zlib's would tie the module to Node.
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
export function crc32(data: Uint8Array): number {
  let c = BIG;
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ BIG) >>> 0;
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const dv = (b: Uint8Array): DataView => new DataView(b.buffer, b.byteOffset, b.byteLength);

/** A ZIP64 extended-information extra field (id 1) holding the given 64-bit values in order. */
function zip64Extra(values: readonly number[]): Uint8Array {
  const out = new Uint8Array(4 + 8 * values.length);
  const v = dv(out);
  v.setUint16(0, 1, true);
  v.setUint16(2, 8 * values.length, true);
  values.forEach((n, i) => v.setBigUint64(4 + 8 * i, BigInt(n), true));
  return out;
}

/** Where a central record's ZIP64 field is: its data offset and length, or -1 when it has none. */
function zip64Field(v: DataView): { at: number; len: number } {
  const extraAt = 46 + v.getUint16(28, true);
  const extraEnd = extraAt + v.getUint16(30, true);
  for (let x = extraAt; x + 4 <= extraEnd; x += 4 + v.getUint16(x + 2, true)) {
    if (v.getUint16(x, true) === 1) return { at: x + 4, len: v.getUint16(x + 2, true) };
  }
  return { at: -1, len: 0 };
}

/** Index of the 64-bit offset slot of a record whose 32-bit offset is the ZIP64 sentinel. */
function offsetSlot(v: DataView): number {
  const z = zip64Field(v);
  // The offset follows the size and compressed-size slots that are present.
  const slot = z.at + 8 * ((v.getUint32(24, true) === BIG ? 1 : 0) + (v.getUint32(20, true) === BIG ? 1 : 0));
  if (z.at < 0 || slot + 8 > Math.min(z.at + z.len, v.byteLength)) throw corrupt('ZIP64 offset slot missing');
  return slot;
}

/**
 * Returns a copy of one central-directory record with its local-header offset set to `offset`, using the
 * record's ZIP64 slot when it has one and adding one when the offset no longer fits in 32 bits.
 * shortcut: a ZIP64 field that also carries a disk number is not extended, only multi-disk archives have one.
 */
export function withOffset(record: Uint8Array, offset: number): Uint8Array {
  const v = dv(record);
  const extraLen = v.getUint16(30, true);
  const extraAt = 46 + v.getUint16(28, true);
  const { at: z64, len: z64Len } = zip64Field(v);
  const out = record.slice();
  const o = dv(out);
  if (v.getUint32(42, true) === BIG) {
    o.setBigUint64(offsetSlot(v), BigInt(offset), true);
    return out;
  }
  if (offset < BIG) {
    o.setUint32(42, offset, true);
    return out;
  }
  // Grow (or add) the ZIP64 field with an offset slot, and mark the 32-bit field as moved there.
  o.setUint32(42, BIG, true);
  o.setUint16(4, Math.max(o.getUint16(4, true) & 0xff, 45) | (o.getUint16(4, true) & 0xff00), true);
  o.setUint16(6, Math.max(o.getUint16(6, true), 45), true);
  const head = out.subarray(0, z64 < 0 ? extraAt + extraLen : z64 + z64Len);
  const tail = out.subarray(head.length);
  const added = new Uint8Array(z64 < 0 ? 12 : 8);
  if (z64 < 0) added.set(zip64Extra([offset]));
  else dv(added).setBigUint64(0, BigInt(offset), true);
  const grown = concat([head, added, tail]);
  const g = dv(grown);
  g.setUint16(30, extraLen + added.length, true);
  if (z64 >= 0) g.setUint16(z64 - 2, z64Len + 8, true);
  return grown;
}

interface Record {
  readonly name: string;
  readonly central: Uint8Array;
  readonly local: Uint8Array;
}

interface Parsed {
  readonly records: Record[];
  /** End of central directory record, comment included. */
  readonly eocd: Uint8Array;
  /** ZIP64 end of central directory record, extensible data included, when the archive has one. */
  readonly eocd64: Uint8Array | undefined;
}

function parse(data: Uint8Array): Parsed {
  const view = dv(data);
  const need = (at: number, len: number): void => {
    if (at < 0 || at + len > data.length) throw corrupt('record outside the file');
  };
  const u16 = (at: number): number => (need(at, 2), view.getUint16(at, true));
  const u32 = (at: number): number => (need(at, 4), view.getUint32(at, true));
  const u64 = (at: number): number => {
    need(at, 8);
    const n = view.getBigUint64(at, true);
    if (n > BigInt(Number.MAX_SAFE_INTEGER)) throw corrupt('64-bit value too large');
    return Number(n);
  };
  let e = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      e = i;
      break;
    }
  }
  if (e < 0) throw corrupt('no end of central directory');
  let count = u16(e + 10);
  let cdStart = u32(e + 16);
  let cdEnd = e;
  let eocd64: Uint8Array | undefined;
  if (e >= 20 && u32(e - 20) === 0x07064b50) {
    const z = u64(e - 12);
    if (u32(z) !== 0x06064b50) throw corrupt('bad ZIP64 end record');
    const len = 12 + u64(z + 4);
    need(z, len);
    eocd64 = data.subarray(z, z + len);
    count = u64(z + 32);
    cdStart = u64(z + 48);
    cdEnd = z;
  } else if (count === 0xffff || cdStart === BIG) {
    throw corrupt('missing ZIP64 locator');
  }

  const found: Array<{ name: string; central: Uint8Array; offset: number }> = [];
  let p = cdStart;
  for (let n = 0; n < count; n++) {
    if (u32(p) !== 0x02014b50) throw corrupt('bad central directory record');
    const nameLen = u16(p + 28);
    const len = 46 + nameLen + u16(p + 30) + u16(p + 32);
    need(p, len);
    const central = data.subarray(p, p + len);
    let offset = u32(p + 42);
    if (offset === BIG) {
      offset = u64(p + offsetSlot(dv(central)));
    }
    found.push({ name: utf8.decode(data.subarray(p + 46, p + 46 + nameLen)), central, offset });
    p += len;
  }
  if (p > cdEnd) throw corrupt('central directory overruns its end record');
  if (new Set(found.map((f) => f.name)).size !== found.length) throw corrupt('duplicate entry names');
  if (new Set(found.map((f) => f.offset)).size !== found.length) throw corrupt('entries share a local header');
  // A local record (header, data, descriptor) runs to the next local header, or to the central directory.
  const starts = [...found.map((f) => f.offset), cdStart].sort((a, b) => a - b);
  const next = new Map(starts.map((o, i) => [o, starts[i + 1]!]));
  const records = found.map((f) => {
    if (f.offset >= cdStart || u32(f.offset) !== 0x04034b50) throw corrupt(`bad local header for "${f.name}"`);
    const end = next.get(f.offset)!;
    const cv = dv(f.central);
    let packed = cv.getUint32(20, true);
    if (packed === BIG) {
      const z = zip64Field(cv);
      const slot = z.at + (cv.getUint32(24, true) === BIG ? 8 : 0);
      if (z.at < 0 || slot + 8 > z.at + z.len || slot + 8 > cv.byteLength) throw corrupt('ZIP64 size slot missing');
      packed = Number(cv.getBigUint64(slot, true));
    }
    const descriptor = cv.getUint16(8, true) & 8 ? 12 : 0; // shortcut: the minimum, signature and ZIP64 widths unchecked
    if (f.offset + 30 + u16(f.offset + 26) + u16(f.offset + 28) + packed + descriptor > end) {
      throw corrupt(`entry "${f.name}" overlaps the next entry or the central directory`);
    }
    return { name: f.name, central: f.central, local: data.subarray(f.offset, end) };
  });
  return { records, eocd: data.subarray(e), eocd64 };
}

/** Local and central records for a new entry: deflated, UTF-8 name, fixed 1980-01-01 timestamp so saves are reproducible. */
function newRecord(name: string, content: Uint8Array): Record {
  const packed = deflateSync(content);
  const crc = crc32(content);
  const nameBytes = enc.encode(name);
  const big = content.length >= BIG || packed.length >= BIG;
  const localExtra = big ? zip64Extra([content.length, packed.length]) : new Uint8Array(0);
  const header = (sig: number, fixed: number, extra: Uint8Array): Uint8Array => {
    const h = new Uint8Array(fixed + nameBytes.length + extra.length);
    const v = dv(h);
    const c = fixed === 46 ? 2 : 0; // central records have "version made by" before the shared fields
    v.setUint32(0, sig, true);
    if (c) v.setUint16(4, 45, true);
    v.setUint16(4 + c, big ? 45 : 20, true);
    v.setUint16(6 + c, 0x0800, true);
    v.setUint16(8 + c, 8, true);
    v.setUint16(10 + c, 0, true);
    v.setUint16(12 + c, 0x21, true);
    v.setUint32(14 + c, crc, true);
    v.setUint32(18 + c, big ? BIG : packed.length, true);
    v.setUint32(22 + c, big ? BIG : content.length, true);
    v.setUint16(26 + c, nameBytes.length, true);
    v.setUint16(28 + c, extra.length, true);
    h.set(nameBytes, fixed);
    h.set(extra, fixed + nameBytes.length);
    return h;
  };
  return {
    name,
    local: concat([header(0x04034b50, 30, localExtra), packed]),
    central: header(0x02014b50, 46, localExtra), // offset 0 for now; withOffset sets it
  };
}

/**
 * Writes `original` back with `changes` applied (a `null` content removes the entry, and is ignored when there is none). Untouched entries keep their local records and central
 * records byte for byte (only the offset is updated); replaced entries stay in place and new ones are
 * appended, both deflated. The end records, archive comment included, are carried over, and ZIP64 records
 * are written when the archive had them or now needs them. With no changes the output equals the input
 * for any archive whose entries start at byte 0 and follow each other without gaps.
 */
export function writeZip(
  original: Uint8Array,
  changes: ReadonlyMap<string, Uint8Array | null> = new Map(),
): Uint8Array {
  const { records, eocd, eocd64 } = parse(original);
  const pending = new Map(changes);
  const out: Record[] = records.flatMap((r) => {
    const content = pending.get(r.name);
    if (content === undefined) return [r];
    pending.delete(r.name);
    return content === null ? [] : [newRecord(r.name, content)];
  });
  for (const [name, content] of pending) if (content !== null) out.push(newRecord(name, content));

  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const r of out) {
    centrals.push(withOffset(r.central, offset));
    offset += r.local.length;
  }
  const cdSize = centrals.reduce((n, c) => n + c.length, 0);
  const count = out.length;
  const needs64 = count >= 0xffff || cdSize >= BIG || offset >= BIG;

  const tail: Uint8Array[] = [];
  const end = eocd.slice();
  const ev = dv(end);
  if (needs64 || eocd64) {
    const z = eocd64 ? eocd64.slice() : new Uint8Array(56);
    const zv = dv(z);
    if (!eocd64) {
      zv.setUint32(0, 0x06064b50, true);
      zv.setBigUint64(4, 44n, true);
      zv.setUint16(12, 45, true);
      zv.setUint16(14, 45, true);
    }
    zv.setBigUint64(24, BigInt(count), true);
    zv.setBigUint64(32, BigInt(count), true);
    zv.setBigUint64(40, BigInt(cdSize), true);
    zv.setBigUint64(48, BigInt(offset), true);
    const locator = new Uint8Array(20);
    const lv = dv(locator);
    lv.setUint32(0, 0x07064b50, true);
    lv.setBigUint64(8, BigInt(offset + cdSize), true);
    lv.setUint32(16, 1, true);
    tail.push(z, locator);
    // Keep the original's sentinel pattern when everything still fits, so an unchanged ZIP64 archive is identical.
    const keep = eocd64 !== undefined && !needs64;
    const pick = (at: number, width: 2 | 4, value: number): void => {
      const sentinel = width === 2 ? 0xffff : BIG;
      const was = width === 2 ? ev.getUint16(at, true) : ev.getUint32(at, true);
      const v = keep && was !== sentinel ? value : sentinel;
      if (width === 2) ev.setUint16(at, v, true);
      else ev.setUint32(at, v, true);
    };
    pick(8, 2, count);
    pick(10, 2, count);
    pick(12, 4, cdSize);
    pick(16, 4, offset);
  } else {
    ev.setUint16(8, count, true);
    ev.setUint16(10, count, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);
  }
  return concat([...out.map((r) => r.local), ...centrals, ...tail, end]);
}
