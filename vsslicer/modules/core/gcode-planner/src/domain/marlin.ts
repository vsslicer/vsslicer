// SPDX-License-Identifier: AGPL-3.0-or-later
// Marlin 2 and Prusa-Firmware-Buddy planner. Ported from PrusaSlicer@30ef591 (AGPL-3.0)
// src/libpgcode/src/Slic3r/Biz/libpgcode/{TimeBlock,TimeMachine,ProcessorImpl}.cpp, Copyright (c)
// Prusa Research, and checked against Marlin@2ef3ee6 (GPL-3.0-or-later, combinable with AGPL-3.0
// under GPLv3 section 13) Marlin/src/module/planner.cpp and src/gcode/motion/G2_G3.cpp.
// Where they differ it follows PrusaSlicer: no kennovo junction correction (Marlin@2ef3ee6:
// planner.cpp:2618-2633) and no minimum_planner_speed_sqr floor. The lookahead depth follows Marlin
// (see segment), not PrusaSlicer@30ef591 batching 256 blocks and keeping 64 (…/libpgcode/TimeProcessor.hpp:14-17).
import { MOVE_STRIDE, MoveFlag, MoveOffset, StateKind } from '@vsslicer/gcode-api';
import type { LimitKey, ResolvedLimits } from './limits.ts';
import { MoveCursor } from './move-cursor.ts';
import type { Planner } from './planner.ts';
import { TimingBuilder } from './timing.ts';

/** Marlin's lookahead ring (Marlin@2ef3ee6:Marlin/Configuration_adv.h:2798-2802). */
export const BLOCK_BUFFER_SIZE = 16;
/** Feedrate before the first F word: DEFAULT_FEEDRATE_MM_M 4000 mm/min (Marlin@2ef3ee6:Marlin/src/module/motion.cpp:168-170). */
const BOOT_FEEDRATE = 4000 / 60;
const SQRT_HALF = Math.SQRT1_2;

/** Marlin 2 G2/G3 segment count (Marlin@2ef3ee6:Marlin/src/gcode/motion/G2_G3.cpp:96-123, 218-234; Configuration_adv.h:2696-2699). */
export function marlinArcSegments(flatMm: number, _radius: number, angle: number, _feedrate: number): number {
  const MIN_MM = 0.1;
  const MAX_MM = 1.0; // ARC_SEGMENTS_PER_SEC is off by default, so the ideal length is MAX_ARC_SEGMENT_MM
  // 1e-4: the angle comes from f32 chord endpoints, so a whole quarter circle may read a hair over 18 segments.
  const minSegments = Math.max(1, Math.ceil((72 * angle) / (2 * Math.PI) - 1e-4));
  const nominal = Math.max(Math.floor(flatMm / MAX_MM), minSegments);
  const nominalMm = flatMm / nominal;
  if (nominalMm > MAX_MM) return Math.ceil(flatMm / MAX_MM);
  if (nominalMm < MIN_MM) return Math.max(1, Math.floor(flatMm / MIN_MM));
  return nominal;
}

/** Buddy G2/G3 segment count as PrusaSlicer models it (PrusaSlicer@30ef591:src/libpgcode/src/Slic3r/Biz/libpgcode/ProcessorImpl.cpp:1123-1136). */
export function buddyArcSegments(flatMm: number, radius: number, _angle: number, feedrate: number): number {
  const segmentMm = Math.min(Math.max(Math.min(Math.sqrt(8 * radius * 0.02), feedrate / 50), 0.1), 2.0);
  return Math.max(Math.floor(flatMm / segmentMm + 0.8), 1);
}

/** What differs between the firmwares this planner models. */
export interface MarlinVariant {
  name: string;
  /** Firmware segments for an arc of XY length `flatMm`, `radius`, |angle| rad, at `feedrate` mm/s. */
  arcSegments: (flatMm: number, radius: number, angle: number, feedrate: number) => number;
  /** Marlin's arc planner hints: curve-radius junctions and a safe exit speed inside the arc. */
  hints: boolean;
  /** M204 values are clamped to the machine maxima (PrusaSlicer@30ef591:…/libpgcode/TimeMachine.cpp:245-261). */
  clampAccel: boolean;
}

