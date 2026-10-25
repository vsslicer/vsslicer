// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { describe, expect, test, vi } from 'vitest';
import type { Channel } from '../src/application/channel.ts';
import { handshake } from '../src/application/handshake.ts';
import { receiveBuffers, sendBuffer } from '../src/application/transfer.ts';
import { ACK_METHOD, CHUNK_METHOD, ack, chunk } from '../src/domain/chunk.ts';
import { PROTOCOL_TAG, TRANSPORT_SCHEMA_VERSION, TimeoutError, VersionMismatchError } from '../src/domain/protocol.ts';
import { pair } from './pair.ts';

const sha = (b: ArrayBuffer | Uint8Array) => createHash('sha256').update(new Uint8Array(b)).digest('hex');
const bytes = (n: number) => Uint8Array.from({ length: n }, (_, i) => (i * 31 + (i >> 8)) & 0xff);
const tick = () => new Promise((r) => setTimeout(r, 0));
const kinds = (log: unknown[], method: string) =>
  log.filter((m) => (m as { method?: string }).method === method) as Array<Record<string, unknown>>;

/** Receiver on `end` that resolves the next completed buffer, or rejects with the stream's error. */
function receiveOne(end: Channel, options?: Parameters<typeof receiveBuffers>[2]) {
  return new Promise<{ stream: string; data: ArrayBuffer }>((resolve, reject) => {
    const stop = receiveBuffers(
      end,
      {
        onBuffer: (stream, data) => (stop(), resolve({ stream, data })),
        onError: (_stream, error) => (stop(), reject(error)),
      },
      options,
    );
  });
}

describe('chunk reassembly', () => {
  const chunkSize = 16;
  test.each([0, 1, 15, 16, 17, 32, 16 * 10 + 3, 4096])('%i bytes arrive with the same hash', async (n) => {
    const [host, webview, log] = pair();
    const data = bytes(n);
    const got = receiveOne(webview);
    await sendBuffer(host, 's', data, { chunkSize, window: 3 });
    const { stream, data: out } = await got;
    expect(stream).toBe('s');
    expect(out.byteLength).toBe(n);
    expect(sha(out)).toBe(sha(data));
    expect(kinds(log, CHUNK_METHOD)).toHaveLength(Math.max(1, Math.ceil(n / chunkSize)));
  });

  test('chunk size is configurable and every chunk payload is an ArrayBuffer of at most that size', async () => {
    const [host, webview, log] = pair();
    const got = receiveOne(webview);
    await sendBuffer(host, 's', bytes(100).buffer, { chunkSize: 30 });
    await got;
    const sizes = kinds(log, CHUNK_METHOD).map((c) => (c.payload as ArrayBuffer).byteLength);
    expect(sizes).toEqual([30, 30, 30, 10]);
    expect(kinds(log, CHUNK_METHOD).every((c) => c.payload instanceof ArrayBuffer)).toBe(true);
  });

  test('a view into a larger buffer sends only the viewed bytes', async () => {
    const [host, webview] = pair();
    const backing = bytes(64);
    const view = backing.subarray(10, 50);
    const got = receiveOne(webview);
    await sendBuffer(host, 's', view, { chunkSize: 7 });
    expect(sha((await got).data)).toBe(sha(view));
  });

  test('rejects a chunk size that is not a positive integer', async () => {
    const [host] = pair();
    await expect(sendBuffer(host, 's', bytes(4), { chunkSize: 0 })).rejects.toThrow(RangeError);
  });
});

