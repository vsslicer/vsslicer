// SPDX-License-Identifier: AGPL-3.0-or-later
import { STATE_CHANGE_STRIDE } from '@vsslicer/gcode-api';
import { parse } from '../../src/index.ts';
import type { Summariser } from './golden.ts';
import { pieces } from './run.ts';

/**
 * Golden fields from the real parser: move, state-change and marker counts and the diagnostic
 * codes. Binary files (.bgcode, .gcode.3mf) only carry the byte size and hash until GCP-7 decodes
 * them. GCP-4/7/8 add slicer, layers, roles, labels, thumbnails and summary here.
 */
export const parserSummary: Summariser = async (bytes, file) => {
  if (file.format !== 'gcode') return {};
  let moveCount = 0;
  let stateChanges = 0;
  let markers = 0;
  const diagnostics: string[] = [];
  for await (const c of parse(pieces(bytes, 64 * 1024))) {
    moveCount += c.moveCount;
    stateChanges += c.stateChanges.byteLength / STATE_CHANGE_STRIDE;
    markers += c.markers.length;
    diagnostics.push(...c.diagnostics.map((d) => d.code));
  }
  return { moveCount, stateChanges, markers, diagnostics };
};
