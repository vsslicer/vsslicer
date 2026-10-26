// SPDX-License-Identifier: AGPL-3.0-or-later
// Written from the description in docs/research/rrf-planner.md (RepRapFirmware 3.6.3 @ aebf629,
// GPL-3.0): the algorithm and constants, not RRF's source text.
import { MOVE_STRIDE, MoveFlag, MoveOffset, StateKind } from '@vsslicer/gcode-api';
import type { LimitKey } from './limits.ts';
import { MoveCursor } from './move-cursor.ts';
import type { Planner } from './planner.ts';
import { TimingBuilder } from './timing.ts';

/** DDA ring length of the Duet 2 / Duet 3 Mini; moves older than this are committed (rrf-planner.md, "the DDA ring"). */
export const RRF_WINDOW = 40;

/** Feedrate before the file's first F word: RRF's DefaultFeedRate 3000 mm/min (RepRapFirmware@aebf629:src/Config/Configuration.h:214). */
const START_FEEDRATE = 50;
const AXES = ['X', 'Y', 'Z', 'E'] as const;
const MAX_FEED = AXES.map((a) => `maxFeedrate${a}` as LimitKey);
const MAX_ACCEL = AXES.map((a) => `maxAccel${a}` as LimitKey);
const JERK = AXES.map((a) => `jerk${a}` as LimitKey);

/** min over drives with a nonzero direction of box_i / |u_i|; a non-positive box is "no limit" (RRF boxIntersect). */
function boxIntersect(u: number[], box: number[]): number {
  let r = Infinity;
  for (let i = 0; i < 4; i++) if (u[i]! !== 0 && box[i]! > 0) r = Math.min(r, box[i]! / Math.abs(u[i]!));
  return r;
}

interface Entry {
  /** Move length, mm (|e| for an E-only move). */
  len: number;
  /** Unit direction over X, Y, Z, E. */
  u: number[];
  jerk: number[];
  accel: number;
  vreq: number;
  /** Highest speed at the start (the join with the move before; 0 if they do not join). */
  cap: number;
  /** Speed entering / leaving the move, as planned so far. */
  vs: number;
  ve: number;
}

/** Seconds for a trapezoid with accel = decel = a; `vs`/`ve` may be infeasible, then it is a constant-accel ramp. */
function duration(e: Entry): number {
  const { len, accel: a, vreq: v, vs, ve } = e;
  if (len === 0) return 0;
  const da = (v * v - vs * vs) / (2 * a);
  const dd = (v * v - ve * ve) / (2 * a);
  if (da + dd <= len) return (v - vs) / a + (v - ve) / a + (len - da - dd) / v;
  const peak2 = a * len + (vs * vs + ve * ve) / 2;
  if (peak2 < Math.max(vs * vs, ve * ve)) return vs + ve > 0 ? (2 * len) / (vs + ve) : 0;
  const peak = Math.sqrt(peak2);
  return (peak - vs) / a + (peak - ve) / a;
}

/** The speed a move can reach (or brake from) over its length from `v`; a zero-length move passes `v` on. */
const reach = (v: number, e: Entry): number => (e.len ? Math.sqrt(v * v + 2 * e.accel * e.len) : v);

/** What a join needs from the move before it. */
interface Prev {
  e: Entry;
  flags: string;
  /** File offset when the move is an arc chord. */
  arc?: number;
}

/**
 * RepRapFirmware 3.6 planner: per-drive M201/M203, M204 P/T, M566 jerk, joins only between like moves,
 * and a backward/forward lookahead over the last {@link RRF_WINDOW} moves. Lower confidence
 * (`estimate`) until compared with RRF's M37 simulation or measured Duet prints: the window depends
 * on the board, and input shaping, kinematic limits and exact arc segments are not modelled.
 */
