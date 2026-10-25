// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * The sparse state-change table: one fixed-size 12-byte record per interpreted modal change,
 * little-endian, sorted by `moveIndex` (ties in file order; the later one wins).
 *
 * | Offset | Size | Type | Field     |
 * |-------:|-----:|------|-----------|
 * |      0 |    4 | u32  | moveIndex |
 * |      4 |    4 | f32  | value     |
 * |      8 |    1 | u8   | kind      |
 * |      9 |    1 | u8   | index     |
 * |     10 |    2 | -    | padding 0 |
 */
export const STATE_CHANGE_STRIDE = 12;

/** Byte offset of each field inside a state-change record. */
export const StateChangeOffset = {
  /** u32: global index of the first move that runs under the new value (`moveCount` if none follows). */
  moveIndex: 0,
  /** f32: the new value, in the unit its {@link StateKind} names. */
  value: 4,
  /** u8: a {@link StateKind}. */
  kind: 8,
  /** u8: which tool, fan or axis the change applies to (see {@link StateKind}); 0 where there is only one. */
  index: 9,
} as const;

/**
 * What changed. Values are what the file commanded, converted to the unit each kind names (mm, s,
 * degrees C) whatever unit the command used. The parser records the command, not its effect on a
 * given firmware: each planner decides which kinds it honours (a Klipper planner ignores
 * `MaxAccel`, `MaxFeedrate` and `Jerk`). `index` axis order is X 0, Y 1, Z 2, E 3.
 */
export const StateKind = {
  /** `F`: commanded feedrate, mm/s. */
  Feedrate: 0,
  /** M106 / M107: fan duty 0..1; `index` = fan (M106 `P`, default 0). */
  Fan: 1,
  /** M104 / M109: hotend target, degrees C; `index` = tool (`T`, default the active tool). */
  HotendTemp: 2,
  /** M140 / M190: bed target, degrees C. */
  BedTemp: 3,
  /** M204 `S`, Klipper `SET_VELOCITY_LIMIT ACCEL`: the single accel, mm/s^2. */
  Accel: 4,
  /** M204 `P`: print accel, mm/s^2. */
  AccelPrint: 5,
  /** M204 `R`: retract accel, mm/s^2. */
  AccelRetract: 6,
  /** M204 `T`: travel accel, mm/s^2. */
  AccelTravel: 7,
  /** M201: max accel per axis, mm/s^2; `index` = axis. */
  MaxAccel: 8,
  /** M203: max feedrate per axis, mm/s; `index` = axis. */
  MaxFeedrate: 9,
  /** M205 `X Y Z E` (classic jerk), RRF M566 (converted from mm/min): max instant speed change, mm/s; `index` = axis. */
  Jerk: 10,
  /** M205 `J`: junction deviation, mm. */
  JunctionDeviation: 11,
  /** M205 `S`: minimum print feedrate, mm/s. */
  MinFeedrate: 12,
  /** M205 `T`: minimum travel feedrate, mm/s. */
  MinTravelFeedrate: 13,
  /** `SET_VELOCITY_LIMIT VELOCITY`: max toolhead velocity, mm/s. */
  MaxVelocity: 14,
  /** `SET_VELOCITY_LIMIT ACCEL_TO_DECEL` (older Klipper), mm/s^2. */
  AccelToDecel: 15,
  /** `SET_VELOCITY_LIMIT MINIMUM_CRUISE_RATIO`, 0..1. */
  MinCruiseRatio: 16,
  /** `SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY`, mm/s. */
  SquareCornerVelocity: 17,
  /** M900 `K`, M572 `S`, `SET_PRESSURE_ADVANCE ADVANCE`: pressure / linear advance, s; `index` = extruder. */
  PressureAdvance: 18,
  /** `SET_PRESSURE_ADVANCE SMOOTH_TIME`, s; `index` = extruder. */
  PressureAdvanceSmoothTime: 19,
  /** `T<n>`: tool change; `value` = the new tool, as in the move record's `tool` byte. */
  ToolChange: 20,
} as const;
export type StateKind = (typeof StateKind)[keyof typeof StateKind];

/** One state change, decoded. Use it at edges (tests, hovers); hot loops read the `DataView` directly. */
export interface StateChange {
  moveIndex: number;
  kind: StateKind;
  index: number;
  value: number;
}

/** Writes record `i` of `view` (byte offset `i * STATE_CHANGE_STRIDE`). */
export function writeStateChange(view: DataView, i: number, c: StateChange): void {
  const o = i * STATE_CHANGE_STRIDE;
  view.setUint32(o + StateChangeOffset.moveIndex, c.moveIndex, true);
  view.setFloat32(o + StateChangeOffset.value, c.value, true);
  view.setUint8(o + StateChangeOffset.kind, c.kind);
  view.setUint8(o + StateChangeOffset.index, c.index);
  view.setUint16(o + StateChangeOffset.index + 1, 0, true);
}

/** Reads record `i` of `view`. */
export function readStateChange(view: DataView, i: number): StateChange {
  const o = i * STATE_CHANGE_STRIDE;
  return {
    moveIndex: view.getUint32(o + StateChangeOffset.moveIndex, true),
    kind: view.getUint8(o + StateChangeOffset.kind) as StateKind,
    index: view.getUint8(o + StateChangeOffset.index),
    value: view.getFloat32(o + StateChangeOffset.value, true),
  };
}
