// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Summariser } from './golden.ts';

const THUMBNAIL = /^;\s*(thumbnail begin|THUMBNAIL_BLOCK_START)/i;
// Layer-change marker by slicer convention: PrusaSlicer/Orca `;LAYER_CHANGE`, Bambu Studio and
// Orca's Bambu profiles `; CHANGE_LAYER`, Cura `;LAYER:<n>`.
const LAYER = /^;\s*(LAYER_CHANGE|CHANGE_LAYER)\s*$|^;LAYER:\d+/;
const MOVE = /^G([0-3])(?=[\s;]|$)/;

/**
 * Interim fields, counted with plain line scans and no parser. They exist only so the corpus is
 * pinned today; GCP-3/4/7/8 replace them with move count, layer count, role histogram, labels,
 * thumbnails and summary. Binary files (.bgcode, .gcode.3mf) only get the byte size and hash.
 */
export const interimSummary: Summariser = (bytes, file) => {
  if (file.format !== 'gcode') return { interim: {} };
  const text = new TextDecoder('utf-8').decode(bytes);
  const lines = text.split('\n');
  if (lines.at(-1) === '') lines.pop();
  const moves = [0, 0, 0, 0];
  let layerMarkers = 0;
  let thumbnailBlocks = 0;
  for (const line of lines) {
    const m = MOVE.exec(line);
    if (m) moves[Number(m[1])] = (moves[Number(m[1])] ?? 0) + 1;
    else if (LAYER.test(line)) layerMarkers++;
    else if (THUMBNAIL.test(line)) thumbnailBlocks++;
  }
  return {
    interim: {
      lines: lines.length,
      g0: moves[0],
      g1: moves[1],
      g2: moves[2],
      g3: moves[3],
      layerMarkers,
      thumbnailBlocks,
    },
  };
};
