// SPDX-License-Identifier: AGPL-3.0-or-later
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
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
    if (req.url === '/gzip') {
      const gz = gzipSync(Buffer.alloc(50_000, 3));
      return void res.writeHead(200, { 'content-encoding': 'gzip', 'content-length': gz.length }).end(gz);
    }
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
test('a gzip body longer than its Content-Length is returned decoded, still capped', async () => {
  const out = await fetchBytes(`${base}/gzip`, 1_000_000);
  expect(out.length).toBe(50_000);
  expect(out[49_999]).toBe(3);
  await expect(fetchBytes(`${base}/gzip`, 20_000)).rejects.toBeInstanceOf(FileTooLargeError);
});
test('an endless stream with no Content-Length is cut off at the cap', async () => {
  await expect(fetchBytes(`${base}/endless`, 5000)).rejects.toBeInstanceOf(FileTooLargeError);
});

const stubFetch = (body: ReadableStream<Uint8Array>, headers: Record<string, string>) => {
  const real = globalThis.fetch;
  globalThis.fetch = (async () => new Response(body, { headers })) as typeof fetch;
  return () => void (globalThis.fetch = real);
};
const streamOf = (chunks: Uint8Array[], onPull?: () => void) =>
  new ReadableStream<Uint8Array>(
    {
      pull(c) {
        onPull?.();
        const next = chunks.shift();
        if (next) c.enqueue(next);
        else c.close();
      },
    },
    { highWaterMark: 0 }, // pull only when fetchBytes reads
  );

test('a known Content-Length allocates the buffer once, before the first chunk is read', async () => {
  const Real = globalThis.Uint8Array;
  let sized = 0; // allocations of exactly the declared size
  const Counting = new Proxy(Real, {
    construct(t, args, nt) {
      if (args[0] === 12_345) sized++;
      return Reflect.construct(t, args, nt);
    },
  });
  let sizedAtFirstPull = -1;
  const chunks = [new Real(5).fill(1), new Real(12_340).fill(2)];
  const restore = stubFetch(
    streamOf(chunks, () => (sizedAtFirstPull = sizedAtFirstPull < 0 ? sized : sizedAtFirstPull)),
    { 'content-length': '12345' },
  );
  globalThis.Uint8Array = Counting;
  try {
    const out = await fetchBytes('blob:x', 1_000_000);
    expect(out.length).toBe(12_345);
    expect(out[4]).toBe(1);
    expect(out[5]).toBe(2);
    expect(sizedAtFirstPull).toBe(1);
    expect(sized).toBe(1);
  } finally {
    globalThis.Uint8Array = Real;
    restore();
  }
});
test('a body longer than its Content-Length is refused', async () => {
  const restore = stubFetch(streamOf([new Uint8Array(4), new Uint8Array(4)]), { 'content-length': '6' });
  try {
    await expect(fetchBytes('blob:x', 100)).rejects.toThrow(/longer than its Content-Length/);
  } finally {
    restore();
  }
});
test('a body shorter than its Content-Length returns only what arrived', async () => {
  const restore = stubFetch(streamOf([new Uint8Array(4).fill(9)]), { 'content-length': '10' });
  try {
    const out = await fetchBytes('blob:x', 100);
    expect([...out]).toEqual([9, 9, 9, 9]);
    expect(out.buffer.byteLength).toBe(4);
  } finally {
    restore();
  }
});