describe('ordering', () => {
  test('chunks delivered out of order and duplicated reassemble in sequence order', async () => {
    const [host, webview] = pair();
    const data = bytes(50);
    const got = receiveOne(webview);
    const parts = [0, 1, 2, 3, 4].map((i) => chunk('s', i, 5, data.slice(i * 10, i * 10 + 10).buffer));
    for (const i of [3, 0, 4, 4, 1, 2]) host.post(parts[i]);
    expect(sha((await got).data)).toBe(sha(data));
  });

  test('acks are cumulative: they count contiguous chunks only', async () => {
    const [host, webview, log] = pair();
    const stop = receiveBuffers(webview, { onBuffer: vi.fn(), onError: vi.fn() });
    host.post(chunk('s', 1, 3, new ArrayBuffer(1)));
    host.post(chunk('s', 0, 3, new ArrayBuffer(1)));
    await tick();
    expect(kinds(log, ACK_METHOD).map((a) => a.seq)).toEqual([0, 2]);
    stop();
  });

  test('concurrent streams on one channel stay separate', async () => {
    const [host, webview] = pair();
    const done: Record<string, string> = {};
    const stop = receiveBuffers(webview, { onBuffer: (s, d) => (done[s] = sha(d)), onError: vi.fn() });
    const a = bytes(100);
    const b = bytes(77).reverse();
    await Promise.all([sendBuffer(host, 'a', a, { chunkSize: 9 }), sendBuffer(host, 'b', b, { chunkSize: 5 })]);
    expect(done).toEqual({ a: sha(a), b: sha(b) });
    stop();
  });

  test('a chunk whose count disagrees with the stream fails that stream', async () => {
    const [host, webview] = pair();
    const onError = vi.fn();
    receiveBuffers(webview, { onBuffer: vi.fn(), onError });
    host.post(chunk('s', 0, 3, new ArrayBuffer(1)));
    host.post(chunk('s', 1, 4, new ArrayBuffer(1)));
    await tick();
    expect(onError).toHaveBeenCalledWith('s', expect.objectContaining({ code: 'invalid-envelope' }));
  });

  test('malformed chunks are ignored', async () => {
    const [host, webview] = pair();
    const onBuffer = vi.fn();
    receiveBuffers(webview, { onBuffer, onError: vi.fn() });
    const bad = (f: Record<string, unknown>) => ({ ...chunk('s', 0, 1, new ArrayBuffer(1)), ...f });
    for (const f of [{ seq: 1 }, { seq: -1 }, { count: 0 }, { stream: '' }, { payload: 'text' }]) host.post(bad(f));
    await tick();
    expect(onBuffer).not.toHaveBeenCalled();
  });
});

