// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { FileTooLargeError, WorkerCrashedError } from '../src/index.ts';
import { handleParseRequest } from '../src/adapters/worker-web/handler.ts';
import { PoolDisposedError, PoolQueueFullError } from '../src/adapters/worker-web/errors.ts';
import { createWebModelWorkerPool } from '../src/adapters/worker-web/pool.ts';
import type { PoolWorker } from '../src/adapters/worker-web/pool.ts';

class FakeWorker implements PoolWorker {
  onmessage: PoolWorker['onmessage'] = null;
  onerror: PoolWorker['onerror'] = null;
  onmessageerror: PoolWorker['onmessageerror'] = null;
  posted = 0;
  terminated = false;
  postMessage = (m: unknown, t: ArrayBuffer[]) => {
    structuredClone(m, { transfer: t }); // really detaches, like a browser worker
    this.posted++;
  };
  terminate = () => void (this.terminated = true);
  reply = () =>
    this.onmessage?.({ data: { ok: true, result: { kind: 'confirm-needed', triangleCount: 1, softCap: 0 } } });
}
const setup = (o: { size?: number; maxQueued?: number; maxInFlight?: number; maxInputBytes?: number } = {}) => {
  const spawned: FakeWorker[] = [];
  const pool = createWebModelWorkerPool({
    size: 2,
    ...o,
    spawn: () => {
      const w = new FakeWorker();
      spawned.push(w);
      return w;
    },
  });
  return { pool, spawned };
};
const bytes = () => new Uint8Array(8);
const settled = (p: Promise<unknown>) =>
  p.then(
    () => 'ok',
    (e: unknown) => e,
  );

test.each([0, 17, 1.5, NaN, -1])('pool size %s is refused', (size) => {
  expect(() => setup({ size })).toThrow(RangeError);
});
test.each([{ maxQueued: -1 }, { maxQueued: 1025 }, { maxInFlight: 3 }, { maxInFlight: 0 }, { maxInputBytes: 0 }])(
  'bad limit %j is refused',
  (o) => expect(() => setup(o)).toThrow(RangeError),
);
test('size 1 and 16 are accepted', () => {
  expect(() => setup({ size: 1 })).not.toThrow();
  expect(() => setup({ size: 16 })).not.toThrow();
});

test('input over the cap is refused before any worker starts', async () => {
  const { pool, spawned } = setup({ maxInputBytes: 4 });
  await expect(pool.parse(bytes())).rejects.toBeInstanceOf(FileTooLargeError);
  await expect(pool.parse(new Uint8Array(3), { maxFileBytes: 2 })).rejects.toBeInstanceOf(FileTooLargeError);
  expect(spawned.length).toBe(0);
});

test('in-flight cap, FIFO queue, then a named refusal', async () => {
  const { pool, spawned } = setup({ size: 1, maxQueued: 1 });
  const a = settled(pool.parse(bytes()));
  const b = settled(pool.parse(bytes()));
  expect(await settled(pool.parse(bytes()))).toBeInstanceOf(PoolQueueFullError);
  expect(spawned.length).toBe(1);
  expect(spawned[0]!.posted).toBe(1); // b waits
  spawned[0]!.reply();
  expect(await a).toBe('ok');
  expect(spawned.length).toBe(1); // the worker is reused
  expect(spawned[0]!.posted).toBe(2);
  spawned[0]!.reply();
  expect(await b).toBe('ok');
});

test('a crash rejects only its job; the other job and a later one still succeed', async () => {
  const { pool, spawned } = setup({ size: 2 });
  const a = settled(pool.parse(bytes()));
  const b = settled(pool.parse(bytes()));
  spawned[0]!.onerror?.({ message: 'boom' });
  expect(await a).toBeInstanceOf(WorkerCrashedError);
  expect(spawned[0]!.terminated).toBe(true);
  spawned[1]!.reply();
  expect(await b).toBe('ok');
  const c = settled(pool.parse(bytes()));
  spawned[1]!.reply();
  expect(await c).toBe('ok');
  expect(spawned.length).toBe(2); // the healthy worker took the third job
});

test('abort rejects a queued and a running job; the running worker is replaced', async () => {
  const { pool, spawned } = setup({ size: 1 });
  const ac = new AbortController();
  const running = settled(pool.parse(bytes(), {}, ac.signal));
  const queued = settled(pool.parse(bytes(), {}, ac.signal));
  ac.abort(new Error('stop'));
  expect(((await queued) as Error).message).toBe('stop');
  expect(((await running) as Error).message).toBe('stop');
  expect(spawned[0]!.terminated).toBe(true);
  const next = settled(pool.parse(bytes()));
  expect(spawned.length).toBe(2); // a follow-up parse gets a fresh worker
  spawned[1]!.reply();
  expect(await next).toBe('ok');
});

