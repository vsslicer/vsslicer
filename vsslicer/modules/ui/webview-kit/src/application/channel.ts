// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * One end of a postMessage pipe: `webview.postMessage`/`onDidReceiveMessage` on the host,
 * `acquireVsCodeApi().postMessage`/`window` "message" events in the webview, a fake in tests.
 */
export interface Channel {
  post(message: unknown): void;
  /** Subscribes; the returned function unsubscribes. */
  onMessage(listener: (message: unknown) => void): () => void;
}
