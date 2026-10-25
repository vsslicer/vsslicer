// SPDX-License-Identifier: AGPL-3.0-or-later
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { webviewCsp, webviewPage } from '../domain/webviewPage.ts';

export interface WebviewHost {
  /** Page that loads the stub and then the bundle. */
  readonly url: string;
  close(): Promise<void>;
}

/** Serve `bundlePath` (a built webview JS file) in a page that mimics a VS Code webview host. */
export const startWebviewHost = async (bundlePath: string): Promise<WebviewHost> => {
  const nonce = randomBytes(16).toString('base64');
  const server = createServer((req, res) => {
    void (async () => {
      if (req.url === '/') {
        const origin = `http://${req.headers.host}`;
        res.writeHead(200, { 'content-type': 'text/html', 'content-security-policy': webviewCsp(origin, nonce) });
        res.end(webviewPage(origin, nonce, '/bundle.js'));
      } else if (req.url === '/bundle.js') {
        res.writeHead(200, { 'content-type': 'text/javascript' });
        res.end(await readFile(bundlePath));
      } else {
        res.writeHead(404).end();
      }
    })().catch((error: unknown) => {
      res.writeHead(500).end(String(error));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
};
