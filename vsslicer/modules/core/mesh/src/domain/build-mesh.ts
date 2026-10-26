// SPDX-License-Identifier: AGPL-3.0-or-later
import { NonFiniteCoordinateError } from './errors.ts';
import type { BoundingBox, IndexedMesh, MeshPart } from './indexed-mesh.ts';

function boundsOf(positions: Float32Array): BoundingBox {
  if (positions.length === 0) return { min: [0, 0, 0], max: [0, 0, 0] };
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i++) {
    const a = i % 3;
    const v = positions[i] as number;
    if (v < (min[a] as number)) min[a] = v;
    if (v > (max[a] as number)) max[a] = v;
  }
  return { min, max };
}

function checkParts(parts: readonly MeshPart[] | undefined, triangleCount: number): readonly MeshPart[] {
  if (!parts) return [{ name: '', firstTriangle: 0, triangleCount }];
  let next = 0;
  for (const p of parts) {
    if (p.firstTriangle !== next) throw new RangeError('Mesh parts must cover the triangles in order without gaps.');
    next += p.triangleCount;
  }
  if (next !== triangleCount)
    throw new RangeError(`Mesh parts cover ${next} triangles but the mesh has ${triangleCount}.`);
  return parts;
}

/** Wrap typed arrays as an `IndexedMesh` (no copy) after checking them. Throws `NonFiniteCoordinateError` or `RangeError`. */
export function fromArrays(positions: Float32Array, indices: Uint32Array, parts?: readonly MeshPart[]): IndexedMesh {
  if (positions.length % 3 !== 0) throw new RangeError('positions must hold x,y,z per vertex.');
  if (indices.length % 3 !== 0) throw new RangeError('indices must hold three vertex numbers per triangle.');
  for (let i = 0; i < positions.length; i++) {
    if (!Number.isFinite(positions[i])) throw new NonFiniteCoordinateError(Math.floor(i / 3));
  }
  const vertexCount = positions.length / 3;
  for (let i = 0; i < indices.length; i++) {
    if ((indices[i] as number) >= vertexCount) {
      throw new RangeError(`Index ${indices[i]} at position ${i} is outside the ${vertexCount} vertices.`);
    }
  }
  return { positions, indices, parts: checkParts(parts, indices.length / 3), bounds: boundsOf(positions) };
}

/** Mixes three uint32 words into a table slot hash (murmur3-style finaliser). */
function hash3(x: number, y: number, z: number): number {
  let h = Math.imul(x, 0x9e3779b1) ^ Math.imul(y, 0x85ebca77) ^ Math.imul(z, 0xc2b2ae3d);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  return (h ^ (h >>> 13)) >>> 0;
}

/**
 * Weld identical vertices of a triangle soup (9 floats per triangle) into indexed form.
 * The soup may come as one array or as consecutive blocks (each a multiple of 9 floats), so a parser
 * need not copy its buffers into one. Vertices are identical when their float32 bits match; -0 is
 * treated as 0. Ids follow first appearance. Open-addressing hash on the bits in typed arrays, so it has
 * no `Map` size limit. Written from the idea only (hash on the coordinates), no upstream code.
 */
export function weld(soup: Float32Array | readonly Float32Array[], parts?: readonly MeshPart[]): IndexedMesh {
  const blocks = soup instanceof Float32Array ? [soup] : soup;
  let floats = 0;
  for (const b of blocks) {
    if (b.length % 9 !== 0) throw new RangeError('A triangle soup holds nine numbers per triangle.');
    floats += b.length;
  }
  const f = new Float32Array(3);
  const bits = new Uint32Array(f.buffer);
  const indices = new Uint32Array(floats / 3);
  let vbits = new Uint32Array(3 * 1024); // unique vertices' bits, in id order
  let count = 0;
  let mask = 2047;
  let table = new Uint32Array(mask + 1); // id + 1 per slot, 0 = empty
  let v = 0;
  for (const block of blocks) {
    for (let i = 0; i < block.length; i += 3, v++) {
      for (let a = 0; a < 3; a++) {
        const c = block[i + a] as number;
        if (!Number.isFinite(c)) throw new NonFiniteCoordinateError(v);
        f[a] = c + 0; // turns -0 into 0
      }
      const x = bits[0] as number,
        y = bits[1] as number,
        z = bits[2] as number;
      let slot = hash3(x, y, z) & mask;
      let id: number;
      for (;;) {
        const e = table[slot] as number;
        if (e === 0) {
          id = count++;
          table[slot] = id + 1;
          if (vbits.length < count * 3) {
            const grown = new Uint32Array(vbits.length * 2);
            grown.set(vbits);
            vbits = grown;
          }
          vbits[id * 3] = x;
          vbits[id * 3 + 1] = y;
          vbits[id * 3 + 2] = z;
          if (count * 2 > mask) {
            // keep the load under one half: rehash every id into a table twice the size
            mask = mask * 2 + 1;
            table = new Uint32Array(mask + 1);
            for (let k = 0; k < count; k++) {
              let s = hash3(vbits[k * 3] as number, vbits[k * 3 + 1] as number, vbits[k * 3 + 2] as number) & mask;
              while (table[s] !== 0) s = (s + 1) & mask;
              table[s] = k + 1;
            }
          }
          break;
        }
        const k = (e - 1) * 3;
        if (vbits[k] === x && vbits[k + 1] === y && vbits[k + 2] === z) {
          id = e - 1;
          break;
        }
        slot = (slot + 1) & mask;
      }
      indices[v] = id;
    }
  }
  const positions = new Float32Array(vbits.buffer.slice(0, count * 12));
  return { positions, indices, parts: checkParts(parts, indices.length / 3), bounds: boundsOf(positions) };
}
