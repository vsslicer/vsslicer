// SPDX-License-Identifier: AGPL-3.0-or-later
import { weld } from '../../domain/build-mesh.ts';
import { TriangleCountMismatchError, TruncatedMeshError } from '../../domain/errors.ts';
import type { IndexedMesh } from '../../domain/indexed-mesh.ts';

const HEADER = 84; // 80 free-text bytes + uint32 triangle count
const RECORD = 50; // normal + 3 vertices as float32 LE, then a 2-byte attribute
const BLOCK = 9 * 65536; // floats per soup block (2.4 MB)

/**
 * Binary or ASCII by length, never by the `solid` header (many binary files start with it):
 * a file is binary STL when its size is exactly 84 + 50 x the count its header declares.
 * `head` needs at least the first 84 bytes; `totalBytes` is the whole file size.
 */
export function isBinaryStl(head: Uint8Array, totalBytes: number): boolean {
  if (head.length < HEADER || totalBytes < HEADER) return false;
  const count = new DataView(head.buffer, head.byteOffset, head.byteLength).getUint32(80, true);
  return totalBytes === HEADER + RECORD * count;
}

/**
 * Parse a binary STL fed as chunks of any size (records may straddle chunks), then weld it.
 * Throws `TruncatedMeshError` (header incomplete or a triangle cut short), `TriangleCountMismatchError`
 * (whole triangles missing or extra bytes after the declared ones) and `NonFiniteCoordinateError`.
 */
export async function parseBinaryStl(chunks: AsyncIterable<Uint8Array> | Iterable<Uint8Array>): Promise<IndexedMesh> {
  const stage = new Uint8Array(Math.max(HEADER, RECORD));
  const sv = new DataView(stage.buffer);
  let staged = 0; // bytes held in `stage`
  let total = 0;
  let declared = -1; // -1 until the header is complete
  let read = 0; // whole triangles stored
  // Fixed-size blocks allocated as data arrives: a hostile count in a tiny file cannot force a huge
  // allocation, and nothing is ever copied, so the soup costs its own size plus at most one block.
  const blocks: Float32Array[] = [];
  let block = new Float32Array(0);
  let at9 = 0; // floats used in `block`

  const store = (v: DataView, at: number) => {
    if (at9 === block.length) {
      block = new Float32Array(BLOCK);
      blocks.push(block);
      at9 = 0;
    }
    for (let k = 0; k < 9; k++) block[at9 + k] = v.getFloat32(at + 12 + 4 * k, true); // skip the normal
    at9 += 9;
    read++;
  };

  for await (const chunk of chunks) {
    total += chunk.length;
    let pos = 0;
    if (declared < 0) {
      const take = Math.min(HEADER - staged, chunk.length);
      stage.set(chunk.subarray(0, take), staged);
      staged += take;
      pos = take;
      if (staged < HEADER) continue;
      declared = sv.getUint32(80, true);
      staged = 0;
    }
    if (staged > 0) {
      const take = Math.min(RECORD - staged, chunk.length - pos);
      stage.set(chunk.subarray(pos, pos + take), staged);
      staged += take;
      pos += take;
      if (staged === RECORD) {
        if (read < declared) store(sv, 0);
        staged = 0;
      }
    }
    const v = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    for (; pos + RECORD <= chunk.length; pos += RECORD) if (read < declared) store(v, pos);
    if (pos < chunk.length) {
      stage.set(chunk.subarray(pos), 0);
      staged = chunk.length - pos;
    }
  }

  if (declared < 0) throw new TruncatedMeshError(HEADER, total);
  const expected = HEADER + RECORD * declared;
  const actual = Math.floor((total - HEADER) / RECORD);
  if (total < expected && (total - HEADER) % RECORD !== 0) throw new TruncatedMeshError(expected, total);
  if (total !== expected) throw new TriangleCountMismatchError(declared, actual);
  if (blocks.length > 0) blocks[blocks.length - 1] = block.subarray(0, at9);
  return weld(blocks);
}
