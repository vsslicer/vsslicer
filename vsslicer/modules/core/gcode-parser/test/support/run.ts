// SPDX-License-Identifier: AGPL-3.0-or-later
import { readMove, readStateChange, STATE_CHANGE_STRIDE, MOVE_STRIDE } from '@vsslicer/gcode-api';
import type { Chunk, Diagnostic, Marker, Move, StateChange } from '@vsslicer/gcode-api';
import { parse } from '../../src/index.ts';
import type { ParseSettings } from '../../src/index.ts';

export const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

/** The bytes in pieces of `size` (the last one shorter), as a stream. */
export async function* pieces(bytes: Uint8Array, size: number): AsyncGenerator<Uint8Array> {
  for (let i = 0; i < bytes.length; i += size) yield bytes.subarray(i, i + size);
}

export interface Result {
  chunks: Chunk[];
  moves: Move[];
  /** Extrusion column, one value per move. */
  e: number[];
  changes: StateChange[];
  markers: Marker[];
  /** Without `no-slicer-tags`, which every untagged snippet gets; see `all` for the full list. */
  diagnostics: Diagnostic[];
  all: Diagnostic[];
}

export async function run(text: string, opts: ParseSettings = {}, pieceSize = 1 << 20): Promise<Result> {
  const r: Result = { chunks: [], moves: [], e: [], changes: [], markers: [], diagnostics: [], all: [] };
  for await (const c of parse(pieces(encode(text), pieceSize), opts)) {
    r.chunks.push(c);
    const mv = new DataView(c.moves);
    for (let i = 0; i < c.moveCount; i++) r.moves.push(readMove(mv, i));
    const ev = new DataView(c.extrusion);
    for (let i = 0; i < c.moveCount; i++) r.e.push(ev.getFloat32(i * 4, true));
    const sv = new DataView(c.stateChanges);
    for (let i = 0; i < c.stateChanges.byteLength / STATE_CHANGE_STRIDE; i++) r.changes.push(readStateChange(sv, i));
    r.markers.push(...c.markers);
    r.all.push(...c.diagnostics);
    r.diagnostics.push(...c.diagnostics.filter((d) => d.code !== 'no-slicer-tags'));
  }
  return r;
}

export const strideOk = (c: Chunk): boolean =>
  c.moves.byteLength === c.moveCount * MOVE_STRIDE && c.extrusion.byteLength === c.moveCount * 4;
