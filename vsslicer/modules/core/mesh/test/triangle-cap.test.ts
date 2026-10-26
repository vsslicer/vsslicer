// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { TooManyTrianglesError, parseAsciiStl, parseModel, parseObj } from '../src/index.ts';

const enc = (s: string) => new TextEncoder().encode(s);

test('one OBJ face fanning past the cap is refused while it is read, not after', async () => {
  const n = 200_000; // fans into 199,998 triangles
  const lines = Array.from({ length: n }, (_, i) => `v ${i} ${i % 7} 0`);
  const face = 'f ' + Array.from({ length: n }, (_, i) => i + 1).join(' ');
  const bytes = enc(lines.join('\n') + '\n' + face + '\n');
  await expect(parseObj([bytes], 10)).rejects.toBeInstanceOf(TooManyTrianglesError);
  await expect(parseModel(bytes, { extension: 'obj', hardTriangleCap: 10 })).rejects.toBeInstanceOf(
    TooManyTrianglesError,
  );
});

test('ASCII STL facets past the cap are refused', async () => {
  const facet = 'facet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\n';
  const bytes = enc('solid s\n' + facet.repeat(5) + 'endsolid s\n');
  await expect(parseAsciiStl([bytes], 4)).rejects.toBeInstanceOf(TooManyTrianglesError);
  expect((await parseAsciiStl([bytes], 5)).indices.length / 3).toBe(5);
});
