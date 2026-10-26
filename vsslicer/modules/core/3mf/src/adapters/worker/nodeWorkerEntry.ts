// SPDX-License-Identifier: AGPL-3.0-or-later
import { parentPort } from 'node:worker_threads';
import { handle } from './handle.ts';
import type { WorkerRequest, WorkerResponse } from './protocol.ts';

/** The slice of a `MessagePort` the entry uses. */
export interface WorkerPort {
  once(event: 'message', listener: (request: WorkerRequest) => void): unknown;
  postMessage(message: WorkerResponse, transfer: ArrayBuffer[]): void;
}

/** Answers one request on `port`, transferring the result. */
export function attach(port: WorkerPort): void {
  port.once('message', (request) => {
    const { response, transfer } = handle(request);
    port.postMessage(response, transfer);
  });
}

if (parentPort) attach(parentPort);
