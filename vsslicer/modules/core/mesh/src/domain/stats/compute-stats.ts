// SPDX-License-Identifier: AGPL-3.0-or-later
import type { IndexedMesh } from '../indexed-mesh.ts';
import type { MeshStats } from '../mesh-stats.ts';

/**
 * Triangle count, bounds, signed volume (sum of origin tetrahedra, float64), edge health and zero-area triangles.
 * Written from the divergence-theorem formula; no admesh (GPL) code.
 * shortcut: edge keys assume under ~9e7 vertices (a*n+b stays exact in a double); upgrade past that.
 */
export function computeStats(mesh: IndexedMesh): MeshStats {
  const { positions: p, indices: ix } = mesh;
  const n = p.length / 3;
  const triangleCount = ix.length / 3;
  let volume = 0;
  let degenerateTriangles = 0;
  const edges = new Map<number, number>();
  const addEdge = (a: number, b: number): void => {
    const key = a < b ? a * n + b : b * n + a;
    edges.set(key, (edges.get(key) ?? 0) + 1);
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
  for (const count of edges.values()) {
    if (count === 1) openEdges++;
    else if (count >= 3) nonManifoldEdges++;
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
