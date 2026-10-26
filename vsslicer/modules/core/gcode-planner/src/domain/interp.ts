// SPDX-License-Identifier: AGPL-3.0-or-later
import { MOVE_STRIDE, MoveOffset } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { Planner } from './planner.ts';
import type { Timing } from './timing.ts';
import { trapezoidsFor } from './trapezoids.ts';

/** Where the toolhead is at one instant; `ToolheadWindow.positionAt` fills it in place. */
export interface ToolheadSample {
  /** Global index of the move running (or holding) at that instant. */
  move: number;
  /** mm, machine coordinates. */
  x: number;
  y: number;
  z: number;
  /** Filament fed so far by this move, mm (the move's extrusion times its progress). */
  e: number;
  tool: number;
}

// Per-move fields in `ToolheadWindow.data`.
const T0 = 0; // start time, s
const PRE = 1; // hold at the start point before moving, s (a dwell before move 0)
const MOTION = 2; // seconds in motion; the rest of the move's duration holds at its end point
const V0 = 3; // entry speed, mm/s
const A = 4; // accel, mm/s²; -1: constant speed over MOTION (no usable profile)
const TA = 5; // end of the accel phase, s into the motion
const TC = 6; // end of the cruise phase, s into the motion
const VC = 7; // cruise speed, mm/s
const L = 8; // profile length, mm: XYZ, or |E| for a move without XYZ motion (as Klipper's move_d)
const SX = 9; // start point
const DX = 12; // end minus start
const DE = 15; // extrusion
const TOOL = 16;
const N = 17;

/** Seconds of standstill the file states before move `i`: its `G4` and `ESTIMATOR_ADD_TIME` markers. */
function dwells(parsed: ParsedFile): Map<number, number> {
  const out = new Map<number, number>();
  for (const k of parsed.markers) if (k.seconds) out.set(k.moveIndex, (out.get(k.moveIndex) ?? 0) + k.seconds);
  return out;
}

/** Locates global move `i` in the chunked buffers. */
function locate(parsed: ParsedFile, i: number): [number, number] {
  let b = 0;
  while (b < parsed.moves.length && i * MOVE_STRIDE >= parsed.moves[b]!.byteLength) {
    i -= parsed.moves[b]!.byteLength / MOVE_STRIDE;
    b++;
  }
  return [b, i];
}

/**
 * The move running at time `t` (seconds), by binary search over the start times the planner wrote
 * into the move records (f32): the last move starting at or before `t`; 0 before the first, -1 for
 * a file without moves. For a timeline to pick the window to build.
 */
export function moveAtTime(parsed: ParsedFile, t: number): number {
  const bufs = parsed.moves.filter((m) => m.byteLength > 0).map((m) => new DataView(m));
  if (!bufs.length) return -1;
  const first = (v: DataView): number => v.getFloat32(MoveOffset.startTime, true);
  let lo = 0;
  let hi = bufs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (first(bufs[mid]!) <= t) lo = mid;
    else hi = mid - 1;
  }
  let base = 0;
  for (let b = 0; b < lo; b++) base += bufs[b]!.byteLength / MOVE_STRIDE;
  const v = bufs[lo]!;
  let i = 0;
  let j = v.byteLength / MOVE_STRIDE - 1;
  while (i < j) {
    const mid = (i + j + 1) >> 1;
    if (v.getFloat32(mid * MOVE_STRIDE + MoveOffset.startTime, true) <= t) i = mid;
    else j = mid - 1;
  }
  return base + i;
}

/** A `ToolheadWindow` as plain numbers and one typed array, for `postMessage` or a file. */
export interface WindowTransfer {
  start: number;
  end: number;
  startTime: number;
  endTime: number;
  profiled: boolean;
  /** The per-move rows (17 doubles each, `end - start` rows); opaque, only `fromTransfer` reads it. */
  data: Float64Array;
}

