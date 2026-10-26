// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of context-loss.spec.ts: bundled by esbuild and run in Chromium on SwiftShader.
import { MOVE_TEXTURE_GLSL, trackContextLoss, uploadMoveTextures } from '../src/gl/index.ts';

const SIZE = 64;
const VS = `#version 300 es
precision highp float; precision highp int;
${MOVE_TEXTURE_GLSL}
flat out vec4 vColor;
void main() {
  int rec = gl_VertexID / 2 + gl_VertexID % 2;
  vColor = vec4(float(rec % 7) / 7.0 + 0.2, float(rec % 5) / 5.0, 0.5, 1);
  gl_Position = vec4(movePosition(rec).xy, 0, 1);
}`;
const FS = `#version 300 es
precision highp float;
flat in vec4 vColor;
out vec4 color;
void main() { color = vColor; }`;

// The webview's CPU-side data: the only copy, kept by the registered builder alone.
function moves(count: number): ArrayBuffer {
  const v = new DataView(new ArrayBuffer(count * 28));
  for (let g = 0; g < count; g++) {
    v.setFloat32(g * 28, 0.9 * Math.cos(g * 0.37), true);
    v.setFloat32(g * 28 + 4, 0.9 * Math.sin(g * 0.37), true);
  }
  return v.buffer;
}

async function run() {
  // Anything the webview sent to the host would come through one of these.
  let messages = 0;
  const post = window.postMessage.bind(window);
  window.postMessage = ((...a: unknown[]) => (messages++, (post as (...x: unknown[]) => void)(...a))) as never;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  document.body.append(canvas);
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true })!;
  const lose = gl.getExtension('WEBGL_lose_context')!;

  let textures: ReturnType<typeof uploadMoveTextures> = [];
  let prog: WebGLProgram;
  const draw = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    for (const c of textures) {
      gl.bindTexture(gl.TEXTURE_2D, c.texture);
      gl.drawArrays(gl.LINES, 0, 2 * (c.recordCount - 1));
    }
  };
  const read = () => {
    const out = new Uint8Array(SIZE * SIZE * 4);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, out);
    return Array.from(out);
  };
  let restored: () => void;
  const done = new Promise<void>((r) => (restored = r));
  const res = trackContextLoss(canvas, { onRestored: () => (draw(), restored()) });
  res.add(() => {
    const buf = moves(300);
    textures = uploadMoveTextures(gl, buf);
    return () => textures.forEach((t) => gl.deleteTexture(t.texture));
  });
  res.add(() => {
    prog = gl.createProgram()!;
    for (const [type, src] of [
      [gl.VERTEX_SHADER, VS],
      [gl.FRAGMENT_SHADER, FS],
    ] as const) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      gl.attachShader(prog, s);
    }
    gl.linkProgram(prog);
  });
  draw();
  const before = read();
  const sent = messages;
  lose.loseContext();
  const isLost = gl.isContextLost();
  // A restore is only allowed after the lost event has been handled.
  await new Promise((r) => setTimeout(r, 50));
  lose.restoreContext();
  await done;
  return { before, after: read(), isLost, sent: messages - sent, error: gl.getError() };
}

Object.assign(globalThis, { run });
