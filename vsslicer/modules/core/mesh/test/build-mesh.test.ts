// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { NonFiniteCoordinateError, computeStats, fromArrays, weld } from '../src/index.ts';
import type { IndexedMesh } from '../src/index.ts';

// Unit cube corners, outward-facing triangles (counter-clockwise seen from outside).
const C = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
] as const;
const CUBE_TRIS = [
  [0, 2, 1],
  [0, 3, 2],
  [4, 5, 6],
  [4, 6, 7],
  [0, 1, 5],
  [0, 5, 4],
  [2, 3, 7],
  [2, 7, 6],
  [1, 2, 6],
  [1, 6, 5],
  [3, 0, 4],
  [3, 4, 7],
] as const;
const soup = (tris: readonly (readonly number[])[], corners: readonly (readonly number[])[], dx = 0): Float32Array =>
  Float32Array.from(tris.flatMap((t) => t.flatMap((i) => [corners[i]![0]! + dx, corners[i]![1]!, corners[i]![2]!])));

/** Triangles as sorted-free canonical strings, in order. */
const expand = (m: IndexedMesh): string[] =>
  Array.from({ length: m.indices.length / 3 }, (_, t) =>
    [0, 1, 2]
      .map((k) => Array.from(m.positions.subarray(m.indices[t * 3 + k]! * 3, m.indices[t * 3 + k]! * 3 + 3)).join(' '))
      .join('|'),
  );

test('cube welds to 8 vertices, 24 bytes per triangle, same triangles back', () => {
  const s = soup(CUBE_TRIS, C);
  const m = weld(s);
  expect(m.positions.length / 3).toBe(8);
  expect(m.indices.length / 3).toBe(12);
  expect((m.positions.byteLength + m.indices.byteLength) / 12).toBeLessThanOrEqual(24); // 20 for a cube
  expect(expand(m)).toEqual(
    Array.from({ length: 12 }, (_, t) =>
      [0, 1, 2].map((k) => Array.from(s.subarray(t * 9 + k * 3, t * 9 + k * 3 + 3)).join(' ')).join('|'),
    ),
  );
  expect(m.bounds).toEqual({ min: [0, 0, 0], max: [1, 1, 1] });
});

test('two cubes sharing a face weld to 12 vertices', () => {
  const m = weld(Float32Array.from([...soup(CUBE_TRIS, C), ...soup(CUBE_TRIS, C, 1)]));
  expect(m.positions.length / 3).toBe(12);
  expect(m.indices.length / 3).toBe(24);
});

test('-0 equals 0 and non-finite is rejected', () => {
  const m = weld(Float32Array.from([-0, 0, 0, 0, 0, 0, 1, 0, 0]));
  expect(m.positions.length / 3).toBe(2);
  expect(() => weld(Float32Array.from([NaN, 0, 0, 0, 0, 0, 1, 0, 0]))).toThrow(NonFiniteCoordinateError);
});

test('random meshes re-expand to the input triangles', () => {
  let seed = 1;
  const rnd = (): number => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let run = 0; run < 50; run++) {
    const pool = Array.from({ length: 1 + Math.floor(rnd() * 30) }, () => [
      Math.floor(rnd() * 5),
      Math.floor(rnd() * 5),
      rnd() - 0.5,
    ]);
    const n = 1 + Math.floor(rnd() * 100);
    const s = Float32Array.from(Array.from({ length: n * 3 }, () => pool[Math.floor(rnd() * pool.length)]!).flat());
    const m = weld(s);
    const back = Float32Array.from(
      Array.from(m.indices, (i) => Array.from(m.positions.subarray(i * 3, i * 3 + 3))).flat(),
    );
    expect(Array.from(back)).toEqual(Array.from(s, (v) => v + 0));
    expect(m.positions.length / 3).toBeLessThanOrEqual(pool.length);
  }
});

test('fromArrays wraps without copying and validates', () => {
  const p = Float32Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const i = Uint32Array.from([0, 1, 2]);
  const m = fromArrays(p, i);
  expect(m.positions).toBe(p);
  expect(m.parts).toEqual([{ name: '', firstTriangle: 0, triangleCount: 1 }]);
  expect(() => fromArrays(p, Uint32Array.from([0, 1, 3]))).toThrow(RangeError);
  expect(() => fromArrays(p, Uint32Array.from([0, 1]))).toThrow(RangeError);
  expect(() => fromArrays(Float32Array.from([0, 0]), i)).toThrow(RangeError);
  expect(() => fromArrays(Float32Array.from([0, 0, 0, 1, Infinity, 0, 0, 1, 0]), i)).toThrow(NonFiniteCoordinateError);
  expect(() => fromArrays(p, i, [{ name: 'a', firstTriangle: 0, triangleCount: 2 }])).toThrow(RangeError);
});

test('stats: unit cube', () => {
  const s = computeStats(weld(soup(CUBE_TRIS, C)));
  expect(s).toMatchObject({
    triangleCount: 12,
    vertexCount: 8,
    openEdges: 0,
    nonManifoldEdges: 0,
    degenerateTriangles: 0,
  });
  const flipped = computeStats(
    weld(
      soup(
        CUBE_TRIS.map(([a, b, c]) => [a, c, b]),
        C,
      ),
    ),
  );
  expect(s.volume).toBeCloseTo(1, 12);
  expect(flipped.volume).toBeCloseTo(-1, 12);
});

test('stats: scaled cube volume, open cube, degenerate triangles', () => {
  const big = C.map(([x, y, z]) => [x * 2, y * 3, z * 4]);
  expect(computeStats(weld(soup(CUBE_TRIS, big))).volume).toBeCloseTo(24, 9);
  const open = computeStats(weld(soup(CUBE_TRIS.slice(2), C)));
  expect(open.openEdges).toBe(4);
  const deg = computeStats(
    weld(
      Float32Array.from([
        0,
        0,
        0,
        1,
        0,
        0,
        2,
        0,
        0, // collinear
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1, // repeated point
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0, // fine
      ]),
    ),
  );
  expect(deg.degenerateTriangles).toBe(2);
  expect(deg.openEdges).toBe(3);
});
