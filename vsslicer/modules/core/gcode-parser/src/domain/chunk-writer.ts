// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  MOVE_STRIDE,
  MoveOffset,
  MoveRole,
  STATE_CHANGE_STRIDE,
  StateChangeOffset,
  StateKind,
} from '@vsslicer/gcode-api';
import type { Chunk, Diagnostic, Layer, Marker, ObjectLabel, Slicer, Thumbnail } from '@vsslicer/gcode-api';

const INITIAL_MOVES = 1024;
const KINDS = 32;

/**
 * Writes moves, the extrusion column, state changes, markers and diagnostics of the chunk being
 * built into gcode-api's buffers. The working buffers are reused: `take` copies the used part into
 * fresh `ArrayBuffer`s (the consumer transfers or drops them) and starts the next chunk, so memory
 * stays bounded by `maxMoves` whatever the file size.
 *
 * State changes are deduplicated here, for every kind alike: a change whose value equals the last
 * one recorded for the same kind and index is not a new row. The "last" values live across chunks,
 * as the modal state does. The initial tool is 0, so a leading `T0` is not a change.
 */
export class ChunkWriter {
  private firstMove = 0;
  private count = 0;
  private moves = new ArrayBuffer(INITIAL_MOVES * MOVE_STRIDE);
  private moveView = new DataView(this.moves);
  private extrusion = new ArrayBuffer(INITIAL_MOVES * 4);
  private extrusionView = new DataView(this.extrusion);
  private changes = new ArrayBuffer(INITIAL_MOVES * STATE_CHANGE_STRIDE);
  private changeView = new DataView(this.changes);
  private changeCount = 0;
  private markers: Marker[] = [];
  private diagnostics: Diagnostic[] = [];
  private layers: Layer[] = [];
  private thumbnails: Thumbnail[] = [];
  private labels = new Map<string, ObjectLabel>();
  private entries = new Map<string, string>();
  /** A layer change was read; the layer joins `layers` with its first move (so the chunk that holds the move lists it). */
  private pending: Layer | null = null;
  /** The layer of this chunk whose z is still the first move's: the first extrusion corrects it. */
  private unsettled: Layer | null = null;
  /** Role written into every move until the next role tag. */
  role: MoveRole = MoveRole.Unknown;
  private readonly last = new Float64Array(KINDS * 256).fill(NaN);

  private readonly maxMoves: number;

  constructor(maxMoves: number) {
    this.maxMoves = maxMoves;
    this.last[StateKind.ToolChange * 256] = 0;
  }

  /** Global index the next move will get. */
  get nextMove(): number {
    return this.firstMove + this.count;
  }
  get full(): boolean {
    return this.count >= this.maxMoves;
  }
  get empty(): boolean {
    return (
      this.count === 0 &&
      this.changeCount === 0 &&
      this.markers.length === 0 &&
      this.diagnostics.length === 0 &&
      this.thumbnails.length === 0 &&
      this.labels.size === 0 &&
      this.entries.size === 0
    );
  }

  writeMove(x: number, y: number, z: number, tool: number, flags: number, fileOffset: number, e: number): void {
    if ((this.count + 1) * MOVE_STRIDE > this.moves.byteLength) this.growMoves();
    const v = this.moveView;
    const o = this.count * MOVE_STRIDE;
    v.setFloat32(o + MoveOffset.position, x, true);
    v.setFloat32(o + MoveOffset.position + 4, y, true);
    v.setFloat32(o + MoveOffset.position + 8, z, true);
    v.setUint32(o + MoveOffset.width, 0, true); // width and height f16 = 0
    v.setUint8(o + MoveOffset.role, this.role);
    v.setUint8(o + MoveOffset.tool, tool);
    v.setUint8(o + MoveOffset.flags, flags);
    v.setUint8(o + MoveOffset.flags + 1, 0);
    v.setUint32(o + MoveOffset.fileOffset, fileOffset, true);
    v.setFloat32(o + MoveOffset.startTime, NaN, true);
    this.extrusionView.setFloat32(this.count * 4, e, true);
    if (this.pending) {
      // no z tag (Cura): the first move's z for now
      if (Number.isNaN(this.pending.z)) {
        this.pending.z = z;
        this.unsettled = this.pending;
      }
      this.layers.push(this.pending);
      this.pending = null;
    } else if (this.unsettled && flags === 0) {
      this.unsettled.z = z; // the first extrusion's z, unless a z-hop came first
      this.unsettled = null;
    }
    this.count++;
  }

