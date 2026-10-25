// SPDX-License-Identifier: AGPL-3.0-or-later
import { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { ResolvedLimits } from './limits.ts';

/** Moves between two checkpoints. shortcut: a fixed guess; GCP-23 measures and picks the spacing. */
export const CHECKPOINT_INTERVAL = 4096;

/**
 * Planner state at the start of a move, every `checkpointInterval` moves, so a consumer can
 * recompute any window's trapezoids from the nearest checkpoint instead of storing speeds per move.
 * Modal state (feedrate, accel, limits) is not stored: fold the state-change table up to `move`.
 */
export interface Checkpoint {
  /** Global move index. */
  move: number;
  /** Start time of the move, seconds (f64). */
  time: number;
  /** Toolhead speed entering the move, mm/s. */
  speed: number;
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
  /** Checkpoints at moves 0, interval, 2 * interval, ... */
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

  constructor(parsed: ParsedFile, interval = CHECKPOINT_INTERVAL) {
    this.views = parsed.moves.map((m) => new DataView(m));
    this.layers = parsed.layers;
    this.layerTimes = new Float64Array(parsed.layers.length);
    this.interval = interval;
  }

  /** Moves added so far. */
  get count(): number {
    return this.move;
  }

  /** Records the next move: it takes `duration` seconds and enters at `entrySpeed` mm/s. */
  add(duration: number, entrySpeed: number): void {
    while (this.local * MOVE_STRIDE >= this.views[this.b]!.byteLength) {
      this.b++;
      this.local = 0;
    }
    const view = this.views[this.b]!;
    const o = this.local * MOVE_STRIDE;
    if (this.move % this.interval === 0) this.checkpoints.push({ move: this.move, time: this.time, speed: entrySpeed });
    view.setFloat32(o + MoveOffset.startTime, this.time, true);
    while (this.layer + 1 < this.layers.length && this.layers[this.layer + 1]!.firstMove <= this.move) this.layer++;
    if (this.layer >= 0) this.layerTimes[this.layer]! += duration;
    if (view.getUint8(o + MoveOffset.flags) & MoveFlag.Travel) this.travel += duration;
    else this.roleTimes[Math.min(view.getUint8(o + MoveOffset.role), MoveRole.Unknown)]! += duration;
    this.time += duration;
    this.local++;
    this.move++;
  }

  finish(planner: string, estimate: boolean, limits: ResolvedLimits): Timing {
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