describe('backpressure', () => {
  test('the sender keeps at most `window` unacknowledged chunks in flight', async () => {
    const [host, webview, log] = pair();
    const sending = sendBuffer(host, 's', bytes(100), { chunkSize: 10, window: 3, timeoutMs: 1000 });
    await tick();
    expect(kinds(log, CHUNK_METHOD).map((c) => c.seq)).toEqual([0, 1, 2]);
    webview.post(ack('s', 1));
    await tick();
    expect(kinds(log, CHUNK_METHOD).map((c) => c.seq)).toEqual([0, 1, 2, 3]);
    webview.post(ack('other', 10)); // another stream's ack does not open this window
    webview.post(ack('s', 1)); // a repeated ack does not either
    await tick();
    expect(kinds(log, CHUNK_METHOD)).toHaveLength(4);
    // an ack beyond what was sent is clamped: the window advances by what was really in flight
    webview.post(ack('s', 10));
    await tick();
    expect(kinds(log, CHUNK_METHOD).map((c) => c.seq)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    webview.post(ack('s', 7));
    await tick();
    webview.post(ack('s', 10));
    await expect(sending).resolves.toBeUndefined();
  });

  test('in-flight count never exceeds the window during a full transfer', async () => {
    const [host, webview, log] = pair();
    const got = receiveOne(webview);
    await sendBuffer(host, 's', bytes(1000), { chunkSize: 10, window: 4 });
    await got;
    let sent = 0;
    let acked = 0;
    for (const m of log as Array<Record<string, unknown>>) {
      if (m.method === CHUNK_METHOD) sent++;
      if (m.method === ACK_METHOD) acked = Math.max(acked, m.seq as number);
      expect(sent - acked).toBeLessThanOrEqual(4);
    }
    expect(sent).toBe(100);
  });
});

describe('timeouts', () => {
  test('a sender with no acknowledgement rejects with TimeoutError', async () => {
    const [host, , log] = pair();
    const err = await sendBuffer(host, 's', bytes(10), { chunkSize: 4, timeoutMs: 20 }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TimeoutError);
    expect(err).toMatchObject({ name: 'TimeoutError', code: 'timeout', ms: 20 });
    expect(log).toHaveLength(3);
  });

  test('a stalled stream fails on the receiver with TimeoutError and is dropped', async () => {
    const [host, webview] = pair();
    const got = receiveOne(webview, { timeoutMs: 20 });
    host.post(chunk('s', 0, 2, new ArrayBuffer(1)));
    await expect(got).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  test('handshake rejects with TimeoutError when no host answers', async () => {
    const [, webview] = pair();
    await expect(handshake(webview, 's', { timeoutMs: 20 })).rejects.toBeInstanceOf(TimeoutError);
  });

  test('unsubscribing the receiver clears its stream timers', async () => {
    const [host, webview] = pair();
    const onError = vi.fn();
    const stop = receiveBuffers(webview, { onBuffer: vi.fn(), onError }, { timeoutMs: 10 });
    host.post(chunk('s', 0, 2, new ArrayBuffer(1)));
    await tick();
    stop();
    await new Promise((r) => setTimeout(r, 30));
    expect(onError).not.toHaveBeenCalled();
  });
});

describe('version mismatch after reload', () => {
  test('a peer reloaded onto a newer version fails the transfer with VersionMismatchError', async () => {
    const [host, webview] = pair();
    const sending = sendBuffer(host, 's', bytes(100), { chunkSize: 10, window: 2 });
    webview.post({ ...ack('s', 1), v: TRANSPORT_SCHEMA_VERSION + 1 });
    await expect(sending).rejects.toMatchObject({
      name: 'VersionMismatchError',
      expected: TRANSPORT_SCHEMA_VERSION,
      received: TRANSPORT_SCHEMA_VERSION + 1,
    });
  });

  test('a reload frame mid-transfer fails the transfer', async () => {
    const [host, webview] = pair();
    const sending = sendBuffer(host, 's', bytes(100), { chunkSize: 10, window: 2 });
    webview.post({ tag: PROTOCOL_TAG, v: 2, kind: 'reload', expected: 2 });
    await expect(sending).rejects.toBeInstanceOf(VersionMismatchError);
  });

  test('the receiver ignores chunks from another version', async () => {
    const [host, webview] = pair();
    const onBuffer = vi.fn();
    receiveBuffers(webview, { onBuffer, onError: vi.fn() });
    host.post({ ...chunk('s', 0, 1, new ArrayBuffer(1)), v: TRANSPORT_SCHEMA_VERSION + 1 });
    await tick();
    expect(onBuffer).not.toHaveBeenCalled();
  });
});

describe('late chunks of a closed stream', () => {
  const setup = () => {
    vi.useFakeTimers();
    const [host, webview] = pair();
    const onBuffer = vi.fn();
    const onError = vi.fn();
    receiveBuffers(webview, { onBuffer, onError }, { timeoutMs: 100 });
    return { host, onBuffer, onError };
  };
  const flush = () => vi.advanceTimersByTimeAsync(1000);
  const one = new ArrayBuffer(1);

  test('a duplicate of a finished single-chunk stream does not fire onBuffer again', async () => {
    const { host, onBuffer, onError } = setup();
    host.post(chunk('s', 0, 1, one));
    host.post(chunk('s', 0, 1, one));
    await flush();
    expect(onBuffer).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test('a duplicate of chunk 0 after a two-chunk stream finished raises no TimeoutError', async () => {
    const { host, onBuffer, onError } = setup();
    host.post(chunk('s', 0, 2, one));
    host.post(chunk('s', 1, 2, one));
    await flush();
    host.post(chunk('s', 0, 2, one));
    await flush();
    expect(onBuffer).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test('later chunks of a stream that failed do not reopen it', async () => {
    const { host, onBuffer, onError } = setup();
    host.post(chunk('s', 0, 2, one));
    host.post(chunk('s', 1, 3, one));
    await flush();
    host.post(chunk('s', 1, 2, one));
    await flush();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onBuffer).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
