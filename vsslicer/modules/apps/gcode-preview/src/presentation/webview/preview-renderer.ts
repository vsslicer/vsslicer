// SPDX-License-Identifier: AGPL-3.0-or-later
// Webview side: draws the received move buffers with webview-kit's instanced segment renderer and a camera
// that frames the print. Orbit/pan/zoom (GCP-33), colour modes (GCP-32) and sliders (GCP-35) build on this.
/*! gcode-preview bundles @vsslicer/webview-kit/gl, which contains a port of OrcaSlicer libvgcode
 * (OrcaSlicer@09aa0114b4e145b89cd61015d8cdf29dbc15b008:src/libvgcode), AGPL-3.0-or-later,
 * Copyright (c) Prusa Research 2023 Enrico Turri, Pavel Mikuš, Vojtěch Bubník, Oleksandra Iushchenko,
 * and OrcaSlicer contributors. */
import { MOVE_STRIDE, MoveFlag, type Layer } from '@vsslicer/gcode-api';
import { ColorMode, createSegmentRenderer, trackContextLoss, type SegmentRenderer } from '@vsslicer/webview-kit/gl';

/** What is visible; kept in the webview state. */
export interface Visibility {
  /** Top visible layer: moves from the start up to the end of this layer are drawn. */
  layer: number;
  /** Bit per `MoveRole`; default all. */
  roleMask?: number;
  /** `MoveFlag` bits to hide; default travels. */
  hiddenFlags?: number;
}

export interface PreviewRenderer {
  draw(visibility: Visibility): void;
  /** Frees every GPU object and stops listening for context loss. */
  dispose(): void;
}

/**
 * One contiguous buffer from the parser's per-chunk buffers (the kit renderer takes one, SP4 audit finding 8).
 * shortcut: one copy, so the moves are briefly held twice (about 420 MB at 15M moves); upload per chunk if that bites.
 */
export const concatMoves = (buffers: readonly ArrayBuffer[]): ArrayBuffer => {
  if (buffers.length === 1) return buffers[0]!;
  const out = new Uint8Array(buffers.reduce((n, b) => n + b.byteLength, 0));
  let at = 0;
  for (const b of buffers) {
    out.set(new Uint8Array(b), at);
    at += b.byteLength;
  }
  return out.buffer;
};

/** Global move range `first .. first + count - 1` up to the end of `layer` (all moves without layers). */
export const visibleRange = (layers: readonly Layer[], moveCount: number, layer: number) => ({
  first: 0,
  count: layer + 1 < layers.length ? layers[layer + 1]!.firstMove : moveCount,
});

/** Min and max corner of the extruding moves' end points (all moves if none extrudes). */
export const printBounds = (moves: ArrayBuffer): [number[], number[]] => {
  const v = new DataView(moves);
  const box = (extrudingOnly: boolean): [number[], number[]] => {
    const lo = [Infinity, Infinity, Infinity];
    const hi = [-Infinity, -Infinity, -Infinity];
    for (let o = 0; o < moves.byteLength; o += MOVE_STRIDE) {
      if (extrudingOnly && v.getUint32(o + 12, true) === 0) continue; // width and height both 0
      for (let i = 0; i < 3; i++) {
        const x = v.getFloat32(o + 4 * i, true);
        lo[i] = Math.min(lo[i]!, x);
        hi[i] = Math.max(hi[i]!, x);
      }
    }
    return [lo, hi];
  };
  const b = box(true);
  if (b[0][0]! <= b[1][0]!) return b;
  const all = box(false);
  return all[0][0]! <= all[1][0]!
    ? all
    : [
        [0, 0, 0],
        [0, 0, 0],
      ];
};

const FOV = Math.PI / 4;

/** Column-major view and projection looking at the box from the front, above (Z up), fitting its bounding sphere. */
export const frameCamera = ([lo, hi]: [number[], number[]], aspect: number) => {
  const c = [0, 1, 2].map((i) => (lo[i]! + hi[i]!) / 2);
  const r = Math.max(1, Math.hypot(hi[0]! - lo[0]!, hi[1]! - lo[1]!, hi[2]! - lo[2]!) / 2);
  const dist = r / Math.sin(Math.min(FOV, FOV * aspect) / 2);
  // forward f points from the eye at the centre: from (0, -1, 1) direction
  const f = [0, Math.SQRT1_2, -Math.SQRT1_2];
  const eye = c.map((x, i) => x - dist * f[i]!);
  const s = [1, 0, 0]; // f x up(0,0,1), normalised
  const u = [0, Math.SQRT1_2, Math.SQRT1_2]; // s x f
  const dot = (a: number[], b: number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
  const view = new Float32Array([
    s[0]!, u[0]!, -f[0]!, 0,
    s[1]!, u[1]!, -f[1]!, 0,
    s[2]!, u[2]!, -f[2]!, 0,
    -dot(s, eye), -dot(u, eye), dot(f, eye), 1,
  ]); // prettier-ignore
  const near = Math.max(0.1, dist - 2 * r);
  const far = dist + 2 * r;
  const t = 1 / Math.tan(FOV / 2);
  const projection = new Float32Array([
    t / aspect, 0, 0, 0,
    0, t, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ]); // prettier-ignore
  return { view, projection };
};

/** Uploads `moves` once (rebuilt after a context loss) and draws the visible part on `draw`. */
export const createPreviewRenderer = (
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  moves: ArrayBuffer,
  layers: readonly Layer[],
  options: { maxTextureSize?: number } = {},
): PreviewRenderer => {
  const moveCount = moves.byteLength / MOVE_STRIDE;
  const bounds = printBounds(moves);
  let renderer: SegmentRenderer | undefined;
  let last: Visibility | undefined;
  const draw = (vis: Visibility) => {
    last = vis;
    if (!renderer || gl.isContextLost()) return;
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    renderer.draw({
      ...frameCamera(bounds, w / Math.max(1, h)),
      ...visibleRange(layers, moveCount, vis.layer),
      colorMode: ColorMode.Feature,
      roleMask: vis.roleMask,
      hiddenFlags: vis.hiddenFlags ?? MoveFlag.Travel,
    });
  };
  const resources = trackContextLoss(canvas, {
    onLost: () => (renderer = undefined),
    onRestored: () => last && draw(last),
  });
  resources.add(() => {
    const r = createSegmentRenderer(gl, moves, {
      layerStarts: layers.map((l) => l.firstMove),
      maxTextureSize: options.maxTextureSize,
    });
    renderer = r;
    return () => r.dispose();
  });
  return {
    draw,
    dispose() {
      resources.dispose();
      renderer = undefined;
    },
  };
};