/** Motion settings in force for one move: an override, else the file's M201/M203/M204/M205/M900, else the limits. */
interface Settings {
  feed: number;
  maxFeed: number[];
  maxAccel: number[];
  jerk: number[];
  jd: number;
  accelPrint: number;
  accelRetract: number;
  accelTravel: number;
  minFeed: number;
  minTravel: number;
  advanceK: number;
}

interface Hint {
  /** Junction speed^2 = accel * radius instead of junction deviation (planner.cpp:2542-2543). */
  curveRadius: number;
  /** Speed^2 the newest block may exit at (planner.cpp:1729-1739). */
  safeExitSqr: number;
}
const NO_HINT: Hint = { curveRadius: 0, safeExitSqr: 0 };

interface Block {
  group: Group;
  distance: number;
  accel: number;
  cruise: number;
  entry: number;
  maxEntry: number;
  exit: number;
  safeExit: number;
  nominalLength: boolean;
  recalc: boolean;
  /** Entry is final: the block before it has run (Marlin's busy block). */
  fixed: boolean;
  accelUntil: number;
  decelAfter: number;
  cruiseRate: number;
}

/** One move record (or every chord of one arc) and the blocks the firmware makes of it. */
interface Group {
  chords: number[];
  blocks: Block[];
  pending: number;
}

const sq = (x: number) => x * x;
/** max_allowable_speed (TimeMachine.cpp:18-23). */
const allowable = (accel: number, target: number, distance: number) =>
  Math.sqrt(Math.max(0, target * target + 2 * accel * distance));

/** TimeBlock::calculate_trapezoid (PrusaSlicer@30ef591:…/libpgcode/TimeBlock.cpp:52-71). */
function trapezoid(b: Block): void {
  const a = b.accel;
  const accelD = a === 0 ? 0 : Math.max(0, (sq(b.cruise) - sq(b.entry)) / (2 * a));
  const decelD = a === 0 ? 0 : Math.max(0, (sq(b.cruise) - sq(b.exit)) / (2 * a));
  let cruiseD = b.distance - accelD - decelD;
  let until = accelD;
  if (cruiseD < 0) {
    const meet = a === 0 ? 0 : (2 * a * b.distance - sq(b.entry) + sq(b.exit)) / (4 * a);
    until = Math.min(Math.max(meet, 0), b.distance);
    cruiseD = 0;
    b.cruiseRate = Math.sqrt(Math.max(0, sq(b.entry) + 2 * a * until));
  } else b.cruiseRate = b.cruise;
  b.accelUntil = until;
  b.decelAfter = until + cruiseD;
}

/** Seconds from the block's start to `d` mm into it, and the speed there (TimeBlock.cpp:14-45). */
function at(b: Block, d: number): [number, number] {
  const a = b.accel;
  const accelTime = (v0: number, dist: number, acc: number) => {
    const v = Math.sqrt(Math.max(0, v0 * v0 + 2 * acc * dist));
    return [acc === 0 ? 0 : (v - v0) / acc, v] as const;
  };
  const [ta, va] = accelTime(b.entry, Math.min(d, b.accelUntil), a);
  if (d <= b.accelUntil) return [ta, va];
  const cruiseLen = Math.min(d, b.decelAfter) - b.accelUntil;
  const tc = b.cruiseRate === 0 ? 0 : cruiseLen / b.cruiseRate;
  if (d <= b.decelAfter) return [ta + tc, b.cruiseRate];
  const [td, vd] = accelTime(b.cruiseRate, d - b.decelAfter, -a);
  return [ta + tc + td, vd];
}

/** The Marlin / Buddy motion model behind one planner run. */
class Machine {
  private readonly blocks: Block[] = [];
  private readonly groups: Group[] = [];
  private hasPrev = false;
  private prevUnit = [0, 0, 0, 0];
  private prevCruise = 0;
  private prevAxis = [0, 0, 0, 0];
  private prevSafe = 0;

  private readonly out: TimingBuilder;

  constructor(out: TimingBuilder) {
    this.out = out;
  }

  group(chords: number[]): Group {
    const g: Group = { chords, blocks: [], pending: 0 };
    this.groups.push(g);
    return g;
  }

