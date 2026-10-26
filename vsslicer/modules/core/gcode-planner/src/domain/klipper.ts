// SPDX-License-Identifier: AGPL-3.0-or-later
// Ported from Klipper (GPL-3.0-or-later, combined here under AGPL-3.0 per D2):
//   klipper@ee2c6fb:klippy/toolhead.py:14-193 (Move, LookAheadQueue), 200-216, 300-306, 395-410, 534-537
//   klipper@ee2c6fb:klippy/kinematics/cartesian.py:41-44,106-119 (Z limits)
//   klipper@ee2c6fb:klippy/kinematics/extruder.py:150-171,208-243 (extrude-only limits, E junction)
//   klipper@ee2c6fb:klippy/extras/firmware_retraction.py:10-16,53-71 (G10/G11)
// Copyright (C) 2016-2024 Kevin O'Connor <kevin@koconnor.net>. Ported from reading, not copied.
// `; ESTIMATOR_ADD_TIME` follows klipper_estimator@dbcff4a:lib/src/planner.rs:171-178 (MIT, Lasse Dalegaard).
import { MOVE_STRIDE, MoveFlag, MoveOffset, StateKind } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import { resegmentArc } from './arc.ts';
import type { ArcPoint } from './arc.ts';
import type { ResolvedLimits } from './limits.ts';
import { MoveCursor } from './move-cursor.ts';
import type { Planner, Replay } from './planner.ts';
import { TimingBuilder } from './timing.ts';

/** printer.cfg values Klipper reads that are not in `MachineLimits`. Unset ones take Klipper's defaults. */
export interface KlipperOptions {
  /** `[printer] max_z_velocity`; default `max_velocity`. */
  maxZVelocity?: number;
  /** `[printer] max_z_accel`; default `max_accel`. */
  maxZAccel?: number;
  /** `[extruder] nozzle_diameter`, mm; default 0.4 (Klipper requires it). */
  nozzleDiameter?: number;
  /** `[extruder] filament_diameter`, mm; default 1.75 (Klipper requires it). */
  filamentDiameter?: number;
  /** `[extruder] max_extrude_only_velocity`; default `max_velocity * 4 * nozzle^2 / filament_area`. */
  maxExtrudeOnlyVelocity?: number;
  /** `[extruder] max_extrude_only_accel`; default `max_accel * 4 * nozzle^2 / filament_area`. */
  maxExtrudeOnlyAccel?: number;
  /** `[extruder] instantaneous_corner_velocity`, mm/s; default 1. */
  instantaneousCornerVelocity?: number;
  /** `[firmware_retraction]`: G10/G11 lengths (mm) and speeds (mm/s); defaults 0, 20, 0, 10. */
  retractLength?: number;
  retractSpeed?: number;
  unretractExtraLength?: number;
  unretractSpeed?: number;
  /**
   * Macro time the caller knows of, beyond the file's own `G4` and `ESTIMATOR_ADD_TIME` markers
   * (which are always added): seconds added before the move at `moveIndex`, with a full flush.
   */
  addTime?: readonly { moveIndex: number; seconds: number }[];
  /** `[gcode_arcs] resolution`, mm: arcs are timed on segments this long; default 1. */
  resolution?: number;
  /** Moves between checkpoints; default `CHECKPOINT_INTERVAL`. */
  checkpointInterval?: number;
}

/** klipper@ee2c6fb:klippy/toolhead.py:116 and 196 */
const LOOKAHEAD_FLUSH_TIME = 0.15;
const BUFFER_TIME_HIGH = 1.0;
/** gcode_move's speed before the first F word, mm/s (klipper@ee2c6fb:klippy/extras/gcode_move.py:34). */
const START_FEEDRATE = 25;

/** One queued toolhead move; field names follow Klipper's `Move`. */
interface KMove {
  moveD: number;
  /** Unit direction X, Y, Z and E ratio (E / moveD). */
  rx: number;
  ry: number;
  rz: number;
  re: number;
  kinematic: boolean;
  accel: number;
  jd: number;
  minMoveT: number;
  maxStartV2: number;
  maxCruiseV2: number;
  deltaV2: number;
  maxMcrStartV2: number;
  mcrDeltaV2: number;
  /** Set by the flush: entry, cruise and exit speed, and duration. */
  startV: number;
  cruiseV: number;
  endV: number;
  time: number;
}

/** What `trapezoidsFor` reports for a move. */
type Profile = Pick<KMove, 'startV' | 'cruiseV' | 'endV' | 'accel'>;
/** A move Klipper drops. */
const STILL: Profile = { startV: 0, cruiseV: 0, endV: 0, accel: 0 };

