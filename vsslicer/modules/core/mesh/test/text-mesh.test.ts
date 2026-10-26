// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Box3, type Mesh } from 'three';
import { MalformedMeshError, ObjIndexOutOfRangeError, parseAsciiStl, parseObj } from '../src/index.ts';

const read = (n: string) => new Uint8Array(readFileSync(new URL(`./fixtures/stl-obj/${n}`, import.meta.url)));
const pieces = (b: Uint8Array, size: number) =>
  Array.from({ length: Math.ceil(b.length / size) }, (_, i) => b.subarray(i * size, (i + 1) * size));
const text = (s: string) => [new TextEncoder().encode(s)];
const SIZES = [1, 3, 17, 4096, 1 << 30];

for (const name of ['box-ascii.stl', 'box-ascii-crlf.stl']) {
  test(`${name} matches three.js STLLoader at every chunk size`, async () => {
    const b = read(name);
    const g = new STLLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length) as ArrayBuffer);
    g.computeBoundingBox();
    for (const size of SIZES) {
      const mesh = await parseAsciiStl(pieces(b, size));
      expect(mesh.indices.length / 3).toBe(g.getAttribute('position').count / 3);
      expect(mesh.positions.length / 3).toBe(8);
      expect(mesh.bounds.min).toEqual(g.boundingBox!.min.toArray());
      expect(mesh.bounds.max).toEqual(g.boundingBox!.max.toArray());
    }
  });
}

test('ASCII STL rejects malformed input with typed errors', async () => {
  await expect(parseAsciiStl(text('solid x\nvertex 1 two 3\n'))).rejects.toBeInstanceOf(MalformedMeshError);
  await expect(parseAsciiStl(text('solid x\nvertex 1 2\n'))).rejects.toBeInstanceOf(MalformedMeshError);
  await expect(parseAsciiStl(text('solid x\nvertex 1 2 3\nvertex 4 5 6\nendsolid\n'))).rejects.toBeInstanceOf(
    MalformedMeshError,
  );
  await expect(parseAsciiStl([read('box-binary.stl')])).rejects.toBeInstanceOf(MalformedMeshError);
  await expect(parseAsciiStl([])).rejects.toBeInstanceOf(MalformedMeshError);
});

for (const [name, groups] of [
  ['box-quads.obj', 1],
  ['box-negative-indices.obj', 1],
  ['box-groups.obj', 2],
  ['cura-Hellbot_Magna_2_230.obj', 1],
] as const) {
  test(`${name} matches three.js OBJLoader at every chunk size`, async () => {
    const b = read(name);
    const obj = new OBJLoader().parse(new TextDecoder().decode(b));
    let triangles = 0;
    obj.traverse((o) => {
      const g = (o as Mesh).geometry;
      if (g) triangles += g.getAttribute('position').count / 3;
    });
    const box = new Box3().setFromObject(obj);
    for (const size of SIZES) {
      const mesh = await parseObj(pieces(b, size));
      expect(mesh.indices.length / 3).toBe(triangles);
      expect(mesh.bounds.min.map((v) => Math.fround(v))).toEqual(box.min.toArray().map((v) => Math.fround(v)));
      expect(mesh.bounds.max.map((v) => Math.fround(v))).toEqual(box.max.toArray().map((v) => Math.fround(v)));
      expect(mesh.parts.length).toBe(groups);
    }
  });
}

test('groups become parts in order', async () => {
  const mesh = await parseObj(pieces(read('box-groups.obj'), 5));
  expect(mesh.parts).toEqual([
    { name: 'lower', firstTriangle: 0, triangleCount: 6 },
    { name: 'upper', firstTriangle: 6, triangleCount: 6 },
  ]);
});

test('n-gons fan into triangles', async () => {
  const mesh = await parseObj(text('v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nv 0.5 2 0\nf 1 2 3 4 5\n'));
  expect(mesh.indices.length / 3).toBe(3);
});

test('OBJ rejects what three.js lets through, and junk', async () => {
  const e = await parseObj(pieces(read('box-index-out-of-range.obj'), 9)).catch((x) => x);
  expect(e).toBeInstanceOf(ObjIndexOutOfRangeError);
  expect([e.index, e.vertexCount]).toEqual([9, 8]);
  await expect(parseObj(text('v 0 0 0\nf 1 1 -2\n'))).rejects.toBeInstanceOf(ObjIndexOutOfRangeError);
  await expect(parseObj(text('v 0 0 0\nf 0 1 1\n'))).rejects.toBeInstanceOf(MalformedMeshError);
  await expect(parseObj(text('v 0 x 0\n'))).rejects.toBeInstanceOf(MalformedMeshError);
  await expect(parseObj(text('v 0 0 0\nf 1 1\n'))).rejects.toBeInstanceOf(MalformedMeshError);
  expect((await parseObj(text('# nothing\n'))).indices.length).toBe(0);
});
