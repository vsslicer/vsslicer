// SPDX-License-Identifier: AGPL-3.0-or-later
import { open } from 'node:fs/promises';
import type { ReadAt } from '../application/read-text.ts';

/** `ReadAt` on a local file: opens, reads the one range with `pread`, closes. Never reads more than `length`. */
export const fileReadAt =
  (path: string): ReadAt =>
  async (position, length) => {
    const f = await open(path, 'r');
    try {
      const buf = new Uint8Array(length);
      const { bytesRead } = await f.read(buf, 0, length, position);
      return buf.subarray(0, bytesRead);
    } finally {
      await f.close();
    }
  };
