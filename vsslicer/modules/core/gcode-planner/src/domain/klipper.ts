// SPDX-License-Identifier: AGPL-3.0-or-later
// Ported from Klipper (GPL-3.0-or-later, combined here under AGPL-3.0 per D2):
//   klipper@ee2c6fb:klippy/toolhead.py:14-193 (Move, LookAheadQueue), 200-216, 300-306, 395-410, 534-537
//   klipper@ee2c6fb:klippy/kinematics/cartesian.py:41-44,106-119 (Z limits)
//   klipper@ee2c6fb:klippy/kinematics/extruder.py:150-171,208-243 (extrude-only limits, E junction)
//   klipper@ee2c6fb:klippy/extras/firmware_retraction.py:10-16,53-71 (G10/G11)
// Copyright (C) 2016-2024 Kevin O'Connor <kevin@koconnor.net>. Ported from reading, not copied.
// `; ESTIMATOR_ADD_TIME` follows klipper_estimator@dbcff4a:lib/src/planner.rs:171-178 (MIT, Lasse Dalegaard).
import { MoveFlag, StateKind } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { ResolvedLimits } from './limits.ts';
import { MoveCursor } from './move-cursor.ts';
import type { Planner } from './planner.ts';
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
   * `; ESTIMATOR_ADD_TIME <seconds>` lines (macro time): seconds added before the move at `moveIndex`.
   * shortcut: the parser drops comments, so the caller passes these until gcode-api carries them.
   */
  addTime?: readonly { moveIndex: number; seconds: number }[];
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
  /** Set by the flush: entry speed and duration. */
  startV: number;
  time: number;
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
  return {
    name: 'klipper',
    estimate: false,
    *plan(parsed: ParsedFile, resolved: ResolvedLimits) {
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
      for (const a of o.addTime ?? []) {
        added.set(a.moveIndex, (added.get(a.moveIndex) ?? 0) + a.seconds);
        stops.add(a.moveIndex);
      }

      const cur = new MoveCursor(parsed);
      const out = new TimingBuilder(parsed);
      // Every parser move in order; null for moves Klipper drops (no XYZ or E motion).
      const order: (KMove | null)[] = [];
      let head = 0;
      const queue: KMove[] = [];
      let junctionFlush = BUFFER_TIME_HIGH;
      // The last emitted move is held back so a macro delay after it can join its duration.
      let held: { time: number; speed: number } | undefined;
      let lead = 0; // macro time before the first move: joins the first move's duration
      const emit = (time: number, speed: number): void => {
        if (held) out.add(held.time, held.speed);
        else time += lead;
        held = { time, speed };
      };
      const commit = (n: number): void => {
        queue.splice(0, n);
        const firstLeft = queue[0];
        while (head < order.length && order[head] !== firstLeft) {
          const m = order[head++];
          emit(m ? m.time : 0, m ? m.startV : 0);
        }
        if (!firstLeft) {
          order.length = 0;
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

      while (cur.next()) {
        if (stops.has(cur.index)) {
          flushAll();
          const extra = added.get(cur.index);
          if (extra && held) held.time += extra;
          else if (extra) lead += extra;
        }
        // SET_VELOCITY_LIMIT and M204 (toolhead.py:534-616): new moves only, no flush.
        const v = cur.state(StateKind.MaxVelocity, 0, th.maxVelocity);
        const s = cur.state(StateKind.Accel, 0, NaN);
        const p = cur.state(StateKind.AccelPrint, 0, NaN);
        const t = cur.state(StateKind.AccelTravel, 0, NaN);
        const nScv = cur.state(StateKind.SquareCornerVelocity, 0, scv);
        const nMcr = cur.state(StateKind.MinCruiseRatio, 0, mcr);
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
        // G10/G11 arrive as motionless flagged moves (gcode-parser machine.ts firmwareRetract).
        if (len === 0 && e === 0 && cur.flags & (MoveFlag.Retract | MoveFlag.Unretract)) {
          const retract = (cur.flags & MoveFlag.Retract) !== 0;
          if (retract !== retracted) {
            retracted = retract;
            e = retract ? -retractLength : unretractLength;
            speed = retract ? (o.retractSpeed ?? 20) : (o.unretractSpeed ?? 10);
          }
        }

        const kinematic = len >= 1e-9;
        const moveD = kinematic ? len : Math.abs(e);
        if (!moveD) {
          order.push(null);
          if (!queue.length) commit(0);
        } else {
          const velocity = kinematic ? Math.min(speed, th.maxVelocity) : speed;
          const inv = 1 / moveD;
          const m: KMove = {
            moveD,
            rx: kinematic ? cur.dx * inv : 0,
            ry: kinematic ? cur.dy * inv : 0,
            rz: kinematic ? cur.dz * inv : 0,
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
            time: 0,
          };
          m.deltaV2 = 2 * moveD * m.accel;
          if (kinematic && cur.dz) {
            const zRatio = moveD / Math.abs(cur.dz);
            limitSpeed(m, maxZV * zRatio, maxZA * zRatio);
          }
          if (e && ((!cur.dx && !cur.dy) || m.re < 0)) limitSpeed(m, maxEV / Math.abs(m.re), maxEA / Math.abs(m.re));
          queue.push(m);
          order.push(m);
          if (queue.length > 1) {
            calcJunction(m, queue[queue.length - 2]!, icv);
            junctionFlush -= m.minMoveT;
            if (junctionFlush <= 0) {
              // toolhead.py:135-136 resets the budget on every flush attempt
              junctionFlush = LOOKAHEAD_FLUSH_TIME;
              commit(flush(queue, true));
            }
          }
        }
        if (cur.bufferEnd) yield out.count;
      }
      flushAll();
      if (held) out.add(held.time, held.speed);
      return out.finish(this.name, this.estimate, resolved);
    },
  };
}

/** Klipper with printer.cfg defaults for everything `MachineLimits` does not carry. */
export const klipperPlanner: Planner = createKlipperPlanner();
