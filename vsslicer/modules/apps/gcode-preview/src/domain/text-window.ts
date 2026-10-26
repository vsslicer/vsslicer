// SPDX-License-Identifier: AGPL-3.0-or-later
// The lazy G-code text pane: which bytes of the file to read around an offset, and how they become lines.
// Pure; the file itself is read behind a port (application/read-text.ts). Bounds are rule 25: the file is untrusted.

/** Most bytes read from the file per request. */
export const MAX_WINDOW_BYTES = 64 * 1024;
/** Most lines returned per request. */
export const MAX_WINDOW_LINES = 400;
/** Longest line returned, in bytes of the file; the rest is cut and `clipped` is set. */
export const MAX_LINE_BYTES = 4096;

export interface TextRequest {
  seq: number;
  /** Byte offset in the file of the line to show. */
  offset: number;
}

export interface TextLine {
  /** Byte offset of the line's first byte in the file (of the first byte read, for a line that began before the window). */
  offset: number;
  text: string;
  clipped: boolean;
}

export interface TextWindow {
  seq: number;
  /** Index in `lines` of the line holding the requested offset; -1 when the offset is past the end of the file. */
  focus: number;
  lines: TextLine[];
}

/** A request the host will serve: a safe non-negative integer offset. */
export const validRequest = (r: unknown): r is TextRequest => {
  const q = r as Partial<TextRequest> | null;
  return !!q && Number.isSafeInteger(q.seq) && Number.isSafeInteger(q.offset) && (q.offset as number) >= 0;
};

/** The byte range to read for `offset`: the window centred on it, never before the file's start. */
export const readRange = (offset: number): { start: number; length: number } => ({
  start: Math.max(0, offset - MAX_WINDOW_BYTES / 2),
  length: MAX_WINDOW_BYTES,
});

/** Lines of `bytes`, which were read from file position `start`, around `offset`: at most 400, each cut to 4 KiB. */
export const textWindow = (seq: number, bytes: Uint8Array, start: number, offset: number): TextWindow => {
  if (bytes.length > MAX_WINDOW_BYTES) bytes = bytes.subarray(0, MAX_WINDOW_BYTES);
  // [from, to) of each line, without its \n and any \r before it
  const spans: [number, number][] = [];
  for (let from = 0; from < bytes.length;) {
    let nl = bytes.indexOf(10, from);
    const next = nl < 0 ? bytes.length : nl + 1;
    if (nl < 0) nl = bytes.length;
    spans.push([from, nl > from && bytes[nl - 1] === 13 ? nl - 1 : nl]);
    from = next;
  }
  const at = offset - start;
  let focus = spans.findLastIndex(([from]) => from <= at);
  if (at >= bytes.length || focus < 0) return { seq, focus: -1, lines: [] };
  const lo = Math.max(0, Math.min(focus - MAX_WINDOW_LINES / 2, spans.length - MAX_WINDOW_LINES));
  const decoder = new TextDecoder();
  const lines = spans.slice(lo, lo + MAX_WINDOW_LINES).map(([from, to]) => ({
    offset: start + from,
    text: decoder.decode(bytes.subarray(from, Math.min(to, from + MAX_LINE_BYTES))),
    clipped: to - from > MAX_LINE_BYTES,
  }));
  focus -= lo;
  return { seq, focus, lines };
};

/** File offset of global move `move`, reading it from the move buffers (`MOVE_STRIDE` bytes a move, `fileOffset` at byte 20). */
export const moveFileOffset = (
  buffers: readonly (ArrayBuffer | undefined)[],
  move: number,
  stride: number,
  at: number,
) => {
  let rest = move;
  for (const b of buffers) {
    if (!b) return undefined;
    const n = b.byteLength / stride;
    if (rest < n) return new DataView(b).getUint32(rest * stride + at, true);
    rest -= n;
  }
  return undefined;
};
