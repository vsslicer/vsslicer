// SPDX-License-Identifier: AGPL-3.0-or-later

/** A problem found while parsing, pointing at the bytes that caused it. */
export interface Diagnostic {
  /** Stable kebab-case id a test or quick fix can match on, e.g. `no-slicer-tags`, `bgcode-crc`. */
  code: string;
  severity: 'error' | 'warning' | 'info';
  /** Byte offset in the source file where the problem starts. */
  fileOffset: number;
  /** Human-readable explanation. */
  message: string;
}

/**
 * One row of the layer table. Layer `i` covers moves `[firstMove, next layer's firstMove)`,
 * the last layer up to `ParsedFile.moveCount`.
 */
export interface Layer {
  /** Print height of the layer in mm (`;Z:` / `; Z_HEIGHT:` or the first extrusion's Z). */
  z: number;
  /** Global index of the layer's first move. */
  firstMove: number;
}

/** A command the parser keeps by name but does not interpret (unknown or out-of-scope commands). */
export interface Marker {
  /** Command word as written, upper-cased: `M486`, `M620`, `EXCLUDE_OBJECT_START`. */
  name: string;
  /** Byte offset of the line in the source file. */
  fileOffset: number;
  /** Global index of the next move after the marker (`moveCount` if none follows). */
  moveIndex: number;
}

/** Slicer that produced the file, detected from header lines. */
export type Slicer = 'prusaslicer' | 'superslicer' | 'orcaslicer' | 'bambustudio' | 'cura' | 'unknown';

/**
 * One increment of a streaming parse. Every field is structured-cloneable, and `moves` is
 * meant to be transferred (`postMessage(chunk, [chunk.moves])`) rather than copied.
 */
export interface Chunk {
  /** `moveCount` move records laid out as in `MoveOffset`, `byteLength === moveCount * MOVE_STRIDE`. */
  moves: ArrayBuffer;
  moveCount: number;
  /** Global index of the chunk's first move. */
  firstMove: number;
  /** Layers whose first move is in this chunk. */
  layers: Layer[];
  markers: Marker[];
  diagnostics: Diagnostic[];
  /** Source bytes consumed so far, for progress. */
  bytesRead: number;
  /** Detected slicer; `unknown` until the header has been read. */
  slicer: Slicer;
}

/** The whole parsed file: every chunk's results, in file order. */
export interface ParsedFile {
  slicer: Slicer;
  moveCount: number;
  /**
   * The chunks' move buffers in file order, not concatenated (concatenating would double the
   * peak memory of a large file). Global move `i` is in the buffer whose range contains it.
   */
  moves: ArrayBuffer[];
  layers: Layer[];
  markers: Marker[];
  diagnostics: Diagnostic[];
}

export interface ParseOptions {
  /** Aborting stops the parse; the iterator then rejects with the signal's reason. */
  signal?: AbortSignal;
}

/**
 * The parser contract (implemented by `@vsslicer/gcode-parser`). `source` is the file's bytes in
 * order: a Node `Readable` and a web `ReadableStream` are both `AsyncIterable<Uint8Array>`.
 */
export type Parse = (source: AsyncIterable<Uint8Array>, opts?: ParseOptions) => AsyncIterable<Chunk>;
