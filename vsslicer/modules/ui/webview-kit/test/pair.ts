// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Channel } from '../src/application/channel.ts';

/** Two ends of an in-memory channel; delivery is async, like postMessage. `log` records every post. */
export function pair(): [Channel, Channel, unknown[]] {
  const log: unknown[] = [];
  const listeners: [Set<(m: unknown) => void>, Set<(m: unknown) => void>] = [new Set(), new Set()];
  const end = (mine: 0 | 1): Channel => ({
    post: (m) => {
      log.push(m);
      queueMicrotask(() => listeners[1 - mine]!.forEach((l) => l(m)));
    },
    onMessage: (l) => {
      listeners[mine].add(l);
      return () => listeners[mine].delete(l);
    },
  });
  return [end(0), end(1), log];
}
