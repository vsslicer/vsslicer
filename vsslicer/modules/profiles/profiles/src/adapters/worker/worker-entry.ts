// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside the worker thread: load the importer module, import the files, post the result.
import { parentPort, workerData } from 'node:worker_threads';
import type { Importer } from '@vsslicer/profile-api';
import type { WorkerInput, WorkerMessage } from './messages.ts';

const post = (m: WorkerMessage) => parentPort!.postMessage(m);
try {
  const { importerModule, files } = workerData as WorkerInput;
  const exported = ((await import(importerModule)) as { default: Importer | (() => Importer) }).default;
  const importer = typeof exported === 'function' ? exported() : exported;
  post({ type: 'result', result: await importer.import(files) });
} catch (error) {
  post({ type: 'error', message: error instanceof Error ? error.message : 'the importer threw a non-error' });
}
