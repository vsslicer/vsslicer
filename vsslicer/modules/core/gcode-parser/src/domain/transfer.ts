// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Chunk } from '@vsslicer/gcode-api';

/** The buffers of a chunk (move columns, state changes, thumbnail images), for `postMessage(chunk, transferList(chunk))`: moved, not copied. */
export const transferList = (chunk: Chunk): ArrayBuffer[] => [
  chunk.moves,
  chunk.extrusion,
  chunk.stateChanges,
  ...chunk.thumbnails.map((t) => t.data.buffer).filter((b) => b instanceof ArrayBuffer),
];