/** The segments Klipper cuts one arc into, shared by the parser chords that stand for it. */
interface ArcGroup {
  segs: KMove[];
  /** Summed chord length, mm. */
  total: number;
}

/** A parser chord of an arc: it takes its share of the arc's time by length. */
interface ChordSlot {
  group: ArcGroup;
  /** Chord start along the arc, and its length, mm. */
  from: number;
  len: number;
}

interface Toolhead {
  maxVelocity: number;
  maxAccel: number;
  jd: number;
  mcrPseudoAccel: number;
}

function limitSpeed(m: KMove, speed: number, accel: number): void {
  if (speed * speed < m.maxCruiseV2) {
    m.maxCruiseV2 = speed * speed;
    m.minMoveT = m.moveD / speed;
  }
  m.accel = Math.min(m.accel, accel);
  m.deltaV2 = 2 * m.moveD * m.accel;
  m.mcrDeltaV2 = Math.min(m.mcrDeltaV2, m.deltaV2);
}

/** toolhead.py:66-99 plus the extruder's extra-axis junction (extruder.py:239-243). */
function calcJunction(m: KMove, p: KMove, icv: number): void {
  if (!m.kinematic || !p.kinematic) return;
  const diffR = m.re - p.re;
  const eaV2 = diffR ? (icv / Math.abs(diffR)) ** 2 : m.maxCruiseV2;
  let maxStartV2 = Math.min(m.maxCruiseV2, p.maxCruiseV2, p.maxStartV2 + p.deltaV2, eaV2);
  const cos = -(m.rx * p.rx + m.ry * p.ry + m.rz * p.rz);
  const sinD2 = Math.sqrt(Math.max(0.5 * (1 - cos), 0));
  const cosD2 = Math.sqrt(Math.max(0.5 * (1 + cos), 0));
  if (1 - sinD2 > 0 && cosD2 > 0) {
    const rJd = sinD2 / (1 - sinD2);
    const quarterTan = (0.25 * sinD2) / cosD2;
    maxStartV2 = Math.min(
      maxStartV2,
      rJd * m.jd * m.accel,
      rJd * p.jd * p.accel,
      m.deltaV2 * quarterTan,
      p.deltaV2 * quarterTan,
    );
  }
  m.maxStartV2 = maxStartV2;
  m.maxMcrStartV2 = Math.min(maxStartV2, p.maxMcrStartV2 + p.mcrDeltaV2);
}

/** toolhead.py:100-114: accel + cruise + decel time of the trapezoid. */
function setJunction(m: KMove, startV2: number, cruiseV2: number, endV2: number): void {
  const half = 0.5 / m.accel;
  const accelD = (cruiseV2 - startV2) * half;
  const decelD = (cruiseV2 - endV2) * half;
  const startV = Math.sqrt(startV2);
  const cruiseV = Math.sqrt(cruiseV2);
  const endV = Math.sqrt(endV2);
  m.startV = startV;
  m.cruiseV = cruiseV;
  m.endV = endV;
  m.time =
    accelD / ((startV + cruiseV) * 0.5) + (m.moveD - accelD - decelD) / cruiseV + decelD / ((endV + cruiseV) * 0.5);
}

/**
 * toolhead.py:135-185: plans the queue assuming a stop after its last move and returns how many
 * moves are final. Lazy: only up to the last point the rest of the queue can no longer change.
 */
function flush(queue: KMove[], lazy: boolean): number {
  let updateFlushCount = lazy;
  let flushCount = queue.length;
  const info: [number, number | undefined, number][] = new Array(flushCount);
  let nextStartV2 = 0;
  let nextMcrStartV2 = 0;
  let peakCruiseV2 = 0;
  let pending = 0;
  for (let i = flushCount - 1; i >= 0; i--) {
    const m = queue[i]!;
    const reachableStartV2 = nextStartV2 + m.deltaV2;
    const startV2 = Math.min(m.maxStartV2, reachableStartV2);
    let cruiseV2: number | undefined;
    pending++;
    const reachMcrStartV2 = nextMcrStartV2 + m.mcrDeltaV2;
    const mcrStartV2 = Math.min(m.maxMcrStartV2, reachMcrStartV2);
    if (mcrStartV2 < reachMcrStartV2) {
      if (mcrStartV2 + m.mcrDeltaV2 > nextMcrStartV2 || pending > 1) {
        if (updateFlushCount && peakCruiseV2) {
          flushCount = i + pending;
          updateFlushCount = false;
        }
        peakCruiseV2 = (mcrStartV2 + reachMcrStartV2) * 0.5;
      }
      cruiseV2 = Math.min((startV2 + reachableStartV2) * 0.5, m.maxCruiseV2, peakCruiseV2);
      pending = 0;
    }
    info[i] = [startV2, cruiseV2, nextStartV2];
    nextStartV2 = startV2;
    nextMcrStartV2 = mcrStartV2;
  }
  if (updateFlushCount || !flushCount) return 0;
  let prevCruiseV2 = 0;
  for (let i = 0; i < flushCount; i++) {
    const [startV2, c, next] = info[i]!;
    const cruiseV2 = c ?? Math.min(prevCruiseV2, startV2);
    setJunction(queue[i]!, Math.min(startV2, cruiseV2), cruiseV2, Math.min(next, cruiseV2));
    prevCruiseV2 = cruiseV2;
  }
  return flushCount;
}

