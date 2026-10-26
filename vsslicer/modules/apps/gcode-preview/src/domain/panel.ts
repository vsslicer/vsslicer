// SPDX-License-Identifier: AGPL-3.0-or-later
// The side panel's data: what the webview shows next to the view, bounded because a .gcode.3mf (its plate
// list, labels, strings and thumbnails) is untrusted input. Pure: no I/O, no DOM.
import type { JobSummary, ObjectLabel, ParsedFile, Thumbnail } from '@vsslicer/gcode-api';
import type { PlateStatistics } from '@vsslicer/gcode-parser/gcode-3mf';

/** Most plates offered in the picker; `plateCount` has the total. */
export const MAX_PLATES = 256;
/** Most object labels listed; `labelCount` has the total. */
export const MAX_LABELS = 10_000;
/** A thumbnail is shown only when it is at most this many bytes. */
export const MAX_THUMBNAIL_BYTES = 4 * 1024 * 1024;
/** Most thumbnails shown (not in the card: a file can embed many, each up to 4 MiB). */
export const MAX_THUMBNAILS = 16;
/** Longest label or summary string, in UTF-16 units. */
export const MAX_TEXT = 256;
/** Most summary lines (filaments) shown. */
export const MAX_LINES = 64;
/** Most move ranges kept per label for the hover highlight (an object has one range per layer). */
export const MAX_RANGES_PER_LABEL = 4096;

/** `s` cut to `MAX_TEXT` characters, without leaving half a surrogate pair at the end. */
export const clip = (s: string): string => {
  if (s.length <= MAX_TEXT) return s;
  const end = /[\ud800-\udbff]/.test(s[MAX_TEXT - 1]!) ? MAX_TEXT - 1 : MAX_TEXT;
  return s.slice(0, end);
};

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const isPng = (b: Uint8Array): boolean => b.length >= PNG.length && PNG.every((x, i) => b[i] === x);
/** True for a PNG of at most `MAX_THUMBNAIL_BYTES`: the only image the panel shows. */
export const usableThumbnail = (b: Uint8Array): boolean => b.byteLength <= MAX_THUMBNAIL_BYTES && isPng(b);

export interface PanelThumbnail {
  width: number;
  height: number;
  /** A PNG file of at most `MAX_THUMBNAIL_BYTES`. */
  data: Uint8Array;
}

export interface PanelLabel {
  /** Clipped name, with the instance as `#copy` when there is one. */
  text: string;
  /** Global move ranges `[first, end)` of the object, for the highlight. */
  ranges: [number, number][];
}

export interface PanelEstimate {
  label: string;
  seconds: number;
}

export interface PanelModel {
  thumbnails: PanelThumbnail[];
  labels: PanelLabel[];
  labelCount: number;
  /** Plate numbers of a `.gcode.3mf` (empty for any other file). */
  plates: number[];
  plateCount: number;
  /** The plate shown. */
  plate?: number;
  /** The slicer's own time estimates, to put next to ours. */
  slicerEstimates: PanelEstimate[];
  /** Filament usage and the like, one clipped line each. */
  lines: string[];
}

/** What a `.gcode.3mf` adds to the panel: its plates and the shown plate's `slice_info.config` and image. */
export interface PlateInfo {
  numbers: number[];
  plate: number;
  statistics?: PlateStatistics;
  thumbnail?: Uint8Array;
}

const validTime = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;

const thumbnails = (embedded: Thumbnail[], plate?: Uint8Array): PanelThumbnail[] => {
  const out: PanelThumbnail[] = [];
  const add = (width: number, height: number, data: Uint8Array) => {
    if (out.length < MAX_THUMBNAILS && usableThumbnail(data)) out.push({ width, height, data });
  };
  if (plate) add(0, 0, plate);
  for (const t of embedded) if (t.format === 'png') add(t.width, t.height, t.data);
  return out;
};

const label = (o: ObjectLabel): PanelLabel => ({
  text: clip(o.copy === undefined ? o.name : `${o.name} #${o.copy}`),
  ranges: o.ranges.slice(0, MAX_RANGES_PER_LABEL).map((r) => [r.firstMove, r.endMove]),
});

const num = (n: number, digits: number): string => (Number.isFinite(n) ? n.toFixed(digits) : '?');

const estimates = (job?: JobSummary, stats?: PlateStatistics): PanelEstimate[] => {
  const e = job?.estimateSeconds;
  const named: [string, number | undefined][] = [
    ['normal', e?.normal],
    ['silent', e?.silent],
    ['model', e?.model],
    ['total', e?.total],
    ['plate', stats?.predictionSeconds],
  ];
  return named.flatMap(([l, s]) => (validTime(s) ? [{ label: l, seconds: s }] : []));
};

const usage = (job?: JobSummary, stats?: PlateStatistics): string[] => {
  const lines: string[] = [];
  job?.extruders.forEach((x, i) => {
    const parts = [
      x.lengthMm === undefined ? '' : `${num(x.lengthMm / 1000, 2)} m`,
      x.weightG === undefined ? '' : `${num(x.weightG, 1)} g`,
    ].filter(Boolean);
    if (parts.length) lines.push(`Extruder ${i + 1}: ${parts.join(', ')}`);
  });
  for (const f of stats?.filaments ?? [])
    lines.push(`Filament ${f.id} ${f.type}: ${num(f.usedMetres, 2)} m, ${num(f.usedGrams, 1)} g`);
  if (stats?.weightGrams !== undefined) lines.push(`Weight ${num(stats.weightGrams, 1)} g`);
  return lines.slice(0, MAX_LINES).map(clip);
};

export const panelOf = (
  parsed: Pick<ParsedFile, 'thumbnails' | 'objects'>,
  extra: { job?: JobSummary; plates?: PlateInfo } = {},
): PanelModel => {
  const { job, plates } = extra;
  const fromStats = plates?.statistics?.objects ?? [];
  const labels =
    parsed.objects.length > 0
      ? parsed.objects.slice(0, MAX_LABELS).map(label)
      : fromStats.slice(0, MAX_LABELS).map((name) => ({ text: clip(name), ranges: [] }));
  return {
    thumbnails: thumbnails(parsed.thumbnails, plates?.thumbnail),
    labels,
    labelCount: parsed.objects.length > 0 ? parsed.objects.length : fromStats.length,
    plates: plates?.numbers.slice(0, MAX_PLATES) ?? [],
    plateCount: plates?.numbers.length ?? 0,
    plate: plates?.plate,
    slicerEstimates: estimates(job, plates?.statistics),
    lines: usage(job, plates?.statistics),
  };
};

type Span = [number, number];

/**
 * Splits the visible moves `[first, first + count)` into the parts inside `ranges` (`hit`) and the rest.
 * Ranges may overlap or arrive unsorted; both outputs are ascending, non-overlapping and non-empty.
 */
export const splitRange = (visible: { first: number; count: number }, ranges: readonly Span[]) => {
  const lo = visible.first;
  const hi = visible.first + visible.count;
  const hit: Span[] = [];
  for (const [a, b] of [...ranges].sort((x, y) => x[0] - y[0])) {
    const s = Math.max(a, lo);
    const e = Math.min(b, hi);
    if (s >= e) continue;
    const last = hit.at(-1);
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else hit.push([s, e]);
  }
  const rest: Span[] = [];
  let at = lo;
  for (const [s, e] of hit) {
    if (s > at) rest.push([at, s]);
    at = e;
  }
  if (at < hi) rest.push([at, hi]);
  return { hit, rest };
};
