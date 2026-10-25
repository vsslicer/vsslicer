// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * MeatPack decoder for .bgcode G-code blocks (encoding 1 and 2) with libbgcode's re-spacing.
 * Ported from libbgcode@d4da907:src/LibBGCode/binarize/meatpack.cpp (`MeatPack::unbinarize`, AGPL-3.0),
 * Copyright (c) Prusa Research (libbgcode, AGPL-3.0; no per-file notice upstream); the format is
 * Scott Mudge's MeatPack (Marlin's meatpack.cpp).
 *
 * Both encodings decode the same way: with comments (2) the encoder just leaves comment lines as plain
 * bytes between "disable packing" and "enable packing" commands; without comments (1) there are none.
 * Each block is decoded on its own (state starts fresh), exactly like libbgcode.
 */

const CMD_ENABLE = 251;
const CMD_DISABLE = 250;
const CMD_RESET_ALL = 249;
const CMD_NO_SPACES_ON = 247;
const CMD_NO_SPACES_OFF = 246;
const SIGNAL = 0xff;
const NL = 0x0a;
const SPACE = 0x20;

const DIGITS = [...'0123456789.'].map((c) => c.charCodeAt(0));
/** Nibble 0..14; 11 is space or, with "no spaces" on, 'E'. 15 means "a full byte follows". */
const nibbleChar = (n: number, noSpaces: boolean): number =>
  n < 11 ? DIGITS[n]! : n === 11 ? (noSpaces ? 0x45 : SPACE) : n === 12 ? NL : n === 13 ? 0x47 : 0x58;

/** Letters libbgcode re-spaces on G lines: PrusaSlicer's parser needs "G1 X1 Y2", MeatPack strips the spaces. */
const GLINE_PARAMS = new Set([...'XYZEFIJRSGPWHCA'].map((c) => c.charCodeAt(0)));

/** Throws on a stream that ends inside a pending command or full character. */
export function meatpackDecode(src: Uint8Array): Uint8Array {
  // Each input byte yields at most 2 characters, each of which can gain one space.
  const out = new Uint8Array(src.length * 4);
  let n = 0;
  let packed = false;
  let noSpaces = false;
  let cmdActive = false;
  let cmdCount = 0;
  let fullQueue = 0;
  let held = 0; // first-of-pair char waiting behind a full byte
  let addSpace = false;

  const emit = (c: number): void => {
    const lineStart = c === 0x47 && (n === 0 || out[n - 1] === NL);
    if (lineStart) addSpace = true;
    else if (c === NL) addSpace = false;
    if (!lineStart && addSpace && n > 0 && out[n - 1] !== SPACE && GLINE_PARAMS.has(c)) out[n++] = SPACE;
    if (c !== NL || n === 0 || out[n - 1] !== NL) out[n++] = c;
  };

  const rx = (c: number): void => {
    if (!packed) return emit(c);
    if (fullQueue > 0) {
      emit(c);
      if (held > 0) {
        emit(held);
        held = 0;
      }
      fullQueue--;
      return;
    }
    const loFull = (c & 0x0f) === 0x0f;
    const hiFull = (c & 0xf0) === 0xf0;
    const lo = loFull ? 0 : nibbleChar(c & 0x0f, noSpaces);
    const hi = hiFull ? 0 : nibbleChar(c >> 4, noSpaces);
    if (loFull) {
      fullQueue += hiFull ? 2 : 1;
      if (!hiFull) held = hi;
    } else {
      emit(lo);
      if (lo !== NL) {
        if (hiFull) fullQueue++;
        else emit(hi);
      }
    }
  };

  for (const c of src) {
    if (c === SIGNAL) {
      if (cmdCount > 0) {
        cmdActive = true;
        cmdCount = 0;
      } else cmdCount++;
    } else if (cmdActive) {
      if (c === CMD_ENABLE) packed = true;
      else if (c === CMD_DISABLE || c === CMD_RESET_ALL) packed = false;
      else if (c === CMD_NO_SPACES_ON) noSpaces = true;
      else if (c === CMD_NO_SPACES_OFF) noSpaces = false;
      cmdActive = false;
    } else {
      if (cmdCount > 0) {
        rx(SIGNAL);
        cmdCount = 0;
      }
      rx(c);
    }
  }
  // libbgcode silently drops these; a valid encoder never leaves them, so they mean truncation.
  if (fullQueue > 0) throw new Error('MeatPack stream ends before a full-width character');
  if (cmdActive || cmdCount > 0) throw new Error('MeatPack stream ends inside a command');
  return out.slice(0, n);
}