/** Builds a Klipper planner for one printer.cfg; `klipperPlanner` uses Klipper's defaults. */
export function createKlipperPlanner(options: KlipperOptions = {}): Planner {
  const resolution = options.resolution ?? 1;
  if (!(resolution > 0)) throw new RangeError(`resolution must be > 0, got ${resolution}`);
  return {
    name: 'klipper',
    estimate: false,
    *plan(parsed: ParsedFile, resolved: ResolvedLimits, replay?: Replay) {
      // M201/M203/M205 (MaxAccel, MaxFeedrate, Jerk, JD) are Marlin's: Klipper ignores them.
      const lim = resolved.limits;
      const th: Toolhead = { maxVelocity: lim.maxVelocity, maxAccel: lim.accel, jd: 0, mcrPseudoAccel: 0 };
      let scv = lim.squareCornerVelocity;
      let mcr = lim.minCruiseRatio;
      const recalc = (): void => {
        th.jd = (scv * scv * (Math.SQRT2 - 1)) / th.maxAccel;
        th.mcrPseudoAccel = th.maxAccel * (1 - mcr);
      };
      recalc();
      const o = options;
      const maxZV = o.maxZVelocity ?? lim.maxVelocity;
      const maxZA = o.maxZAccel ?? lim.accel;
      const nozzle = o.nozzleDiameter ?? 0.4;
      const filamentArea = Math.PI * ((o.filamentDiameter ?? 1.75) / 2) ** 2;
      const extrudeRatio = (4 * nozzle * nozzle) / filamentArea;
      const maxEV = o.maxExtrudeOnlyVelocity ?? lim.maxVelocity * extrudeRatio;
      const maxEA = o.maxExtrudeOnlyAccel ?? lim.accel * extrudeRatio;
      const icv = o.instantaneousCornerVelocity ?? 1;
      const retractLength = o.retractLength ?? 0;
      const unretractLength = retractLength + (o.unretractExtraLength ?? 0);
      let retracted = false;

      // G4 and M400 drain the lookahead (toolhead.py:418-423); so do macro delays.
      const stops = new Set(parsed.markers.filter((m) => m.name === 'G4' || m.name === 'M400').map((m) => m.moveIndex));
      const added = new Map<number, number>();
      // G4 dwell (toolhead.py:565-568) and `; ESTIMATOR_ADD_TIME` (klipper_estimator@dbcff4a:lib/src/planner.rs:171-178)
      const timed = parsed.markers.filter((m) => m.name === 'G4' || m.name === 'ESTIMATOR_ADD_TIME');
      for (const a of [...(o.addTime ?? []), ...timed]) {
        added.set(a.moveIndex, (added.get(a.moveIndex) ?? 0) + (a.seconds ?? 0));
        stops.add(a.moveIndex);
      }

      const cur = new MoveCursor(parsed);
      const out = replay?.out ?? new TimingBuilder(parsed, o.checkpointInterval);
      // Every parser move in order; null for moves Klipper drops (no XYZ or E motion).
      const order: (KMove | ChordSlot | null)[] = [];
      let head = 0;
      const queue: KMove[] = [];
      let junctionFlush = BUFFER_TIME_HIGH;
      // The last emitted move is held back so a macro delay after it can join its duration.
      let held: { time: number; p: Profile } | undefined;
      let lead = 0; // macro time before the first move: joins the first move's duration
      const add = (time: number, p: Profile): void => out.add(time, p.startV, p.cruiseV, p.endV, p.accel);
      const emit = (time: number, p: Profile): void => {
        if (held) add(held.time, held.p);
        else time += lead;
        held = { time, p };
      };
      // A chord is final only once all of its arc's segments are.
      const isNext = (slot: KMove | ChordSlot | null, firstLeft: KMove | undefined): boolean =>
        slot !== null &&
        (slot === firstLeft || ('group' in slot && firstLeft !== undefined && slot.group.segs.includes(firstLeft)));
      const commit = (n: number): void => {
        queue.splice(0, n);
        const firstLeft = queue[0];
        while (head < order.length && !isNext(order[head]!, firstLeft)) {
          const m = order[head++];
          if (m && 'group' in m) {
            const { segs, total } = m.group;
            const t = segs.reduce((sum, k) => sum + k.time, 0);
            const at = (d: number): number =>
              Math.max(0, Math.min(segs.length - 1, Math.ceil((d / (total || 1)) * segs.length) - 1));
            const i = Math.min(segs.length - 1, Math.floor((m.from / (total || 1)) * segs.length));
            const j = Math.max(i, at(m.from + m.len));
            // The chord's profile spans the segments it overlaps: first entry, top cruise, last exit.
            const cruiseV = segs.slice(i, j + 1).reduce((v, k) => Math.max(v, k.cruiseV), 0);
            const p = segs[i] ? { startV: segs[i].startV, cruiseV, endV: segs[j]!.endV, accel: segs[i].accel } : STILL;
            emit((t * m.len) / (total || 1), p);
          } else emit(m ? m.time : 0, m ?? STILL);
        }
        if (!firstLeft) {
          order.length = 0;
          head = 0;
        } else if (head > 4096) {
          // Drop the reported prefix, or a file with no G4/M400 keeps every move until the end.
          order.splice(0, head);
          head = 0;
        }
      };
      const flushAll = (): void => {
        commit(flush(queue, false));
        junctionFlush = BUFFER_TIME_HIGH;
      };
      let lastAccel = NaN;
      let lastP = NaN;
      let lastT = NaN;

      /** A move as Klipper's `Move`; null when it has no XYZ or E motion (Klipper drops it). */
      const build = (dx: number, dy: number, dz: number, e: number, speed: number): KMove | null => {
        const kinematic = Math.hypot(dx, dy, dz) >= 1e-9;
        const moveD = kinematic ? Math.hypot(dx, dy, dz) : Math.abs(e);
        if (!moveD) return null;
        const velocity = kinematic ? Math.min(speed, th.maxVelocity) : speed;
        const inv = 1 / moveD;
        const m: KMove = {
          moveD,
          rx: kinematic ? dx * inv : 0,
          ry: kinematic ? dy * inv : 0,
          rz: kinematic ? dz * inv : 0,
          re: e * inv,
          kinematic,
          accel: kinematic ? th.maxAccel : 99999999.9,
          jd: th.jd,
          minMoveT: moveD / velocity,
          maxStartV2: 0,
          maxCruiseV2: velocity * velocity,
          deltaV2: 0,
          maxMcrStartV2: 0,
          mcrDeltaV2: 2 * moveD * th.mcrPseudoAccel,
          startV: 0,
          cruiseV: 0,
          endV: 0,
          time: 0,
        };
        m.deltaV2 = 2 * moveD * m.accel;
        if (kinematic && dz) {
          const zRatio = moveD / Math.abs(dz);
          limitSpeed(m, maxZV * zRatio, maxZA * zRatio);
        }
        if (e && ((!dx && !dy) || m.re < 0)) limitSpeed(m, maxEV / Math.abs(m.re), maxEA / Math.abs(m.re));
        return m;
      };
      const enqueue = (m: KMove): void => {
        queue.push(m);
        if (queue.length > 1) {
          calcJunction(m, queue[queue.length - 2]!, icv);
          junctionFlush -= m.minMoveT;
          if (junctionFlush <= 0) {
            // toolhead.py:135-136 resets the budget on every flush attempt
            junctionFlush = LOOKAHEAD_FLUSH_TIME;
            commit(flush(queue, true));
          }
        }
      };
      // The parser's chords of one arc, held until the arc ends and then run as Klipper's segments.
      let arc: { offset: number; points: ArcPoint[]; speed: number; group: ArcGroup } | undefined;
      const flushArc = (): void => {
        if (!arc) return;
        const { points, speed, group } = arc;
        arc = undefined;
        let prev = points[0]!;
        for (const p of resegmentArc(points, resolution) ?? points.slice(1)) {
          const m = build(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2], p[3] - prev[3], speed);
          if (m) {
            group.segs.push(m);
            enqueue(m);
          }
          prev = p;
        }
      };
      const views = parsed.moves.map((b) => new DataView(b));
      let vb = 0;
      let vl = -1;

      // Everything the loop carries from one move to the next: a checkpoint's snapshot.
      const state = () => ({
        cur: cur.save(),
        th,
        scv,
        mcr,
        retracted,
        lastAccel,
        lastP,
        lastT,
        order: order.slice(head),
        queue,
        junctionFlush,
        held,
        lead,
        arc,
        vb,
        vl,
      });
      if (replay) {
        const s = structuredClone(replay.from.state) as ReturnType<typeof state>;
        cur.restore(s.cur);
        Object.assign(th, s.th);
        ({ scv, mcr, retracted, lastAccel, lastP, lastT, junctionFlush, held, lead, arc, vb, vl } = s);
        order.push(...s.order);
        queue.push(...s.queue);
      }
      if (out.snapshotDue) out.snapshot(structuredClone(state()));

      while (cur.next()) {
        vl++;
        while (vl * MOVE_STRIDE >= views[vb]!.byteLength) {
          vb++;
          vl = 0;
        }
        const offset = views[vb]!.getUint32(vl * MOVE_STRIDE + MoveOffset.fileOffset, true);
        const isArc = (cur.flags & MoveFlag.Arc) !== 0;
        if (arc && !(isArc && arc.offset === offset)) flushArc();
        if (stops.has(cur.index)) {
          flushArc();
          flushAll();
          const extra = added.get(cur.index);
          if (extra && held) held.time += extra;
          else if (extra) lead += extra;
        }
        // SET_VELOCITY_LIMIT and M204 (toolhead.py:534-616): new moves only, no flush.
        // An `accel` override pins S, P and T to it, so M204 never changes the accel.
        const vLimit = cur.limit(resolved, 'maxVelocity', StateKind.MaxVelocity, 0, th.maxVelocity);
        const v = vLimit > 0 ? vLimit : th.maxVelocity; // Klipper refuses VELOCITY=0 (above=0.)
        const s = cur.limit(resolved, 'accel', StateKind.Accel, 0, NaN);
        const p = cur.limit(resolved, 'accel', StateKind.AccelPrint, 0, NaN);
        const t = cur.limit(resolved, 'accel', StateKind.AccelTravel, 0, NaN);
        const nScv = cur.limit(resolved, 'squareCornerVelocity', StateKind.SquareCornerVelocity, 0, scv);
        const nMcr = cur.limit(resolved, 'minCruiseRatio', StateKind.MinCruiseRatio, 0, mcr);
        let accel = th.maxAccel;
        if (s !== lastAccel && s > 0) accel = s;
        else if ((p !== lastP || t !== lastT) && p > 0 && t > 0) accel = Math.min(p, t); // M204 P T: the lower one
        lastAccel = s;
        lastP = p;
        lastT = t;
        if (v !== th.maxVelocity || accel !== th.maxAccel || nScv !== scv || nMcr !== mcr) {
          th.maxVelocity = v;
          th.maxAccel = accel;
          scv = nScv;
          mcr = nMcr;
          recalc();
        }

        let e = cur.e;
        let speed = cur.state(StateKind.Feedrate, 0, START_FEEDRATE);
        if (!(speed > 0)) speed = START_FEEDRATE;
        const len = cur.length;
        if (isArc) {
          arc ??= {
            offset,
            points: [[cur.x - cur.dx, cur.y - cur.dy, cur.z - cur.dz, 0]],
            speed,
            group: { segs: [], total: 0 },
          };
          arc.points.push([cur.x, cur.y, cur.z, arc.points.at(-1)![3] + e]);
          order.push({ group: arc.group, from: arc.group.total, len });
          arc.group.total += len;
        } else {
          // G10/G11 arrive as motionless flagged moves (gcode-parser machine.ts firmwareRetract).
          if (len === 0 && e === 0 && cur.flags & (MoveFlag.Retract | MoveFlag.Unretract)) {
            const retract = (cur.flags & MoveFlag.Retract) !== 0;
            if (retract !== retracted) {
              retracted = retract;
              e = retract ? -retractLength : unretractLength;
              speed = retract ? (o.retractSpeed ?? 20) : (o.unretractSpeed ?? 10);
            }
          }
          const m = build(cur.dx, cur.dy, cur.dz, e, speed);
          order.push(m);
          if (m) enqueue(m);
          else if (!queue.length) commit(0);
        }
        if (out.snapshotDue) out.snapshot(structuredClone(state()));
        if (cur.bufferEnd || out.stop) yield out.count;
      }
      flushArc();
      flushAll();
      if (held) add(held.time + (added.get(parsed.moveCount) ?? 0), held.p); // time after the last move
      return out.finish(this.name, this.estimate, resolved);
    },
  };
}

/** Klipper with printer.cfg defaults for everything `MachineLimits` does not carry. */
export const klipperPlanner: Planner = createKlipperPlanner();
