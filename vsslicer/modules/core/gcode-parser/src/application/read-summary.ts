// SPDX-License-Identifier: AGPL-3.0-or-later
import type { JobSummary } from '@vsslicer/gcode-api';
import { SummaryBuilder } from '../domain/summary.ts';

const NEWLINE = 0x0a;
const SEMICOLON = 0x3b;
/** Summary comments are short; a longer line (config values, thumbnails) is not one. */
const MAX_LINE = 512;
const decoder = new TextDecoder('utf-8');

const concat = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
};

/**
 * Reads the slicer's job statistics (filament per extruder, time estimates) from the comment
 * lines of `source`, without parsing moves: no chunk writer, no move buffers, only the partial
 * line between two pieces is held. The comments may be anywhere (PrusaSlicer writes them at the
 * start and the end, Orca at the end, Bambu Studio at the start).
 */
export async function readSummary(source: AsyncIterable<Uint8Array>): Promise<JobSummary> {
  const summary = new SummaryBuilder();
  let carry: Uint8Array | null = null; // start of a comment line cut by the end of a piece
  const emit = (line: Uint8Array): void => {
    if (line.length <= MAX_LINE) summary.line(decoder.decode(line.subarray(1)));
  };
  for await (const piece of source) {
    let start = 0;
    for (let nl = piece.indexOf(NEWLINE); nl >= 0; nl = piece.indexOf(NEWLINE, start)) {
      if (carry) {
        emit(concat(carry, piece.subarray(start, nl)));
        carry = null;
      } else if (piece[start] === SEMICOLON && nl - start <= MAX_LINE) {
        emit(piece.subarray(start, nl));
      }
      start = nl + 1;
    }
    if (start < piece.length) {
      const rest = piece.subarray(start);
      if (carry) {
        if (carry.length + rest.length <= MAX_LINE) {
          carry = concat(carry, rest);
        } else carry = null;
      } else if (rest[0] === SEMICOLON && rest.length <= MAX_LINE) carry = rest.slice();
    }
  }
  if (carry) emit(carry);
  return summary.build();
}