/**
 * Toolhead positions over moves `start` to `end` (exclusive), built once per window and sampled
 * per frame: `positionAt` is a binary search and a closed-form trapezoid, with no allocation when
 * given its `out`.
 *
 * Profiles: for a planner that resumes from checkpoints (Klipper), each move follows its
 * `trapezoidsFor` trapezoid (accelerate, cruise, decelerate) and holds at its end point for the
 * rest of its duration, which is where the planner charges G4 dwells and macro time. A dwell before
 * the first move holds at the start point instead. A trapezoid that does not fit its move
 * (Klipper's arc chords, which take a share of the arc's re-cut segments by length) runs at
 * constant speed over its duration less those holds.
 *
 * Fallback: every other planner (`trapezoidsFor` throws for them) has only start times, so each
 * move runs at constant speed from its start time to the next move's, less the dwell its G4
 * markers state, which holds. Start times then come from the f32 records (about 4 ms resolution
 * ten hours in).
 */
export class ToolheadWindow {
  readonly start: number;
  readonly end: number;
  /** Start of the first move and end of the last, seconds. */
  readonly startTime: number;
  readonly endTime: number;
  /** True when the moves follow the planner's trapezoids, false on the constant-speed fallback. */
  readonly profiled: boolean;
  private readonly data: Float64Array;

