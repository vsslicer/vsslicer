// SPDX-License-Identifier: AGPL-3.0-or-later
// The timeline behind play/pause/step/speed: a clock over the print's seconds and the toolhead position read from
// the move records, which carry the planner's start times (f32). Pure, no DOM.
import { MOVE_STRIDE, MoveOffset, type Layer } from '@vsslicer/gcode-api';
import type { ToolheadSample, ToolheadWindow } from '@vsslicer/gcode-planner/window';
import { unpackWindow } from '../../domain/window.ts';

/** Speed multipliers offered, 1 = real time. */
export const SPEEDS = [0.5, 1, 2, 5, 10, 50, 100, 500, 2000];

export interface Clock {
  /** Seconds into the print. */
  time: number;
  speed: number;
  playing: boolean;
}

export const createClock = (duration: number, speed = 1) => {
  const c: Clock = { time: 0, speed, playing: false };
  const seek = (t: number) => (c.time = Math.min(Math.max(t, 0), duration));
  return {
    state: c,
    play() {
      if (c.time >= duration) c.time = 0; // play at the end restarts
      c.playing = duration > 0;
    },
    pause: () => void (c.playing = false),
    setSpeed: (x: number) => void (c.speed = x > 0 ? x : c.speed),
    seek,
    /** Advances by `dt` real seconds while playing; stops at the end. */
    tick(dt: number) {
      if (!c.playing) return;
      seek(c.time + dt * c.speed);
      if (c.time >= duration) c.playing = false;
    },
  };
};

/** Start time of global move `i` (s). */
const startOf = (v: DataView, i: number) => v.getFloat32(i * MOVE_STRIDE + MoveOffset.startTime, true);

/** The last move starting at or before `t` (before it when `strict`; 0 if none, -1 without moves). */
export const moveAtTime = (moves: ArrayBuffer, t: number, strict = false): number => {
  const v = new DataView(moves);
  let lo = 0;
  let hi = moves.byteLength / MOVE_STRIDE - 1;
  if (hi < 0) return -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    const s = startOf(v, mid);
    if (strict ? s < t : s <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

/** The time one move on: the next distinct start time, or the end of the print; backwards, the previous one (0 at the first). */
export const stepTime = (moves: ArrayBuffer, t: number, direction: 1 | -1, duration: number): number => {
  const n = moves.byteLength / MOVE_STRIDE;
  if (!n) return 0;
  const v = new DataView(moves);
  if (direction > 0) {
    const i = moveAtTime(moves, t) + 1; // its start is after t
    return i < n ? startOf(v, i) : duration;
  }
  const i = moveAtTime(moves, t, true);
  return startOf(v, i) < t ? startOf(v, i) : 0;
};

/** Start time of move `i`, clamped into the file. */
export const timeOfMove = (moves: ArrayBuffer, i: number): number => {
  const n = moves.byteLength / MOVE_STRIDE;
  return n ? startOf(new DataView(moves), Math.min(Math.max(i, 0), n - 1)) : 0;
};

/**
 * Toolhead at `t`: constant speed from the previous move's end point to this move's over its start-to-next-start
 * span (the planner's own fallback; trapezoid profiles and dwells need the host's timing, not sent to the webview).
 * Writes x, y, z into `out` and returns the move index.
 * The marker's fallback while `createMarker` has no window for `t`: no acceleration shape, a dwell shows as slow motion.
 */
export const positionAt = (moves: ArrayBuffer, t: number, duration: number, out: number[] = [0, 0, 0]): number => {
  const i = moveAtTime(moves, t);
  if (i < 0) return i;
  const v = new DataView(moves);
  const n = moves.byteLength / MOVE_STRIDE;
  const s = startOf(v, i);
  const e = i + 1 < n ? startOf(v, i + 1) : duration;
  const f = e > s ? Math.min(1, Math.max(0, (t - s) / (e - s))) : 1;
  for (let k = 0; k < 3; k++) {
    const to = v.getFloat32(i * MOVE_STRIDE + 4 * k, true);
    const from = i > 0 ? v.getFloat32((i - 1) * MOVE_STRIDE + 4 * k, true) : to;
    out[k] = from + f * (to - from);
  }
  return i;
};

/** Moves per window: 2048 * 136 B = 278 KB over the message channel, about 4 ms of host time per window (Klipper replay). */
export const WINDOW_MOVES = 2048;

/**
 * The marker's position from planner windows fetched on demand: `sample` answers from the window covering `t`,
 * prefetches the next one once `t` is 3/4 through it, and returns undefined (the caller falls back to `positionAt`)
 * while none covers `t`. One request is in flight at a time. `request` asks the host; `accept` takes its reply.
 */
export const createMarker = (
  moves: ArrayBuffer,
  moveCount: number,
  request: (seq: number, from: number, to: number) => void,
  size = WINDOW_MOVES,
) => {
  let cur: ToolheadWindow | undefined;
  let next: ToolheadWindow | undefined;
  let pending = -1;
  let askedAt = 0;
  let seq = 0;
  const covers = (w: ToolheadWindow | undefined, t: number): w is ToolheadWindow =>
    !!w && t >= w.startTime && (t < w.endTime || w.end >= moveCount);
  const ask = (from: number) => {
    // a request the host dropped (bad range, closed panel) frees the slot after 2 s
    if (pending >= 0 && performance.now() - askedAt < 2000) return;
    askedAt = performance.now();
    pending = ++seq;
    request(pending, from, Math.min(moveCount, from + size));
  };
  const out: ToolheadSample = { move: 0, x: 0, y: 0, z: 0, e: 0, tool: 0 };
  return {
    sample(t: number, xyz: number[]): number | undefined {
      if (!covers(cur, t) && covers(next, t)) [cur, next] = [next, undefined];
      if (!covers(cur, t)) return void ask(Math.max(0, moveAtTime(moves, t) - size / 4));
      if (!next && cur.end < moveCount && t > cur.startTime + 0.75 * (cur.endTime - cur.startTime)) ask(cur.end);
      cur.positionAt(t, out);
      [xyz[0], xyz[1], xyz[2]] = [out.x, out.y, out.z];
      return out.move;
    },
    /** The reply to request `n`; kept for when its span is asked for. */
    accept(n: number, packed: ArrayBuffer) {
      if (n === pending) pending = -1;
      next = unpackWindow(packed);
    },
  };
};

/** The layer holding global move `i`, and how many of its moves are done once `i` has run. Moves before layer 0 count as layer 0. */
export const layerOfMove = (layers: readonly Layer[], i: number): { layer: number; move: number } => {
  let lo = 0;
  let hi = layers.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (layers[mid]!.firstMove <= i) lo = mid;
    else hi = mid - 1;
  }
  return { layer: Math.max(lo, 0), move: Math.max(0, i + 1 - (layers[lo]?.firstMove ?? 0)) };
};

/** Column-major `view` and `projection` applied to a world point: fractions of the canvas from its top left, or undefined behind the camera. */
export const project = (
  view: Float32Array,
  projection: Float32Array,
  p: readonly number[],
): [number, number] | undefined => {
  const m = (a: Float32Array, v: number[]) =>
    [0, 1, 2, 3].map((r) => a[r]! * v[0]! + a[4 + r]! * v[1]! + a[8 + r]! * v[2]! + a[12 + r]! * v[3]!);
  const c = m(projection, m(view, [p[0]!, p[1]!, p[2]!, 1]));
  if (c[3]! <= 0) return undefined;
  return [(c[0]! / c[3]! + 1) / 2, (1 - c[1]! / c[3]!) / 2];
};
