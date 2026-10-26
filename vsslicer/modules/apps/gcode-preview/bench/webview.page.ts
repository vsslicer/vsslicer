// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of webview-case.ts: moves arrive as per-chunk buffers, are concatenated and uploaded as the webview does.
import { createGl2Context } from '@vsslicer/webview-kit/gl';
import type { Layer } from '@vsslicer/gcode-api';
import { MOVE_STRIDE } from '@vsslicer/gcode-api';
import { concatMoves, createPreviewRenderer } from '../src/presentation/webview/preview-renderer.ts';

const CHUNK_MOVES = 150_000; // about 4 MB, the order of the parser's chunks

/** Filler moves with an extruding width/height (f16 0.4); only the byte count matters for memory. */
function chunk(n: number, seed: number): ArrayBuffer {
  const buf = new ArrayBuffer(n * MOVE_STRIDE);
  const f = new Float32Array(buf);
  const u = new Uint32Array(buf);
  for (let i = 0; i < n; i++) {
    const o = i * (MOVE_STRIDE / 4);
    f[o] = 10 + ((i * 7 + seed) % 2300) / 10;
    f[o + 1] = 10 + ((i * 13 + seed) % 2300) / 10;
    f[o + 2] = 0.2 + (seed % 100) * 0.2;
    u[o + 3] = 0x36663666;
  }
  return buf;
}

async function run(moveCount: number): Promise<{ glError: number }> {
  const chunks: ArrayBuffer[] = [];
  for (let left = moveCount, s = 0; left > 0; left -= CHUNK_MOVES, s++)
    chunks.push(chunk(Math.min(CHUNK_MOVES, left), s));
  const layers: Layer[] = [];
  for (let i = 0; i * 60_000 < moveCount; i++) layers.push({ z: 0.2 * (i + 1), firstMove: i * 60_000 });
  const moves = concatMoves(chunks);
  chunks.length = 0; // the webview keeps the concatenated copy only
  const canvas = document.querySelector('canvas')!;
  const gl = createGl2Context(canvas);
  if (!gl.ok) throw gl.error;
  const renderer = createPreviewRenderer(canvas, gl.gl, moves, layers);
  renderer.draw({ layer: layers.length - 1 });
  gl.gl.finish();
  return { glError: gl.gl.getError() };
}

Object.assign(globalThis, { run });
