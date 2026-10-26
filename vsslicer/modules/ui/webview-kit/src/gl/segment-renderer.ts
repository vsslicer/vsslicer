// SPDX-License-Identifier: AGPL-3.0-or-later
import { saveGlState } from './gl-state.ts';
import { MOVE_WORDS, uploadMoveTextures, type MoveTextureChunk } from './move-textures.ts';
import { PALETTE_ROWS, PALETTE_WIDTH, SEGMENT_FS, SEGMENT_INDICES, SEGMENT_VS } from './segment-shader.ts';

/** Colour modes, the value of the `uMode` uniform. */
export const ColorMode = { Feature: 0, Speed: 1, Tool: 2, LayerTime: 3 } as const;
export type ColorMode = (typeof ColorMode)[keyof typeof ColorMode];

/** What one `draw` shows. Changing any of it sets uniforms only; nothing is uploaded. */
export interface SegmentView {
  /** World to eye, column-major 4x4 (rigid: rotation and translation). */
  view: Float32List;
  /** Eye to clip, column-major 4x4. */
  projection: Float32List;
  /** Visible moves are global indices `first .. first + count - 1` (move 0 is never drawn). */
  first: number;
  count: number;
  colorMode: ColorMode;
  /** Bit `r` shows `MoveRole` r; default all. */
  roleMask?: number;
  /** Moves with any of these `MoveFlag` bits are hidden (e.g. `MoveFlag.Travel`); default none. */
  hiddenFlags?: number;
  /** Value mapped to the first and last gradient colour in speed (mm/s) and layer-time (s) modes; default from `ranges`. */
  colorRange?: readonly [number, number];
}

export interface SegmentRenderer {
  /** Min and max over the data: speed of non-travel moves (mm/s), layer time (s); `[0, 0]` when unknown. */
  readonly ranges: { speed: [number, number]; layerTime: [number, number] };
  /**
   * Draws the visible moves with depth test and writes on, culling and blending off. Leaves that state,
   * its program, VAO and textures (units 0-2) bound, unless created with `foreign: true`.
   */
  draw(view: SegmentView): void;
  /** Frees every GPU object. */
  dispose(): void;
}

const STRIDE = MOVE_WORDS * 4;
const NAN_BITS = 0x7fc00000;

/** Chunk-local records `lo .. lo + n - 1` that end a visible move, or null; local record 0 starts the chunk. */
export function chunkInstances(
  chunk: { firstRecord: number; recordCount: number },
  first: number,
  count: number,
): { lo: number; n: number } | null {
  const lo = Math.max(1, first - chunk.firstRecord);
  const hi = Math.min(chunk.recordCount - 1, first + count - 1 - chunk.firstRecord);
  return hi >= lo ? { lo, n: hi - lo + 1 } : null;
}

/** Layer table texels `[firstMove, f32 bits of layer time]` and the data ranges; one pass over the moves. */
export function analyseMoves(
  moves: ArrayBuffer,
  layerStarts: readonly number[],
): { table: Uint32Array; ranges: SegmentRenderer['ranges'] } {
  const v = new DataView(moves);
  const n = moves.byteLength / STRIDE;
  const start = (r: number) => v.getFloat32(r * STRIDE + 24, true);
  const span = (): [number, number] => [Infinity, -Infinity];
  const widen = (s: [number, number], x: number) => {
    if (!Number.isFinite(x)) return;
    s[0] = Math.min(s[0], x);
    s[1] = Math.max(s[1], x);
  };
  const speed = span();
  for (let r = 1; r + 1 < n; r++) {
    if (v.getUint8(r * STRIDE + 18) & 1) continue; // MoveFlag.Travel
    const d = start(r + 1) - start(r);
    if (!(d > 0)) continue;
    const o = r * STRIDE;
    const len = Math.hypot(
      v.getFloat32(o, true) - v.getFloat32(o - STRIDE, true),
      v.getFloat32(o + 4, true) - v.getFloat32(o - STRIDE + 4, true),
      v.getFloat32(o + 8, true) - v.getFloat32(o - STRIDE + 8, true),
    );
    widen(speed, len / d);
  }
  const table = new Uint32Array(2 * layerStarts.length);
  const f32 = new Float32Array(table.buffer);
  const layerTime = span();
  layerStarts.forEach((first, i) => {
    const next = i + 1 < layerStarts.length ? layerStarts[i + 1]! : n - 1;
    const t = first < n && next < n ? start(next) - start(first) : NaN;
    table[2 * i] = first;
    f32[2 * i + 1] = t;
    widen(layerTime, t);
  });
  const done = (s: [number, number]): [number, number] => (s[0] <= s[1] ? s : [0, 0]);
  return { table, ranges: { speed: done(speed), layerTime: done(layerTime) } };
}

