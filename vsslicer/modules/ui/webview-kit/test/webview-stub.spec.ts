// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { attachFakeHost, serveHandshake } from '../src/testing/index.ts';

// A secure origin like the webview's (about:blank has no crypto.randomUUID).
async function openPage(page: Page) {
  await page.route('http://localhost/', (r) => r.fulfill({ contentType: 'text/html', body: '<!doctype html>' }));
  await page.goto('http://localhost/');
}

// A tiny webview built on the kit: handshake with the host, post a typed message, show the typed reply.
const webview = `
import { handshake, createWebviewApi, createWindowChannel } from './src/webview/index.ts';
const api = createWebviewApi(acquireVsCodeApi);
const channel = createWindowChannel(api.post, window);
handshake(channel).then(() => {
  channel.onMessage((m) => { if (m && m.type === 'pong') document.title = 'pong:' + m.n; });
  api.post({ type: 'ping', n: 7 });
});`;

test('sample webview exchanges a typed message with the fake host', async ({ page }) => {
  const { outputFiles } = await build({
    stdin: { contents: webview, resolveDir: import.meta.dirname + '/..', loader: 'ts' },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
  });
  const host = await attachFakeHost(page);
  const ready: string[] = [];
  serveHandshake(host, { onReady: (s) => ready.push(s), onMismatch: () => {} });
  host.onMessage((m) => {
    const ping = m as { type?: string; n?: number };
    if (ping.type === 'ping') host.post({ type: 'pong', n: ping.n });
  });
  await openPage(page);
  await page.addScriptTag({ content: outputFiles[0]!.text });
  await expect.poll(() => page.title()).toBe('pong:7');
  expect(ready).toHaveLength(1);
});

test('stub reproduces VS Code: parent is the window, host messages carry the page origin', async ({ page }) => {
  await attachFakeHost(page);
  await openPage(page);
  const seen = await page.evaluate(() => {
    const out: { origin: string; source: unknown; parentIsSelf: boolean; topIsSelf: boolean }[] = [];
    window.addEventListener('message', (e) =>
      out.push({
        origin: e.origin,
        source: e.source,
        parentIsSelf: window.parent === window,
        topIsSelf: window.top === window,
      }),
    );
    (window as unknown as { __vscode: { deliver(m: unknown): void } }).__vscode.deliver('x');
    return out;
  });
  expect(seen).toEqual([{ origin: 'http://localhost', source: null, parentIsSelf: true, topIsSelf: true }]);
});

test('acquireVsCodeApi works once per page', async ({ page }) => {
  await attachFakeHost(page);
  await openPage(page);
  const second = await page.evaluate(() => {
    const w = window as unknown as { acquireVsCodeApi(): unknown };
    w.acquireVsCodeApi();
    try {
      w.acquireVsCodeApi();
      return 'no throw';
    } catch (e) {
      return String(e);
    }
  });
  expect(second).toMatch(/already been acquired/);
});