  constructor(planner: Planner, parsed: ParsedFile, timing: Timing, start: number, end: number) {
    start = Math.max(0, start);
    end = Math.min(end, parsed.moveCount);
    if (start >= end) throw new RangeError(`empty window ${start}..${end}`);
    const n = end - start;
    this.start = start;
    this.end = end;
    this.profiled = timing.checkpoints[0]?.state !== undefined;
    // One move past the window gives the last one's duration.
    const traps = this.profiled ? trapezoidsFor(planner, parsed, timing, start, end + 1) : undefined;
    const holds = dwells(parsed);
    const d = (this.data = new Float64Array(n * N));

    let [b, local] = locate(parsed, start === 0 ? 0 : start - 1);
    let view = new DataView(parsed.moves[b]!);
    let ext = new DataView(parsed.extrusion[b]!);
    let px = 0;
    let py = 0;
    let pz = 0;
    if (start > 0) {
      const o = local * MOVE_STRIDE;
      [px, py, pz] = [view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)];
      local++;
    }
    const startAt = (i: number): number => {
      if (i >= parsed.moveCount) return timing.totalTime;
      if (traps) return traps[i - start]!.start;
      const [cb, cl] = locate(parsed, i);
      return new DataView(parsed.moves[cb]!).getFloat32(cl * MOVE_STRIDE + MoveOffset.startTime, true);
    };
    let t0 = startAt(start);
    for (let k = 0; k < n; k++) {
      while (local * MOVE_STRIDE >= view.byteLength) {
        view = new DataView(parsed.moves[++b]!);
        ext = new DataView(parsed.extrusion[b]!);
        local = 0;
      }
      const o = local * MOVE_STRIDE;
      const x = view.getFloat32(o, true);
      const y = view.getFloat32(o + 4, true);
      const z = view.getFloat32(o + 8, true);
      const de = ext.getFloat32(local * 4, true);
      const i = start + k;
      const next = startAt(i + 1);
      const duration = Math.max(0, next - t0);
      const pre = i === 0 ? Math.min(duration, holds.get(0) ?? 0) : 0;
      const post = Math.min(duration - pre, holds.get(i + 1) ?? 0);
      const len = Math.hypot(x - px, y - py, z - pz);
      const r = k * N;
      d[r + T0] = t0;
      d[r + PRE] = pre;
      d[r + L] = len >= 1e-9 ? len : Math.abs(de);
      d[r + SX] = px;
      d[r + SX + 1] = py;
      d[r + SX + 2] = pz;
      d[r + DX] = x - px;
      d[r + DX + 1] = y - py;
      d[r + DX + 2] = z - pz;
      d[r + DE] = de;
      d[r + TOOL] = view.getUint8(o + MoveOffset.tool);
      if (!(traps && this.fit(r, traps[k]!, duration - pre))) {
        d[r + A] = -1;
        d[r + MOTION] = duration - pre - post;
      }
      [px, py, pz, t0] = [x, y, z, next];
      local++;
    }
    this.startTime = d[T0]!;
    this.endTime = startAt(end);
  }

  /** The window as plain data (shares `data`, no copy); `ToolheadWindow.fromTransfer` rebuilds it with no planner. */
  toTransfer(): WindowTransfer {
    const { start, end, startTime, endTime, profiled, data } = this;
    return { start, end, startTime, endTime, profiled, data };
  }

  /** The window `toTransfer` made (keeps `t.data`, no copy); `positionAt` works on it as on the original. */
  static fromTransfer(t: WindowTransfer): ToolheadWindow {
    if (!(t.end > t.start) || t.data.length !== (t.end - t.start) * N)
      throw new RangeError('malformed window transfer');
    const { data, ...rest } = t;
    const w = Object.create(ToolheadWindow.prototype) as { data: Float64Array };
    return Object.assign(w, rest, { data }) as unknown as ToolheadWindow;
  }

  /** Stores the trapezoid's phases at row `r` if it fits the move in `budget` seconds. */
  private fit(r: number, tr: { entry: number; cruise: number; exit: number; accel: number }, budget: number): boolean {
    const d = this.data;
    const len = d[r + L]!;
    const { entry: v0, cruise: vc, exit: v1, accel: a } = tr;
    let ta = 0;
    let tc = 0;
    let motion = 0;
    if (len > 0) {
      if (!(a > 0 && vc > 0 && vc >= v0 - 1e-9 && vc >= v1 - 1e-9)) return false;
      const da = (vc * vc - v0 * v0) / (2 * a);
      const dd = (vc * vc - v1 * v1) / (2 * a);
      const dc = len - da - dd;
      if (dc < -1e-6 * Math.max(1, len)) return false;
      ta = (vc - v0) / a;
      tc = ta + Math.max(0, dc) / vc;
      motion = tc + (vc - v1) / a;
      if (motion > budget + 1e-6) return false;
    }
    d[r + V0] = v0;
    d[r + A] = a;
    d[r + VC] = vc;
    d[r + TA] = ta;
    d[r + TC] = tc;
    d[r + MOTION] = motion;
    return true;
  }

  /** The toolhead at time `t` (seconds), clamped to the window, written into `out`. */
  positionAt(t: number, out: ToolheadSample = { move: 0, x: 0, y: 0, z: 0, e: 0, tool: 0 }): ToolheadSample {
    const d = this.data;
    let lo = 0;
    let hi = d.length / N - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (d[mid * N + T0]! <= t) lo = mid;
      else hi = mid - 1;
    }
    const r = lo * N;
    const motion = d[r + MOTION]!;
    const tau = Math.min(Math.max(t - d[r + T0]! - d[r + PRE]!, 0), motion);
    const len = d[r + L]!;
    let f = 1;
    if (d[r + A]! < 0) f = motion > 0 ? tau / motion : 1;
    else if (len > 0) {
      const a = d[r + A]!;
      const v0 = d[r + V0]!;
      const vc = d[r + VC]!;
      const ta = d[r + TA]!;
      const tc = d[r + TC]!;
      const da = v0 * ta + 0.5 * a * ta * ta;
      let s: number;
      if (tau < ta) s = v0 * tau + 0.5 * a * tau * tau;
      else if (tau < tc) s = da + vc * (tau - ta);
      else {
        const u = tau - tc;
        s = da + vc * (tc - ta) + vc * u - 0.5 * a * u * u;
      }
      f = Math.min(1, Math.max(0, s / len));
    }
    out.move = this.start + lo;
    out.x = d[r + SX]! + f * d[r + DX]!;
    out.y = d[r + SX + 1]! + f * d[r + DX + 1]!;
    out.z = d[r + SX + 2]! + f * d[r + DX + 2]!;
    out.e = f * d[r + DE]!;
    out.tool = d[r + TOOL]!;
    return out;
  }
}
