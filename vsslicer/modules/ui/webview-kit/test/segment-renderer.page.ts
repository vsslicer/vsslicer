// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of segment-renderer.spec.ts: bundled by esbuild and run in Chromium on SwiftShader.
import { ColorMode, createSegmentRenderer, type SegmentView } from '../src/gl/index.ts';

const STRIDE = 28;
const SIZE = 64; // canvas pixels = mm, origin bottom left

/**
 * Fixed synthetic move set. Record 0 is the start. Layer 0 (z 0.2) is eight rows on the left, layer 1
 * (z 0.4) eight rows on the right; each row is a travel to its start and one 28 mm extrusion along x at
 * y = 8i + 4. Left: role Perimeter, tool 0, 1 s per row (28 mm/s). Right: role ExternalPerimeter, tool 1,
 * flag Arc, 0.1 s per row (280 mm/s). A last travel ends the final extrusion so its speed is known.
 */
export function moves(): { buffer: ArrayBuffer; layerStarts: number[] } {
  // x, y, z, width, role, tool, flags, duration of the move this record ends
  const recs: number[][] = [[0, 0, 0, 0, 0, 0, 1, 0]];
  const layerStarts: number[] = [];
  for (const right of [0, 1]) {
    layerStarts.push(recs.length);
    const [x0, z, dt] = right ? [34, 0.4, 0.1] : [2, 0.2, 1];
    for (let i = 0; i < 8; i++) {
      recs.push([x0, 8 * i + 4, z, 0, 0, right, 1, 0.01]);
      recs.push([x0 + 28, 8 * i + 4, z, 0.6 * 5, right ? 2 : 1, right, right ? 16 : 0, dt]);
    }
  }
  recs.push([0, 0, 1, 0, 0, 0, 1, 0.5]);
  const v = new DataView(new ArrayBuffer(recs.length * STRIDE));
  let t = 0;
  recs.forEach(([x, y, z, w, role, tool, flags, dt], i) => {
    const o = i * STRIDE;
    t += dt!; // record i's move starts when move i - 1 ends
    v.setFloat32(o, x!, true);
    v.setFloat32(o + 4, y!, true);
    v.setFloat32(o + 8, z!, true);
    v.setFloat16(o + 12, w!, true);
    v.setFloat16(o + 14, w ? 0.2 : 0, true);
    v.setUint8(o + 16, role!);
    v.setUint8(o + 17, tool!);
    v.setUint8(o + 18, flags!);
    v.setUint32(o + 20, i, true);
    v.setFloat32(o + 24, t - dt!, true);
  });
  return { buffer: v.buffer, layerStarts };
}

// Top-down orthographic camera 10 mm above the bed centre.
const VIEW = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -32, -32, -10, 1]);
const PROJECTION = new Float32Array([1 / 32, 0, 0, 0, 0, 1 / 32, 0, 0, 0, 0, -2 / 19, 0, 0, 0, -21 / 19, 1]);

/**
 * State changes for the move set: fan 0 on layer 0 and 100% from layer 1 (record 17); hotend T0 200 and
 * T1 250 C at move 0, tool 1 from record 17. So left is the low end of both ranges, right the high end.
 */
export function stateChanges(): ArrayBuffer {
  const rows = [
    [0, 2, 0, 200],
    [0, 2, 1, 250],
    [17, 1, 0, 1],
    [17, 20, 0, 1],
  ];
  const v = new DataView(new ArrayBuffer(12 * rows.length));
  rows.forEach(([move, kind, index, value], i) => {
    v.setUint32(12 * i, move!, true);
    v.setFloat32(12 * i + 4, value!, true);
    v.setUint8(12 * i + 8, kind!);
    v.setUint8(12 * i + 9, index!);
  });
  return v.buffer;
}

type Options = Partial<SegmentView> & { records?: number; maxTextureSize?: number; states?: boolean };

/** Renders the move set (optionally truncated to `records`) and returns the RGBA pixels. */
function render(o: Options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no WebGL2');
  const { buffer, layerStarts } = moves();
  const data = o.records ? buffer.slice(0, o.records * STRIDE) : buffer;
  const r = createSegmentRenderer(gl, data, {
    layerStarts,
    maxTextureSize: o.maxTextureSize,
    stateChanges: o.states ? [stateChanges()] : undefined,
  });
  gl.viewport(0, 0, SIZE, SIZE);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  r.draw({ view: VIEW, projection: PROJECTION, first: 1, count: 1e9, colorMode: ColorMode.Feature, ...o });
  const px = new Uint8Array(SIZE * SIZE * 4);
  gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, px);
  const at = (x: number, y: number) => Array.from(px.subarray(4 * (y * SIZE + x), 4 * (y * SIZE + x) + 3));
  const error = gl.getError();
  r.dispose();
  // Centre of the first left row and the first right row.
  return { px: Array.from(px), left: at(16, 4), right: at(48, 4), ranges: r.ranges, error };
}

Object.assign(globalThis, { render, layerStarts: moves().layerStarts });
