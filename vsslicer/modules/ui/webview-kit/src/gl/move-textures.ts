// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Per-move data textures. The 28-byte move record of `@vsslicer/gcode-api` (`MOVE_STRIDE`,
 * `MoveOffset`; frozen by D17) is uploaded unchanged as seven little-endian u32 words, one `R32UI`
 * texel each, so the GPU holds exactly 28 bytes per move and nothing is repacked on the CPU:
 *
 * | Word | Bytes | Type             | Field                         | GLSL accessor            |
 * |-----:|------:|------------------|-------------------------------|--------------------------|
 * |  0-2 |  0-11 | f32 x3           | position (end point, mm)      | `movePosition`           |
 * |    3 | 12-15 | f16 x2           | width (low), height (high)    | `moveWidthHeight`        |
 * |    4 | 16-19 | u8 x3 + pad      | role, tool, flags             | `moveRoleToolFlags`      |
 * |    5 | 20-23 | u32              | fileOffset                    | `moveFileOffset`         |
 * |    6 | 24-27 | f32              | startTime (s)                 | `moveStartTime`          |
 *
 * Record `r` of a chunk is texels `7r .. 7r+6` in row-major order of a texture `w` texels wide.
 * A texture holds at most `MAX_TEXTURE_SIZE²` texels, so the records are split into chunks, one
 * texture each. A move is the segment from record `r - 1` to record `r`, so consecutive chunks
 * share one record: chunk `k + 1` starts at chunk `k`'s last record and draws its segments from
 * local record 1. Global move 0 has no start point in the buffer and is never a segment.
 */
export const MOVE_WORDS = 7;

/** One data texture: records `firstRecord .. firstRecord + recordCount - 1` of the move buffer. */
export interface MoveTextureChunk {
  texture: WebGLTexture;
  firstRecord: number;
  recordCount: number;
}

// GLSL `int` texel index must stay below 2^31: cap the side used at 32768 (2^30 texels).
const MAX_SIDE = 32768;

/** Splits `recordCount` records into texture chunks that overlap by one record. */
export function planMoveChunks(
  recordCount: number,
  maxTextureSize: number,
): { firstRecord: number; recordCount: number }[] {
  const side = Math.min(maxTextureSize, MAX_SIDE);
  const per = Math.floor((side * side) / MOVE_WORDS);
  if (per < 2) throw new RangeError(`maxTextureSize ${maxTextureSize} holds fewer than 2 move records`);
  const chunks = [];
  for (let first = 0; first < recordCount; first += per - 1) {
    const n = Math.min(per, recordCount - first);
    chunks.push({ firstRecord: first, recordCount: n });
    if (first + n >= recordCount) break;
  }
  return chunks;
}

/**
 * Uploads a move buffer (`MOVE_STRIDE`-byte records) into `R32UI` textures, once per chunk.
 * Leaves the uploaded texture bound on the active unit and sets the unpack state it needs; a
 * caller sharing the context with another renderer (three.js) resets that renderer's state after.
 * The caller owns the textures (`gl.deleteTexture`). Assumes a little-endian host, as every
 * browser is.
 */
export function uploadMoveTextures(
  gl: WebGL2RenderingContext,
  moves: ArrayBuffer,
  maxTextureSize: number = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
): MoveTextureChunk[] {
  // A view would be read as elements, not bytes, by `new Uint32Array(moves, ...)` below.
  if (!(moves instanceof ArrayBuffer)) throw new TypeError('moves must be an ArrayBuffer, not a typed-array view');
  const stride = MOVE_WORDS * 4;
  if (moves.byteLength % stride !== 0)
    throw new RangeError(`move buffer length ${moves.byteLength} is not a multiple of ${stride}`);
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
  for (const [p, v] of [
    [gl.UNPACK_ALIGNMENT, 4],
    [gl.UNPACK_ROW_LENGTH, 0],
    [gl.UNPACK_SKIP_ROWS, 0],
    [gl.UNPACK_SKIP_PIXELS, 0],
    [gl.UNPACK_FLIP_Y_WEBGL, 0],
    [gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0],
  ] as const)
    gl.pixelStorei(p, v);
  return planMoveChunks(moves.byteLength / stride, maxTextureSize).map(({ firstRecord, recordCount }) => {
    const words = recordCount * MOVE_WORDS;
    const w = Math.min(maxTextureSize, words);
    const full = Math.floor(words / w);
    const rest = words - full * w;
    const offset = firstRecord * stride;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R32UI, w, full + (rest ? 1 : 0));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    const sub = (row: number, width: number, height: number, at: number, length: number) =>
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        row,
        width,
        height,
        gl.RED_INTEGER,
        gl.UNSIGNED_INT,
        new Uint32Array(moves, at, length),
      );
    sub(0, w, full, offset, full * w);
    if (rest) sub(full, rest, 1, offset + full * w * 4, rest);
    return { texture, firstRecord, recordCount };
  });
}

/**
 * GLSL ES 3.00 accessors for one chunk texture bound to `uMoves`; `rec` is the chunk-local record.
 * Include it in a vertex shader after the `#version` and precision lines.
 */
export const MOVE_TEXTURE_GLSL = /* glsl */ `
uniform highp usampler2D uMoves;
uint moveWord(int rec, int word) {
  int i = rec * ${MOVE_WORDS} + word;
  int w = textureSize(uMoves, 0).x;
  return texelFetch(uMoves, ivec2(i % w, i / w), 0).r;
}
vec3 movePosition(int rec) {
  return uintBitsToFloat(uvec3(moveWord(rec, 0), moveWord(rec, 1), moveWord(rec, 2)));
}
vec2 moveWidthHeight(int rec) { return unpackHalf2x16(moveWord(rec, 3)); }
uvec3 moveRoleToolFlags(int rec) {
  uint v = moveWord(rec, 4);
  return uvec3(v & 255u, (v >> 8) & 255u, (v >> 16) & 255u);
}
uint moveFileOffset(int rec) { return moveWord(rec, 5); }
float moveStartTime(int rec) { return uintBitsToFloat(moveWord(rec, 6)); }
`;
