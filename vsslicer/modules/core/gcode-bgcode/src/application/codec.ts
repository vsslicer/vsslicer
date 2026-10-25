// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Compression } from '../domain/bgcode.ts';

/** Port: decompresses block payloads of one compression type (Deflate here, Heatshrink in its own module). */
export interface Codec {
  readonly compression: Compression;
  /** Throws when the data is corrupt. */
  decode(data: Uint8Array, uncompressedSize: number): Uint8Array;
}
