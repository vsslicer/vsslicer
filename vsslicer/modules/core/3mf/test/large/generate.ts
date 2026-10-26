// SPDX-License-Identifier: AGPL-3.0-or-later
// Deterministic large 3MF (VWR-32): grid meshes of seeded heights, one object per 1000 rows, in a stored model part.
//   node test/large/generate.ts --size <MB> --seed <int> --out <file.3mf>
// Same size, seed and generator version give byte-identical output: never short of the size, at most one grid row
// (~150 KB) over it, so within 1% from 15 MB up (1 MB = 2^20 bytes).
// Stored, not deflated: mesh XML deflates about 3x, so a 500 MB deflated file is ~1.5 GB of parts, past the 1 GiB
// package cap (DEFAULT_MAX_TOTAL_BYTES); a stored 500 MB file is the largest the caps accept. Exit 0 written, 2 bad args.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { coreNs, minimalEntries } from '../support/minimalPackage.ts';
import { buildZip } from '../support/zipBuilder.ts';

const MB = 1024 * 1024;
const COLS = 1000;
const ROWS_PER_OBJECT = 1000;
/** The per-entry cap (DEFAULT_MAX_ENTRY_BYTES, 512 MiB) less headroom for the zip's own records. */
export const MAX_SIZE_MB = 510;

/** Throws unless `targetBytes` is 1..MAX_SIZE_MB MB and `seed` an integer; largeModel and the CLI both call it. */
export function checkArgs(targetBytes: number, seed: number): void {
  if (!Number.isFinite(targetBytes) || targetBytes < 1 || targetBytes > MAX_SIZE_MB * MB)
    throw new RangeError(`targetBytes must be 1..${MAX_SIZE_MB} MB`);
  if (!Number.isInteger(seed)) throw new RangeError('seed must be an integer');
}

/** The model XML, about `targetBytes` long, and its triangle count. */
export function largeModel(targetBytes: number, seed: number): { xml: Buffer; triangles: number } {
  checkArgs(targetBytes, seed);
  let s = seed >>> 0;
  const rnd = (): number => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32; // LCG, as mesh's generator
  const chunks: Buffer[] = [];
  let size = 0;
  const put = (text: string): void => {
    const b = Buffer.from(text, 'latin1');
    chunks.push(b);
    size += b.length;
  };
  put(
    `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="${coreNs}">\n<resources>\n`,
  );
  const tail = (ids: number): string =>
    `</resources>\n<build>\n${Array.from({ length: ids }, (_, i) => `<item objectid="${i + 1}"/>\n`).join('')}</build>\n</model>\n`;
  let triangles = 0;
  let id = 0;
  // An object is a COLS-wide grid; rows go on until the object is full or the file reaches its target.
  while (size + tail(id).length < targetBytes) {
    id++;
    const verts: string[] = [];
    const tris: string[] = [];
    let objectBytes = 0;
    for (let row = 0; row < ROWS_PER_OBJECT && size + objectBytes + tail(id).length < targetBytes; row++) {
      let v = '';
      for (let c = 0; c < COLS; c++)
        v += `<vertex x="${(c * 0.1).toFixed(3)}" y="${(row * 0.1).toFixed(3)}" z="${(rnd() * 10).toFixed(3)}"/>\n`;
      let t = '';
      if (row > 0) {
        const a = (row - 1) * COLS;
        const b = row * COLS;
        for (let c = 0; c < COLS - 1; c++)
          t += `<triangle v1="${a + c}" v2="${a + c + 1}" v3="${b + c}"/>\n<triangle v1="${a + c + 1}" v2="${b + c + 1}" v3="${b + c}"/>\n`;
        triangles += 2 * (COLS - 1);
      }
      verts.push(v);
      tris.push(t);
      objectBytes += v.length + t.length;
    }
    put(`<object id="${id}" type="model"><mesh>\n<vertices>\n`);
    for (const v of verts) put(v);
    put('</vertices>\n<triangles>\n');
    for (const t of tris) put(t);
    put('</triangles>\n</mesh></object>\n');
  }
  put(tail(id));
  return { xml: Buffer.concat(chunks, size), triangles };
}

/** The whole 3MF: content types, root relationships and the stored large model. */
export function large3mf(targetBytes: number, seed: number): { bytes: Uint8Array; triangles: number } {
  const { xml, triangles } = largeModel(targetBytes, seed);
  const entries = minimalEntries({ '3D/3dmodel.model': null });
  return { bytes: buildZip([...entries, { name: '3D/3dmodel.model', data: xml, method: 0 }]), triangles };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const usage = 'usage: node test/large/generate.ts --size <MB> --seed <int> --out <file.3mf>';
  let v: { size?: string; seed?: string; out?: string };
  try {
    ({ values: v } = parseArgs({
      options: { size: { type: 'string' }, seed: { type: 'string' }, out: { type: 'string' } },
    }));
  } catch (e) {
    console.error(`${(e as Error).message}\n${usage}`);
    process.exit(2);
  }
  const mb = Number(v.size);
  let ok = /^\d+$/.test(v.size ?? '') && /^\d+$/.test(v.seed ?? '') && !!v.out;
  try {
    if (ok) checkArgs(mb * MB, Number(v.seed));
  } catch {
    ok = false;
  }
  if (!ok || !v.out) {
    console.error(usage);
    process.exit(2);
  }
  const { bytes, triangles } = large3mf(mb * MB, Number(v.seed));
  writeFileSync(v.out, bytes);
  console.log(JSON.stringify({ out: v.out, bytes: bytes.length, triangles }));
}
