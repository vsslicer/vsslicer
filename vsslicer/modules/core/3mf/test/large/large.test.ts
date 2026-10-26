// SPDX-License-Identifier: AGPL-3.0-or-later
// VWR-32 at test size: the generator is deterministic and valid, and the host thread keeps turning while the worker
// reads. The 500 MB run, with its memory and host-blocking gates, is run.ts.
import { expect, test } from 'vitest';
import { readInNodeWorker } from '../../src/adapters/worker/nodeWorkerClient.ts';
import { DEFAULT_MAX_ENTRY_BYTES, openPackage, readProject } from '../../src/index.ts';
import { checkArgs, large3mf, largeModel, MAX_SIZE_MB } from './generate.ts';

const MB = 1024 * 1024;
const guard = { timeout: 60_000 };
const ROW_BYTES = 160 * 1024; // one 1000-vertex row and its 1998 triangles
const triangleCount = (project: ReturnType<typeof readProject>): number =>
  project.objects.flatMap((o) => o.parts).reduce((n, p) => n + p.mesh.triangles.length / 3, 0);

test('the generator is deterministic, at most one grid row over its size, and opens with every triangle', () => {
  const a = large3mf(2 * MB, 7);
  expect(Buffer.from(a.bytes).equals(Buffer.from(large3mf(2 * MB, 7).bytes))).toBe(true);
  expect(Buffer.from(a.bytes).equals(Buffer.from(large3mf(2 * MB, 8).bytes))).toBe(false);
  expect(a.bytes.length).toBeGreaterThanOrEqual(2 * MB);
  expect(a.bytes.length - 2 * MB).toBeLessThan(ROW_BYTES);
  expect(a.triangles).toBeGreaterThan(0);
  expect(triangleCount(readProject(openPackage(a.bytes)))).toBe(a.triangles);
});

test('the generator refuses sizes past the per-entry cap and non-finite input', () => {
  for (const bad of [0, Number.NaN, Number.POSITIVE_INFINITY, (MAX_SIZE_MB + 1) * MB])
    expect(() => largeModel(bad, 1)).toThrow(RangeError);
  expect(() => largeModel(MB, 1.5)).toThrow(RangeError);
});

test('the size cap is 510 MB: accepted at the cap, refused one byte over, and its model fits the entry cap', () => {
  expect(MAX_SIZE_MB).toBe(510);
  expect(() => checkArgs(510 * MB, 1)).not.toThrow();
  expect(() => checkArgs(510 * MB + 1, 1)).toThrow(RangeError);
  expect(() => checkArgs(1, 1)).not.toThrow();
  // the model can run one grid row over its target; the reader must still accept that entry
  expect(510 * MB + ROW_BYTES).toBeLessThanOrEqual(DEFAULT_MAX_ENTRY_BYTES);
});

test('the host event loop keeps turning while the worker reads a large file', guard, async () => {
  const { bytes, triangles } = large3mf(8 * MB, 1);
  let turns = 0;
  let spinning = true;
  const spin = (): void => {
    turns++;
    if (spinning) setImmediate(spin);
  };
  setImmediate(spin);
  const before = turns;
  const result = await readInNodeWorker(bytes);
  spinning = false;
  expect(triangleCount(result.project)).toBe(triangles);
  // a read on the host thread would run between two turns, leaving almost none; the worker leaves thousands
  expect(turns - before).toBeGreaterThan(100);
});