  /** Builds a block as ProcessorImpl::process_G1 does (PrusaSlicer@30ef591:…/libpgcode/ProcessorImpl.cpp:660-865). */
  segment(g: Group, delta: number[], s: Settings, hint: Hint): void {
    const xyz = Math.hypot(delta[0]!, delta[1]!, delta[2]!);
    const e = delta[3]!;
    const distance = xyz > 0 ? xyz : Math.abs(e);
    if (distance === 0) return;
    const inv = 1 / distance;
    const feed = Math.max(s.feed, e === 0 ? s.minTravel : s.minFeed);

    const axis = delta.map((d) => feed * d * inv);
    let factor = 1;
    axis.forEach((v, a) => {
      if (v !== 0 && s.maxFeed[a]! > 0) factor = Math.min(factor, s.maxFeed[a]! / Math.abs(v));
    });
    const cruise = factor * feed;
    if (factor < 1) axis.forEach((v, a) => (axis[a] = v * factor));

    let accel = e === 0 ? s.accelTravel : xyz === 0 ? s.accelRetract : s.accelPrint;
    // Linear advance accel cap (Marlin@2ef3ee6:Marlin/src/module/planner.cpp:2361-2386, planner.h:1155-1159).
    if (e > 0 && xyz > 0 && s.advanceK > 0 && e / xyz <= 3) {
      const maxEJerk = s.jd > 0 ? Math.sqrt(((s.jd * SQRT_HALF) / (1 - SQRT_HALF)) * s.maxAccel[3]!) : s.jerk[3]!;
      accel = Math.min(accel, maxEJerk / (s.advanceK * (e / xyz)));
    }
    delta.forEach((d, a) => {
      const scale = Math.abs(d) * inv;
      if (s.maxAccel[a]! > 0 && accel * scale > s.maxAccel[a]!) accel = s.maxAccel[a]! / scale;
    });

    const unit = delta.map((d) => d * inv);
    let vmax = 0;
    let safe = 0;
    if (s.jd > 0) {
      safe = Math.sqrt(hint.safeExitSqr);
      if (this.hasPrev && this.prevCruise > 1e-4) {
        let cos = -unit.reduce((sum, u, a) => sum + u * this.prevUnit[a]!, 0);
        if (cos <= 0.999999) {
          cos = Math.max(cos, -0.999999);
          const jv = unit.map((u, a) => u - this.prevUnit[a]!);
          const mag = Math.hypot(...jv);
          let ja = accel;
          jv.forEach((v, a) => {
            if (v !== 0 && s.maxAccel[a]! > 0) ja = Math.min(ja, Math.abs(s.maxAccel[a]! / (v / mag)));
          });
          const sin = Math.sqrt(0.5 * (1 - cos));
          let v2: number;
          if (hint.curveRadius > 0) v2 = ja * hint.curveRadius;
          else {
            v2 = (ja * s.jd * sin) / (1 - sin);
            // JD_HANDLE_SMALL_SEGMENTS: short moves with a >135 degree junction (ProcessorImpl.cpp:755-771).
            if (distance < 1 && cos < -0.7071067812) {
              const t = -cos;
              const asinx =
                0.032843707 +
                t *
                  (-1.451838349 +
                    t * (29.66153956 + t * (-131.1123477 + t * (262.8130562 + t * (-242.7199627 + t * 84.31466202)))));
              const theta = Math.PI / 2 - asinx;
              v2 = Math.min(v2, (distance * ja) / theta);
            }
          }
          vmax = Math.sqrt(Math.min(v2, sq(cruise), sq(this.prevCruise)));
        }
      }
    } else {
      // Classic jerk (ProcessorImpl.cpp:778-849).
      safe = cruise;
      axis.forEach((v, a) => {
        if (Math.abs(v) > s.jerk[a]!) safe = Math.min(safe, s.jerk[a]!);
      });
      vmax = safe;
      if (this.hasPrev && this.prevCruise > 1e-4) {
        const prevLarger = this.prevCruise > cruise;
        const smaller = prevLarger ? cruise / this.prevCruise : this.prevCruise / cruise;
        vmax = prevLarger ? cruise : this.prevCruise;
        let vf = 1;
        let limited = false;
        for (let a = 0; a < 4; a++) {
          let vExit = this.prevAxis[a]!;
          let vEntry = axis[a]!;
          if (prevLarger) vExit *= smaller;
          if (limited) {
            vExit *= vf;
            vEntry *= vf;
          }
          const jerk =
            vExit > vEntry
              ? vEntry > 0 || vExit < 0
                ? vExit - vEntry
                : Math.max(vExit, -vEntry)
              : vEntry < 0 || vExit > 0
                ? vEntry - vExit
                : Math.max(-vExit, vEntry);
          if (jerk > s.jerk[a]!) {
            vf *= s.jerk[a]! / jerk;
            limited = true;
          }
        }
        if (limited) vmax *= vf;
        const threshold = vmax * 0.99;
        if (this.prevSafe > threshold && safe > threshold) vmax = safe;
      }
    }

    const vAllow = allowable(accel, safe, distance);
    const b: Block = {
      group: g,
      distance,
      accel,
      cruise,
      entry: Math.min(vmax, vAllow),
      maxEntry: vmax,
      exit: safe,
      safeExit: safe,
      nominalLength: cruise <= vAllow,
      recalc: true,
      fixed: false,
      accelUntil: 0,
      decelAfter: 0,
      cruiseRate: 0,
    };
    trapezoid(b);
    this.hasPrev = true;
    this.prevUnit = unit;
    this.prevCruise = cruise;
    this.prevAxis = axis;
    this.prevSafe = safe;

    g.pending++;
    // The ring holds BLOCK_BUFFER_SIZE - 1 blocks including the busy one (moves_free(),
    // Marlin@2ef3ee6:Marlin/src/module/planner.h:901,917), so blocks[0] stands in for the busy block
    // and 14 follow it. Buddy uses the same depth (its own BLOCK_BUFFER_SIZE is unverified).
    if (this.blocks.length === BLOCK_BUFFER_SIZE - 1) this.retire();
    this.blocks.push(b);
    this.recalculate();
  }

