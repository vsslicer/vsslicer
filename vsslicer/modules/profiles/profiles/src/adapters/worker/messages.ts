// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ImportResult, SourceFile } from '@vsslicer/profile-api';

/** What the host hands the worker (`workerData`). */
export interface WorkerInput {
  /** `file:` URL of a module whose default export is an `Importer`, or a function returning one. */
  readonly importerModule: string;
  readonly files: readonly SourceFile[];
}

/** What the worker posts back, exactly once. */
export type WorkerMessage =
  { readonly type: 'result'; readonly result: ImportResult } | { readonly type: 'error'; readonly message: string };
