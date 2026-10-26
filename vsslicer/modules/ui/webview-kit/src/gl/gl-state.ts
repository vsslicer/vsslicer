// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Saves the GL state the kit's renderers change and returns a function that puts it back, so the
 * kit can draw into a context another renderer (three.js) owns and caches state for: program, VAO,
 * active texture unit, `TEXTURE_2D` bindings of units 0-2 and the active unit, `DEPTH_TEST`,
 * `CULL_FACE`, `BLEND`, depth write mask, `PIXEL_UNPACK_BUFFER` and the unpack parameters
 * `uploadMoveTextures` sets. Framebuffer and viewport are the caller's; the kit does not change them.
 */
export function saveGlState(gl: WebGL2RenderingContext): () => void {
  const get = (p: number) => gl.getParameter(p) as unknown;
  const program = get(gl.CURRENT_PROGRAM) as WebGLProgram | null;
  const vao = get(gl.VERTEX_ARRAY_BINDING) as WebGLVertexArrayObject | null;
  const active = get(gl.ACTIVE_TEXTURE) as number;
  const units = [...new Set([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, active])].map((u) => {
    gl.activeTexture(u);
    return [u, get(gl.TEXTURE_BINDING_2D) as WebGLTexture | null] as const;
  });
  gl.activeTexture(active);
  const caps = [gl.DEPTH_TEST, gl.CULL_FACE, gl.BLEND].map((c) => [c, gl.isEnabled(c)] as const);
  const depthMask = get(gl.DEPTH_WRITEMASK) as boolean;
  const unpackBuffer = get(gl.PIXEL_UNPACK_BUFFER_BINDING) as WebGLBuffer | null;
  const unpack = [
    gl.UNPACK_ALIGNMENT,
    gl.UNPACK_ROW_LENGTH,
    gl.UNPACK_SKIP_ROWS,
    gl.UNPACK_SKIP_PIXELS,
    gl.UNPACK_FLIP_Y_WEBGL,
    gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
  ].map((p) => [p, get(p) as number | boolean] as const);
  return () => {
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    for (const [u, t] of units) {
      gl.activeTexture(u);
      gl.bindTexture(gl.TEXTURE_2D, t);
    }
    gl.activeTexture(active);
    for (const [c, on] of caps) {
      if (on) gl.enable(c);
      else gl.disable(c);
    }
    gl.depthMask(depthMask);
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, unpackBuffer);
    for (const [p, v] of unpack) gl.pixelStorei(p, v);
  };
}
