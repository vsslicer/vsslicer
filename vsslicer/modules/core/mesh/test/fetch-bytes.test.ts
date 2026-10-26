// SPDX-License-Identifier: AGPL-3.0-or-later
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { FileTooLargeError } from '../src/index.ts';
import { fetchBytes } from '../src/adapters/worker-web/fetch-bytes.ts';

let server: Server;
let base = '';
beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === '/declared')
      return void res.writeHead(200, { 'content-length': 100_000 }).end(Buffer.alloc(100_000));
    if (req.url === '/ok') return void res.writeHead(200, { 'content-length': 10 }).end(Buffer.alloc(10, 7));
    // No Content-Length: chunked, endless until the client hangs up.
    res.writeHead(200);
    const timer = setInterval(() => res.write(Buffer.alloc(1000)), 1);
    res.on('close', () => clearInterval(timer));
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
  server.closeAllConnections();
  server.close();
});

test('a body within the cap is returned whole', async () => {
  expect([...(await fetchBytes(`${base}/ok`, 100))]).toEqual(Array(10).fill(7));
});
test('a Content-Length over the cap is refused', async () => {
  await expect(fetchBytes(`${base}/declared`, 1000)).rejects.toBeInstanceOf(FileTooLargeError);
});
test('an endless stream with no Content-Length is cut off at the cap', async () => {
  await expect(fetchBytes(`${base}/endless`, 5000)).rejects.toBeInstanceOf(FileTooLargeError);
});
