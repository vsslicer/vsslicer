// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
  FileTooLargeError,
  MalformedMeshError,
  NonFiniteCoordinateError,
  TooManyTrianglesError,
  TriangleCountMismatchError,
  WorkerCrashedError,
  deserialiseBvh,
  nodeModelWorker,
  parseModel,
  parseObj,
} from '../src/index.ts';

const read = (n: string) => new Uint8Array(readFileSync(new URL(`./fixtures/stl-obj/${n}`, import.meta.url)));

test.each([
  ['box-binary.stl', undefined],
  ['box-ascii.stl', 'stl'],
  ['box-ascii.stl', undefined],
  ['box-groups.obj', '.obj'],
  ['box-groups.obj', undefined],
  ['box-binary-solid-header.stl', undefined],
])('%s (ext %s) parses with stats', async (name, extension) => {
  const r = await parseModel(read(name), { extension });
  if (r.kind !== 'parsed') throw new Error('expected parsed');
  expect(r.mesh.indices.length / 3).toBe(r.stats.triangleCount);
  expect(r.stats.triangleCount).toBeGreaterThanOrEqual(12);
});

test('above the soft cap asks to confirm, confirmed parses, above the hard cap throws', async () => {
  const bytes = read('box-binary.stl');
  expect(await parseModel(bytes, { softTriangleCap: 5 })).toMatchObject({ kind: 'confirm-needed', triangleCount: 12 });
  expect((await parseModel(bytes, { softTriangleCap: 5, confirmed: true })).kind).toBe('parsed');
  await expect(parseModel(bytes, { hardTriangleCap: 5, confirmed: true })).rejects.toBeInstanceOf(
    TooManyTrianglesError,
  );
  // text formats are counted after parsing
  expect(await parseModel(read('box-ascii.stl'), { softTriangleCap: 5 })).toMatchObject({ kind: 'confirm-needed' });
  await expect(parseModel(read('box-groups.obj'), { hardTriangleCap: 5 })).rejects.toBeInstanceOf(
    TooManyTrianglesError,
  );
});

test('file-size cap and a header that lies about its count', async () => {
  await expect(parseModel(read('box-binary.stl'), { maxFileBytes: 100 })).rejects.toBeInstanceOf(FileTooLargeError);
  await expect(parseModel(read('box-binary-count-too-large.stl'))).rejects.toBeInstanceOf(TriangleCountMismatchError);
});

test('one endless line, fed in chunks, is refused after a bounded number of chunks', async () => {
  const chunk = new TextEncoder().encode('1 '.repeat(32_768)); // 64 KiB; the line cap is 1 MiB
  let consumed = 0;
  const chunks = {
    *[Symbol.iterator]() {
      for (let i = 0; i < 200; i++) {
        consumed++;
        yield chunk;
      }
    },
  };
  await expect(parseObj(chunks)).rejects.toBeInstanceOf(MalformedMeshError);
  expect(consumed).toBeLessThanOrEqual(32);
}, 30_000); // hang guard only

test('worker: parses with a BVH, transfers the input, returns transferred buffers', async () => {
  const bytes = read('cura-BIQU_BX_PLATE.stl').slice();
  const r = await nodeModelWorker.parse(bytes);
  expect(bytes.buffer.byteLength).toBe(0); // detached in the sender
  if (r.kind !== 'parsed') throw new Error('expected parsed');
  expect(r.stats.triangleCount).toBeGreaterThan(0);
  const bvh = deserialiseBvh(r.bvh, r.mesh);
  expect(bvh.raycastFirst).toBeTypeOf('function');
  expect(r.mesh.positions.buffer.byteLength).toBeGreaterThan(0);
});

test('worker: confirm-needed and OBJ', async () => {
  expect((await nodeModelWorker.parse(read('box-binary.stl').slice(), { softTriangleCap: 5 })).kind).toBe(
    'confirm-needed',
  );
  expect((await nodeModelWorker.parse(read('box-groups.obj').slice(), { extension: 'obj' })).kind).toBe('parsed');
});

test('worker: typed errors survive the boundary with their fields', async () => {
  const e = await nodeModelWorker.parse(read('box-binary-nan.stl').slice()).catch((x: unknown) => x);
  expect(e).toBeInstanceOf(NonFiniteCoordinateError);
  expect(e).toMatchObject({ code: 'non-finite' });
  expect((e as Error).message).toMatch(/not a finite number/);
  await expect(nodeModelWorker.parse(read('box-binary.stl').slice(), { hardTriangleCap: 1 })).rejects.toMatchObject({
    code: 'too-many-triangles',
    capTriangles: 1,
  });
});

test('worker: abort terminates and rejects with the signal reason', async () => {
  const c = new AbortController();
  const p = nodeModelWorker.parse(read('cura-BIQU_BX_PLATE.stl').slice(), {}, c.signal);
  c.abort(new Error('cancelled'));
  await expect(p).rejects.toThrow('cancelled');
  await expect(nodeModelWorker.parse(read('box-binary.stl').slice(), {}, c.signal)).rejects.toThrow('cancelled');
});

test('worker: a crash is a typed error for that file', async () => {
  const bytes = read('box-binary.stl').slice();
  // a non-object opts makes the worker throw outside parseModel's own checks: structured clone of a function fails in the caller
  const e = await nodeModelWorker
    .parse(bytes, { maxFileBytes: 1e9, extension: 5 as unknown as string })
    .catch((x: unknown) => x);
  // extension 5 throws a plain TypeError inside the worker: reported as WorkerCrashedError
  expect(e).toBeInstanceOf(WorkerCrashedError);
});

const workers = () => process.getActiveResourcesInfo().filter((r) => /worker/i.test(r)).length;
const noLeak = async (before: number) => {
  for (let i = 0; i < 50 && workers() > before; i++) await new Promise((r) => setTimeout(r, 20));
  expect(workers()).toBe(before);
};

test('worker: an uncloneable option is a WorkerCrashedError and leaves no worker or abort listener', async () => {
  const before = workers();
  const c = new AbortController();
  const e = await nodeModelWorker
    .parse(read('box-binary.stl').slice(), { extension: (() => 1) as unknown as string }, c.signal)
    .catch((x: unknown) => x);
  expect(e).toBeInstanceOf(WorkerCrashedError);
  expect(c.signal.aborted).toBe(false);
  await noLeak(before);
});

test('worker: parsing the same (now detached) bytes twice is a WorkerCrashedError and leaves no worker', async () => {
  const bytes = read('box-binary.stl').slice();
  await nodeModelWorker.parse(bytes);
  const before = workers();
  await expect(nodeModelWorker.parse(bytes)).rejects.toBeInstanceOf(WorkerCrashedError);
  await noLeak(before);
});
