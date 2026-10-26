// SPDX-License-Identifier: AGPL-3.0-or-later
// A follow feed: printer positions arrive faster than a preview can show them, so one reveal runs at a time and
// only the newest position waits (at most one pending); older ones are dropped, never queued.
import type { PrintPosition } from '../domain/print-position.ts';

export interface Follower {
  /** Shows `position` now, or after the reveal in flight, replacing any position still waiting. */
  push(position: PrintPosition): void;
  /** Drops the waiting position; a reveal in flight finishes, nothing after it runs. */
  stop(): void;
}

/** `reveal` errors (a closed preview, a layer past the end) are passed to `onError` and the feed goes on. */
export const createFollower = (
  reveal: (position: PrintPosition) => Promise<unknown>,
  onError: (e: unknown) => void = () => {},
): Follower => {
  let busy = false;
  let stopped = false;
  let pending: PrintPosition | undefined;
  const run = (p: PrintPosition): void => {
    busy = true;
    let shown: Promise<unknown>;
    try {
      shown = reveal(p); // called synchronously, so the first push shows at once
    } catch (e) {
      shown = Promise.reject(e);
    }
    void shown
      .catch(onError)
      .catch(() => {}) // a throwing onError must not stop the feed
      .then(() => {
        busy = false;
        const next = pending;
        pending = undefined;
        if (next && !stopped) run(next);
      });
  };
  return {
    push(p) {
      if (stopped) return;
      if (busy) pending = p;
      else run(p);
    },
    stop() {
      stopped = true;
      pending = undefined;
    },
  };
};