  /** A layer starts with the next move. A layer that got no move before this call is dropped. */
  layerChange(): void {
    this.pending = { z: NaN, firstMove: this.nextMove };
    this.unsettled = null;
  }

  /** The z the slicer states for the current layer (`;Z:`, `; Z_HEIGHT:`). */
  layerZ(z: number): void {
    const layer = this.pending ?? this.unsettled;
    if (layer) layer.z = z;
    this.unsettled = null;
  }

  /** Records a state change at the next move unless it repeats the last value of that kind and index. */
  change(kind: StateKind, index: number, value: number): void {
    const slot = kind * 256 + index;
    if (this.last[slot] === value) return;
    this.last[slot] = value;
    if ((this.changeCount + 1) * STATE_CHANGE_STRIDE > this.changes.byteLength) {
      const bigger = new ArrayBuffer(this.changes.byteLength * 2);
      new Uint8Array(bigger).set(new Uint8Array(this.changes));
      this.changes = bigger;
      this.changeView = new DataView(bigger);
    }
    const v = this.changeView;
    const o = this.changeCount * STATE_CHANGE_STRIDE;
    v.setUint32(o + StateChangeOffset.moveIndex, this.nextMove, true);
    v.setFloat32(o + StateChangeOffset.value, value, true);
    v.setUint8(o + StateChangeOffset.kind, kind);
    v.setUint8(o + StateChangeOffset.index, index);
    v.setUint16(o + StateChangeOffset.index + 1, 0, true);
    this.changeCount++;
  }

  marker(name: string, fileOffset: number, seconds?: number): void {
    const m: Marker = { name, fileOffset, moveIndex: this.nextMove };
    if (seconds !== undefined) m.seconds = seconds;
    this.markers.push(m);
  }

  thumbnail(t: Thumbnail): void {
    this.thumbnails.push(t);
  }

  /** The label of this chunk with that identity; created without ranges if new (an object that is only defined). */
  label(l: { name: string; id?: string; copy?: number }): ObjectLabel {
    const key = `${l.name}\0${l.id ?? ''}\0${l.copy ?? ''}`;
    let label = this.labels.get(key);
    if (!label) {
      label = { ...l, ranges: [] };
      this.labels.set(key, label);
    }
    return label;
  }

  /** Moves `[firstMove, endMove)` print the object. */
  range(l: { name: string; id?: string; copy?: number }, firstMove: number, endMove: number): void {
    this.label(l).ranges.push({ firstMove, endMove });
  }

  config(pairs: Iterable<[string, string]>): void {
    for (const [k, v] of pairs) this.entries.set(k, v);
  }

  diagnostic(code: string, severity: Diagnostic['severity'], fileOffset: number, message: string): void {
    this.diagnostics.push({ code, severity, fileOffset, message });
  }

  /** Ends the current chunk and starts the next one at the following move. */
  take(bytesRead: number, slicer: Slicer, flavourName?: string): Chunk {
    const chunk: Chunk = {
      moves: this.moves.slice(0, this.count * MOVE_STRIDE),
      extrusion: this.extrusion.slice(0, this.count * 4),
      stateChanges: this.changes.slice(0, this.changeCount * STATE_CHANGE_STRIDE),
      moveCount: this.count,
      firstMove: this.firstMove,
      layers: this.layers,
      markers: this.markers,
      diagnostics: this.diagnostics,
      bytesRead,
      slicer,
      ...(flavourName !== undefined && { flavourName }),
      thumbnails: this.thumbnails,
      objects: [...this.labels.values()],
      config: Object.fromEntries(this.entries),
    };
    this.firstMove += this.count;
    this.count = 0;
    this.changeCount = 0;
    this.markers = [];
    this.diagnostics = [];
    this.layers = [];
    this.thumbnails = [];
    this.labels = new Map();
    this.entries = new Map();
    this.unsettled = null; // the chunk is gone: its layer objects must not change any more
    return chunk;
  }

  private growMoves(): void {
    const moves = new ArrayBuffer(this.moves.byteLength * 2);
    new Uint8Array(moves).set(new Uint8Array(this.moves));
    this.moves = moves;
    this.moveView = new DataView(moves);
    const extrusion = new ArrayBuffer(this.extrusion.byteLength * 2);
    new Uint8Array(extrusion).set(new Uint8Array(this.extrusion));
    this.extrusion = extrusion;
    this.extrusionView = new DataView(extrusion);
  }
}
