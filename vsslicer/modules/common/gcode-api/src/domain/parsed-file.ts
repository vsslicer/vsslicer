// SPDX-License-Identifier: AGPL-3.0-or-later

// Every `fileOffset` here and in the move record is a byte offset in the decoded G-code text
// stream: the file's bytes for `.gcode`, the decoded text (not the container) for `.bgcode`.
// It is a u32: once the decoded text passes 4 GiB the parser ends the parse with an error
// diagnostic `offset-overflow` at `fileOffset` 0xFFFFFFFF and never wraps an offset.

/** A problem found while parsing, pointing at the bytes that caused it. */
export interface Diagnostic {
  /** Stable kebab-case id a test or quick fix can match on, e.g. `no-slicer-tags`, `bgcode-crc`. */
  code: string;
  severity: 'error' | 'warning' | 'info';
  /** Offset in the decoded text where the problem starts (for a container error, the text decoded so far). */
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

/**
 * A command the parser keeps by name but does not interpret (unknown or out-of-scope commands,
 * pauses such as M600). Interpreted modal commands go to the state-change table instead.
 */
export interface Marker {
  /** Command word as written, upper-cased: `M486`, `M620`, `EXCLUDE_OBJECT_START`. */
  name: string;
  /** Offset of the line in the decoded text. */
  fileOffset: number;
  /** Global index of the next move after the marker (`moveCount` if none follows). */
  moveIndex: number;
}

/** Slicer that produced the file, detected from header lines. */
export type Slicer = 'prusaslicer' | 'superslicer' | 'orcaslicer' | 'bambustudio' | 'cura' | 'unknown';

/**
 * One increment of a streaming parse. Every field is structured-cloneable, and the buffers are
 * meant to be transferred (`postMessage(chunk, [chunk.moves, chunk.extrusion, chunk.stateChanges])`)
 * rather than copied.
 */
export interface Chunk {
  /**
   * `moveCount` move records laid out as in `MoveOffset`, `byteLength === moveCount * MOVE_STRIDE`.
   * The chunk's first move starts at the previous chunk's last position (carry it over).
   */
  moves: ArrayBuffer;
  /**
   * One little-endian f32 per move, `byteLength === moveCount * 4`: filament length in mm the move
   * feeds (negative: retracts), after M82/M83 and G92; arc chords share their arc's E pro rata;
   * firmware retracts (G10/G11) are 0. Read by planners and totals, not uploaded by the renderer.
   */
  extrusion: ArrayBuffer;
  /**
   * The state changes read in this chunk, as `StateChangeOffset` records,
   * `byteLength === count * STATE_CHANGE_STRIDE`. `moveIndex` may equal `firstMove + moveCount`
   * when the next move is in the next chunk (or the file ends). Only changes are recorded: the
   * state at a chunk's first move is every earlier chunk's table folded in order.
   */
  stateChanges: ArrayBuffer;
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
  /** The chunks' extrusion columns, one per `moves` buffer. */
  extrusion: ArrayBuffer[];
  /** The chunks' state-change tables in file order; together they are sorted by `moveIndex`. */
  stateChanges: ArrayBuffer[];
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
