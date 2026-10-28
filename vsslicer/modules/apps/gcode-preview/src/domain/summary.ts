// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Diagnostic, JobSummary, Layer, ParsedFile, Slicer } from '@vsslicer/gcode-api';
import type { Flavour, Timing } from '@vsslicer/gcode-planner';
import type { FileKind } from './file-kind.ts';
import { flagsOf, type Flag } from './flags.ts';
import { clip, panelOf, type PanelModel, type PlateInfo } from './panel.ts';

/** Most diagnostics sent to the webview; `diagnosticCount` has the total. */
export const MAX_DIAGNOSTICS = 10_000;

/** What the webview gets as JSON next to the move buffers (sent one stream per buffer, `moveBuffers[i]` bytes each). */
export interface PreviewSummary {
  kind: FileKind;
  slicer: Slicer;
  moveCount: number;
  /** Byte length of each move buffer, in file order (`ParsedFile.moves`); start times are filled in. */
  moveBuffers: number[];
  layers: Layer[];
  /** Seconds per row of `layers`. */
  layerTimes: number[];
  totalTime: number;
  planner: string;
  estimate: boolean;
  flavour: Flavour;
  flavourAssumed: boolean;
  /** Thumbnails, object labels, slicer estimates and the plate picker. */
  panel: PanelModel;
  diagnostics: Diagnostic[];
  diagnosticCount: number;
  /** What the timing assumes or cannot see. */
  flags: Flag[];
}

export const summarise = (
  kind: FileKind,
  parsed: ParsedFile,
  timing: Timing,
  extra: { job?: JobSummary; plates?: PlateInfo } = {},
): PreviewSummary => ({
  kind,
  slicer: parsed.slicer,
  moveCount: parsed.moveCount,
  moveBuffers: parsed.moves.map((b) => b.byteLength),
  layers: parsed.layers,
  layerTimes: Array.from(timing.layerTimes),
  totalTime: timing.totalTime,
  planner: timing.planner,
  estimate: timing.estimate,
  flavour: timing.limits.flavour,
  flavourAssumed: timing.limits.flavourAssumed,
  panel: panelOf(parsed, extra),
  diagnostics: parsed.diagnostics.slice(0, MAX_DIAGNOSTICS).map((d) => ({ ...d, message: clip(d.message) })),
  diagnosticCount: parsed.diagnostics.length,
  flags: flagsOf(parsed, timing),
});

/** The state the host tells the webview after every handshake. */
export type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; summary: PreviewSummary }
  | { status: 'unsupported'; message: string }
  | { status: 'error'; code: string; message: string };

/** Notification methods between host and webview (the payloads are not inspected by webview-kit). */
export const Method = {
  /** Host to webview: `ViewState`. */
  state: 'gcode-preview/state',
  /** Webview to host: `Received`, once every move buffer of a `ready` state has arrived. */
  received: 'gcode-preview/received',
  /** Webview to host: `Progress`, when the timeline changes state and about four times a second while it plays. */
  progress: 'gcode-preview/progress',
  /** Host to webview: `TimelineCommand` (the integration tests drive the timeline with it). */
  command: 'gcode-preview/command',
  /** Webview to host: no payload; load the file again after a failed load (the error panel's Retry). */
  retry: 'gcode-preview/retry',
  /** Webview to host: `WindowRequest`; the host answers with the packed window on `windowStream`. */
  window: 'gcode-preview/window',
  /** Webview to host: `TextRequest`; the host answers with a `textWindow` notification. */
  text: 'gcode-preview/text',
  /** Host to webview: `TextWindow`. */
  textWindow: 'gcode-preview/text-window',
  /** Webview to host: `PlateRequest`; the host loads that plate of a `.gcode.3mf` and answers with a new state. */
  plate: 'gcode-preview/plate',
} as const;

/** The webview wants the toolhead window over moves `from` to `to` (exclusive), as request number `seq`. */
export interface WindowRequest {
  seq: number;
  from: number;
  to: number;
}

/** The picker chose plate `plate` (one of `PanelModel.plates`). */
export interface PlateRequest {
  plate: number;
}

/** Stream id of the window answering request `seq`. */
export const windowStream = (session: string, seq: number): string => `${session}/window/${seq}`;

/** The request number a `windowStream` id carries, or undefined for any other stream. */
export const windowSeq = (session: string, stream: string): number | undefined => {
  const prefix = `${session}/window/`;
  return stream.startsWith(prefix) ? Number(stream.slice(prefix.length)) : undefined;
};

/** Stream id of move buffer `index` for one webview load. */
export const moveStream = (session: string, index: number): string => `${session}/moves/${index}`;

/** What the webview reports back: per move buffer its byte length and whether it arrived as an ArrayBuffer. */
export interface Received {
  buffers: { byteLength: number; arrayBuffer: boolean }[];
  /** The webview stored its view state with `setState`. */
  stateSaved: boolean;
}

/** Where the timeline stands; `time` is seconds into the print, `move` the global index of the move running. */
export interface Progress {
  time: number;
  move: number;
  playing: boolean;
  speed: number;
  /** The GPU has finished the latest frame. */
  drawn: boolean;
}

export type TimelineCommand =
  | { action: 'play' | 'pause' }
  | { action: 'step'; direction: 1 | -1 }
  | { action: 'speed'; value: number }
  /** Pauses and shows global move `move` (a followed print position). */
  | { action: 'seek'; move: number };
