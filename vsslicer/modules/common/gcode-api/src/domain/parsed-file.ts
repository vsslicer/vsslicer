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

/** Image formats of an embedded thumbnail; `data` holds the file's bytes (checked against the format's magic). */
export type ThumbnailFormat = 'png' | 'jpg' | 'qoi';

/**
 * A preview image embedded in the G-code as a comment block (`; thumbnail begin WxH len`,
 * `; thumbnail_JPG begin ...`, `; thumbnail_QOI begin ...`), base64-decoded.
 */
export interface Thumbnail {
  format: ThumbnailFormat;
  /** Size the slicer states in the block header. */
  width: number;
  height: number;
  /** The decoded image file (a PNG, JPEG or QOI file). */
  data: Uint8Array;
  /** Offset in the decoded text of the block's `begin` line. */
  fileOffset: number;
}

/** Moves `[firstMove, endMove)` (global indices); never empty. */
export interface MoveRange {
  firstMove: number;
  endMove: number;
}

/**
 * An object the slicer labelled, for cancel-object / exclude-object: `; printing object NAME id:ID
 * copy N` (PrusaSlicer, Orca, Bambu), Marlin `M486`, Klipper `EXCLUDE_OBJECT_*`, Cura `;MESH:`.
 * `ranges` are the stretches of moves that print it, in file order (an object is usually printed
 * in many stretches, one per layer); empty for an object that was only defined.
 */
export interface ObjectLabel {
  name: string;
  /** The slicer's id for the object (`id:` value, M486 index), when it states one. */
  id?: string;
  /** Instance number (`copy N`), when the slicer states one. */
  copy?: number;
  ranges: MoveRange[];
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
  /** Thumbnails whose block ends in this chunk, decoded. Their `data` buffers can be transferred. */
  thumbnails: Thumbnail[];
  /**
   * Labels with the ranges that were closed in this chunk (a range closes at the next label, the
   * stop line or the end of the file, so it is listed by the chunk that holds that point; its
   * moves can be in earlier chunks) and objects defined here. The same object can appear in
   * several chunks; `ParsedFile.objects` merges them.
   */
  objects: ObjectLabel[];
  /** Config entries read in this chunk (the block's end is here): key to verbatim value. Usually empty or one block. */
  config: Record<string, string>;
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
  /** Every chunk's thumbnails in file order. */
  thumbnails: Thumbnail[];
  /** The chunks' labels merged by name, id and copy: ranges joined in file order. */
  objects: ObjectLabel[];
  /**
   * The slicer's config block (`; prusaslicer_config = begin`, `; CONFIG_BLOCK_START`, Cura
   * `;SETTING_3`) as written: keys to verbatim string values, later duplicates win. Empty if the file has none.
   */
  config: Record<string, string>;
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

/** What the slicer's own summary comments state for one extruder (tool index = array index). A statistic the slicer did not write is absent, never 0. */
export interface ExtruderUsage {
  /** Filament length in mm. */
  lengthMm?: number;
  /** Filament volume in cm3. */
  volumeCm3?: number;
  /** Filament weight in g. */
  weightG?: number;
  /** Cost in the slicer's currency; derived by the slicer from the filament's cost per kg. */
  cost?: number;
}

/** The slicer's own time estimate in seconds, per mode it states. */
export interface EstimateSeconds {
  /** PrusaSlicer `normal mode`. */
  normal?: number;
  /** PrusaSlicer `silent mode`. */
  silent?: number;
  /** Orca/Bambu `model printing time`: moves only. */
  model?: number;
  /** Orca/Bambu `total estimated time` (with prepare/changes), Cura `;TIME:`. */
  total?: number;
}

/**
 * Per-job statistics from the slicer's summary comments, not from the moves. Every field is
 * optional: a file without the comment has no entry.
 */
export interface JobSummary {
  /** One entry per extruder, in tool order; empty when the slicer wrote no usage. */
  extruders: ExtruderUsage[];
  estimateSeconds?: EstimateSeconds;
}
