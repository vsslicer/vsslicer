// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Chunk, ParsedFile } from '@vsslicer/gcode-api';

/**
 * Gathers a chunk stream into a `ParsedFile`: buffers stay one per chunk (not concatenated), the
 * layer table, markers and diagnostics are joined in file order. `slicer` is the last chunk's.
 */
export const collect = async (chunks: AsyncIterable<Chunk>): Promise<ParsedFile> => {
  const file: ParsedFile = {
    slicer: 'unknown',
    moveCount: 0,
    moves: [],
    extrusion: [],
    stateChanges: [],
    layers: [],
    markers: [],
    diagnostics: [],
  };
  for await (const c of chunks) {
    file.slicer = c.slicer;
    file.moveCount = c.firstMove + c.moveCount;
    file.moves.push(c.moves);
    file.extrusion.push(c.extrusion);
    file.stateChanges.push(c.stateChanges);
    file.layers.push(...c.layers);
    file.markers.push(...c.markers);
    file.diagnostics.push(...c.diagnostics);
  }
  return file;
};
