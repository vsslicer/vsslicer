// SPDX-License-Identifier: AGPL-3.0-or-later
import { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { ResolvedLimits } from './limits.ts';

/**
 * Moves between two checkpoints. Picked by the GCP-23 spike (.reference/notes/GCP-23-checkpoint-spacing.md):
 * recomputing a 1 s scrub window from the nearest checkpoint stays well under a frame.
 */
export const CHECKPOINT_INTERVAL = 4096;

/**
 * Planner state at the start of a move, about every `checkpointInterval` moves, so a consumer can
 * recompute any window's trapezoids from the nearest checkpoint (`trapezoidsFor`) instead of
 * storing speeds per move.
 */
export interface Checkpoint {
  /** Global move index. */
  move: number;
  /** Start time of the move, seconds (f64). */
  time: number;
  /** Toolhead speed entering the move, mm/s. */
  speed: number;
  /**
   * The planner's own snapshot at this move, structured-cloneable, for `trapezoidsFor` to resume
   * from. Absent when the planner cannot resume (its checkpoints then only carry time and speed).
   */
  state?: unknown;
}

/** One move's velocity profile: accelerate from `entry` to `cruise`, decelerate to `exit`. */
export interface Trapezoid {
  /** Global move index. */
  move: number;
  /** Start time, seconds (f64; the move record holds it as f32). */
  start: number;
  /** mm/s. A planner without a profile reports its constant speed for all three. */
  entry: number;
  cruise: number;
  exit: number;
  /** mm/s²; 0 for a constant-speed move. */
  accel: number;
}

/**
 * A planner's result. Start times live in the move records themselves (`MoveOffset.startTime`,
 * f32), written in place; every sum here is f64.
 */
export interface Timing {
  /** Which planner produced it, e.g. `constant-speed`, `klipper`. */
  planner: string;
  /** True when the planner approximates rather than models the firmware's motion. */
  estimate: boolean;
  limits: ResolvedLimits;
  /** Seconds for every move. */
  totalTime: number;
  /** Seconds per row of `ParsedFile.layers`; moves before the first layer are in no row. */
  layerTimes: Float64Array;
  /** Seconds of non-travel moves per `MoveRole` value (index = role). */
  roleTimes: Float64Array;
  /** Seconds of moves flagged `Travel`. `roleTimes` summed plus this is `totalTime`. */
  travelTime: number;
  /**
   * Checkpoints in move order, the first at move 0 and at most one per `checkpointInterval` moves:
   * at each multiple, or for a planner that snapshots its state, at the first move it can resume at.
   */
  checkpoints: Checkpoint[];
  checkpointInterval: number;
}

const ROLE_COUNT = MoveRole.Unknown + 1;

/**
 * The bookkeeping every planner shares: feed it each move's duration in move order and it writes
 * start times into the move buffers, fills the layer and role tables and takes checkpoints.
 */
export class TimingBuilder {
  private readonly views: DataView[];
  private readonly layers: ParsedFile['layers'];
  private readonly interval: number;
  private b = 0;
  private local = 0;
  private move = 0;
  private layer = -1;
  private time = 0;
  private travel = 0;
  private readonly layerTimes: Float64Array;
  private readonly roleTimes = new Float64Array(ROLE_COUNT);
  private readonly checkpoints: Checkpoint[] = [];
  /** Dwell before the first move: joins its duration. */
  private lead = 0;
  /** The last move's role (-1: travel), for a dwell after it. */
  private lastRole = -1;
  /** The planner calls `snapshot`: take checkpoints only there. */
  private resumable = false;
  /** Set by `replay`: record trapezoids for moves `start` to `end` (exclusive) instead of writing records. */
  private window: { start: number; end: number; out: Trapezoid[] } | undefined;

  constructor(parsed: ParsedFile, interval = CHECKPOINT_INTERVAL) {
    this.views = parsed.moves.map((m) => new DataView(m));
    this.layers = parsed.layers;
    this.layerTimes = new Float64Array(parsed.layers.length);
    this.interval = interval;
  }

  /**
   * A builder for `trapezoidsFor`: it starts at `from` (move and time), records the trapezoids of
   * moves `start` to `end` (exclusive), and writes nothing into the move records or the tables.
   */
  static replay(parsed: ParsedFile, from: Checkpoint, start: number, end: number): TimingBuilder {
    const b = new TimingBuilder(parsed);
    b.move = from.move;
    b.time = from.time;
    b.window = { start, end, out: [] };
    return b;
  }

  /** Moves added so far. */
  get count(): number {
    return this.move;
  }

  /** A replay has reached its window's end: the planner should yield so the caller can stop it. */
  get stop(): boolean {
    return this.window !== undefined && this.move >= this.window.end;
  }

  /** The replay's trapezoids so far. */
  get trapezoids(): Trapezoid[] {
    return this.window?.out ?? [];
  }

  /** A snapshotting planner should call `snapshot` now (it is at a point it can resume from). */
  get snapshotDue(): boolean {
    if (this.window) return false;
    const last = this.checkpoints.at(-1);
    return !last || this.move >= (Math.floor(last.move / this.interval) + 1) * this.interval;
  }

  /**
   * Takes a checkpoint at the next move to be added, carrying `state`, the planner's
   * structured-cloneable snapshot taken now. Once a planner calls it, `add` takes no checkpoints of its own.
   */
  snapshot(state: unknown): void {
    this.resumable = true;
    this.checkpoints.push({ move: this.move, time: this.time, speed: NaN, state });
  }

  /**
   * Records the next move: it takes `duration` seconds and enters at `entrySpeed` mm/s, then
   * cruises at `cruise` and leaves at `exit` with `accel` (defaults: a constant-speed move).
   */
  add(duration: number, entrySpeed: number, cruise = entrySpeed, exit = entrySpeed, accel = 0): void {
    duration += this.lead;
    this.lead = 0;
    if (this.window) {
      const { start, end, out } = this.window;
      if (this.move >= start && this.move < end)
        out.push({ move: this.move, start: this.time, entry: entrySpeed, cruise, exit, accel });
      this.time += duration;
      this.move++;
      return;
    }
    while (this.local * MOVE_STRIDE >= this.views[this.b]!.byteLength) {
      this.b++;
      this.local = 0;
    }
    const view = this.views[this.b]!;
    const o = this.local * MOVE_STRIDE;
    const last = this.checkpoints.at(-1);
    if (last?.move === this.move) last.speed = entrySpeed;
    else if (!this.resumable && this.move % this.interval === 0)
      this.checkpoints.push({ move: this.move, time: this.time, speed: entrySpeed });
    view.setFloat32(o + MoveOffset.startTime, this.time, true);
    while (this.layer + 1 < this.layers.length && this.layers[this.layer + 1]!.firstMove <= this.move) this.layer++;
    this.lastRole =
      view.getUint8(o + MoveOffset.flags) & MoveFlag.Travel
        ? -1
        : Math.min(view.getUint8(o + MoveOffset.role), MoveRole.Unknown);
    this.charge(duration);
    this.local++;
    this.move++;
  }

  /** Adds `seconds` at a standstill (a G4 dwell) to the last move's duration; before any move, to the first one's. */
  dwell(seconds: number): void {
    if (this.move === 0) this.lead += seconds;
    else this.charge(seconds);
  }

  private charge(duration: number): void {
    if (this.layer >= 0) this.layerTimes[this.layer]! += duration;
    if (this.lastRole < 0) this.travel += duration;
    else this.roleTimes[this.lastRole]! += duration;
    this.time += duration;
  }

  finish(planner: string, estimate: boolean, limits: ResolvedLimits): Timing {
    if (this.checkpoints.at(-1)?.move === this.move) this.checkpoints.pop(); // a snapshot after the last move
    return {
      planner,
      estimate,
      limits,
      totalTime: this.time,
      layerTimes: this.layerTimes,
      roleTimes: this.roleTimes,
      travelTime: this.travel,
      checkpoints: this.checkpoints,
      checkpointInterval: this.interval,
    };
  }
}
