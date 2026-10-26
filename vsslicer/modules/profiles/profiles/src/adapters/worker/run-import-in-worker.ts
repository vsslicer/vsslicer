// SPDX-License-Identifier: AGPL-3.0-or-later
// The worker runner (PRF-39): an import runs in a worker_thread so a 14k-file tree cannot block the extension host.
// A crash, a blown time budget or a cancel becomes a diagnostic, never a rejection.
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import type { Diagnostic, ImportResult, SourceFile } from '@vsslicer/profile-api';
import { MAX_IMPORT_FILES, clip } from '../../application/import/registry.ts';
import type { WorkerInput, WorkerMessage } from './messages.ts';

export const MAX_BUDGET_MS = 600_000;
export const MAX_HEARTBEAT_MS = 10_000;
/** Heap cap of the worker; a runaway import dies alone instead of taking the host down. */
export const WORKER_HEAP_MB = 4096;

export interface WorkerImportOptions {
  /** `file:` URL of the importer module (see WorkerInput). */
  importerModule: string;
  files: readonly SourceFile[];
  /** Time the import may take before the worker is killed; finite, in (0, MAX_BUDGET_MS]. */
  budgetMs: number;
  /** Cancels the import: the worker is terminated and the result says so. */
  signal?: AbortSignal;
  /** Host heartbeat period, in (0, MAX_HEARTBEAT_MS]; default 50. */
  heartbeatMs?: number;
  /** Called every beat with how many ms late the beat ran: the proof the host stayed responsive. */
  onBeat?: (lagMs: number) => void;
}

// Same extension as this file, so the runner works from src (type stripping) and from dist.
const entry = new URL(`./worker-entry${extname(fileURLToPath(import.meta.url))}`, import.meta.url);

const range = (name: string, n: number, max: number) => {
  if (!Number.isFinite(n) || n <= 0 || n > max) throw new RangeError(`${name} must be in (0, ${max}], got ${n}`);
};

const failure = (code: Diagnostic['code'], message: string): ImportResult => ({
  entities: [],
  native: Object.create(null),
  // shortcut: DiagnosticCode has no worker code; unreadable-folder is the nearest until profile-api adds one
  diagnostics: [{ severity: 'error', code, file: '', message: clip(message) }],
});

export async function runImportInWorker(options: WorkerImportOptions): Promise<ImportResult> {
  const { importerModule, files, budgetMs, signal, heartbeatMs = 50, onBeat } = options;
  range('budgetMs', budgetMs, MAX_BUDGET_MS);
  range('heartbeatMs', heartbeatMs, MAX_HEARTBEAT_MS);
  if (!importerModule.startsWith('file:')) throw new RangeError('importerModule must be a file: URL');
  if (files.length > MAX_IMPORT_FILES)
    return failure('unreadable-folder', `${files.length} files is more than the ${MAX_IMPORT_FILES} one import reads`);
  if (signal?.aborted) return failure('unreadable-folder', 'the import was cancelled');

  return new Promise((resolve) => {
    const input: WorkerInput = { importerModule, files };
    const worker = new Worker(entry, {
      workerData: input,
      resourceLimits: { maxOldGenerationSizeMb: WORKER_HEAP_MB },
    });
    let last = Date.now();
    const beat = setInterval(() => {
      const now = Date.now();
      onBeat?.(Math.max(0, now - last - heartbeatMs));
      last = now;
    }, heartbeatMs);
    const budget = setTimeout(
      () => settle(failure('unreadable-folder', `the import exceeded ${budgetMs} ms`)),
      budgetMs,
    );
    const abort = () => settle(failure('unreadable-folder', 'the import was cancelled'));
    signal?.addEventListener('abort', abort, { once: true });

    let done = false;
    function settle(result: ImportResult): void {
      if (done) return;
      done = true;
      clearInterval(beat);
      clearTimeout(budget);
      signal?.removeEventListener('abort', abort);
      void worker.terminate();
      resolve(result);
    }

    worker.on('message', (m: WorkerMessage) => {
      const r = m.type === 'result' ? m.result : undefined;
      if (
        !r ||
        !Array.isArray(r.entities) ||
        !Array.isArray(r.diagnostics) ||
        typeof r.native !== 'object' ||
        !r.native
      )
        settle(
          failure('unreadable-folder', `the import worker failed: ${m.type === 'error' ? m.message : 'bad result'}`),
        );
      else settle({ ...r, native: Object.assign(Object.create(null), r.native) });
    });
    worker.on('error', (e) => settle(failure('unreadable-folder', `the import worker crashed: ${e?.message ?? e}`)));
    worker.on('exit', (code) => settle(failure('unreadable-folder', `the import worker exited with code ${code}`)));
  });
}
