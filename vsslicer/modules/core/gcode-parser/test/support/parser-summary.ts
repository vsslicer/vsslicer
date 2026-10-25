// SPDX-License-Identifier: AGPL-3.0-or-later
import { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole, STATE_CHANGE_STRIDE } from '@vsslicer/gcode-api';
import type { Chunk } from '@vsslicer/gcode-api';
import { GCodeParser } from '../../src/domain/parser.ts';
import type { Summariser } from './golden.ts';
import { pieces } from './run.ts';

const roleName = new Map<number, string>(Object.entries(MoveRole).map(([name, v]) => [v, name]));
const NOT_EXTRUSION = MoveFlag.Travel | MoveFlag.Retract | MoveFlag.Unretract;

/** Extruding moves per role name (an arc counts as one), in role order. */
export function roleHistogram(chunks: readonly Chunk[]): Record<string, number> {
  const counts = new Map<number, number>();
  for (const c of chunks) {
    const v = new DataView(c.moves);
    for (let i = 0; i < c.moveCount; i++) {
      if ((v.getUint8(i * MOVE_STRIDE + MoveOffset.flags) & NOT_EXTRUSION) !== 0) continue;
      const role = v.getUint8(i * MOVE_STRIDE + MoveOffset.role);
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }
  return Object.fromEntries([...counts].sort((a, b) => a[0] - b[0]).map(([role, n]) => [roleName.get(role), n]));
}

/** Parses `bytes` in 64 KiB pieces; returns the chunks and the parser (for what it detected). */
export async function parseAll(bytes: Uint8Array): Promise<{ chunks: Chunk[]; parser: GCodeParser }> {
  const parser = new GCodeParser();
  const chunks: Chunk[] = [];
  for await (const piece of pieces(bytes, 64 * 1024)) chunks.push(...parser.feed(piece));
  chunks.push(...parser.end());
  return { chunks, parser };
}

/**
 * Golden fields from the real parser: move, state-change and marker counts, the diagnostic codes,
 * the detected slicer and flavour, the layer count and the extruding moves per role. Binary files
 * (.bgcode, .gcode.3mf) only carry the byte size and hash until GCP-7 decodes them. GCP-7/8 add
 * labels, thumbnails and summary here.
 */
export const parserSummary: Summariser = async (bytes, file) => {
  if (file.format !== 'gcode') return {};
  const { chunks, parser } = await parseAll(bytes);
  return {
    slicer: parser.slicer,
    flavour: parser.flavour,
    moveCount: chunks.reduce((n, c) => n + c.moveCount, 0),
    stateChanges: chunks.reduce((n, c) => n + c.stateChanges.byteLength / STATE_CHANGE_STRIDE, 0),
    markers: chunks.reduce((n, c) => n + c.markers.length, 0),
    layerCount: chunks.reduce((n, c) => n + c.layers.length, 0),
    roleHistogram: roleHistogram(chunks),
    diagnostics: chunks.flatMap((c) => c.diagnostics.map((d) => d.code)),
  };
};
