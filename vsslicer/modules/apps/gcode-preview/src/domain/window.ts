// SPDX-License-Identifier: AGPL-3.0-or-later
// A ToolheadWindow as one Float64Array, to cross from the host (which has the planner's checkpoints) to the webview.
import { ToolheadWindow } from '@vsslicer/gcode-planner';

const HEADER = 5; // start, end, startTime, endTime, profiled
/** Doubles per move in the packed window (the planner's row size). */
export const WINDOW_ROW = 17;

/** Bytes per move on the wire: 8 * 17 = 136, plus a 40 byte header per window. */
export const packWindow = (w: ToolheadWindow): ArrayBuffer => {
  // shortcut: reads ToolheadWindow's private `data`; gcode-planner should export/import it, then drop this cast.
  const data = (w as unknown as { data: Float64Array }).data;
  const out = new Float64Array(HEADER + data.length);
  out.set([w.start, w.end, w.startTime, w.endTime, w.profiled ? 1 : 0]);
  out.set(data, HEADER);
  return out.buffer;
};

/** The window `packWindow` made; `positionAt` works on it as on the original. */
export const unpackWindow = (buffer: ArrayBuffer): ToolheadWindow => {
  const f = new Float64Array(buffer);
  const [start, end, startTime, endTime, profiled] = f;
  return Object.assign(Object.create(ToolheadWindow.prototype) as ToolheadWindow, {
    start,
    end,
    startTime,
    endTime,
    profiled: profiled === 1,
    data: f.subarray(HEADER),
  });
};