function compile(gl: WebGL2RenderingContext): WebGLProgram {
  const p = gl.createProgram();
  for (const [type, src] of [
    [gl.VERTEX_SHADER, SEGMENT_VS],
    [gl.FRAGMENT_SHADER, SEGMENT_FS],
  ] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile');
    gl.attachShader(p, s);
    gl.deleteShader(s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program link');
  return p;
}

function texture(
  gl: WebGL2RenderingContext,
  format: number,
  w: number,
  h: number,
  upload: (w: number) => void,
): WebGLTexture {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texStorage2D(gl.TEXTURE_2D, 1, format, w, h);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  upload(w);
  return t;
}

/**
 * Instanced segment renderer: one 8-corner prism template drawn once per visible move, the move data
 * read from the PLT-42 data textures, coloured in the shader from a palette texture. Everything is
 * uploaded here, once; `draw` only sets uniforms. `layerStarts` are the global first moves of each layer
 * (`Layer.firstMove` of `@vsslicer/gcode-api`), ascending; layer-time mode needs them.
 * `foreign: true` is for a context another renderer owns (three.js): creating and each `draw` save
 * the GL state they change and restore it after (`saveGlState`), so that renderer's state cache stays true.
 */
export function createSegmentRenderer(
  gl: WebGL2RenderingContext,
  moves: ArrayBuffer,
  options: { layerStarts?: readonly number[]; maxTextureSize?: number; foreign?: boolean } = {},
): SegmentRenderer {
  if (!options.foreign) return create(gl, moves, options);
  const saved = <T>(f: () => T): T => {
    const restore = saveGlState(gl);
    try {
      return f();
    } finally {
      restore();
    }
  };
  const r = saved(() => create(gl, moves, options));
  return { ranges: r.ranges, draw: (view) => saved(() => r.draw(view)), dispose: () => r.dispose() };
}

function create(
  gl: WebGL2RenderingContext,
  moves: ArrayBuffer,
  options: { layerStarts?: readonly number[]; maxTextureSize?: number },
): SegmentRenderer {
  const { table, ranges } = analyseMoves(moves, options.layerStarts ?? []);
  const chunks: MoveTextureChunk[] = uploadMoveTextures(gl, moves, options.maxTextureSize);
  const words = new Uint32Array(moves);
  // Start time bits of the record after the chunk's last, which ends the chunk's last move.
  const nextStart = (c: MoveTextureChunk) => {
    const r = c.firstRecord + c.recordCount;
    return r * MOVE_WORDS < words.length ? words[r * MOVE_WORDS + 6]! : NAN_BITS;
  };

  const program = compile(gl);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, SEGMENT_INDICES, gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const layerCount = table.length / 2;
  const lw = Math.max(1, Math.min(layerCount, max));
  const lh = Math.max(1, Math.ceil(layerCount / lw));
  const layers = texture(gl, gl.RG32UI, lw, lh, (w) => {
    const data = new Uint32Array(2 * w * lh);
    data.set(table);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, lh, gl.RG_INTEGER, gl.UNSIGNED_INT, data);
  });
  const palette = texture(gl, gl.RGBA8, PALETTE_WIDTH, PALETTE_ROWS.length, (w) => {
    const data = new Uint8Array(4 * w * PALETTE_ROWS.length);
    PALETTE_ROWS.forEach((row, y) => row.forEach((c, x) => data.set([...c, 255], 4 * (y * w + x))));
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, PALETTE_ROWS.length, gl.RGBA, gl.UNSIGNED_BYTE, data);
  });

  const u = (name: string) => gl.getUniformLocation(program, name);
  const loc = {
    moves: u('uMoves'),
    layers: u('uLayers'),
    palette: u('uPalette'),
    view: u('uView'),
    projection: u('uProjection'),
    camera: u('uCamera'),
    firstLocal: u('uFirstLocal'),
    chunkFirst: u('uChunkFirst'),
    recordCount: u('uRecordCount'),
    nextStart: u('uNextStart'),
    layerCount: u('uLayerCount'),
    roleMask: u('uRoleMask'),
    hiddenFlags: u('uHiddenFlags'),
    mode: u('uMode'),
    range: u('uRange'),
  };

  return {
    ranges,
    draw(view) {
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, layers);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, palette);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(loc.moves, 0);
      gl.uniform1i(loc.layers, 1);
      gl.uniform1i(loc.palette, 2);
      const m = view.view;
      gl.uniformMatrix4fv(loc.view, false, m);
      gl.uniformMatrix4fv(loc.projection, false, view.projection);
      // Camera position of a rigid view: -Rᵀt.
      const [tx, ty, tz] = [m[12]!, m[13]!, m[14]!];
      gl.uniform3f(
        loc.camera,
        -(m[0]! * tx + m[1]! * ty + m[2]! * tz),
        -(m[4]! * tx + m[5]! * ty + m[6]! * tz),
        -(m[8]! * tx + m[9]! * ty + m[10]! * tz),
      );
      gl.uniform1i(loc.layerCount, layerCount);
      gl.uniform1ui(loc.roleMask, (view.roleMask ?? 0xffffffff) >>> 0);
      gl.uniform1ui(loc.hiddenFlags, (view.hiddenFlags ?? 0) >>> 0);
      gl.uniform1ui(loc.mode, view.colorMode);
      const range = view.colorRange ?? (view.colorMode === ColorMode.LayerTime ? ranges.layerTime : ranges.speed);
      gl.uniform2f(loc.range, range[0], range[1]);
      for (const c of chunks) {
        const inst = chunkInstances(c, view.first, view.count);
        if (!inst) continue;
        gl.bindTexture(gl.TEXTURE_2D, c.texture);
        gl.uniform1i(loc.firstLocal, inst.lo);
        gl.uniform1i(loc.chunkFirst, c.firstRecord);
        gl.uniform1i(loc.recordCount, c.recordCount);
        gl.uniform1ui(loc.nextStart, nextStart(c));
        gl.drawElementsInstanced(gl.TRIANGLES, SEGMENT_INDICES.length, gl.UNSIGNED_SHORT, 0, inst.n);
      }
    },
    dispose() {
      for (const c of chunks) gl.deleteTexture(c.texture);
      gl.deleteTexture(layers);
      gl.deleteTexture(palette);
      gl.deleteBuffer(indices);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}
