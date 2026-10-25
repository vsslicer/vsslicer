// SPDX-License-Identifier: AGPL-3.0-or-later
import { createReadStream } from 'node:fs';

/** A file as the byte stream `parse` takes, read in pieces of `highWaterMark` bytes (default 64 KiB). */
export const fileSource = (path: string, highWaterMark = 64 * 1024): AsyncIterable<Uint8Array> =>
  createReadStream(path, { highWaterMark });
