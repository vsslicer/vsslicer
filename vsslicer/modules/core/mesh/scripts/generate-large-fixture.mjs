// SPDX-License-Identifier: AGPL-3.0-or-later
// Deterministic binary STL of about N triangles (bumpy sphere, closed), streamed to disk.
// usage: node scripts/generate-large-fixture.mjs <triangles> <out.stl> [seed]
// The count is 2*seg*(rings-1), the nearest the grid allows; the header holds the exact number.
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';

const [target, out, seedArg = '1'] = process.argv.slice(2);
const want = Number(target);
if (!Number.isInteger(want) || want < 8 || !out) {
  console.error('usage: generate-large-fixture.mjs <triangles >= 8> <out.stl> [seed]');
  process.exit(2);
}
const rings = Math.max(2, Math.round(Math.sqrt(want / 4)));
const seg = Math.max(3, Math.round(want / (2 * (rings - 1))));
const tris = 2 * seg * (rings - 1);
let s = Number(seedArg) >>> 0;
const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32; // LCG
const ph0 = rnd() * 6.28;
const ph1 = rnd() * 6.28;
const point = (i, j) => {
  if (j === 0 || j === rings) return [0, 0, j === 0 ? 10 : -10]; // one exact vertex per pole so the fans weld
  const th = (Math.PI * j) / rings;
  const ph = (2 * Math.PI * (i % seg)) / seg;
  const r = 10 * (1 + 0.05 * Math.sin(7 * ph + ph0) * Math.sin(5 * th + ph1));
  return [r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)];
};

const ws = createWriteStream(out);
const head = Buffer.alloc(84);
head.write('vsslicer large fixture');
head.writeUInt32LE(tris, 80);
ws.write(head);
const CHUNK = 20000;
let buf = Buffer.alloc(50 * CHUNK);
let n = 0;
let total = 0;
const tri = async (a, b, c) => {
  const o = n * 50; // normal stays zero (readers recompute); attribute bytes zero
  buf.fill(0, o, o + 50);
  [a, b, c].forEach((p, k) => p.forEach((v, m) => buf.writeFloatLE(v, o + 12 + 12 * k + 4 * m)));
  total++;
  if (++n === CHUNK) {
    if (!ws.write(buf)) await once(ws, 'drain');
    buf = Buffer.alloc(50 * CHUNK); // the written buffer is still owned by the stream
    n = 0;
  }
};
for (let j = 0; j < rings; j++) {
  for (let i = 0; i < seg; i++) {
    const a = point(i, j),
      b = point(i + 1, j),
      c = point(i + 1, j + 1),
      d = point(i, j + 1);
    if (j === 0)
      await tri(a, d, c); // wound outward (positive volume)
    else if (j === rings - 1) await tri(a, c, b);
    else {
      await tri(a, c, b);
      await tri(a, d, c);
    }
  }
}
if (n) ws.write(buf.subarray(0, n * 50));
ws.end();
await once(ws, 'finish');
if (total !== tris) throw new Error(`wrote ${total}, expected ${tris}`);
console.log(`${out}: ${tris} triangles`);
