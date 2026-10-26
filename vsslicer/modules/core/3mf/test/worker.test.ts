// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { MessageChannel, Worker } from 'node:worker_threads';
import { describe, expect, test, vi } from 'vitest';
import { collectBuffers, handle } from '../src/adapters/worker/handle.ts';
import { readInNodeWorker } from '../src/adapters/worker/nodeWorkerClient.ts';
import { WorkerReadError } from '../src/adapters/worker/protocol.ts';
import type { WorkerResponse } from '../src/adapters/worker/protocol.ts';
import { attach as attachNode } from '../src/adapters/worker/nodeWorkerEntry.ts';
import { attach } from '../src/adapters/worker/webWorkerEntry.ts';
import type { WorkerScope } from '../src/adapters/worker/webWorkerEntry.ts';
import { readInWebWorker } from '../src/adapters/worker/webWorkerClient.ts';
import type { WebWorkerLike } from '../src/adapters/worker/webWorkerClient.ts';
import { openPackage, readProject } from '../src/index.ts';

const fixture = (path: string): Uint8Array =>
  new Uint8Array(readFileSync(new URL(`./fixtures/${path}`, import.meta.url)));
const REAL = 'real/pa_pattern.3mf';
const inline = (js: string): URL => new URL(`data:text/javascript,${encodeURIComponent(js)}`);
const guard = { timeout: 60_000 };

const direct = (bytes: Uint8Array) => {
  const p = openPackage(bytes);
  return { p, project: readProject(p) };
};

/** A Web Worker stand-in: the real entry on one end of a MessageChannel, the client on the other. */
function fakeWebWorker(
  seen: { transfer?: ArrayBuffer[]; sent?: WorkerResponse; terminated?: number } = {},
): () => WebWorkerLike {
  return () => {
    const { port1, port2 } = new MessageChannel();
    const scope: WorkerScope = {
      onmessage: null,
      postMessage: (m, transfer) => {
        seen.sent = m;
        seen.transfer = transfer;
        port2.postMessage(m, transfer);
      },
    };
    attach(scope);
    port2.on('message', (data) => scope.onmessage?.({ data }));
    return {
      postMessage: (m, t) => port1.postMessage(m, t),
      addEventListener: (type: string, l: (e: never) => void) =>
        port1.on(type === 'message' ? 'message' : 'x', (d) => l({ data: d } as never)),
      terminate: () => {
        seen.terminated = (seen.terminated ?? 0) + 1;
        port1.close();
        port2.close();
      },
    };
  };
}

describe('both workers run the same library', () => {
  test('node worker_threads result equals the direct read', guard, async () => {
    const want = direct(fixture(REAL));
    const got = await readInNodeWorker(fixture(REAL));
    expect(got.rootModel).toBe(want.p.rootModel);
    expect(got.parts.map((p) => [p.name, p.bytes.length])).toEqual(want.p.parts.map((p) => [p.name, p.bytes.length]));
    expect(got.project).toEqual(want.project);
    expect(got.project.objects.length).toBeGreaterThan(0);
  });

  test('web worker result equals the direct read', guard, async () => {
    const want = direct(fixture(REAL));
    const got = await readInWebWorker(fixture(REAL), fakeWebWorker());
    expect(got.project).toEqual(want.project);
    expect(got.parts.map((p) => p.name)).toEqual(want.p.parts.map((p) => p.name));
  });
});

describe('failures are typed and per file', () => {
  test('a 3MF error keeps its code', guard, async () => {
    const e = await readInNodeWorker(fixture('broken/corrupt-zip.3mf')).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(WorkerReadError);
    expect((e as WorkerReadError).code).toBe('corrupt-zip');
    const w = await readInWebWorker(fixture('broken/missing-root-model.3mf'), fakeWebWorker()).catch((x: unknown) => x);
    expect((w as WorkerReadError).code).toBe('missing-root-model');
  });

  test('a worker that throws is a crash, and the next file still reads', guard, async () => {
    const bad = inline(`process.exit(3)`);
    const e = await readInNodeWorker(fixture(REAL), { entry: bad }).catch((x: unknown) => x);
    expect((e as WorkerReadError).code).toBe('worker-crashed');
    const t = inline(`throw new Error('boom')`);
    const e2 = await readInNodeWorker(fixture(REAL), { entry: t }).catch((x: unknown) => x);
    expect((e2 as WorkerReadError).code).toBe('worker-crashed');
    await expect(readInNodeWorker(fixture(REAL))).resolves.toBeDefined();
  });

  test('running past the heap limit is out-of-memory', guard, async () => {
    const hog = inline(`const a=[]; for(let i=0;i<30;i++) a.push(new Array(1e6).fill(i+0.5)); process.exit(0)`);
    const e = await readInNodeWorker(fixture(REAL), { entry: hog, maxOldGenerationSizeMb: 32 }).catch(
      (x: unknown) => x,
    );
    expect((e as WorkerReadError).code).toBe('worker-out-of-memory');
  });

  test('a web worker error event is a crash', async () => {
    const dead = (): WebWorkerLike => ({
      postMessage: () => {},
      addEventListener: (type: string, l: (e: never) => void) => {
        if (type === 'error') queueMicrotask(() => l({ message: 'died' } as never));
      },
      terminate: () => {},
    });
    const e = await readInWebWorker(fixture(REAL), dead).catch((x: unknown) => x);
    expect((e as WorkerReadError).code).toBe('worker-crashed');
  });

  test('a web worker messageerror event is a crash', async () => {
    const bad = (): WebWorkerLike => ({
      postMessage: () => {},
      addEventListener: (type: string, l: (e: never) => void) => {
        if (type === 'messageerror') queueMicrotask(() => l({} as never));
      },
      terminate: () => {},
    });
    const e = await readInWebWorker(fixture(REAL), bad).catch((x: unknown) => x);
    expect((e as WorkerReadError).code).toBe('worker-crashed');
  });

  test('bad options are refused', () => {
    expect(() => readInNodeWorker(fixture(REAL), { maxOldGenerationSizeMb: NaN })).toThrow(RangeError);
    expect(() => readInNodeWorker(fixture(REAL), { maxOldGenerationSizeMb: 0 })).toThrow(RangeError);
    expect(() => readInNodeWorker(new Uint8Array(new SharedArrayBuffer(4)))).toThrow(TypeError);
  });
});

