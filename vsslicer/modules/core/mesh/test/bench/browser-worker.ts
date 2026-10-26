// SPDX-License-Identifier: AGPL-3.0-or-later
// Web Worker side of chromium-case.ts: bundled self-contained, receives the file's bytes (transferred) and runs the stages.
import { runStages, type Stage } from './stages.ts';

declare const self: {
  onmessage: ((e: { data: ArrayBuffer | 'ack' }) => void) | null;
  postMessage(message: unknown): void;
};

let ack: (() => void) | undefined;
const mark = (m: Stage, edge: 'start' | 'end') =>
  new Promise<void>((r) => {
    ack = r;
    self.postMessage({ mark: m, edge });
  });

self.onmessage = (e) => {
  if (e.data === 'ack') return ack?.(); // the host's reply to a stage mark
  void runStages(new Uint8Array(e.data), mark).then(
    (done) => self.postMessage({ done }),
    (err: unknown) => self.postMessage({ error: String((err as Error).stack ?? err) }),
  );
};
