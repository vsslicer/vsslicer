// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Channel } from '../application/channel.ts';

/** The slice of `vscode.WebviewPanel` used here, taken structurally so no `vscode` import is needed. */
export interface HostPanel {
  readonly webview: {
    postMessage(message: unknown): PromiseLike<boolean>;
    onDidReceiveMessage(listener: (message: unknown) => void): { dispose(): void };
  };
  onDidDispose(listener: () => void): { dispose(): void };
}

/**
 * Host side `Channel` over a webview panel. Messages are passed through untouched (the envelope is parsed
 * by the application layer, payloads never). After disposal, or when `postMessage` rejects, messages are
 * dropped with one warning in total; all listeners are released on disposal.
 */
export function createPanelChannel(
  panel: HostPanel,
  { warn = (m: string) => console.warn(m) }: { readonly warn?: (message: string) => void } = {},
): Channel & { readonly disposed: boolean } {
  const listeners = new Set<(m: unknown) => void>();
  let disposed = false;
  let warned = false;
  const drop = (why: string) => {
    if (!warned) warn(`webview-kit: message dropped, ${why}`);
    warned = true;
  };
  const subs = [
    panel.webview.onDidReceiveMessage((m) => listeners.forEach((l) => l(m))),
    panel.onDidDispose(() => {
      disposed = true;
      listeners.clear();
      subs.forEach((s) => s.dispose());
    }),
  ];
  return {
    get disposed() {
      return disposed;
    },
    post(message) {
      if (disposed) return drop('the webview is disposed');
      try {
        panel.webview.postMessage(message).then(undefined, () => drop('postMessage failed'));
      } catch {
        drop('postMessage failed');
      }
    },
    onMessage(listener) {
      if (!disposed) listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
