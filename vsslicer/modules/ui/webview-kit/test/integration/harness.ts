// SPDX-License-Identifier: AGPL-3.0-or-later
// Shared by the integration suites: a panel on the fixture webview with the kit's channel, handshake and CSP.
import * as assert from 'node:assert';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { createPanelChannel, createWebviewHtml, localResourceRoots, serveHandshake } from '../../src/host/index.ts';

export const MiB = 1 << 20;
const root = vscode.Uri.file(path.resolve(__dirname, '..')); // dist is test/integration/fixture/tests

export interface Reply {
  type: string;
  [k: string]: unknown;
}

export function openPanel() {
  const panel = vscode.window.createWebviewPanel('vsslicerKitTest', 'webview-kit test', vscode.ViewColumn.One, {
    enableScripts: true,
    localResourceRoots: localResourceRoots(vscode.Uri.joinPath(root, '..'), ['fixture'], vscode.Uri.joinPath),
  });
  /** Every message the webview posted that is not a kit envelope, in order. */
  const log: Reply[] = [];
  const pending: Reply[] = [];
  const waiters: (() => void)[] = [];
  let receivers = 0; // live `onDidReceiveMessage` subscriptions made through the kit
  const warnings: string[] = [];
  panel.webview.onDidReceiveMessage((m: Reply) => {
    if (typeof m?.type !== 'string') return;
    log.push(m);
    pending.push(m);
    waiters.splice(0).forEach((w) => w());
  });
  const channel = createPanelChannel(
    {
      webview: {
        postMessage: (m) => panel.webview.postMessage(m),
        onDidReceiveMessage(listener) {
          receivers++;
          const d = panel.webview.onDidReceiveMessage(listener);
          return { dispose: () => (receivers--, d.dispose()) };
        },
      },
      onDidDispose: (l) => panel.onDidDispose(l),
    },
    { warn: (w) => warnings.push(w) },
  );
  serveHandshake(channel, { onReady: () => {}, onMismatch: (e) => assert.fail(e.message) });
  panel.webview.html = createWebviewHtml({
    webview: panel.webview,
    scripts: [panel.webview.asWebviewUri(vscode.Uri.joinPath(root, 'webview.js'))],
  });
  /** The next message of `type`; fails the test on a webview `error` first. */
  const next = async (type: string): Promise<Reply> => {
    for (;;) {
      const at = pending.findIndex((r) => r.type === type || r.type === 'error');
      if (at >= 0) {
        const r = pending.splice(at, 1)[0]!;
        if (r.type === 'error') assert.fail(`webview error: ${String(r.message)}`);
        return r;
      }
      await new Promise<void>((resolve) => waiters.push(resolve));
    }
  };
  return { panel, channel, log, next, warnings, receivers: () => receivers };
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export async function until(what: string, cond: () => boolean, ms = 10_000) {
  for (const end = Date.now() + ms; !cond(); await sleep(20)) if (Date.now() > end) assert.fail(`timed out: ${what}`);
}
