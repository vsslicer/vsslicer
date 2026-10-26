// SPDX-License-Identifier: AGPL-3.0-or-later
import { weld } from '../../domain/build-mesh.ts';
import { MalformedMeshError } from '../../domain/errors.ts';
import type { IndexedMesh } from '../../domain/indexed-mesh.ts';
import { FloatBuffer, parseNumber, textLines } from '../text.ts';

/**
 * Parse an ASCII STL fed as chunks of any size, then weld it. Only `vertex` lines matter; normals,
 * loops and facet words are skipped, so CRLF, tabs, indents and trailing blanks all work.
 * Throws `MalformedMeshError` (not a `solid` file, bad number, vertex count not a multiple of three)
 * and `NonFiniteCoordinateError`.
 */
export async function parseAsciiStl(chunks: AsyncIterable<Uint8Array> | Iterable<Uint8Array>): Promise<IndexedMesh> {
  const soup = new FloatBuffer();
  let started = false;
  let lastLine = 0;
  for await (const [raw, no] of textLines(chunks)) {
    lastLine = no;
    const t = raw
      .replace(/^\uFEFF/, '')
      .trim()
      .split(/\s+/);
    const word = (t[0] as string).toLowerCase();
    if (word === '') continue;
    if (!started) {
      if (word !== 'solid') throw new MalformedMeshError(no, 'this is not an ASCII STL, it should start with "solid"');
      started = true;
    } else if (word === 'vertex') {
      if (t.length !== 4) throw new MalformedMeshError(no, 'a vertex needs exactly three numbers');
      soup.push(parseNumber(t[1], no), parseNumber(t[2], no), parseNumber(t[3], no));
    }
  }
  if (!started) throw new MalformedMeshError(1, 'the file is empty, it should start with "solid"');
  if ((soup.length / 3) % 3 !== 0) throw new MalformedMeshError(lastLine, 'the file ends in the middle of a triangle');
  return weld(soup.view());
}
