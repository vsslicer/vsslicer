// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of move-textures.spec.ts: bundled by esbuild and run in Chromium on SwiftShader.
import { MOVE_TEXTURE_GLSL, uploadMoveTextures } from '../src/gl/index.ts';

const STRIDE = 28;

// Synthetic records; `exact` positions are (g, 2g, g/2) so the shader can check them bit for bit.
function moves(count: number, exact: boolean): ArrayBuffer {
  const v = new DataView(new ArrayBuffer(count * STRIDE));
  for (let g = 0; g < count; g++) {
    const o = g * STRIDE;
    const a = g * 0.37;
    const r = (0.9 * g) / count;
    const p = exact ? [g, 2 * g, 0.5 * g] : [r * Math.cos(a), r * Math.sin(a), g * 0.01];
    p.forEach((x, k) => v.setFloat32(o + 4 * k, x, true));
    v.setFloat16(o + 12, (g % 8) * 0.125, true);
    v.setFloat16(o + 14, (g % 4) * 0.0625, true);
    v.setUint8(o + 16, g % 20);
    v.setUint8(o + 17, g % 4);
    v.setUint8(o + 18, g % 8);
    v.setUint32(o + 20, g * 1009, true);
    v.setFloat32(o + 24, g * 0.25, true);
  }
  return v.buffer;
}

const CHECK_VS = `#version 300 es
precision highp float; precision highp int;
${MOVE_TEXTURE_GLSL}
uniform int uBase;
flat out vec4 vColor;
void main() {
  int rec = gl_VertexID;
  int g = uBase + rec;
  float f = float(g);
  uvec3 rtf = moveRoleToolFlags(rec);
  bool ok = movePosition(rec) == vec3(f, 2.0 * f, 0.5 * f)
    && moveWidthHeight(rec) == vec2(float(g % 8) * 0.125, float(g % 4) * 0.0625)
    && rtf == uvec3(uint(g % 20), uint(g % 4), uint(g % 8))
    && moveFileOffset(rec) == uint(g) * 1009u
    && moveStartTime(rec) == f * 0.25;
  vColor = ok ? vec4(0, 1, 0, 1) : vec4(1, 0, 0, 1);
  gl_PointSize = 1.0;
  gl_Position = vec4((vec2(g % 32, g / 32) + 0.5) / 16.0 - 1.0, 0, 1);
}`;

const LINE_VS = `#version 300 es
precision highp float; precision highp int;
${MOVE_TEXTURE_GLSL}
uniform vec2 uOffset;
flat out vec4 vColor;
void main() {
  int rec = gl_VertexID / 2 + gl_VertexID % 2; // segment s spans records s and s + 1
  int end = gl_VertexID / 2 + 1;
  uvec3 rtf = moveRoleToolFlags(end);
  vColor = vec4(float(rtf.x) / 20.0, moveWidthHeight(end).x, fract(moveStartTime(end) / 10.0), 1);
  gl_Position = vec4(movePosition(rec).xy + uOffset, 0, 1);
}`;

const FS = `#version 300 es
precision highp float;
flat in vec4 vColor;
out vec4 color;
void main() { color = vColor; }`;

function program(gl: WebGL2RenderingContext, vs: string): WebGLProgram {
  const p = gl.createProgram();
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, FS],
  ] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'compile');
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}

function context(size: number): WebGL2RenderingContext {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  document.body.append(canvas);
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no WebGL2');
  return gl;
}

// Counts every texture or buffer upload issued after the spy is installed.
function spyUploads(gl: WebGL2RenderingContext): () => number {
  let n = 0;
  for (const name of ['texImage2D', 'texSubImage2D', 'bufferData', 'bufferSubData'] as const) {
    const f = gl[name].bind(gl) as (...a: unknown[]) => void;
    (gl as unknown as Record<string, unknown>)[name] = (...a: unknown[]) => (n++, f(...a));
  }
  return () => n;
}

function pixels(gl: WebGL2RenderingContext, size: number): Uint8Array {
  const out = new Uint8Array(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, out);
  return out;
}

/** Decodes every record in the shader and counts green (all fields match) and red pixels. */
function check(count: number, limit?: number) {
  const gl = context(32);
  const chunks = uploadMoveTextures(gl, moves(count, true), limit);
  const prog = program(gl, CHECK_VS);
  const base = gl.getUniformLocation(prog, 'uBase');
  gl.useProgram(prog);
  for (const c of chunks) {
    gl.bindTexture(gl.TEXTURE_2D, c.texture);
    gl.uniform1i(base, c.firstRecord);
    gl.drawArrays(gl.POINTS, 0, c.recordCount);
  }
  const px = pixels(gl, 32);
  let green = 0;
  let red = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 1] === 255) green++;
    if (px[i] === 255) red++;
  }
  return { chunks: chunks.length, green, red, error: gl.getError() };
}

/** Draws every segment as a line, then twice more with another view offset, which must not upload. */
function render(count: number, limit?: number) {
  const size = 128;
  const gl = context(size);
  const uploads = spyUploads(gl);
  const chunks = uploadMoveTextures(gl, moves(count, false), limit);
  const atUpload = uploads();
  const prog = program(gl, LINE_VS);
  const offset = gl.getUniformLocation(prog, 'uOffset');
  const draw = (x: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform2f(offset, x, 0);
    for (const c of chunks) {
      gl.bindTexture(gl.TEXTURE_2D, c.texture);
      gl.drawArrays(gl.LINES, 0, 2 * (c.recordCount - 1));
    }
  };
  draw(0.05);
  draw(0);
  const px = Array.from(pixels(gl, size));
  return { chunks: chunks.length, atUpload, afterViews: uploads(), px, error: gl.getError() };
}

Object.assign(globalThis, { check, render });
