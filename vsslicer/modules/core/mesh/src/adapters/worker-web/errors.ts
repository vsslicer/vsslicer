// SPDX-License-Identifier: AGPL-3.0-or-later

/** The pool's queue is full: the request was refused without being started. Retry later or raise `maxQueued`. */
export class PoolQueueFullError extends Error {
  readonly code = 'pool-queue-full';
  readonly maxQueued: number;
  constructor(maxQueued: number) {
    super(`the parse queue is full (${maxQueued} waiting); try again when a model has finished`);
    this.maxQueued = maxQueued;
    this.name = 'PoolQueueFullError';
  }
}

/** The pool was disposed while this request was waiting or running. */
export class PoolDisposedError extends Error {
  readonly code = 'pool-disposed';
  constructor() {
    super('the parse pool was disposed');
    this.name = 'PoolDisposedError';
  }
}
