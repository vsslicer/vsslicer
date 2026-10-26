// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Channel } from '../application/channel.ts';

/** Name of the function the stub calls (exposed by Playwright) for every message the webview posts. */
const POST_BINDING = '__vsslicerHostPost';

/**
 * Browser-side stand-in for VS Code's webview environment, run before the webview bundle. Reproduces what
 * PLT-31 measured in VS Code 1.143.1: `window.parent === window` (and `top`, `frameElement` null) inside the
 * webview, and host messages arriving with `event.origin === location.origin` and a `source` the webview cannot
 * reach. Also: `acquireVsCodeApi` works once per page; posts are recorded in `window.__vscode.messages`, state
 * lives in `window.__vscode.state`; `window.__vscode.deliver(data)` is the host-to-webview direction.
 */
export const webviewStubScript = `(() => {
  const messages = [];
  let state;
  const deliver = (data) => window.dispatchEvent(new MessageEvent('message', { data, origin: location.origin }));
  Object.defineProperty(window, '__vscode', { value: { messages, deliver, get state() { return state; } } });
  for (const k of ['parent', 'top']) { try { Object.defineProperty(window, k, { value: window, configurable: true }); } catch {} }
  try { Object.defineProperty(window, 'frameElement', { value: null, configurable: true }); } catch {}
  let acquired = false;
  window.acquireVsCodeApi = () => {
    if (acquired) throw new Error('An instance of the VS Code API has already been acquired');
    acquired = true;
    return Object.freeze({
      postMessage: (message) => {
        messages.push(structuredClone(message));
        if (typeof window.${POST_BINDING} === 'function') window.${POST_BINDING}(message);
      },
      getState: () => state,
      setState: (next) => { state = next; return next; },
    });
  };
})();`;

/** The part of a Playwright `Page` the fake host needs, so the kit does not depend on Playwright. */
export interface StubPage {
  addInitScript(script: string): Promise<unknown>;
  exposeFunction(name: string, callback: (message: unknown) => void): Promise<unknown>;
  evaluate<A>(fn: (arg: A) => unknown, arg: A): Promise<unknown>;
}

/**
 * Installs the stub on `page` (call before `page.goto`) and returns the host end of the transport as a `Channel`:
 * `serveHandshake(host, ...)` and the message helpers work on it as on a real panel.
 * shortcut: messages cross as JSON (Playwright bindings), so `ArrayBuffer` payloads do not survive; upgrade by
 * base64-encoding buffers in the stub if a test needs `sendBuffer` over it.
 */
export async function attachFakeHost(page: StubPage): Promise<Channel> {
  const listeners = new Set<(message: unknown) => void>();
  await page.exposeFunction(POST_BINDING, (message) => listeners.forEach((l) => l(message)));
  await page.addInitScript(webviewStubScript);
  return {
    post(message) {
      // A page that navigated away or closed drops the message, as a disposed panel does.
      page
        .evaluate(
          (m) => (globalThis as unknown as { __vscode: { deliver(m: unknown): void } }).__vscode.deliver(m),
          message,
        )
        .catch(() => {});
    },
    onMessage(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}
