// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ThreeMfErrorCode } from '../../domain/errors.ts';
import type { Package } from '../../domain/package.ts';
import type { Project } from '../../domain/project/project.ts';

/** What a worker returns for one file: the opened package's data (its methods cannot cross) and the project. */
export interface WorkerResult {
  readonly rootModel: string;
  readonly parts: Package['parts'];
  readonly thumbnails: readonly string[];
  readonly readOnly?: string;
  readonly project: Project;
}

/** Why a read in a worker failed: a typed 3MF error of the file, or the worker itself dying. */
export type WorkerErrorCode = ThreeMfErrorCode | 'worker-crashed' | 'worker-out-of-memory';

export interface WorkerFailure {
  readonly code: WorkerErrorCode;
  readonly userMessage: string;
}

/** The only message a worker accepts: the 3MF bytes, transferred (the sender's buffer is detached). */
export type WorkerRequest = { readonly bytes: Uint8Array };
export type WorkerResponse =
  { readonly ok: true; readonly result: WorkerResult } | { readonly ok: false; readonly failure: WorkerFailure };

/** The error a client rejects with. It concerns the one file; the next read gets a fresh worker. */
export class WorkerReadError extends Error {
  readonly code: WorkerErrorCode;
  readonly userMessage: string;
  constructor(failure: WorkerFailure, options?: ErrorOptions) {
    super(failure.userMessage, options);
    this.name = 'WorkerReadError';
    this.code = failure.code;
    this.userMessage = failure.userMessage;
  }
}

export const crashed = (detail: string): WorkerFailure => ({
  code: 'worker-crashed',
  userMessage: `Reading this file crashed its worker (${detail}); other files are not affected.`,
});
export const outOfMemory: WorkerFailure = {
  code: 'worker-out-of-memory',
  userMessage: 'This file needs more memory than a worker may use, so it was not opened.',
};
