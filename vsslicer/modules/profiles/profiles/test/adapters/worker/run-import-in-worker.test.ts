// SPDX-License-Identifier: AGPL-3.0-or-later
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { SourceFile } from '@vsslicer/profile-api';
import { describe, expect, test, vi } from 'vitest';
import { MAX_IMPORT_FILES } from '../../../src/application/import/registry.ts';
import { MAX_BUDGET_MS, MAX_HEARTBEAT_MS, runImportInWorker } from '../../../src/adapters/worker/index.ts';

const HANG_GUARD = 60_000; // rule 26: a timeout is only a hang guard
const fixture = (name: string) => pathToFileURL(join(import.meta.dirname, 'fixtures', name)).href;
const file = (path: string, ...bytes: number[]): SourceFile => ({ path, bytes: Uint8Array.from(bytes) });
const messages = (r: { diagnostics: { message: string }[] }) => r.diagnostics.map((d) => d.message);

describe('result and bounds', () => {
  test('files cross to the worker and the result comes back', async () => {
    const r = await runImportInWorker({
      importerModule: fixture('echo.mjs'),
      files: [file('a', 1, 2), file('b', 3)],
      budgetMs: 30_000,
    });
    expect(messages(r)).toEqual(['2 files, sum 6']);
  });

  test('a function default export is called to make the importer', async () => {
    const r = await runImportInWorker({ importerModule: fixture('throws.mjs'), files: [], budgetMs: 30_000 });
    expect(messages(r)).toEqual(['the import worker failed: boom from the importer']);
  });

  test('a result of the wrong shape becomes a diagnostic', async () => {
    const r = await runImportInWorker({ importerModule: fixture('badresult.mjs'), files: [], budgetMs: 30_000 });
    expect(r.entities).toEqual([]);
    expect(messages(r)[0]).toContain('the import worker failed');
  });

  test('budget and heartbeat are validated: cap accepted, cap plus one refused', async () => {
    const base = { importerModule: fixture('echo.mjs'), files: [] };
    await expect(runImportInWorker({ ...base, budgetMs: MAX_BUDGET_MS + 1 })).rejects.toThrow(RangeError);
    await expect(runImportInWorker({ ...base, budgetMs: 0 })).rejects.toThrow(RangeError);
    await expect(runImportInWorker({ ...base, budgetMs: Number.NaN })).rejects.toThrow(RangeError);
    await expect(runImportInWorker({ ...base, budgetMs: 1000, heartbeatMs: MAX_HEARTBEAT_MS + 1 })).rejects.toThrow(
      RangeError,
    );
    const ok = await runImportInWorker({
      ...base,
      budgetMs: MAX_BUDGET_MS,
      heartbeatMs: MAX_HEARTBEAT_MS,
    });
    expect(messages(ok)).toEqual(['0 files, sum 0']);
    await expect(runImportInWorker({ ...base, importerModule: '/tmp/x.mjs', budgetMs: 1000 })).rejects.toThrow(
      RangeError,
    );
  });

  test(
    'the file cap is exact: cap files run, cap plus one are refused without starting a worker',
    async () => {
      const make = (n: number) => Array.from({ length: n }, (_, i) => file(String(i)));
      const ok = await runImportInWorker({
        importerModule: fixture('echo.mjs'),
        files: make(MAX_IMPORT_FILES),
        budgetMs: 30_000,
      });
      expect(messages(ok)).toEqual([`${MAX_IMPORT_FILES} files, sum 0`]);
      const over = await runImportInWorker({
        importerModule: fixture('crash.mjs'), // would report an exit code if a worker ran
        files: make(MAX_IMPORT_FILES + 1),
        budgetMs: 30_000,
      });
      expect(messages(over)[0]).toContain(`more than the ${MAX_IMPORT_FILES}`);
    },
    HANG_GUARD,
  );
});