  /** Runs every remaining block and emits the last groups. */
  finish(): void {
    while (this.blocks.length) this.retire();
    this.emit();
  }

  /** Reverse pass, forward pass, trapezoids (PrusaSlicer@30ef591:…/libpgcode/TimeMachine.cpp:40-140). */
  private recalculate(): void {
    const bl = this.blocks;
    for (let i = bl.length - 1; i >= 1; i--) {
      const curr = bl[i - 1]!;
      const next = bl[i]!;
      if (curr.fixed || (curr.entry === curr.maxEntry && !next.recalc)) continue;
      const v = curr.nominalLength
        ? curr.maxEntry
        : Math.min(curr.maxEntry, allowable(curr.accel, next.entry, curr.distance));
      if (curr.entry !== v) {
        curr.entry = v;
        curr.recalc = true;
      }
    }
    for (let i = 0; i + 1 < bl.length; i++) {
      const prev = bl[i]!;
      const curr = bl[i + 1]!;
      if (!prev.nominalLength && prev.entry < curr.entry) {
        const v = allowable(prev.accel, prev.entry, prev.distance);
        if (v < curr.entry) {
          curr.entry = v;
          curr.recalc = true;
        }
      }
    }
    for (let i = 0; i + 1 < bl.length; i++) {
      const curr = bl[i]!;
      const next = bl[i + 1]!;
      if (curr.recalc || next.recalc) {
        curr.exit = next.entry;
        trapezoid(curr);
        curr.recalc = false;
      }
    }
    const last = bl.at(-1)!;
    last.exit = last.safeExit;
    trapezoid(last);
    last.recalc = false;
  }

  /** The oldest block runs: its plan is final, and the next block's entry with it. */
  private retire(): void {
    const b = this.blocks.shift()!;
    b.group.blocks.push(b);
    b.group.pending--;
    const next = this.blocks[0];
    if (next) {
      next.fixed = true;
      next.maxEntry = next.entry;
    }
    this.emit();
  }

