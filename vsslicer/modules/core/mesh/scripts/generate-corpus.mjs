// SPDX-License-Identifier: AGPL-3.0-or-later
// Writes the STL/OBJ corpus into test/fixtures/stl-obj (our own files, deterministic). Usage: node scripts/generate-corpus.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'test', 'fixtures', 'stl-obj');
mkdirSync(out, { recursive: true });

// Box 10 x 20 x 30 from (1,2,3); corners indexed by bits x=1 y=2 z=4. Triangles are counter-clockwise from outside.
const V = [...Array(8)].map((_, i) => [1 + (i & 1) * 10, 2 + ((i >> 1) & 1) * 20, 3 + ((i >> 2) & 1) * 30]);
const quads = [
  [0, 2, 3, 1],
  [4, 5, 7, 6],
  [0, 1, 5, 4],
  [2, 6, 7, 3],
  [0, 4, 6, 2],
  [1, 3, 7, 5],
];
const tris = quads.flatMap(([a, b, c, d]) => [
  [a, b, c],
  [a, c, d],
]);
const normal = (t) => {
  const [p, q, r] = t.map((i) => V[i]);
  const u = q.map((v, k) => v - p[k]),
    w = r.map((v, k) => v - p[k]);
  const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  const l = Math.hypot(...n);
  return n.map((v) => v / l);
};

function binary(triangles = tris, { header = 'binary box', declared = triangles.length, mutate } = {}) {
  const b = Buffer.alloc(84 + 50 * triangles.length);
  b.write(header, 0, 'latin1');
  b.writeUInt32LE(declared, 80);
  triangles.forEach((t, n) => {
    const o = 84 + 50 * n;
    [normal(t), ...t.map((i) => V[i])].flat().forEach((v, k) => b.writeFloatLE(v, o + 4 * k));
  });
  mutate?.(b);
  return b;
}
const ascii = (eol = '\n', pad = '') =>
  [
    `solid box`,
    ...tris.flatMap((t) => [
      `${pad}facet normal ${normal(t).join(' ')}`,
      `${pad}  outer loop`,
      ...t.map((i) => `${pad}    vertex ${V[i].join(pad ? '\t  ' : ' ')}`),
      `${pad}  endloop`,
      `${pad}endfacet`,
    ]),
    `endsolid box`,
  ].join(eol) + eol;
const vLines = V.map((v) => `v ${v.join(' ')}`);
const f = (a) => `f ${a.join(' ')}`;
const w = (name, data) => writeFileSync(join(out, name), data);

w('box-binary.stl', binary());
w('box-ascii.stl', ascii());
w('box-ascii-crlf.stl', ascii('\r\n', '  ').replace(/endfacet/g, 'endfacet \t')); // CRLF, indented, tabs, trailing blanks
w('box-binary-solid-header.stl', binary(tris, { header: 'solid box exported by a careless tool' }));
w('box-binary-truncated.stl', binary().subarray(0, 84 + 50 * 5 + 17)); // cut inside the sixth triangle
w('box-binary-count-too-large.stl', binary(tris, { declared: 20 })); // 12 triangles present
w('box-binary-count-too-small.stl', binary(tris, { declared: 10 })); // 12 present: trailing data
w('box-binary-nan.stl', binary(tris, { mutate: (b) => b.writeFloatLE(NaN, 84 + 50 * 3 + 12) }));
w('box-binary-infinite.stl', binary(tris, { mutate: (b) => b.writeFloatLE(-Infinity, 84 + 50 * 7 + 24) }));
w('box-binary-header-only.stl', binary([], { header: 'empty' }).subarray(0, 60)); // shorter than the 84-byte header

w('box-quads.obj', ['# box with quad faces', ...vLines, ...quads.map((q) => f(q.map((i) => i + 1)))].join('\n') + '\n');
w(
  'box-negative-indices.obj',
  ['# negative (relative) indices', ...vLines, ...tris.map((t) => f(t.map((i) => i - 8)))].join('\n') + '\n',
);
w(
  'box-groups.obj',
  [
    '# two groups, normals and texture slots',
    'o box',
    ...vLines,
    'vn 0 0 1',
    'vt 0 0',
    'g lower',
    ...tris.slice(0, 6).map((t) => f(t.map((i) => `${i + 1}/1/1`))),
    'g upper',
    ...tris.slice(6).map((t) => f(t.map((i) => `${i + 1}//1`))),
  ].join('\n') + '\n',
);
w(
  'box-index-out-of-range.obj',
  ['# face 3 names vertex 9 of 8', ...vLines, f([1, 2, 3]), f([1, 3, 4]), f([1, 2, 9])].join('\n') + '\n',
);
console.log('corpus written to', out);