describe('crash, budget and cancel', () => {
  test('a worker crash returns a diagnostic and the next import works', async () => {
    const crashed = await runImportInWorker({ importerModule: fixture('crash.mjs'), files: [], budgetMs: 30_000 });
    expect(crashed.entities).toEqual([]);
    expect(crashed.diagnostics).toMatchObject([{ severity: 'error', message: 'the import worker exited with code 3' }]);
    const next = await runImportInWorker({
      importerModule: fixture('echo.mjs'),
      files: [file('a', 1)],
      budgetMs: 30_000,
    });
    expect(messages(next)).toEqual(['1 files, sum 1']);
  });

  test('a missing importer module is a diagnostic', async () => {
    const r = await runImportInWorker({ importerModule: fixture('absent.mjs'), files: [], budgetMs: 30_000 });
    expect(r.diagnostics[0]!.severity).toBe('error');
  });

  test('a finished import clears every timer it made', async () => {
    const setI = vi.spyOn(globalThis, 'setInterval');
    const setT = vi.spyOn(globalThis, 'setTimeout');
    const clrI = vi.spyOn(globalThis, 'clearInterval');
    const clrT = vi.spyOn(globalThis, 'clearTimeout');
    try {
      await runImportInWorker({ importerModule: fixture('echo.mjs'), files: [], budgetMs: 30_000 });
      const made = [...setI.mock.results, ...setT.mock.results].map((r) => r.value);
      const cleared = new Set([...clrI.mock.calls, ...clrT.mock.calls].map((c) => c[0]));
      expect(made.length).toBeGreaterThanOrEqual(2); // heartbeat and budget
      for (const h of made) expect(cleared.has(h)).toBe(true);
    } finally {
      for (const s of [setI, setT, clrI, clrT]) s.mockRestore();
    }
  });

  test('a worker result keeps the null prototype and the colliding keys', async () => {
    const r = await runImportInWorker({ importerModule: fixture('native.mjs'), files: [], budgetMs: 30_000 });
    expect(Object.getPrototypeOf(r.native)).toBeNull();
    expect(Object.keys(r.native).sort()).toEqual(['__proto__', 'constructor']);
    expect((r.native as Record<string, unknown>)['toString']).toBeUndefined();
  });

  test('the time budget kills a worker that never returns', async () => {
    const r = await runImportInWorker({ importerModule: fixture('spin.mjs'), files: [], budgetMs: 300 });
    expect(messages(r)).toEqual(['the import exceeded 300 ms']);
  });

  test(
    'cancel stops a spinning worker within 1 s',
    async () => {
      const ctl = new AbortController();
      const run = runImportInWorker({
        importerModule: fixture('spin.mjs'),
        files: [],
        budgetMs: MAX_BUDGET_MS,
        signal: ctl.signal,
      });
      await new Promise((r) => setTimeout(r, 300)); // let the worker reach its loop
      const t0 = performance.now();
      ctl.abort();
      const r = await run;
      expect(performance.now() - t0).toBeLessThan(1000); // the card's own bound, not a perf assertion
      expect(messages(r)).toEqual(['the import was cancelled']);
    },
    HANG_GUARD,
  );

  test('an already aborted signal never starts a worker', async () => {
    const r = await runImportInWorker({
      importerModule: fixture('crash.mjs'),
      files: [],
      budgetMs: 30_000,
      signal: AbortSignal.abort(),
    });
    expect(messages(r)).toEqual(['the import was cancelled']);
  });
});

/** Runs one import and returns the worst heartbeat lag seen and the number of beats. */
async function withBeats(importerModule: string, files: SourceFile[]) {
  let worst = 0;
  let beats = 0;
  const result = await runImportInWorker({
    importerModule,
    files,
    budgetMs: 120_000,
    heartbeatMs: 20,
    onBeat: (lag) => {
      beats++;
      worst = Math.max(worst, lag);
    },
  });
  return { result, worst, beats };
}

describe('the host stays responsive', () => {
  test(
    'a long synchronous import does not delay the host heartbeat by more than 200 ms',
    async () => {
      const { result, worst, beats } = await withBeats(fixture('cpu.mjs'), [file('a', 1)]);
      expect(messages(result)).toEqual(['done true']);
      expect(beats).toBeGreaterThan(5); // the host kept beating while the worker worked
      expect(worst).toBeLessThanOrEqual(200);
    },
    HANG_GUARD,
  );
});
