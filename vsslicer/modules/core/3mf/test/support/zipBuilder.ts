// SPDX-License-Identifier: AGPL-3.0-or-later
// Minimal zip writer for tests and fixtures: stored or deflated entries, data descriptors, zip64 and
// lying size fields. Not a general writer (no comments, no encryption, no UTF-8 flag handling).
import { deflateSync } from 'fflate';
import { crc32 } from 'node:zlib';

export interface BuildEntry {
  readonly name: string;
  readonly data: Uint8Array | string;
  /** 0 stored, 8 deflate (default). */
  readonly method?: 0 | 8;
  /** Sizes and CRC go after the data (flag bit 3), local header has zeros. */
  readonly descriptor?: boolean;
  /** Written to the central directory instead of the real uncompressed size. */
  readonly declaredSize?: number;
}

export interface BuildOptions {
  readonly zip64?: boolean;
}

const enc = new TextEncoder();

function bytes(parts: Array<number[] | Uint8Array>): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Little-endian integers: u(2, n) is a 16-bit field, u(8, n) a 64-bit one. */
function u(width: 2 | 4 | 8, value: number): number[] {
  let v = BigInt(value);
  const out: number[] = [];
  for (let i = 0; i < width; i++, v >>= 8n) out.push(Number(v & 0xffn));
  return out;
}

export function buildZip(entries: readonly BuildEntry[], options: BuildOptions = {}): Uint8Array {
  const zip64 = options.zip64 ?? false;
  const body: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const e of entries) {
    const raw = typeof e.data === 'string' ? enc.encode(e.data) : e.data;
    const method = e.method ?? 8;
    const packed = method === 8 ? deflateSync(raw) : raw;
    const crc = crc32(raw);
    const name = enc.encode(e.name);
    const flags = e.descriptor ? 0x08 : 0;
    const local = bytes([
      u(4, 0x04034b50),
      u(2, 20),
      u(2, flags),
      u(2, method),
      u(4, 0),
      u(4, e.descriptor ? 0 : crc),
      u(4, e.descriptor ? 0 : packed.length),
      u(4, e.descriptor ? 0 : raw.length),
      u(2, name.length),
      u(2, 0),
      name,
      packed,
      e.descriptor
        ? bytes([u(4, 0x08074b50), u(4, crc), u(zip64 ? 8 : 4, packed.length), u(zip64 ? 8 : 4, raw.length)])
        : new Uint8Array(0),
    ]);
    const size = e.declaredSize ?? raw.length;
    const extra = zip64 ? bytes([u(2, 1), u(2, 24), u(8, size), u(8, packed.length), u(8, offset)]) : new Uint8Array(0);
    const big = (n: number): number => (zip64 ? 0xffffffff : n);
    central.push(
      bytes([
        u(4, 0x02014b50),
        u(2, 45),
        u(2, 20),
        u(2, flags),
        u(2, method),
        u(4, 0),
        u(4, crc),
        u(4, big(packed.length)),
        u(4, big(size)),
        u(2, name.length),
        u(2, extra.length),
        u(2, 0),
        u(2, 0),
        u(2, 0),
        u(4, 0),
        u(4, big(offset)),
        name,
        extra,
      ]),
    );
    body.push(local);
    offset += local.length;
  }
  const cd = bytes(central);
  const tail: Array<number[] | Uint8Array> = [];
  if (zip64) {
    tail.push(
      u(4, 0x06064b50),
      u(8, 44),
      u(2, 45),
      u(2, 45),
      u(4, 0),
      u(4, 0),
      u(8, entries.length),
      u(8, entries.length),
      u(8, cd.length),
      u(8, offset),
      u(4, 0x07064b50),
      u(4, 0),
      u(8, offset + cd.length),
      u(4, 1),
    );
  }
  tail.push(
    u(4, 0x06054b50),
    u(2, 0),
    u(2, 0),
    u(2, zip64 ? 0xffff : entries.length),
    u(2, zip64 ? 0xffff : entries.length),
    u(4, zip64 ? 0xffffffff : cd.length),
    u(4, zip64 ? 0xffffffff : offset),
    u(2, 0),
  );
  return bytes([...body, cd, ...tail]);
}
