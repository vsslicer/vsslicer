// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import {
  NonFiniteCoordinateError,
  TriangleCountMismatchError,
  TruncatedMeshError,
  isBinaryStl,
  parseBinaryStl,
} from '../src/index.ts';

const read = (n: string) => new Uint8Array(readFileSync(new URL(`./fixtures/stl-obj/${n}`, import.meta.url)));
const pieces = (b: Uint8Array, size: number) =>
  Array.from({ length: Math.ceil(b.length / size) }, (_, i) => b.subarray(i * size, (i + 1) * size));

for (const name of ['box-binary.stl', 'box-binary-solid-header.stl', 'cura-BIQU_BX_PLATE.stl']) {
  test(`${name} matches three.js STLLoader, whole and in odd chunks`, async () => {
    const bytes = read(name);
    const g = new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length));
    g.computeBoundingBox();
    for (const size of [bytes.length, 7, 50, 1]) {
      if (size === 1 && bytes.length > 5000) continue;
      const mesh = await parseBinaryStl(pieces(bytes, size));
      expect(mesh.indices.length / 3).toBe(g.getAttribute('position').count / 3);
      expect(mesh.bounds.min).toEqual(g.boundingBox!.min.toArray());
      expect(mesh.bounds.max).toEqual(g.boundingBox!.max.toArray());
    }
  });
}

test('welds the box to 8 vertices and accepts an async source', async () => {
  async function* gen() {
    yield read('box-binary.stl');
  }
  expect((await parseBinaryStl(gen())).positions.length).toBe(24);
});

test('tells binary from ASCII by length, not by the solid header', () => {
  const sizes = (n: string) => [read(n), read(n).length] as const;
  expect(isBinaryStl(...sizes('box-binary-solid-header.stl'))).toBe(true);
  expect(isBinaryStl(...sizes('box-binary.stl'))).toBe(true);
  expect(isBinaryStl(...sizes('box-ascii.stl'))).toBe(false);
  expect(isBinaryStl(...sizes('box-binary-truncated.stl'))).toBe(false);
});

test('hostile files raise the typed errors', async () => {
  await expect(parseBinaryStl([read('box-binary-header-only.stl')])).rejects.toBeInstanceOf(TruncatedMeshError);
  await expect(parseBinaryStl(pieces(read('box-binary-truncated.stl'), 13))).rejects.toBeInstanceOf(TruncatedMeshError);
  const tooLarge = await parseBinaryStl(pieces(read('box-binary-count-too-large.stl'), 64)).catch((e) => e);
  expect(tooLarge).toBeInstanceOf(TriangleCountMismatchError);
  expect([tooLarge.declared, tooLarge.actual]).toEqual([20, 12]);
  await expect(parseBinaryStl([read('box-binary-count-too-small.stl')])).rejects.toBeInstanceOf(
    TriangleCountMismatchError,
  );
  const nan = await parseBinaryStl([read('box-binary-nan.stl')]).catch((e) => e);
  expect(nan).toBeInstanceOf(NonFiniteCoordinateError);
  expect(nan.vertex).toBe(3 * 3);
  await expect(parseBinaryStl([read('box-binary-infinite.stl')])).rejects.toBeInstanceOf(NonFiniteCoordinateError);
});
