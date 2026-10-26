// SPDX-License-Identifier: AGPL-3.0-or-later
import { webviewStubScript } from '@vsslicer/webview-kit/testing';

/** Browser-side stub of the VS Code webview host API, from the kit (PLT-38). Kept under this name for existing callers. */
export const stubScript = webviewStubScript;

/** The CSP an extension would normally set: nothing loads except nonce-carrying scripts and same-origin styles/images/fonts. */
export const webviewCsp = (origin: string, nonce: string): string =>
  `default-src 'none'; img-src ${origin} data: blob:; style-src ${origin} 'unsafe-inline'; font-src ${origin}; script-src 'nonce-${nonce}';`;

/** The page a VS Code webview would show: CSP, then the stub, then the bundle at `bundleUrl`. */
export const webviewPage = (origin: string, nonce: string, bundleUrl: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${webviewCsp(origin, nonce)}">
<title>VS Code webview stub</title>
</head>
<body>
<script nonce="${nonce}">${stubScript}</script>
<script nonce="${nonce}" src="${bundleUrl}"></script>
</body>
</html>`;

/** One WebGL2 triangle on a plain canvas, for the snapshot harness. Colour is a 6-digit hex such as `1e90ff`. */
export const trianglePage = (colorHex: string): string => `<!doctype html>
<html><head><meta charset="UTF-8"><style>html,body{margin:0;background:#202020}canvas{display:block}</style></head>
<body><canvas id="c" width="256" height="256"></canvas>
<script>
const gl = document.getElementById('c').getContext('webgl2', { antialias: false });
const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
const p = gl.createProgram();
gl.attachShader(p, compile(gl.VERTEX_SHADER, '#version 300 es\\nin vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }'));
gl.attachShader(p, compile(gl.FRAGMENT_SHADER, '#version 300 es\\nprecision mediump float; out vec4 o; void main(){ o = vec4(${[
  0, 2, 4,
]
  .map((i) => (parseInt(colorHex.slice(i, i + 2), 16) / 255).toFixed(4))
  .join(', ')}, 1.0); }'));
gl.linkProgram(p);
gl.useProgram(p);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.8, -0.8, 0.8, -0.8, 0, 0.8]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.clearColor(0.125, 0.125, 0.125, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
document.title = gl.getError() === 0 ? 'drawn' : 'gl-error';
</script></body></html>`;
