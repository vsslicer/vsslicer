// SPDX-License-Identifier: AGPL-3.0-or-later
import { DoubleSide, Ray, Vector3 } from 'three';
import { expect, test } from 'vitest';
import { buildBvh, deserialiseBvh, fromArrays, serialiseBvh, weld } from '../src/index.ts';
import type { IndexedMesh } from '../src/index.ts';

function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sphere(rings: number, segments: number): IndexedMesh {
  const p: number[] = [];
  for (let r = 0; r <= rings; r++) {
    const th = (r / rings) * Math.PI;
    for (let s = 0; s < segments; s++) {
      const ph = (s / segments) * 2 * Math.PI;
      p.push(Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th));
    }
  }
  const idx: number[] = [];
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * segments + s;
      const b = r * segments + ((s + 1) % segments);
      idx.push(a, a + segments, b, b, a + segments, b + segments);
    }
  }
  return fromArrays(Float32Array.from(p), Uint32Array.from(idx));
}

function randomSoup(triangles: number, next: () => number): IndexedMesh {
  const soup = new Float32Array(triangles * 9);
  for (let t = 0; t < triangles; t++) {
    const c = [next() * 2 - 1, next() * 2 - 1, next() * 2 - 1];
    for (let i = 0; i < 9; i++) soup[t * 9 + i] = (c[i % 3] as number) + (next() - 0.5) * 0.3;
  }
  return weld(soup);
}

function randomRays(count: number, next: () => number): Ray[] {
  const rays: Ray[] = [];
  for (let i = 0; i < count; i++) {
    const origin = new Vector3(next() * 6 - 3, next() * 6 - 3, next() * 6 - 3);
    const target = new Vector3(next() * 2 - 1, next() * 2 - 1, next() * 2 - 1);
    rays.push(new Ray(origin, target.sub(origin).normalize()));
  }
  return rays;
}

function bruteForce(mesh: IndexedMesh, ray: Ray): number | null {
  const [a, b, c, hit] = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
  const vertex = (i: number) => (mesh.indices[i] as number) * 3;
  let best: number | null = null;
  for (let t = 0; t < mesh.indices.length; t += 3) {
    a.fromArray(mesh.positions, vertex(t));
    b.fromArray(mesh.positions, vertex(t + 1));
    c.fromArray(mesh.positions, vertex(t + 2));
    if (ray.intersectTriangle(a, b, c, false, hit)) {
      const d = hit.distanceTo(ray.origin);
      if (best === null || d < best) best = d;
    }
  }
  return best;
}

const fixtures: [string, IndexedMesh][] = [
  ['sphere', sphere(24, 48)],
  ['random soup', randomSoup(2000, rng(7))],
];

test.each(fixtures)('%s: BVH raycasts agree with brute force on 10,000 rays', (_name, mesh) => {
  const bvh = buildBvh(mesh);
  let hits = 0;
  for (const ray of randomRays(10_000, rng(42))) {
    const expected = bruteForce(mesh, ray);
    const got = bvh.raycastFirst(ray, DoubleSide);
    expect(got === null ? null : got.distance).toEqual(expected === null ? null : expect.closeTo(expected, 5));
    if (got) hits++;
  }
  expect(hits).toBeGreaterThan(1000); // the rays do hit something
});

test.each(fixtures)('%s: a transferred and deserialised BVH gives identical raycasts', (_name, mesh) => {
  const indicesBefore = mesh.indices.slice();
  const bvh = buildBvh(mesh);
  expect(mesh.indices).toEqual(indicesBefore); // indirect: the mesh's triangle order is untouched
  const rays = randomRays(2000, rng(3));
  const before = rays.map((r) => bvh.raycastFirst(r, DoubleSide));

  const { data, transfer } = serialiseBvh(bvh);
  expect(transfer.every((b) => b instanceof ArrayBuffer)).toBe(true); // no SharedArrayBuffer
  const received = structuredClone(data, { transfer });
  expect(transfer[0]?.byteLength).toBe(0); // moved, not copied

  const restored = deserialiseBvh(received, mesh);
  const after = rays.map((r) => restored.raycastFirst(r, DoubleSide));
  expect(after.map((h) => h && [h.distance, h.faceIndex])).toEqual(before.map((h) => h && [h.distance, h.faceIndex]));
  for (const h of after) {
    if (h) expect(h.faceIndex).toBeLessThan(mesh.indices.length / 3);
  }
});
