// SPDX-License-Identifier: AGPL-3.0-or-later
// Webview side: draws the received move buffers with webview-kit's instanced segment renderer and a camera
// that frames the print. Orbit/pan/zoom (GCP-33), colour modes (GCP-32) and sliders (GCP-35) build on this.
/*! gcode-preview bundles @vsslicer/webview-kit/gl, which contains a port of OrcaSlicer libvgcode
 * (OrcaSlicer@09aa0114b4e145b89cd61015d8cdf29dbc15b008:src/libvgcode), AGPL-3.0-or-later,
 * Copyright (c) Prusa Research 2023 Enrico Turri, Pavel Mikuš, Vojtěch Bubník, Oleksandra Iushchenko,
 * and OrcaSlicer contributors. */
import { MOVE_STRIDE, MoveFlag, type Layer } from '@vsslicer/gcode-api';
import { splitRange } from '../../domain/panel.ts';
import { cameraMatrices, presetCamera, type CameraState } from './camera.ts';
import {
  ColorMode,
  createSegmentRenderer,
  showGlFailure,
  trackContextLoss,
  type GlContextError,
  type SegmentRenderer,
} from '@vsslicer/webview-kit/gl';

/** What is visible; kept in the webview state. */
export interface Visibility {
  /** Top visible layer: moves from the start up to the end of this layer are drawn. */
  layer: number;
  /** Lowest visible layer (default 0): the range is `bottom` to `layer`. */
  bottom?: number;
  /** Moves of the top layer shown (default all): the move slider. */
  move?: number;
  /** Bit per `MoveRole`; default all. */
  roleMask?: number;
  /** `MoveFlag` bits to hide; default travels. */
  hiddenFlags?: number;
  /** Default `Feature`. Changing it sets a uniform; nothing is uploaded again. */
  colorMode?: ColorMode;
  /** Default: the iso view fitting the print. */
  camera?: CameraState;
}

export interface PreviewRenderer {
  /** Bounding box of the print and the data ranges of the gradient modes (undefined while the context is lost). */
  readonly bounds: [number[], number[]];
  readonly ranges: () => SegmentRenderer['ranges'] | undefined;
  /** `highlight`: global move ranges `[first, end)` drawn in the highlight colour (an object hovered in the side panel). */
  draw(visibility: Visibility, highlight?: readonly [number, number][]): void;
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

/**
 * Global move range `first .. first + count - 1`: from the start of layer `bottom` to the end of `layer`, or to
 * `move` moves into it (all moves without layers).
 */
export const visibleRange = (layers: readonly Layer[], moveCount: number, layer: number, move?: number, bottom = 0) => {
  const first = bottom > 0 ? (layers[bottom]?.firstMove ?? 0) : 0; // layer 0 keeps the moves before it
  const layerEnd = layer + 1 < layers.length ? layers[layer + 1]!.firstMove : moveCount;
  const end = move == null ? layerEnd : Math.min(layerEnd, (layers[layer]?.firstMove ?? 0) + move);
  return { first, count: Math.max(0, end - first) };
};

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

/** Column-major view and projection of a camera (the iso preset fitting the box by default). */
export const frameCamera = (bounds: [number[], number[]], aspect: number, camera = presetCamera(bounds, aspect)) =>
  cameraMatrices(camera, aspect);

const HIGHLIGHT_RANGE = [1e9, 2e9] as const;

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
  let lastHighlight: readonly [number, number][] | undefined;
  const draw = (vis: Visibility, highlight?: readonly [number, number][]) => {
    last = vis;
    lastHighlight = highlight;
    if (!renderer || gl.isContextLost()) return;
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const base = {
      ...frameCamera(bounds, w / Math.max(1, h), vis.camera),
      colorMode: vis.colorMode ?? ColorMode.Feature,
      roleMask: vis.roleMask,
      hiddenFlags: vis.hiddenFlags ?? MoveFlag.Travel,
    };
    const visible = visibleRange(layers, moveCount, vis.layer, vis.move, vis.bottom);
    if (!highlight?.length) return renderer.draw({ ...base, ...visible });
    // The object's moves are left out of the normal draw and drawn again alone, so equal depths never fight.
    // Width mode with a range far above any width paints them with the gradient's first colour.
    const { hit, rest } = splitRange(visible, highlight);
    for (const [a, b] of rest) renderer.draw({ ...base, first: a, count: b - a });
    for (const [a, b] of hit)
      renderer.draw({ ...base, first: a, count: b - a, colorMode: ColorMode.Width, colorRange: HIGHLIGHT_RANGE });
  };
  const resources = trackContextLoss(canvas, {
    onLost: () => (renderer = undefined),
    onRestored: (err) =>
      err
        ? // the kit's GlFailureCause has no 'restore' yet; showGlFailure reads only cause and message
          showGlFailure(canvas, {
            cause: 'restore',
            message: `The 3D view could not be restored after a graphics reset: ${String(err)}`,
          } as unknown as GlContextError)
        : last && draw(last, lastHighlight),
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
    bounds,
    ranges: () => renderer?.ranges,
    draw,
    dispose() {
      resources.dispose();
      renderer = undefined;
    },
  };
};