  /** Writes the durations of every finished group at the head of the queue, chord by chord. */
  private emit(): void {
    while (this.groups.length && this.groups[0]!.pending === 0) {
      const { chords, blocks } = this.groups.shift()!;
      const total = blocks.reduce((s, b) => s + b.distance, 0);
      const len = chords.reduce((s, c) => s + c, 0);
      let bi = 0;
      let bStart = 0;
      let tBefore = 0;
      let cum = 0;
      const timeAt = (dist: number): [number, number] => {
        while (bi < blocks.length - 1 && dist > bStart + blocks[bi]!.distance) {
          tBefore += at(blocks[bi]!, blocks[bi]!.distance)[0];
          bStart += blocks[bi]!.distance;
          bi++;
        }
        const b = blocks[bi];
        if (!b) return [0, 0];
        const [t, v] = at(b, Math.min(Math.max(dist - bStart, 0), b.distance));
        return [tBefore + t, v];
      };
      let [t0, v0] = timeAt(0);
      // The parser's chords and the firmware's blocks split the arc differently: each chord ends at its
      // arc-length fraction of the blocks' total distance, and takes the block time up to that point.
      chords.forEach((c, k) => {
        cum += c;
        const end = k === chords.length - 1 ? total : len > 0 ? (cum / len) * total : ((k + 1) / chords.length) * total;
        const [t1, v1] = timeAt(end);
        this.out.add(t1 - t0, v0);
        [t0, v0] = [t1, v1];
      });
    }
  }
}

/** The settings in force for the cursor's current move. */
function settings(cur: MoveCursor, r: ResolvedLimits, v: MarlinVariant): Settings {
  const l = r.limits;
  const lim = (key: LimitKey, kind: StateKind, i = 0, fallback?: number) => cur.limit(r, key, kind, i, fallback);
  const per = (kind: StateKind, keys: [LimitKey, LimitKey, LimitKey, LimitKey]) => keys.map((k, i) => lim(k, kind, i));
  // shortcut: state() hides the order of M204 S and P/T, so P/T win when both are set; fine for slicer output.
  const s = cur.state(StateKind.Accel, 0, NaN);
  const clamp = (x: number, max: number) => (v.clampAccel && max > 0 ? Math.min(x, max) : x);
  return {
    feed: cur.state(StateKind.Feedrate, 0, BOOT_FEEDRATE),
    maxFeed: per(StateKind.MaxFeedrate, ['maxFeedrateX', 'maxFeedrateY', 'maxFeedrateZ', 'maxFeedrateE']),
    maxAccel: per(StateKind.MaxAccel, ['maxAccelX', 'maxAccelY', 'maxAccelZ', 'maxAccelE']),
    jerk: per(StateKind.Jerk, ['jerkX', 'jerkY', 'jerkZ', 'jerkE']),
    jd: lim('junctionDeviation', StateKind.JunctionDeviation),
    accelPrint: clamp(lim('accelPrint', StateKind.AccelPrint, 0, Number.isNaN(s) ? l.accelPrint : s), l.accelPrint),
    accelRetract: clamp(lim('accelRetract', StateKind.AccelRetract), l.accelRetract),
    accelTravel: clamp(
      lim('accelTravel', StateKind.AccelTravel, 0, Number.isNaN(s) ? l.accelTravel : s),
      l.accelTravel,
    ),
    minFeed: lim('minFeedrate', StateKind.MinFeedrate),
    minTravel: lim('minTravelFeedrate', StateKind.MinTravelFeedrate),
    advanceK: cur.state(StateKind.PressureAdvance, cur.tool, 0),
  };
}

type Point = [number, number, number, number];

