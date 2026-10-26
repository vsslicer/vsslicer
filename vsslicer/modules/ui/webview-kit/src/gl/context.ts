// SPDX-License-Identifier: AGPL-3.0-or-later
export type GlFailureCause = 'no-webgl2' | 'hardware-acceleration-disabled' | 'creation-refused' | 'restore';

const ARGV_HINT =
  'If you disabled hardware acceleration in argv.json ("disable-hardware-acceleration": true), remove that entry (Preferences: Configure Runtime Arguments) and restart.';

const MESSAGES: Record<GlFailureCause, string> = {
  'no-webgl2': `This webview does not support WebGL2, so the 3D view cannot start. ${ARGV_HINT}`,
  'hardware-acceleration-disabled': `WebGL2 is only available through software rendering, which is not supported. ${ARGV_HINT}`,
  'creation-refused': `The browser refused to create a WebGL2 context (no usable GPU, or software rendering is removed in current Chromium). ${ARGV_HINT}`,
  restore: 'The 3D view could not be restored after a graphics reset. Reload the view to try again.',
};

export class GlContextError extends Error {
  readonly cause: GlFailureCause;
  constructor(cause: GlFailureCause) {
    super(MESSAGES[cause]);
    this.name = 'GlContextError';
    this.cause = cause;
  }
}

export type GlResult = { ok: true; gl: WebGL2RenderingContext } | { ok: false; error: GlContextError };

const tryContext = (canvas: HTMLCanvasElement, attrs: WebGLContextAttributes): WebGL2RenderingContext | null => {
  try {
    return canvas.getContext('webgl2', attrs);
  } catch {
    return null;
  }
};

/** Creates a hardware WebGL2 context, or returns the cause of the failure; never throws. */
export function createGl2Context(canvas: HTMLCanvasElement, attributes: WebGLContextAttributes = {}): GlResult {
  if (typeof WebGL2RenderingContext === 'undefined') return fail('no-webgl2');
  const gl = tryContext(canvas, { ...attributes, failIfMajorPerformanceCaveat: true });
  if (gl) return { ok: true, gl };
  // A context that exists only without the caveat flag is software rendering (acceleration is off).
  // Unverified inference: not tested against a real argv.json setting, which the webview cannot read.
  const soft = tryContext(canvas, { ...attributes, failIfMajorPerformanceCaveat: false });
  return fail(soft ? 'hardware-acceleration-disabled' : 'creation-refused');
}

const fail = (cause: GlFailureCause): GlResult => ({ ok: false, error: new GlContextError(cause) });

/** Shows the failure in place of the canvas: an alert element carrying the cause in `data-cause`. */
export function showGlFailure(canvas: HTMLCanvasElement, error: GlContextError): HTMLElement {
  const el = canvas.ownerDocument.createElement('div');
  el.setAttribute('role', 'alert');
  el.dataset['cause'] = error.cause;
  el.textContent = error.message;
  canvas.replaceWith(el);
  return el;
}
