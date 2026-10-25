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
  /** The VS Code host frame; only messages whose `source` is this are accepted. */
  readonly parent: unknown;
  addEventListener(type: 'message', l: (e: { data: unknown; source: unknown }) => void): void;
  removeEventListener(type: 'message', l: (e: { data: unknown; source: unknown }) => void): void;
}

/** Webview side `Channel`: posts through the API, hears only `window` messages sent by the host frame. */
export function createWindowChannel(post: (m: unknown) => void, win: WindowLike): Channel {
  return {
    post,
    onMessage(listener) {
      const l = (e: { data: unknown; source: unknown }) => {
        if (e.source === win.parent) listener(e.data);
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
