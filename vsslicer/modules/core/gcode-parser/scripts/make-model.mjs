// SPDX-License-Identifier: AGPL-3.0-or-later
// Writes an ASCII STL. Usage: node make-model.mjs cube <edge-mm> <out.stl>
//                         or: node make-model.mjs cylinder <diameter-mm> <height-mm> <out.stl>
import { writeFileSync } from 'node:fs';

const [kind, ...rest] = process.argv.slice(2);
const facets = []; // [a, b, c] points, counter-clockwise seen from outside

if (kind === 'cube') {
  const s = Number(rest[0]);
  if (!(s > 0)) throw new Error('edge must be positive');
  const v = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [(i & 1) * s, ((i >> 1) & 1) * s, ((i >> 2) & 1) * s]);
  for (const [a, b, c] of [
    [0, 2, 3],
    [0, 3, 1],
    [4, 5, 7],
    [4, 7, 6],
    [0, 1, 5],
    [0, 5, 4],
    [2, 6, 7],
    [2, 7, 3],
    [0, 4, 6],
    [0, 6, 2],
    [1, 3, 7],
    [1, 7, 5],
  ])
    facets.push([v[a], v[b], v[c]]);
} else if (kind === 'cylinder') {
  const r = Number(rest[0]) / 2;
  const h = Number(rest[1]);
  if (!(r > 0 && h > 0)) throw new Error('diameter and height must be positive');
  const n = 96; // enough segments for arc fitting to find arcs
  const p = (i, z) => [r + r * Math.cos((2 * Math.PI * i) / n), r + r * Math.sin((2 * Math.PI * i) / n), z];
  for (let i = 0; i < n; i++) {
    const [a0, a1, b0, b1] = [p(i, 0), p(i + 1, 0), p(i, h), p(i + 1, h)];
    facets.push([a0, a1, b1], [a0, b1, b0], [[r, r, 0], a1, a0], [[r, r, h], b0, b1]);
  }
} else throw new Error('usage: make-model.mjs cube <edge> <out> | cylinder <diameter> <height> <out>');

const out = rest[kind === 'cube' ? 1 : 2];
if (!out) throw new Error('missing output path');
const f = (n) => Number(n.toFixed(6));
let t = `solid ${kind}\n`;
for (const tri of facets) {
  t += ' facet normal 0 0 0\n  outer loop\n';
  for (const q of tri) t += `   vertex ${q.map(f).join(' ')}\n`;
  t += '  endloop\n endfacet\n';
}
writeFileSync(out, `${t}endsolid ${kind}\n`);
