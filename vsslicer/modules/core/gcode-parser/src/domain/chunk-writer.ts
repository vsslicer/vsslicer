// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  MOVE_STRIDE,
  MoveOffset,
  MoveRole,
  STATE_CHANGE_STRIDE,
  StateChangeOffset,
  StateKind,
} from '@vsslicer/gcode-api';
import type { Chunk, Diagnostic, Marker, Slicer } from '@vsslicer/gcode-api';

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
    return this.count === 0 && this.changeCount === 0 && this.markers.length === 0 && this.diagnostics.length === 0;
  }

  writeMove(x: number, y: number, z: number, tool: number, flags: number, fileOffset: number, e: number): void {
    if ((this.count + 1) * MOVE_STRIDE > this.moves.byteLength) this.growMoves();
    const v = this.moveView;
    const o = this.count * MOVE_STRIDE;
    v.setFloat32(o + MoveOffset.position, x, true);
    v.setFloat32(o + MoveOffset.position + 4, y, true);
    v.setFloat32(o + MoveOffset.position + 8, z, true);
    v.setUint32(o + MoveOffset.width, 0, true); // width and height f16 = 0
    v.setUint8(o + MoveOffset.role, MoveRole.Unknown);
    v.setUint8(o + MoveOffset.tool, tool);
    v.setUint8(o + MoveOffset.flags, flags);
    v.setUint8(o + MoveOffset.flags + 1, 0);
    v.setUint32(o + MoveOffset.fileOffset, fileOffset, true);
    v.setFloat32(o + MoveOffset.startTime, NaN, true);
    this.extrusionView.setFloat32(this.count * 4, e, true);
    this.count++;
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

  marker(name: string, fileOffset: number): void {
    this.markers.push({ name, fileOffset, moveIndex: this.nextMove });
  }

  diagnostic(code: string, severity: Diagnostic['severity'], fileOffset: number, message: string): void {
    this.diagnostics.push({ code, severity, fileOffset, message });
  }

  /** Ends the current chunk and starts the next one at the following move. */
  take(bytesRead: number, slicer: Slicer): Chunk {
    const chunk: Chunk = {
      moves: this.moves.slice(0, this.count * MOVE_STRIDE),
      extrusion: this.extrusion.slice(0, this.count * 4),
      stateChanges: this.changes.slice(0, this.changeCount * STATE_CHANGE_STRIDE),
      moveCount: this.count,
      firstMove: this.firstMove,
      layers: [],
      markers: this.markers,
      diagnostics: this.diagnostics,
      bytesRead,
      slicer,
    };
    this.firstMove += this.count;
    this.count = 0;
    this.changeCount = 0;
    this.markers = [];
    this.diagnostics = [];
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
