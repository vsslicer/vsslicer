// SPDX-License-Identifier: AGPL-3.0-or-later
// A ToolheadWindow as one Float64Array, to cross from the host (which has the planner's checkpoints) to the webview.
// The /window entry has no planner code, so the webview bundle stays free of it.
import { ToolheadWindow } from '@vsslicer/gcode-planner/window';

const HEADER = 5; // start, end, startTime, endTime, profiled
/** Doubles per move in the packed window (the planner's row size). */
export const WINDOW_ROW = 17;

/** Bytes per move on the wire: 8 * 17 = 136, plus a 40 byte header per window. */
export const packWindow = (w: ToolheadWindow): ArrayBuffer => {
  const t = w.toTransfer();
  const out = new Float64Array(HEADER + t.data.length);
  out.set([t.start, t.end, t.startTime, t.endTime, t.profiled ? 1 : 0]);
  out.set(t.data, HEADER);
  return out.buffer;
};

/** The window `packWindow` made; `positionAt` works on it as on the original. */
export const unpackWindow = (buffer: ArrayBuffer): ToolheadWindow => {
  const f = new Float64Array(buffer);
  const [start, end, startTime, endTime, profiled] = f as unknown as [number, number, number, number, number];
  return ToolheadWindow.fromTransfer({
    start,
    end,
    startTime,
    endTime,
    profiled: profiled === 1,
    data: f.subarray(HEADER),
  });
};
