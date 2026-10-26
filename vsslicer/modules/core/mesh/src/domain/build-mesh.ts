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

/**
 * Weld identical vertices of a triangle soup (9 floats per triangle) into indexed form.
 * Vertices are identical when their float32 bits match; -0 is treated as 0.
 * Written from the idea only (hash on the coordinates), no upstream code.
 */
export function weld(soup: Float32Array, parts?: readonly MeshPart[]): IndexedMesh {
  if (soup.length % 9 !== 0) throw new RangeError('A triangle soup holds nine numbers per triangle.');
  const bits = new Uint32Array(3);
  const f = new Float32Array(bits.buffer);
  const seen = new Map<string, number>();
  const vertices: number[] = [];
  const indices = new Uint32Array(soup.length / 3);
  for (let v = 0; v < indices.length; v++) {
    for (let a = 0; a < 3; a++) {
      const c = soup[v * 3 + a] as number;
      if (!Number.isFinite(c)) throw new NonFiniteCoordinateError(v);
      f[a] = c + 0; // turns -0 into 0
    }
    const key = `${bits[0]},${bits[1]},${bits[2]}`;
    let id = seen.get(key);
    if (id === undefined) {
      id = vertices.length / 3;
      seen.set(key, id);
      vertices.push(f[0] as number, f[1] as number, f[2] as number);
    }
    indices[v] = id;
  }
  const positions = Float32Array.from(vertices);
  return { positions, indices, parts: checkParts(parts, indices.length / 3), bounds: boundsOf(positions) };
}
