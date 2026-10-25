// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startWebviewHost, stubScript, type WebviewHost } from '../src/index.ts';

const bundle = join(mkdtempSync(join(tmpdir(), 'webview-host-')), 'bundle.js');
writeFileSync(bundle, 'window.loaded = true;');
let host: WebviewHost;
beforeAll(async () => {
  host = await startWebviewHost(bundle);
});
afterAll(() => host.close());

describe('startWebviewHost', () => {
  it('serves a page with a CSP header and nonce-carrying stub and bundle scripts', async () => {
    const res = await fetch(host.url);
    const html = await res.text();
    const csp = res.headers.get('content-security-policy') ?? '';
    const nonce = /script-src 'nonce-([^']+)'/.exec(csp)?.[1];
    expect(csp).toContain("default-src 'none'");
    expect(nonce).toBeTruthy();
    expect(html.split(`<script nonce="${nonce}"`)).toHaveLength(3); // base64 nonce: no regex
    expect(html).toContain('src="/bundle.js"');
  });

  it('serves the bundle and 404s anything else', async () => {
    expect(await (await fetch(`${host.url}bundle.js`)).text()).toBe('window.loaded = true;');
    expect((await fetch(`${host.url}other`)).status).toBe(404);
  });
});

describe('stubScript', () => {
  const run = () => {
    const win: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    new Function('window', stubScript)(win);
    return win;
  };

  it('records posted messages and keeps state', () => {
    const win = run();
    const api = win.acquireVsCodeApi();
    api.postMessage({ type: 'ready' });
    expect(api.setState({ a: 1 })).toEqual({ a: 1 });
    expect(api.getState()).toEqual({ a: 1 });
    expect(win.__vscode.messages).toEqual([{ type: 'ready' }]);
  });

  it('allows acquiring the API only once, like VS Code', () => {
    const win = run();
    win.acquireVsCodeApi();
    expect(() => win.acquireVsCodeApi()).toThrow(/already been acquired/);
  });
});
