// SPDX-License-Identifier: AGPL-3.0-or-later
import { inflateSync } from 'node:zlib';
import type { Codec } from '../application/codec.ts';
import { Compression } from '../domain/bgcode.ts';

/** Deflate via `node:zlib`; libbgcode writes a zlib stream. */
export const deflateCodec: Codec = {
  compression: Compression.Deflate,
  // zlib throws once the output passes the declared size, so a bomb is never fully inflated.
  decode: (data, size) => inflateSync(data, { maxOutputLength: Math.max(size, 1) }),
};
