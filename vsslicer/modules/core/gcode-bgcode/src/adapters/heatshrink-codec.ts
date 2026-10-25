// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Codec } from '../application/codec.ts';
import { Compression } from '../domain/bgcode.ts';
import { heatshrinkDecode } from '../domain/heatshrink.ts';

/** Heatshrink window 11, lookahead 4 (compression value 2). */
export const heatshrink11Codec: Codec = {
  compression: Compression.Heatshrink11,
  decode: (data, size) => heatshrinkDecode(data, size, 11, 4),
};

/** Heatshrink window 12, lookahead 4 (compression value 3). */
export const heatshrink12Codec: Codec = {
  compression: Compression.Heatshrink12,
  decode: (data, size) => heatshrinkDecode(data, size, 12, 4),
};
