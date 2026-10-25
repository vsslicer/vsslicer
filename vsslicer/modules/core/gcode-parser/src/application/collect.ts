// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Chunk, ObjectLabel, ParsedFile } from '@vsslicer/gcode-api';

/**
 * Gathers a chunk stream into a `ParsedFile`: buffers stay one per chunk (not concatenated), the
 * layer table, markers, diagnostics and thumbnails are joined in file order, the object labels merged by name, id and copy, the config blocks merged. `slicer` is the last chunk's.
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
    thumbnails: [],
    objects: [],
    config: {},
  };
  const labels = new Map<string, ObjectLabel>();
  for await (const c of chunks) {
    file.slicer = c.slicer;
    file.moveCount = c.firstMove + c.moveCount;
    file.moves.push(c.moves);
    file.extrusion.push(c.extrusion);
    file.stateChanges.push(c.stateChanges);
    file.layers.push(...c.layers);
    file.markers.push(...c.markers);
    file.diagnostics.push(...c.diagnostics);
    file.thumbnails.push(...c.thumbnails);
    file.config = Object.fromEntries([...Object.entries(file.config), ...Object.entries(c.config)]); // own keys even for `__proto__`
    for (const o of c.objects) {
      const key = `${o.name}\0${o.id ?? ''}\0${o.copy ?? ''}`;
      const known = labels.get(key);
      if (known) known.ranges.push(...o.ranges);
      else labels.set(key, { ...o, ranges: [...o.ranges] });
    }
  }
  file.objects = [...labels.values()];
  return file;
};