describe('results are transferred, not copied', () => {
  test('the input buffer is detached by the client', guard, async () => {
    const bytes = fixture(REAL);
    const pending = readInNodeWorker(bytes);
    expect(bytes.byteLength).toBe(0);
    await pending;
  });

  test('the web entry transfers every buffer of the result and detaches them in the sender', guard, async () => {
    const seen: { transfer?: ArrayBuffer[]; sent?: WorkerResponse } = {};
    await readInWebWorker(fixture(REAL), fakeWebWorker(seen));
    expect(seen.transfer!.length).toBeGreaterThan(0);
    expect(new Set(seen.transfer).size).toBe(seen.transfer!.length);
    expect(seen.transfer!.every((b) => b.byteLength === 0)).toBe(true);
    const r = seen.sent as Extract<WorkerResponse, { ok: true }>;
    expect(r.result.parts.every((p) => p.bytes.byteLength === 0)).toBe(true);
  });

  test('the node entry transfers every buffer of the result and detaches them in the sender', () => {
    const { port1, port2 } = new MessageChannel();
    let sent: WorkerResponse | undefined;
    const real = port2.postMessage.bind(port2);
    attachNode({
      once: (e, l) => port2.once(e, l),
      postMessage: (m, t) => {
        sent = m;
        real(m, t);
      },
    });
    port1.postMessage({ bytes: fixture(REAL) });
    return new Promise<void>((done) =>
      port1.once('message', () => {
        const r = sent as Extract<WorkerResponse, { ok: true }>;
        expect(r.result.parts.every((p) => p.bytes.byteLength === 0)).toBe(true);
        port1.close();
        port2.close();
        done();
      }),
    );
  });

  test('a pooled view (readFileSync Buffer) resolves and leaves the caller buffer alone', guard, async () => {
    const buf = readFileSync(new URL(`./fixtures/${REAL}`, import.meta.url));
    const size = buf.byteLength;
    const got = await readInNodeWorker(buf);
    expect(got.project.objects.length).toBeGreaterThan(0);
    expect(buf.byteLength).toBe(size);
    const big = new Uint8Array(size + 100);
    big.set(buf, 50);
    await readInNodeWorker(big.subarray(50, 50 + size));
    expect(big.byteLength).toBe(size + 100);
    await readInWebWorker(big.subarray(50, 50 + size), fakeWebWorker());
    expect(big.byteLength).toBe(size + 100);
  });

  test('a detached input rejects typed and terminates the worker', guard, async () => {
    const terminate = vi.spyOn(Worker.prototype, 'terminate');
    try {
      const bytes = fixture(REAL);
      structuredClone(bytes.buffer, { transfer: [bytes.buffer as ArrayBuffer] });
      await expect(readInNodeWorker(bytes)).rejects.toBeInstanceOf(WorkerReadError);
      expect(terminate).toHaveBeenCalledTimes(1);
    } finally {
      terminate.mockRestore();
    }
    const detached = fixture(REAL);
    structuredClone(detached.buffer, { transfer: [detached.buffer as ArrayBuffer] });
    const seen: { terminated?: number } = {};
    await expect(readInWebWorker(detached, fakeWebWorker(seen))).rejects.toBeInstanceOf(WorkerReadError);
    expect(seen.terminated).toBe(1);
  });

  test('collectBuffers lists a shared buffer once and finds buffers in maps and meshes', () => {
    const shared = new Uint8Array(8);
    const m = new Map([['k', new Uint8Array(4)]]);
    const out = collectBuffers({ a: shared, b: shared.subarray(2), c: [m], d: { v: new Float32Array(3) } });
    expect(out).toHaveLength(3);
  });

  test('collectBuffers survives a cycle', () => {
    const a: Record<string, unknown> = { v: new Uint8Array(2) };
    a.self = a;
    expect(collectBuffers(a)).toHaveLength(1);
  });

  test('collectBuffers scans 200,000-item arrays, sets and objects without overflowing the stack', () => {
    const n = 200_000;
    const tail = new Uint8Array(1);
    const arr: unknown[] = Array.from({ length: n }, (_, i) => `s${i}`);
    arr.push(tail);
    expect(collectBuffers(arr)).toEqual([tail.buffer]);
    expect(collectBuffers(new Set(arr))).toEqual([tail.buffer]);
    const obj: Record<string, unknown> = Object.fromEntries(arr.map((x, i) => [`k${i}`, x]));
    expect(collectBuffers(obj)).toEqual([tail.buffer]);
  });

  test('handle lists the project mesh buffers', () => {
    const { response, transfer } = handle({ bytes: fixture(REAL) });
    expect(response.ok).toBe(true);
    const r = (response as Extract<WorkerResponse, { ok: true }>).result;
    const mesh = r.project.objects[0]!.parts[0]!.mesh;
    expect(transfer).toContain(mesh.vertices.buffer);
  });
});
