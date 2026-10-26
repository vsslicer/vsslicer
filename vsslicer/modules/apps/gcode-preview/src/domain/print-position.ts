// SPDX-License-Identifier: AGPL-3.0-or-later
// D20: where a printer says the print is, validated at the command boundary and resolved to a move. Pure.
import { MOVE_STRIDE, MoveOffset, type Layer } from '@vsslicer/gcode-api';

/** Where a printer says the print is. At least one field set; serialisable (crosses extension hosts). */
export interface PrintPosition {
  /**
   * Byte offset in the decoded G-code text (Move.fileOffset space). Klipper/Moonraker.
   * For `.bgcode` that is the decoded stream, not the binary container: a connector whose printer counts container
   * bytes must convert first (the block table is not exposed, so it cannot be mapped here), or send layer/percent.
   * PrusaLink, the `.bgcode` firmware, reports no byte offset at all, only progress and Z (D20).
   */
  fileOffset?: number;
  /** 1-based layer number as the printer reports it; 0 is before the first layer. */
  layer?: number;
  /** Nozzle Z in mm. */
  z?: number;
  /** Printer's own progress, 0..100. */
  percent?: number;
}

/** Which field `reveal` followed: `percent` is approximate (estimated time), the others land on a move or layer start. */
export type ResolvedBy = keyof PrintPosition;

export interface Revealed {
  by: ResolvedBy;
  /** Global index of the move shown. */
  move: number;
  /** Set when the position was clamped: it named a place beyond the file's last move. */
  warning?: string;
}

const U32_MAX = 0xffffffff;
const FIELDS = new Set(['fileOffset', 'layer', 'z', 'percent']);
const isIndex = (v: unknown, max: number) => Number.isSafeInteger(v) && (v as number) >= 0 && (v as number) <= max;

/** Validates an untrusted position (a command argument); throws a TypeError naming the bad field. */
export const parsePosition = (x: unknown): PrintPosition => {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) throw new TypeError('position must be an object');
  const keys = Object.keys(x);
  const unknown = keys.find((k) => !FIELDS.has(k));
  if (unknown !== undefined) throw new TypeError(`position has an unknown field: ${unknown.slice(0, 64)}`);
  const { fileOffset, layer, z, percent } = x as Record<string, unknown>;
  if (fileOffset !== undefined && !isIndex(fileOffset, U32_MAX))
    throw new TypeError('fileOffset must be an integer in 0..4294967295');
  if (layer !== undefined && !isIndex(layer, U32_MAX)) throw new TypeError('layer must be a non-negative integer');
  if (z !== undefined && !(typeof z === 'number' && Number.isFinite(z))) throw new TypeError('z must be finite');
  if (percent !== undefined && !(typeof percent === 'number' && percent >= 0 && percent <= 100))
    throw new TypeError('percent must be in 0..100');
  const p: PrintPosition = { fileOffset, layer, z, percent } as PrintPosition;
  for (const k of FIELDS) if (p[k as ResolvedBy] === undefined) delete p[k as ResolvedBy];
  if (!Object.keys(p).length) throw new TypeError('position needs fileOffset, layer, z or percent');
  return p;
};

/** Reads field `at` of global move `i` from the chunked move buffers. */
const field = (buffers: readonly ArrayBuffer[], i: number, at: number, f32: boolean) => {
  let rest = i;
  for (const b of buffers) {
    const n = b.byteLength / MOVE_STRIDE;
    if (rest < n) {
      const v = new DataView(b);
      return f32 ? v.getFloat32(rest * MOVE_STRIDE + at, true) : v.getUint32(rest * MOVE_STRIDE + at, true);
    }
    rest -= n;
  }
  return NaN;
};

/** The last move whose field is at or before `value` (0 when none is): binary search, log2(moveCount) reads. */
const lastAtOrBefore = (buffers: readonly ArrayBuffer[], count: number, at: number, f32: boolean, value: number) => {
  let lo = 0;
  let hi = count - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (field(buffers, mid, at, f32) <= value) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

export interface Track {
  moves: readonly ArrayBuffer[];
  moveCount: number;
  layers: readonly Layer[];
  totalTime: number;
}

/**
 * Resolves `p` against a loaded file, fileOffset > layer > z > percent (D20). Throws a RangeError when the chosen
 * field is outside the file (a layer past the last one) or the file has no moves.
 */
export const resolvePosition = ({ moves, moveCount, layers, totalTime }: Track, p: PrintPosition): Revealed => {
  if (!moveCount) throw new RangeError('the file has no moves');
  if (p.fileOffset !== undefined) {
    const move = lastAtOrBefore(moves, moveCount, MoveOffset.fileOffset, false, p.fileOffset);
    // shortcut: the file's length is unknown here, so "past the end" means past the last move's start; upgrade with a size
    return p.fileOffset > field(moves, moveCount - 1, MoveOffset.fileOffset, false)
      ? { by: 'fileOffset', move, warning: `fileOffset ${p.fileOffset} is past the last move; showing the last move` }
      : { by: 'fileOffset', move };
  }
  if (p.layer !== undefined) {
    if (p.layer > layers.length) throw new RangeError(`layer ${p.layer} is past the last layer (${layers.length})`);
    return { by: 'layer', move: p.layer ? layers[p.layer - 1]!.firstMove : 0 };
  }
  if (p.z !== undefined) {
    // layers are in print order; the last one at or below the nozzle (shortcut: assumes Z rises, fine for planar prints)
    let row = -1;
    for (let i = 0; i < layers.length && layers[i]!.z <= p.z + 1e-6; i++) row = i;
    return { by: 'z', move: row < 0 ? 0 : layers[row]!.firstMove };
  }
  const t = (p.percent! / 100) * totalTime;
  return { by: 'percent', move: lastAtOrBefore(moves, moveCount, MoveOffset.startTime, true, t) };
};
