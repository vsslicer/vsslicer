// SPDX-License-Identifier: AGPL-3.0-or-later
import { MOVE_STRIDE, MoveOffset, STATE_CHANGE_STRIDE, StateChangeOffset } from '@vsslicer/gcode-api';
import type { MoveRole, ParsedFile, StateKind } from '@vsslicer/gcode-api';
import type { LimitKey, ResolvedLimits } from './limits.ts';

/** `MoveCursor.save`'s snapshot. */
export interface CursorState {
  index: number;
  x: number;
  y: number;
  z: number;
  b: number;
  local: number;
  sb: number;
  si: number;
  values: [number, number][];
}

/**
 * Walks a parsed file's moves in order across its chunk buffers, carrying the start position over
 * buffer boundaries and folding the state-change table so `state()` is the value in force for the
 * current move. Move 0 starts at the origin (the file does not say where the machine was).
 */
export class MoveCursor {
  /** Global index of the current move; -1 before the first `next()`. */
  index = -1;
  /** End point of the current move, mm. */
  x = 0;
  y = 0;
  z = 0;
  /** Delta from the start point to the end point, mm. */
  dx = 0;
  dy = 0;
  dz = 0;
  /** Filament fed by the current move, mm (negative: retract). */
  e = 0;
  flags = 0;
  role = 0 as MoveRole;
  tool = 0;
  /** The current move is its buffer's last: a good point for a planner to yield. */
  bufferEnd = false;

  private readonly parsed: ParsedFile;
  private b = 0;
  private local = -1;
  private view: DataView | undefined;
  private ext: DataView | undefined;
  private sb = 0;
  private si = 0;
  private table: DataView | undefined;
  private readonly values = new Map<number, number>();

  constructor(parsed: ParsedFile) {
    this.parsed = parsed;
  }

  /** XYZ length of the current move, mm. */
  get length(): number {
    return Math.hypot(this.dx, this.dy, this.dz);
  }

  /** The value of `kind` (for `index`) in force for the current move, or `fallback` if none was set yet. */
  state(kind: StateKind, index = 0, fallback = NaN): number {
    return this.values.get(kind * 256 + index) ?? fallback;
  }

  /**
   * The limit `key` in force for the current move, by the rule in planner.ts: a user override beats
   * the file's own command (`kind`, `index`), which beats the config block and the flavour default.
   * `fallback` is used before the file sets `kind`; it defaults to the resolved value.
   */
  limit(r: ResolvedLimits, key: LimitKey, kind: StateKind, index = 0, fallback = r.limits[key]): number {
    return r.sources[key] === 'override' ? r.limits[key] : this.state(kind, index, fallback);
  }

  /** The walk's position, structured-cloneable, for a planner's checkpoint snapshot. */
  save(): CursorState {
    const { index, x, y, z, b, local, sb, si } = this;
    return { index, x, y, z, b, local, sb, si, values: [...this.values] };
  }

  /** Puts the walk back where `save` was called (on a cursor over the same file). */
  restore(s: CursorState): void {
    const { values, ...at } = s;
    Object.assign(this, at);
    this.view = s.local < 0 ? undefined : new DataView(this.parsed.moves[s.b]!);
    this.ext = s.local < 0 ? undefined : new DataView(this.parsed.extrusion[s.b]!);
    this.table = undefined;
    this.values.clear();
    for (const [k, v] of values) this.values.set(k, v);
  }

  /** Steps to the next move; false at the end. */
  next(): boolean {
    if (this.index + 1 >= this.parsed.moveCount) return false;
    this.local++;
    while (!this.view || this.local * MOVE_STRIDE >= this.view.byteLength) {
      if (this.view) this.b++;
      this.view = new DataView(this.parsed.moves[this.b]!);
      this.ext = new DataView(this.parsed.extrusion[this.b]!);
      this.local = 0;
    }
    this.index++;
    const v = this.view;
    const o = this.local * MOVE_STRIDE;
    const x = v.getFloat32(o, true);
    const y = v.getFloat32(o + 4, true);
    const z = v.getFloat32(o + 8, true);
    this.dx = x - this.x;
    this.dy = y - this.y;
    this.dz = z - this.z;
    this.x = x;
    this.y = y;
    this.z = z;
    this.e = this.ext!.getFloat32(this.local * 4, true);
    this.flags = v.getUint8(o + MoveOffset.flags);
    this.role = v.getUint8(o + MoveOffset.role) as MoveRole;
    this.tool = v.getUint8(o + MoveOffset.tool);
    this.bufferEnd = (this.local + 1) * MOVE_STRIDE >= v.byteLength;
    this.fold();
    return true;
  }

  private fold(): void {
    const tables = this.parsed.stateChanges;
    while (this.sb < tables.length) {
      const t = (this.table ??= new DataView(tables[this.sb]!));
      if (this.si * STATE_CHANGE_STRIDE >= t.byteLength) {
        this.sb++;
        this.si = 0;
        this.table = undefined;
      } else {
        const o = this.si * STATE_CHANGE_STRIDE;
        if (t.getUint32(o + StateChangeOffset.moveIndex, true) > this.index) return;
        const key = t.getUint8(o + StateChangeOffset.kind) * 256 + t.getUint8(o + StateChangeOffset.index);
        this.values.set(key, t.getFloat32(o + StateChangeOffset.value, true));
        this.si++;
      }
    }
  }
}
