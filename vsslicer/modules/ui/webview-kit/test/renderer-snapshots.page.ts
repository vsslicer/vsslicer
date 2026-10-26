// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of renderer-snapshots.spec.ts: a small deterministic part drawn by the real segment renderer.
import { ColorMode, createSegmentRenderer, type SegmentView } from '../src/gl/index.ts';

const STRIDE = 28;
const W = 360;
const H = 270;

/**
 * Four-layer 40 mm tower: per layer an external perimeter (role 2, 40 mm/s, 0.5 wide), an inner perimeter
 * (role 1, 60 mm/s, 0.45), a zigzag infill (role 6, 150 mm/s, 0.4) and travels between them; layer 3 uses
 * tool 1 and a thicker line. Layer times and flows differ, so every colour mode shows a gradient.
 */
function part(): { buffer: ArrayBuffer; layerStarts: number[] } {
  type Rec = { x: number; y: number; z: number; w: number; role: number; tool: number; flags: number; t: number };
  const recs: Rec[] = [{ x: 0, y: 0, z: 0, w: 0, role: 0, tool: 0, flags: 1, t: 0 }];
  const layerStarts: number[] = [];
  let t = 0;
  const go = (x: number, y: number, z: number, w: number, role: number, tool: number, mmps: number) => {
    const p = recs[recs.length - 1]!;
    const d = Math.hypot(x - p.x, y - p.y, z - p.z);
    recs.push({ x, y, z, w, role, tool, flags: w ? 0 : 1, t });
    t += d / mmps;
  };
  for (let k = 0; k < 4; k++) {
    layerStarts.push(recs.length);
    const z = 0.2 * (k + 1);
    const tool = k === 3 ? 1 : 0;
    const w = k === 3 ? 0.8 : 0.5;
    for (const [inset, role, v, ww] of [
      [0, 2, 40, w],
      [1, 1, 60, 0.45],
    ] as const) {
      const a = 10 + inset;
      const b = 50 - inset;
      go(a, a, z, 0, role, tool, 200);
      for (const [x, y] of [
        [b, a],
        [b, b],
        [a, b],
        [a, a],
      ] as const)
        go(x, y, z, ww, role, tool, v);
    }
    go(13, 13, z, 0, 6, tool, 200);
    for (let i = 0; i < 10; i++) {
      const y = 13 + 3.8 * i;
      go(i % 2 ? 13 : 47, y, z, i ? 0.4 : 0, 6, tool, 150);
      go(i % 2 ? 47 : 13, y + 1.9, z, 0.4, 6, tool, 150);
    }
  }
  go(0, 0, 1, 0, 0, 0, 200);
  const v = new DataView(new ArrayBuffer(recs.length * STRIDE));
  recs.forEach((r, i) => {
    const o = i * STRIDE;
    v.setFloat32(o, r.x, true);
    v.setFloat32(o + 4, r.y, true);
    v.setFloat32(o + 8, r.z, true);
    v.setFloat16(o + 12, r.w, true);
    v.setFloat16(o + 14, r.w ? 0.2 : 0, true);
    v.setUint8(o + 16, r.role);
    v.setUint8(o + 17, r.tool);
    v.setUint8(o + 18, r.flags);
    v.setUint32(o + 20, i, true);
    v.setFloat32(o + 24, r.t, true);
  });
  return { buffer: v.buffer, layerStarts };
}

// Orthographic camera looking at the part centre from 50 degrees above the bed, in front.
const A = (50 * Math.PI) / 180;
const [S, C] = [Math.sin(A), Math.cos(A)];
const CENTRE = [30, 30, 2];
const VIEW = new Float32Array([
  1,
  0,
  0,
  0,
  0,
  C,
  S,
  0,
  0,
  -S,
  C,
  0,
  -CENTRE[0]!,
  -(C * CENTRE[1]! - S * CENTRE[2]!),
  -(S * CENTRE[1]! + C * CENTRE[2]!) - 100,
  1,
]);
const HALF = 34; // mm shown above and below the centre
const PROJECTION = new Float32Array([
  1 / (HALF * (W / H)),
  0,
  0,
  0,
  0,
  1 / HALF,
  0,
  0,
  0,
  0,
  -2 / 299,
  0,
  0,
  0,
  -301 / 299,
  1,
]);

function render(o: Partial<SegmentView> = {}): void {
  const canvas = document.querySelector('canvas') ?? document.body.appendChild(document.createElement('canvas'));
  canvas.width = W;
  canvas.height = H;
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no WebGL2');
  const { buffer, layerStarts } = part();
  const r = createSegmentRenderer(gl, buffer, { layerStarts });
  gl.viewport(0, 0, W, H);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.1, 0.1, 0.12, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  r.draw({ view: VIEW, projection: PROJECTION, first: 1, count: 1e9, colorMode: ColorMode.Feature, ...o });
  if (gl.getError() !== 0) throw new Error('GL error');
  r.dispose();
}

Object.assign(globalThis, { render, layerStarts: part().layerStarts });
