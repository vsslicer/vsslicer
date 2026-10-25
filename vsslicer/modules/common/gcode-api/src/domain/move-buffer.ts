// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * One move is one interleaved, fixed-size record in an `ArrayBuffer`, little-endian.
 * A move is the segment from the previous move's `position` to its own: start = record `i - 1`,
 * end = record `i`. A chunk's first move starts at the previous chunk's last record, so a consumer
 * carries that position across chunk boundaries; global move 0 starts at the machine's position
 * before the first move.
 *
 * | Offset | Size | Type   | Field        |
 * |-------:|-----:|--------|--------------|
 * |      0 |   12 | f32 x3 | position     |
 * |     12 |    2 | f16    | width        |
 * |     14 |    2 | f16    | height       |
 * |     16 |    1 | u8     | role         |
 * |     17 |    1 | u8     | tool         |
 * |     18 |    1 | u8     | flags        |
 * |     19 |    1 | -      | padding (0)  |
 * |     20 |    4 | u32    | fileOffset   |
 * |     24 |    4 | f32    | startTime    |
 *
 * Every field sits at a multiple of its own size and the stride is a multiple of 4, as WebGL2
 * `vertexAttribPointer` requires, so a renderer binds the buffer as instanced attributes as is.
 */
export const MOVE_STRIDE = 28;

/** Byte offset of each field inside a move record. */
export const MoveOffset = {
  /** f32 x3: end point X, Y, Z in mm, absolute machine coordinates after G92 and G91 are applied. */
  position: 0,
  /** f16: extrusion width in mm (`;WIDTH:` / `; LINE_WIDTH:` or derived); 0 for non-extruding moves. */
  width: 12,
  /** f16: layer height of the extrusion in mm (`;HEIGHT:` or derived); 0 for non-extruding moves. */
  height: 14,
  /** u8: a {@link MoveRole} value. */
  role: 16,
  /** u8: active tool (extruder) index, T0 = 0. */
  tool: 17,
  /** u8: bit set of {@link MoveFlag}. */
  flags: 18,
  /**
   * u32: byte offset of the line that produced the move in the decoded G-code text stream (for
   * `.bgcode`, in the decoded text, not the container). Past 4 GiB the parser stops with an
   * `offset-overflow` diagnostic rather than wrap.
   */
  fileOffset: 20,
  /** f32: seconds from print start at which the move begins; NaN until a planner (E4) fills it. */
  startTime: 24,
} as const;

/**
 * Extrusion role (feature type). Values 0-19 keep the order of libvgcode's
 * `EGCodeExtrusionRole` so its tables port index for index; `Unknown` marks files without tags.
 * Ported from OrcaSlicer@09aa0114:src/libvgcode/include/Types.hpp:141-166 (AGPL-3.0),
 * Copyright (c) Prusa Research 2023 Enrico Turri, Pavel Mikuš.
 */
export const MoveRole = {
  None: 0,
  Perimeter: 1,
  ExternalPerimeter: 2,
  OverhangPerimeter: 3,
  InternalInfill: 4,
  SolidInfill: 5,
  TopSolidInfill: 6,
  Ironing: 7,
  BridgeInfill: 8,
  GapFill: 9,
  Skirt: 10,
  SupportMaterial: 11,
  SupportMaterialInterface: 12,
  WipeTower: 13,
  Custom: 14,
  BottomSurface: 15,
  InternalBridgeInfill: 16,
  Brim: 17,
  SupportTransition: 18,
  Mixed: 19,
  Unknown: 20,
} as const;
export type MoveRole = (typeof MoveRole)[keyof typeof MoveRole];

/** Bits of the `flags` byte. A move with none of them set is an extrusion. */
export const MoveFlag = {
  /** Moves without extruding. */
  Travel: 1 << 0,
  /** Retracts filament (E decreases, or G10). */
  Retract: 1 << 1,
  /** Primes filament after a retract (or G11). */
  Unretract: 1 << 2,
  /** Inside a slicer wipe block (`;WIPE_START` .. `;WIPE_END`). */
  Wipe: 1 << 3,
  /** One chord of a tessellated G2/G3 arc; consecutive chords share the arc's `fileOffset`. */
  Arc: 1 << 4,
} as const;

/** One move, decoded. Use it at edges (tests, hovers); hot loops read the `DataView` directly. */
export interface Move {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  role: MoveRole;
  tool: number;
  flags: number;
  fileOffset: number;
  startTime: number;
}

/** Writes move `index` of `view` (byte offset `index * MOVE_STRIDE`). */
export function writeMove(view: DataView, index: number, m: Move): void {
  const o = index * MOVE_STRIDE;
  view.setFloat32(o, m.x, true);
  view.setFloat32(o + 4, m.y, true);
  view.setFloat32(o + 8, m.z, true);
  view.setFloat16(o + MoveOffset.width, m.width, true);
  view.setFloat16(o + MoveOffset.height, m.height, true);
  view.setUint8(o + MoveOffset.role, m.role);
  view.setUint8(o + MoveOffset.tool, m.tool);
  view.setUint8(o + MoveOffset.flags, m.flags);
  view.setUint8(o + MoveOffset.flags + 1, 0);
  view.setUint32(o + MoveOffset.fileOffset, m.fileOffset, true);
  view.setFloat32(o + MoveOffset.startTime, m.startTime, true);
}

/** Reads move `index` of `view`. */
export function readMove(view: DataView, index: number): Move {
  const o = index * MOVE_STRIDE;
  return {
    x: view.getFloat32(o, true),
    y: view.getFloat32(o + 4, true),
    z: view.getFloat32(o + 8, true),
    width: view.getFloat16(o + MoveOffset.width, true),
    height: view.getFloat16(o + MoveOffset.height, true),
    role: view.getUint8(o + MoveOffset.role) as MoveRole,
    tool: view.getUint8(o + MoveOffset.tool),
    flags: view.getUint8(o + MoveOffset.flags),
    fileOffset: view.getUint32(o + MoveOffset.fileOffset, true),
    startTime: view.getFloat32(o + MoveOffset.startTime, true),
  };
}