export const rrfPlanner: Planner = {
  name: 'reprapfirmware',
  estimate: true,
  *plan(parsed, limits) {
    const cur = new MoveCursor(parsed);
    const out = new TimingBuilder(parsed);
    const views = parsed.moves.map((b) => new DataView(b));
    let vb = 0;
    let vl = -1;
    const win: Entry[] = [];
    let prev: Prev | undefined;

    const commit = () => {
      const e = win.shift()!;
      out.add(duration(e), e.vs);
    };
    const flush = () => {
      while (win.length) commit();
      prev = undefined;
    };
    // G4 waits for the moves to finish, then dwells.
    const dwells = new Map<number, number>();
    for (const k of parsed.markers)
      if (k.name === 'G4') dwells.set(k.moveIndex, (dwells.get(k.moveIndex) ?? 0) + (k.seconds ?? 0));
    const dwell = (index: number) => {
      const seconds = dwells.get(index);
      if (seconds === undefined) return;
      flush();
      out.dwell(seconds);
    };

    const accelCap = (printing: boolean): number => {
      const key = printing ? 'accelPrint' : 'accelTravel';
      if (limits.sources[key] === 'override') return limits.limits[key];
      const own = cur.state(printing ? StateKind.AccelPrint : StateKind.AccelTravel);
      if (!Number.isNaN(own)) return own;
      return cur.state(StateKind.Accel, 0, limits.limits[key]); // M204 S stands in for an unset P/T
    };

    while (cur.next()) {
      dwell(cur.index);
      vl++;
      while (vl * MOVE_STRIDE >= views[vb]!.byteLength) {
        vb++;
        vl = 0;
      }
      const offset = views[vb]!.getUint32(vl * MOVE_STRIDE + MoveOffset.fileOffset, true);
      const isArc = (cur.flags & MoveFlag.Arc) !== 0;
      const xyz = cur.length;
      const len = xyz || Math.abs(cur.e);
      if (len === 0) {
        // Nothing to move (RRF drops it): it keeps its place in the order and the neighbours still join.
        const z: Entry = {
          len: 0,
          u: [0, 0, 0, 0],
          jerk: [0, 0, 0, 0],
          accel: Infinity,
          vreq: 1,
          cap: Infinity,
          vs: 0,
          ve: 0,
        };
        win.push(z);
      } else {
        const u = xyz ? [cur.dx / xyz, cur.dy / xyz, cur.dz / xyz, cur.e / xyz] : [0, 0, 0, Math.sign(cur.e)];
        const xy = cur.dx !== 0 || cur.dy !== 0;
        const printing = xy && cur.e > 0;
        const lim = (keys: LimitKey[], kind: StateKind) => keys.map((k, i) => cur.limit(limits, k, kind, i));
        const maxAccel = lim(MAX_ACCEL, StateKind.MaxAccel);
        const jerk = lim(JERK, StateKind.Jerk);
        const pa = cur.state(StateKind.PressureAdvance, cur.tool, 0);
        if (xy && pa > 0) maxAccel[3] = Math.min(maxAccel[3]! > 0 ? maxAccel[3]! : Infinity, jerk[3]! / pa);
        let accel = boxIntersect(u, maxAccel);
        if (xy) accel = Math.min(accel, accelCap(printing));
        const f = cur.state(StateKind.Feedrate, 0, START_FEEDRATE);
        const vreq = Math.min(
          Math.max(f, limits.limits.minFeedrate),
          boxIntersect(u, lim(MAX_FEED, StateKind.MaxFeedrate)),
        );
        const e: Entry = { len, u, jerk, accel, vreq, cap: 0, vs: 0, ve: 0 };
        const flags = `${printing}${xy}${cur.e !== 0 && !printing}`;
        if (prev && prev.flags === flags) {
          let v = Math.min(prev.e.vreq, vreq);
          // A chord pair of one arc turns by RRF's finer segments, not by ours.
          let scale = 1;
          if (isArc && prev.arc === offset) {
            const pl = prev.e.u;
            const dot = Math.min(1, Math.max(-1, pl[0]! * u[0]! + pl[1]! * u[1]! + pl[2]! * u[2]!));
            const turn = Math.acos(dot);
            if (turn > 1e-9) {
              const r = len / (2 * Math.sin(turn / 2));
              const segLen = Math.min(1, Math.max(0.02, Math.min(Math.sqrt(8 * r * 0.005), f / 200)));
              scale = (segLen * 2 * Math.sin(turn / 2)) / (len * turn);
            }
          }
          for (let i = 0; i < 4; i++) {
            const d = Math.abs(prev.e.u[i]! - u[i]!) * scale;
            if (d > 0) v = Math.min(v, jerk[i]! / d);
          }
          e.cap = v;
        }
        // Zero-length moves in between pass the join on.
        for (let i = win.length - 1; i >= 0 && win[i]!.len === 0; i--) win[i]!.cap = e.cap;
        win.push(e);
        prev = { e, flags, ...(isArc && { arc: offset }) };
      }
      // Lookahead from the join caps each time: backward (can we brake in time?), then forward (can we reach it?).
      // The oldest move's entry speed is final, because its predecessor was committed.
      win.at(-1)!.ve = 0;
      for (let i = win.length - 1; i > 0; i--) {
        const w = win[i]!;
        w.vs = Math.min(w.cap, reach(w.ve, w));
        win[i - 1]!.ve = w.vs;
      }
      for (let i = 0; i < win.length; i++) {
        const w = win[i]!;
        w.ve = Math.min(w.ve, reach(w.vs, w));
        if (i + 1 < win.length) win[i + 1]!.vs = w.ve;
      }
      if (win.length > RRF_WINDOW) commit();
      if (cur.bufferEnd) yield out.count;
    }
    flush();
    dwell(parsed.moveCount);
    return out.finish(this.name, this.estimate, limits);
  },
};
