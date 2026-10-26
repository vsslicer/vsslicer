// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of memory.spec.ts: 15 million synthetic moves through the real renderer.
import { ColorMode, createSegmentRenderer } from '../src/gl/index.ts';
import { spyGlUploads } from '../src/testing/gl-spy.ts';
import { STRIDE, writeSyntheticMoves } from './synthetic-moves.ts';

const VIEW = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -32, -32, -10, 1]);
const PROJECTION = new Float32Array([1 / 32, 0, 0, 0, 0, 1 / 32, 0, 0, 0, 0, -2 / 19, 0, 0, 0, -21 / 19, 1]);

function run(count: number) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no WebGL2');
  // Generated chunk by chunk straight into the one buffer the renderer uploads.
  const buffer = new ArrayBuffer(count * STRIDE);
  const layerStarts: number[] = [];
  for (let first = 0; first < count; first += 1 << 20) {
    layerStarts.push(...writeSyntheticMoves(buffer, first, Math.min(count, first + (1 << 20))));
  }
  const spy = spyGlUploads(gl);
  const r = createSegmentRenderer(spy.gl, buffer, { layerStarts });
  gl.viewport(0, 0, 64, 64);
  gl.clear(gl.COLOR_BUFFER_BIT);
  r.draw({ view: VIEW, projection: PROJECTION, first: 1, count, colorMode: ColorMode.Speed });
  const px = new Uint8Array(4);
  gl.readPixels(32, 32, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); // forces the draw to finish
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = dbg ? (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string) : 'unknown';
  const out = {
    storageBytes: spy.storageBytes(),
    error: gl.getError(),
    gpu,
    maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
  };
  r.dispose();
  return out;
}

Object.assign(globalThis, { run });
