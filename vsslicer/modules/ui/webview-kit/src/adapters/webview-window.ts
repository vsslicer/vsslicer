// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Channel } from '../application/channel.ts';

/** What `acquireVsCodeApi()` returns. */
export interface VsCodeApi<S = unknown> {
  postMessage(message: unknown): void;
  getState(): S | undefined;
  setState(state: S): S;
}

/** Typed state and post over `acquireVsCodeApi`, which throws when called twice: this calls it once. */
export function createWebviewApi<S>(acquire: () => VsCodeApi<S>) {
  const api = acquire();
  return {
    post: (m: unknown) => api.postMessage(m),
    getState: (): S | undefined => api.getState(),
    setState: (s: S): void => void api.setState(s),
  };
}

let shared: ReturnType<typeof createWebviewApi<never>> | undefined;
/** Process-wide instance over the global `acquireVsCodeApi`; acquires on first use only. */
export function webviewApi<S>(): ReturnType<typeof createWebviewApi<S>> {
  shared ??= createWebviewApi<never>(
    (globalThis as unknown as { acquireVsCodeApi: () => VsCodeApi<never> }).acquireVsCodeApi,
  );
  return shared as never;
}

export interface WindowLike {
  /** The VS Code host frame. Inside a real webview VS Code sets it to the window itself (see `createWindowChannel`). */
  readonly parent: unknown;
  readonly location: { readonly origin: string };
  addEventListener(type: 'message', l: (e: WindowMessage) => void): void;
  removeEventListener(type: 'message', l: (e: WindowMessage) => void): void;
}

export interface WindowMessage {
  data: unknown;
  source: unknown;
  origin: string;
}

/**
 * Webview side `Channel`: posts through the API, hears only host messages. VS Code's outer frame posts with the
 * webview's own origin, but the frame is not reliably `window.parent`: VS Code 1.143 sets `window.parent = window`
 * (pre/index.html:252-254) and 1.100 leaves a parent that is not the sender. So a message is the host's when its
 * `event.origin === location.origin`, or (a plain iframe, as in tests) when `event.source === window.parent`.
 */
export function createWindowChannel(post: (m: unknown) => void, win: WindowLike): Channel {
  return {
    post,
    onMessage(listener) {
      const l = (e: WindowMessage) => {
        const fromHost = e.origin === win.location.origin || e.source === win.parent;
        if (fromHost) listener(e.data);
      };
      win.addEventListener('message', l);
      return () => win.removeEventListener('message', l);
    },
  };
}

export type ThemeTokens = Readonly<Record<string, string>>;

export interface ThemeHost {
  tokens(): ThemeTokens;
  /** Calls back on any class/style change of the root element; returns the stop function. */
  observe(onChange: () => void): () => void;
}

/** Real DOM: `--vscode-*` custom properties on the root element's inline style. */
export function domThemeHost(doc: Document = document, MO: typeof MutationObserver = MutationObserver): ThemeHost {
  const root = doc.documentElement;
  return {
    tokens() {
      const out: Record<string, string> = {};
      for (const name of Array.from(root.style)) {
        if (name.startsWith('--vscode-')) out[name] = root.style.getPropertyValue(name).trim();
      }
      return out;
    },
    observe(onChange) {
      const o = new MO(onChange);
      o.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });
      return () => o.disconnect();
    },
  };
}

/** Calls `listener` with the current tokens, then again whenever they actually change. */
export function watchTheme(host: ThemeHost, listener: (tokens: ThemeTokens) => void): () => void {
  let last = host.tokens();
  listener(last);
  return host.observe(() => {
    const next = host.tokens();
    const same =
      Object.keys(next).length === Object.keys(last).length && Object.entries(next).every(([k, v]) => last[k] === v);
    if (same) return;
    last = next;
    listener(next);
  });
}

/** `visible` false when the webview is hidden, true when restored. */
export function watchVisibility(
  doc: {
    readonly visibilityState: string;
    addEventListener(t: 'visibilitychange', l: () => void): void;
    removeEventListener(t: 'visibilitychange', l: () => void): void;
  },
  listener: (visible: boolean) => void,
): () => void {
  const l = () => listener(doc.visibilityState === 'visible');
  doc.addEventListener('visibilitychange', l);
  return () => doc.removeEventListener('visibilitychange', l);
}
