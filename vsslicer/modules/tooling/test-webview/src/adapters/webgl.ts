// SPDX-License-Identifier: AGPL-3.0-or-later

/** The part of a Playwright `Page` this needs, so the package does not depend on Playwright. */
export interface Evaluates {
  evaluate<T>(fn: () => T): Promise<T>;
}

/** The unmasked WebGL renderer string (`WEBGL_debug_renderer_info`), e.g. "ANGLE (Google, Vulkan ... SwiftShader ...)". */
export const webglRenderer = (page: Evaluates): Promise<string> =>
  page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : 'no-webgl2';
  });
