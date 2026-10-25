// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Heatshrink (LZSS) decoder for the .bgcode window/lookahead pairs 11-4 and 12-4.
 * Ported from heatshrink@v0.4.1:src/heatshrink_decoder.c (the version libbgcode vendors; read via
 * the copy in Marlin@2ef3ee6:Marlin/src/libs/heatshrink/heatshrink_decoder.cpp).
 * Copyright (c) 2013-2015, Scott Vokes <vokes.s@gmail.com>
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without
 * fee is hereby granted, provided that the above copyright notice and this permission notice appear
 * in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
 * SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
 * AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
 * NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
 * OF THIS SOFTWARE.
 *
 * Whole-block, not streaming: .bgcode blocks are bounded and the caller already holds the payload.
 * The output size is the block's declared uncompressed size and is never exceeded, so a hostile
 * stream cannot grow memory or loop: every iteration consumes at least 9 input bits.
 */

/** Stream format: a 1 bit then 8 literal bits, or a 0 bit then (window) index bits and (lookahead) count bits, both stored minus one; MSB first. */
export function heatshrinkDecode(
  data: Uint8Array,
  uncompressedSize: number,
  windowBits: number,
  lookaheadBits: number,
): Uint8Array {
  const out = new Uint8Array(uncompressedSize);
  const totalBits = data.length * 8;
  let bit = 0;
  let n = 0;
  const get = (count: number): number => {
    let v = 0;
    for (let i = 0; i < count; i++, bit++) v = (v << 1) | ((data[bit >> 3]! >> (7 - (bit & 7))) & 1);
    return v;
  };
  // Fewer bits left than the smallest token is the zero padding of the last byte.
  while (n < uncompressedSize && totalBits - bit >= 9) {
    if (get(1)) {
      out[n++] = get(8);
      continue;
    }
    if (totalBits - bit < windowBits + lookaheadBits) break;
    const back = get(windowBits) + 1;
    const count = get(lookaheadBits) + 1;
    if (back > n) throw new Error(`back-reference ${back} bytes before the start of the output (${n} bytes decoded)`);
    if (n + count > uncompressedSize) throw new Error(`back-reference runs past the declared size ${uncompressedSize}`);
    // Byte by byte: a reference may overlap the bytes it is producing.
    for (let i = 0; i < count; i++, n++) out[n] = out[n - back]!;
  }
  if (n < uncompressedSize) throw new Error(`stream ends after ${n} of ${uncompressedSize} bytes`);
  if (totalBits - bit >= 8)
    throw new Error(`${Math.floor((totalBits - bit) / 8)} unused bytes after the declared size`);
  return out;
}
