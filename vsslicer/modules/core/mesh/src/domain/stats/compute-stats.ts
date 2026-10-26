// SPDX-License-Identifier: AGPL-3.0-or-later
import type { IndexedMesh } from '../indexed-mesh.ts';
import type { MeshStats } from '../mesh-stats.ts';

/**
 * Triangle count, bounds, signed volume (sum of origin tetrahedra, float64), edge health and zero-area triangles.
 * Written from the divergence-theorem formula; no admesh (GPL) code.
 * Edges are counted in an open-addressing hash over typed arrays, so there is no `Map` size limit.
 */
export function computeStats(mesh: IndexedMesh): MeshStats {
  const { positions: p, indices: ix } = mesh;
  const n = p.length / 3;
  const triangleCount = ix.length / 3;
  let volume = 0;
  let degenerateTriangles = 0;
  // a closed mesh has 1.5 edges per triangle, so 2 slots per triangle keeps the load near 0.75 at worst
  let mask = 15;
  while (mask < triangleCount * 2) mask = mask * 2 + 1;
  let lo = new Uint32Array(mask + 1); // smaller vertex + 1, 0 = empty
  let hi = new Uint32Array(mask + 1);
  let hits = new Uint8Array(mask + 1); // uses, capped at 3 (all the result needs)
  let used = 0;
  const slotOf = (a: number, b: number, m: number): number => {
    const h = Math.imul(a, 0x9e3779b1) ^ Math.imul(b, 0x85ebca77);
    return (Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0) & m;
  };
  const addEdge = (p0: number, p1: number): void => {
    const a = p0 < p1 ? p0 : p1;
    const b = p0 < p1 ? p1 : p0;
    let s = slotOf(a, b, mask);
    for (;;) {
      if (lo[s] === 0) {
        lo[s] = a + 1;
        hi[s] = b;
        hits[s] = 1;
        if (++used * 10 > mask * 8) grow();
        return;
      }
      if (lo[s] === a + 1 && hi[s] === b) {
        if ((hits[s] as number) < 3) hits[s] = (hits[s] as number) + 1;
        return;
      }
      s = (s + 1) & mask;
    }
  };
  const grow = (): void => {
    const [oLo, oHi, oHits] = [lo, hi, hits];
    mask = mask * 2 + 1;
    lo = new Uint32Array(mask + 1);
    hi = new Uint32Array(mask + 1);
    hits = new Uint8Array(mask + 1);
    for (let i = 0; i < oLo.length; i++) {
      if (oLo[i] === 0) continue;
      let s = slotOf((oLo[i] as number) - 1, oHi[i] as number, mask);
      while (lo[s] !== 0) s = (s + 1) & mask;
      lo[s] = oLo[i] as number;
      hi[s] = oHi[i] as number;
      hits[s] = oHits[i] as number;
    }
  };
  for (let t = 0; t < triangleCount; t++) {
    const a = ix[t * 3] as number;
    const b = ix[t * 3 + 1] as number;
    const c = ix[t * 3 + 2] as number;
    const ax = p[a * 3] as number,
      ay = p[a * 3 + 1] as number,
      az = p[a * 3 + 2] as number;
    const bx = p[b * 3] as number,
      by = p[b * 3 + 1] as number,
      bz = p[b * 3 + 2] as number;
    const cx = p[c * 3] as number,
      cy = p[c * 3 + 1] as number,
      cz = p[c * 3 + 2] as number;
    volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    // area vector = (b-a) x (c-a); zero in float64 means zero area
    const ux = bx - ax,
      uy = by - ay,
      uz = bz - az,
      vx = cx - ax,
      vy = cy - ay,
      vz = cz - az;
    if (uy * vz - uz * vy === 0 && uz * vx - ux * vz === 0 && ux * vy - uy * vx === 0) {
      degenerateTriangles++;
      continue; // a collapsed triangle has no real edges
    }
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }
  let openEdges = 0;
  let nonManifoldEdges = 0;
  for (let i = 0; i < hits.length; i++) {
    if (hits[i] === 1) openEdges++;
    else if (hits[i] === 3) nonManifoldEdges++;
  }
  return {
    triangleCount,
    vertexCount: n,
    bounds: mesh.bounds,
    volume,
    openEdges,
    nonManifoldEdges,
    degenerateTriangles,
  };
}
