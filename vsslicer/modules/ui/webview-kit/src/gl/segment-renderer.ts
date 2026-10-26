// SPDX-License-Identifier: AGPL-3.0-or-later
import { saveGlState } from './gl-state.ts';
import { MOVE_WORDS, uploadMoveTextures, type MoveTextureChunk } from './move-textures.ts';
import { PALETTE_ROWS, PALETTE_WIDTH, SEGMENT_FS, SEGMENT_INDICES, SEGMENT_VS } from './segment-shader.ts';

/** Colour modes, the value of the `uMode` uniform. */
export const ColorMode = {
  Feature: 0,
  Speed: 1,
  Tool: 2,
  LayerTime: 3,
  Width: 4,
  Flow: 5,
  /** Part-cooling fan duty, %; needs `stateChanges`. */
  Fan: 6,
  /** Hotend target of the move's tool, degrees C; needs `stateChanges`. */
  Temperature: 7,
} as const;
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
  /** Value mapped to the first and last gradient colour in speed (mm/s), layer-time (s), width (mm), flow (mm3/s), fan (%) and temperature (degrees C) modes; default from `ranges`. */
  colorRange?: readonly [number, number];
}

export interface SegmentRenderer {
  /**
   * Min and max over the data: speed of non-travel moves (mm/s), layer time (s), extrusion width (mm) and
   * volumetric flow (width x height x speed, mm3/s) of non-travel moves, fan duty (%) and hotend
   * temperature (degrees C) over the moves; `[0, 0]` when unknown. The default `colorRange` of each
   * mode, so a legend can label the gradient.
   */
  readonly ranges: {
    speed: [number, number];
    layerTime: [number, number];
    width: [number, number];
    flow: [number, number];
    fan: [number, number];
    temperature: [number, number];
  };
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

/** IEEE half to number (Float16Array is not in every runtime we target). */
export function halfToNumber(h: number): number {
  const e = (h >> 10) & 31;
  const m = h & 1023;
  const x = e === 0 ? m * 2 ** -24 : e === 31 ? (m ? NaN : Infinity) : (1024 + m) * 2 ** (e - 25);
  return h & 0x8000 ? -x : x;
}

/** Layer table texels `[firstMove, f32 bits of layer time]` and the data ranges; one pass over the moves. */
export function analyseMoves(
  moves: ArrayBuffer,
  layerStarts: readonly number[],
): { table: Uint32Array; ranges: Omit<SegmentRenderer['ranges'], 'fan' | 'temperature'> } {
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
  const width = span();
  const flow = span();
  for (let r = 1; r < n; r++) {
    if (v.getUint8(r * STRIDE + 18) & 1) continue; // MoveFlag.Travel
    const o = r * STRIDE;
    const w = halfToNumber(v.getUint16(o + 12, true));
    const h = halfToNumber(v.getUint16(o + 14, true));
    const sized = w > 0 && h > 0;
    if (sized) widen(width, w);
    if (r + 1 >= n) continue;
    const d = start(r + 1) - start(r);
    if (!(d > 0)) continue;
    const len = Math.hypot(
      v.getFloat32(o, true) - v.getFloat32(o - STRIDE, true),
      v.getFloat32(o + 4, true) - v.getFloat32(o - STRIDE + 4, true),
      v.getFloat32(o + 8, true) - v.getFloat32(o - STRIDE + 8, true),
    );
    widen(speed, len / d);
    if (sized) widen(flow, (len / d) * w * h);
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
  return { table, ranges: { speed: done(speed), layerTime: done(layerTime), width: done(width), flow: done(flow) } };
}

const done = (s: [number, number]): [number, number] => (s[0] <= s[1] ? s : [0, 0]);

/** Step texels `[firstMove, f32 bits of value]` (the layer table's format), ascending, and the range of the values. */
export interface Steps {
  table: Uint32Array;
  range: [number, number];
}

// `@vsslicer/gcode-api` state-change record (STATE_CHANGE_STRIDE, StateChangeOffset, StateKind).
const SC_STRIDE = 12;
const KIND_FAN = 1;
const KIND_HOTEND = 2;
const KIND_TOOL = 20;

/**
 * Folds the parser's state-change tables (`ParsedFile.stateChanges`, in file order) into the value each
 * move runs under: the part-cooling fan duty in % and the hotend target of the move's tool in degrees C.
 * As OrcaSlicer's GCodeProcessor: M106 without `P` or with `P1` is the part fan (Bambu uses P1); the parser
 * records no `P` as index 0, so `P0` counts too, and M107 with `P2` and up leaves it alone (Orca zeroes it). The
 * temperature is the active tool's (OrcaSlicer@09aa0114:src/libslic3r/GCode/GCodeProcessor.cpp:6586-6595,
 * 7565-7566, AGPL-3.0). The fan starts at 0, a temperature not yet set is NaN (drawn as unknown). Both
 * tables start at move 0; one step per move at most, so a table never has more than `moveCount + 1` rows.
 */
export function stateSteps(
  stateChanges: readonly ArrayBuffer[],
  moveCount: number,
): { fan: Steps; temperature: Steps } {
  if (!Number.isSafeInteger(moveCount) || moveCount < 0) throw new RangeError(`bad moveCount ${moveCount}`);
  let records = 0;
  for (const b of stateChanges) {
    if (!(b instanceof ArrayBuffer)) throw new TypeError('stateChanges must be ArrayBuffers');
    if (b.byteLength % SC_STRIDE) throw new RangeError(`state-change length ${b.byteLength} is not a multiple of 12`);
    records += b.byteLength / SC_STRIDE;
  }
  const rows = Math.min(records, moveCount) + 1;
  const series = () => ({ moves: new Uint32Array(rows), values: new Float32Array(rows), n: 0 });
  const fan = series();
  const temp = series();
  const set = (s: ReturnType<typeof series>, move: number, value: number) => {
    const last = s.n - 1;
    if (last >= 0 && s.moves[last] === move) s.values[last] = value;
    else if (last < 0 || !Object.is(s.values[last], Math.fround(value))) {
      s.moves[s.n] = move;
      s.values[s.n++] = value;
    }
  };
  const temps = new Float64Array(256).fill(NaN);
  let tool = 0;
  set(fan, 0, 0);
  set(temp, 0, NaN);
  let prev = 0;
  for (const b of stateChanges) {
    const v = new DataView(b);
    for (let o = 0; o < b.byteLength; o += SC_STRIDE) {
      const move = v.getUint32(o, true);
      const value = v.getFloat32(o + 4, true);
      const kind = v.getUint8(o + 8);
      const index = v.getUint8(o + 9);
      if (move < prev || move > moveCount) throw new RangeError(`state change move ${move} out of order or range`);
      prev = move;
      if (kind === KIND_FAN && index <= 1) set(fan, move, value * 100);
      else if (kind === KIND_HOTEND) {
        temps[index] = value;
        if (index === tool) set(temp, move, value);
      } else if (kind === KIND_TOOL && Number.isInteger(value) && value >= 0 && value < 256 && value !== tool) {
        tool = value;
        set(temp, move, temps[tool]!);
      }
    }
  }
  const pack = (s: ReturnType<typeof series>): Steps => {
    const table = new Uint32Array(2 * s.n);
    const f32 = new Float32Array(table.buffer);
    const range: [number, number] = [Infinity, -Infinity];
    for (let i = 0; i < s.n; i++) {
      table[2 * i] = s.moves[i]!;
      f32[2 * i + 1] = s.values[i]!;
      // only values some move runs under count (a step at moveCount follows the last move)
      if (s.moves[i]! < moveCount && Number.isFinite(s.values[i])) {
        range[0] = Math.min(range[0], s.values[i]!);
        range[1] = Math.max(range[1], s.values[i]!);
      }
    }
    return { table, range: done(range) };
  };
  return { fan: pack(fan), temperature: pack(temp) };
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
 * (`Layer.firstMove` of `@vsslicer/gcode-api`), ascending; layer-time mode needs them. `stateChanges` are
 * the parser's state-change tables (`ParsedFile.stateChanges`); fan and temperature modes need them (see
 * `stateSteps`) and draw every move as unknown without them.
 * `foreign: true` is for a context another renderer owns (three.js): creating and each `draw` save
 * the GL state they change and restore it after (`saveGlState`), so that renderer's state cache stays true.
 */
export function createSegmentRenderer(
  gl: WebGL2RenderingContext,
  moves: ArrayBuffer,
  options: {
    layerStarts?: readonly number[];
    stateChanges?: readonly ArrayBuffer[];
    maxTextureSize?: number;
    foreign?: boolean;
  } = {},
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
  options: { layerStarts?: readonly number[]; stateChanges?: readonly ArrayBuffer[]; maxTextureSize?: number },
): SegmentRenderer {
  if (!(moves instanceof ArrayBuffer)) throw new TypeError('moves must be an ArrayBuffer, not a typed-array view');
  const { table: layerTable, ranges: moveRanges } = analyseMoves(moves, options.layerStarts ?? []);
  const none: Steps = { table: new Uint32Array(0), range: [0, 0] };
  const steps = options.stateChanges
    ? stateSteps(options.stateChanges, moves.byteLength / STRIDE)
    : { fan: none, temperature: none };
  const ranges = { ...moveRanges, fan: steps.fan.range, temperature: steps.temperature.range };
  // One step texture: the layer table, then the fan steps, then the temperature steps.
  const table = new Uint32Array(layerTable.length + steps.fan.table.length + steps.temperature.table.length);
  table.set(layerTable);
  table.set(steps.fan.table, layerTable.length);
  table.set(steps.temperature.table, layerTable.length + steps.fan.table.length);
  const layerCount = layerTable.length / 2;
  const fanSteps = [layerCount, steps.fan.table.length / 2] as const;
  const tempSteps = [fanSteps[0] + fanSteps[1], steps.temperature.table.length / 2] as const;
  const chunks: MoveTextureChunk[] = uploadMoveTextures(gl, moves, options.maxTextureSize);
  // Start time bits of the record after each chunk's last, which ends its last move. Read once so
  // the CPU buffer is not held after creation.
  const words = new Uint32Array(moves);
  const nextStarts = chunks.map((c) => {
    const r = c.firstRecord + c.recordCount;
    return r * MOVE_WORDS < words.length ? words[r * MOVE_WORDS + 6]! : NAN_BITS;
  });

  const program = compile(gl);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, SEGMENT_INDICES, gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const rows = table.length / 2;
  const lw = Math.max(1, Math.min(rows, max));
  const lh = Math.max(1, Math.ceil(rows / lw));
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
    layers: u('uSteps'),
    palette: u('uPalette'),
    view: u('uView'),
    projection: u('uProjection'),
    camera: u('uCamera'),
    firstLocal: u('uFirstLocal'),
    chunkFirst: u('uChunkFirst'),
    recordCount: u('uRecordCount'),
    nextStart: u('uNextStart'),
    layerCount: u('uLayerCount'),
    fan: u('uFan'),
    temperature: u('uTemperature'),
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
      gl.uniform2i(loc.fan, ...fanSteps);
      gl.uniform2i(loc.temperature, ...tempSteps);
      gl.uniform1ui(loc.roleMask, (view.roleMask ?? 0xffffffff) >>> 0);
      gl.uniform1ui(loc.hiddenFlags, (view.hiddenFlags ?? 0) >>> 0);
      gl.uniform1ui(loc.mode, view.colorMode);
      const modeRange = {
        [ColorMode.LayerTime]: ranges.layerTime,
        [ColorMode.Width]: ranges.width,
        [ColorMode.Flow]: ranges.flow,
        [ColorMode.Fan]: ranges.fan,
        [ColorMode.Temperature]: ranges.temperature,
      } as Partial<Record<ColorMode, readonly [number, number]>>;
      const range = view.colorRange ?? modeRange[view.colorMode] ?? ranges.speed;
      gl.uniform2f(loc.range, range[0], range[1]);
      chunks.forEach((c, i) => {
        const inst = chunkInstances(c, view.first, view.count);
        if (!inst) return;
        gl.bindTexture(gl.TEXTURE_2D, c.texture);
        gl.uniform1i(loc.firstLocal, inst.lo);
        gl.uniform1i(loc.chunkFirst, c.firstRecord);
        gl.uniform1i(loc.recordCount, c.recordCount);
        gl.uniform1ui(loc.nextStart, nextStarts[i]!);
        gl.drawElementsInstanced(gl.TRIANGLES, SEGMENT_INDICES.length, gl.UNSIGNED_SHORT, 0, inst.n);
      });
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