/** Circle centre through three XY points, or undefined when they are collinear. */
function centre(a: Point, b: Point, c: Point): [number, number] | undefined {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-9) return undefined;
  const a2 = sq(a[0]) + sq(a[1]);
  const b2 = sq(b[0]) + sq(b[1]);
  const c2 = sq(c[0]) + sq(c[1]);
  return [
    (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d,
    (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d,
  ];
}

const diff = (a: Point, b: Point) => b.map((x, i) => x - a[i]!);

/**
 * Plans one arc the way the firmware runs it: the parser's chords (`points`, start first, XYZE)
 * are refitted to the circle and re-segmented with the firmware's own segment count, and each
 * firmware segment gets Marlin's hints (G2_G3.cpp:308-391).
 */
function planArc(m: Machine, points: Point[], s: Settings, v: MarlinVariant): void {
  const chords = points.slice(1).map((p, i) => Math.hypot(...diff(points[i]!, p).slice(0, 3)));
  const g = m.group(chords);
  const n = chords.length;
  const p0 = points[0]!;
  const pn = points[n]!;
  const c =
    n >= 2 ? centre(p0, points[Math.floor(n / 3) || 1]!, points[Math.max(Math.floor((2 * n) / 3), 2)]!) : undefined;
  if (!c) {
    for (let i = 0; i < n; i++) m.segment(g, diff(points[i]!, points[i + 1]!), s, NO_HINT);
    return;
  }
  const r = Math.hypot(p0[0] - c[0], p0[1] - c[1]);
  const angle = points
    .slice(1)
    .reduce(
      (sum, p, i) => sum + 2 * Math.asin(Math.min(1, Math.hypot(p[0] - points[i]![0], p[1] - points[i]![1]) / (2 * r))),
      0,
    );
  const p1 = points[1]!;
  const dir = Math.sign((p0[0] - c[0]) * (p1[1] - c[1]) - (p0[1] - c[1]) * (p1[0] - c[0])) || 1;
  const flat = r * angle;
  const segments = v.arcSegments(flat, r, angle, s.feed);
  const limAccel = Math.min(s.maxAccel[0]!, s.maxAccel[1]!);
  const limSpeedSqr = Math.min(sq(Math.min(s.maxFeed[0]!, s.maxFeed[1]!)), limAccel * r, sq(s.feed));
  const a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]);
  let prev = p0;
  for (let i = 1; i <= segments; i++) {
    const f = i / segments;
    const a = a0 + dir * angle * f;
    const p: Point =
      i === segments
        ? pn
        : [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), p0[2] + (pn[2] - p0[2]) * f, p0[3] + (pn[3] - p0[3]) * f];
    const hint: Hint =
      v.hints && i < segments
        ? {
            curveRadius: i > 1 ? r : 0,
            safeExitSqr: Math.min(limSpeedSqr, 2 * limAccel * (flat - (flat / segments) * i)),
          }
        : NO_HINT;
    m.segment(g, diff(prev, p), s, hint);
    prev = p;
  }
}

/** A Marlin-family planner for `variant`. */
export function marlinFamilyPlanner(variant: MarlinVariant): Planner {
  return {
    name: variant.name,
    estimate: false,
    *plan(parsed, limits) {
      const cur = new MoveCursor(parsed);
      const out = new TimingBuilder(parsed);
      const m = new Machine(out);
      const views = parsed.moves.map((b) => new DataView(b));
      let vb = 0;
      let vl = -1;
      let arc: { offset: number; points: Point[]; s: Settings } | undefined;
      const flush = () => {
        if (arc) planArc(m, arc.points, arc.s, variant);
        arc = undefined;
      };
      while (cur.next()) {
        vl++;
        while (vl * MOVE_STRIDE >= views[vb]!.byteLength) {
          vb++;
          vl = 0;
        }
        const offset = views[vb]!.getUint32(vl * MOVE_STRIDE + MoveOffset.fileOffset, true);
        const isArc = (cur.flags & MoveFlag.Arc) !== 0;
        if (arc && !(isArc && arc.offset === offset)) flush();
        const end: Point = [cur.x, cur.y, cur.z, 0];
        if (isArc) {
          if (!arc)
            arc = {
              offset,
              points: [[cur.x - cur.dx, cur.y - cur.dy, cur.z - cur.dz, 0]],
              s: settings(cur, limits, variant),
            };
          end[3] = arc.points.at(-1)![3] + cur.e;
          arc.points.push(end);
        } else
          m.segment(m.group([cur.length]), [cur.dx, cur.dy, cur.dz, cur.e], settings(cur, limits, variant), NO_HINT);
        if (cur.bufferEnd) yield out.count;
      }
      flush();
      m.finish();
      return out.finish(this.name, this.estimate, limits);
    },
  };
}

/** Marlin 2 (bugfix-2.1.x defaults): 16-block lookahead, JD or classic jerk, 1 mm arc segments with planner hints. */
export const marlinPlanner = marlinFamilyPlanner({
  name: 'marlin',
  arcSegments: marlinArcSegments,
  hints: true,
  clampAccel: false,
});

/** Prusa-Firmware-Buddy (MK4, XL, MINI) as PrusaSlicer models it: deviation-based arc segments, M204 clamped to the machine maxima. */
export const buddyPlanner = marlinFamilyPlanner({
  name: 'prusa-buddy',
  arcSegments: buddyArcSegments,
  hints: false,
  clampAccel: true,
});
