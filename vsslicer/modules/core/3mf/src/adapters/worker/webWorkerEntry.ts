// SPDX-License-Identifier: AGPL-3.0-or-later
import { handle } from './handle.ts';
import type { WorkerRequest, WorkerResponse } from './protocol.ts';

/** The slice of a DedicatedWorkerGlobalScope the entry uses. */
export interface WorkerScope {
  onmessage: ((event: { data: WorkerRequest }) => void) | null;
  postMessage(message: WorkerResponse, transfer: ArrayBuffer[]): void;
}

/** Answers one request on `scope`, transferring the result. */
export function attach(scope: WorkerScope): void {
  scope.onmessage = (event) => {
    const { response, transfer } = handle(event.data);
    scope.postMessage(response, transfer);
  };
}

// A bundler builds this file as the Web Worker script; elsewhere (tests) `attach` is called with a stand-in scope.
if (typeof (globalThis as { WorkerGlobalScope?: unknown }).WorkerGlobalScope !== 'undefined') {
  attach(globalThis as unknown as WorkerScope);
}
