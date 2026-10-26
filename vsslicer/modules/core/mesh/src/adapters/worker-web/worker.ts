// SPDX-License-Identifier: AGPL-3.0-or-later
import { handleParseRequest } from './handler.ts';
import type { ParseRequest } from './handler.ts';

// Bundle this file self-contained (D19: the worker starts from a blob: URL, so it cannot import by URL).
declare const self: {
  onmessage: ((e: { data: ParseRequest }) => void) | null;
  postMessage(message: unknown, transfer: ArrayBuffer[]): void;
};

self.onmessage = (e) => void handleParseRequest(e.data, (m, t) => self.postMessage(m, t));
