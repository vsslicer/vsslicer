// SPDX-License-Identifier: AGPL-3.0-or-later
import { weld } from '../../domain/build-mesh.ts';
import { MalformedMeshError, ObjIndexOutOfRangeError } from '../../domain/errors.ts';
import type { IndexedMesh, MeshPart } from '../../domain/indexed-mesh.ts';
import { FloatBuffer, parseNumber, textLines } from '../text.ts';

/**
 * Parse OBJ geometry fed as chunks of any size, then weld it. Reads `v`, `f`, `g` and `o`; everything
 * else (`vt`, `vn`, `mtl`, `usemtl`, `s`...) is ignored. Faces of any size are fanned into triangles,
 * negative indices count back from the vertices read so far, and each `g`/`o` name becomes a part.
 * Throws `ObjIndexOutOfRangeError`, `MalformedMeshError` and `NonFiniteCoordinateError`.
 * shortcut: no `\` line continuation, no 4th-component weights; upgrade if a real file needs them.
 */
export async function parseObj(chunks: AsyncIterable<Uint8Array> | Iterable<Uint8Array>): Promise<IndexedMesh> {
  const verts = new FloatBuffer(); // v lines
  const soup = new FloatBuffer(); // triangle corners, 3 per triangle
  const parts: { name: string; firstTriangle: number; triangleCount: number }[] = [];
  let group = '';

  for await (const [raw, no] of textLines(chunks)) {
    const t = raw.trim().split(/\s+/);
    const word = t[0];
    if (word === 'v') {
      if (t.length < 4) throw new MalformedMeshError(no, 'a vertex needs three numbers');
      verts.push(parseNumber(t[1], no), parseNumber(t[2], no), parseNumber(t[3], no)); // extra colour fields ignored
    } else if (word === 'g' || word === 'o') {
      group = t.slice(1).join(' ');
    } else if (word === 'f') {
      if (t.length < 4) throw new MalformedMeshError(no, 'a face needs at least three vertices');
      const count = verts.length / 3;
      const corner = t.slice(1).map((ref) => {
        const text = ref.split('/')[0] as string;
        if (!/^[+-]?\d+$/.test(text) || Number(text) === 0)
          throw new MalformedMeshError(no, `"${ref}" is not a vertex number`);
        const i = Number(text);
        const at = i > 0 ? i - 1 : count + i;
        if (at < 0 || at >= count) throw new ObjIndexOutOfRangeError(no, i, count);
        return at;
      });
      let part = parts[parts.length - 1];
      if (!part || part.name !== group) {
        part = { name: group, firstTriangle: soup.length / 9, triangleCount: 0 };
        parts.push(part);
      }
      const view = verts.view();
      for (let k = 1; k < corner.length - 1; k++) {
        for (const c of [corner[0], corner[k], corner[k + 1]] as number[]) {
          soup.push(view[c * 3] as number, view[c * 3 + 1] as number, view[c * 3 + 2] as number);
        }
        part.triangleCount++;
      }
    }
  }
  return weld(soup.view(), parts.length > 0 ? (parts as MeshPart[]) : undefined);
}
