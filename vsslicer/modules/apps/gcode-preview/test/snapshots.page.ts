// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of snapshots.spec.ts: the preview's own renderer (as main.ts builds it) drawing a parsed corpus file.
import { createGl2Context } from '@vsslicer/webview-kit/gl';
import type { Layer } from '@vsslicer/gcode-api';
import { MOVE_STRIDE, MoveFlag } from '@vsslicer/gcode-api';
import { presetCamera } from '../src/presentation/webview/camera.ts';
import {
  createPreviewRenderer,
  type PreviewRenderer,
  type Visibility,
} from '../src/presentation/webview/preview-renderer.ts';

let renderer: PreviewRenderer | undefined;

/**
 * Box of the non-travel moves from layer 2 up: the first layers hold the purge line, which would shrink the part to
 * a dot. (The preview's own printBounds keys on the width column, which the PrusaSlicer fixture leaves at 0, so it
 * falls back to every move, travels included.)
 */
function partBounds(moves: ArrayBuffer, layers: Layer[]): [number[], number[]] {
  const v = new DataView(moves);
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let o = (layers[2]?.firstMove ?? 0) * MOVE_STRIDE; o < moves.byteLength; o += MOVE_STRIDE) {
    if (v.getUint8(o + 18) & MoveFlag.Travel) continue;
    for (let i = 0; i < 3; i++) {
      const x = v.getFloat32(o + 4 * i, true);
      lo[i] = Math.min(lo[i]!, x);
      hi[i] = Math.max(hi[i]!, x);
    }
  }
  return [lo, hi];
}

/** Uploads `base64` moves (little-endian records) and the layer table, then draws `vis` on the page's canvas. */
function show(base64: string, layers: Layer[], vis: Visibility): void {
  const canvas = document.querySelector('canvas')!;
  renderer?.dispose();
  const gl = createGl2Context(canvas);
  if (!gl.ok) throw gl.error;
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  renderer = createPreviewRenderer(canvas, gl.gl, bytes.buffer, layers);
  renderer.draw({
    ...vis,
    camera: presetCamera(partBounds(bytes.buffer, layers), canvas.width / canvas.height, 'iso'),
  });
  if (gl.gl.getError() !== 0) throw new Error('GL error');
}

Object.assign(globalThis, { show });