test('the abort listener is removed once the job starts or ends', async () => {
  const { pool, spawned } = setup({ size: 1 });
  let live = 0;
  const signal = new AbortController().signal;
  const add = signal.addEventListener.bind(signal);
  const remove = signal.removeEventListener.bind(signal);
  signal.addEventListener = ((t: string, l: never, o?: never) => (live++, add(t, l, o))) as never;
  signal.removeEventListener = ((t: string, l: never, o?: never) => (live--, remove(t, l, o))) as never;
  const a = settled(pool.parse(bytes(), {}, signal));
  const b = settled(pool.parse(bytes(), {}, signal)); // queued behind a
  expect(live).toBe(2); // a: running; b: queued
  spawned[0]!.reply();
  await a;
  expect(live).toBe(1); // a ended, b started: one listener left
  spawned[0]!.reply();
  await b;
  expect(live).toBe(0);
});

test('dispose rejects running and queued work and stops later requests', async () => {
  const { pool, spawned } = setup({ size: 1 });
  const a = settled(pool.parse(bytes()));
  const b = settled(pool.parse(bytes()));
  pool.dispose();
  expect(await a).toBeInstanceOf(PoolDisposedError);
  expect(await b).toBeInstanceOf(PoolDisposedError);
  expect(spawned[0]!.terminated).toBe(true);
  expect(await settled(pool.parse(bytes()))).toBeInstanceOf(PoolDisposedError);
});

test('a view that does not own its buffer is copied, not transferred whole', async () => {
  const whole = new Uint8Array(16);
  const { pool, spawned } = setup({ size: 2 });
  void pool.parse(whole.subarray(4, 8));
  expect(whole.buffer.byteLength).toBe(16); // a transferred buffer would read 0
  const own = new Uint8Array(8);
  void pool.parse(own);
  expect(own.buffer.byteLength).toBe(0); // an owning array is moved
  expect(spawned[0]!.posted).toBe(1);
});

test('the worker hands the mesh and BVH buffers over in the transfer list', async () => {
  const stl = new Uint8Array(readFileSync(new URL('./fixtures/stl-obj/box-binary.stl', import.meta.url)));
  let sent: { message: any; transfer: ArrayBuffer[] } | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  await handleParseRequest({ bytes: stl, opts: {} }, (message, transfer) => (sent = { message, transfer }));
  const { mesh } = sent!.message.result;
  expect(sent!.message.ok).toBe(true);
  expect(sent!.transfer).toContain(mesh.positions.buffer);
  expect(sent!.transfer).toContain(mesh.indices.buffer);
  expect(sent!.transfer.length).toBeGreaterThanOrEqual(3); // plus the BVH roots
});

test('parseUrl refuses before downloading when running, queued and downloading requests fill the limits', async () => {
  const { pool } = setup({ size: 1, maxQueued: 1 });
  let fetches = 0;
  const real = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetches++;
    return new Response(new Uint8Array(8));
  }) as typeof fetch;
  try {
    const calls = Array.from({ length: 10 }, () => settled(pool.parseUrl('blob:x')));
    await new Promise((r) => setTimeout(r, 20)); // the fake workers never reply: let every call reach its decision
    pool.dispose(); // rejects the two accepted ones
    const results = await Promise.all(calls);
    // capacity is 1 running + 1 queued: two downloads start, the other eight are refused without a fetch
    expect(fetches).toBe(2);
    expect(results.filter((r) => r instanceof PoolQueueFullError).length).toBe(8);
  } finally {
    globalThis.fetch = real;
    pool.dispose();
  }
});

test('a failed download and a finished download each free their slot', async () => {
  const { pool, spawned } = setup({ size: 1, maxQueued: 0 }); // capacity 1: a leaked slot refuses every later call
  let fetches = 0;
  let fail = true;
  const real = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetches++;
    if (fail) throw new Error('network down');
    return new Response(new Uint8Array(8));
  }) as typeof fetch;
  const tick = () => new Promise((r) => setTimeout(r, 20));
  try {
    expect(await settled(pool.parseUrl('blob:x'))).toBeInstanceOf(Error);
    fail = false;
    for (let i = 0; i < 3; i++) {
      const p = settled(pool.parseUrl('blob:x'));
      await tick();
      spawned[0]!.reply();
      expect(await p).toBe('ok');
    }
    expect(fetches).toBe(4); // every call reached fetch, none was refused
  } finally {
    globalThis.fetch = real;
    pool.dispose();
  }
});
