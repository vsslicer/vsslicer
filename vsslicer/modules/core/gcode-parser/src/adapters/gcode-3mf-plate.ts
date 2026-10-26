// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { openZip } from '@vsslicer/3mf';
import type { Diagnostic } from '@vsslicer/gcode-api';

export interface PlateFilament {
  id: number;
  type: string;
  color: string;
  usedMetres: number;
  usedGrams: number;
}

/** One `<plate>` of `Metadata/slice_info.config` (BBL format, Bambu Studio and Orca). */
export interface PlateStatistics {
  index: number;
  /** Predicted print time in seconds (`prediction`). */
  predictionSeconds?: number;
  weightGrams?: number;
  printerModelId?: string;
  nozzleDiameters: number[];
  filaments: PlateFilament[];
  objects: string[];
  /** Every `<metadata key value>` pair, verbatim. */
  metadata: Record<string, string>;
}

export interface Gcode3mfPlate {
  plate: number;
  entry: string;
  /** `X-BBL-Client-Version` of `slice_info.config`: the Bambu Studio / Orca version that sliced it. */
  slicerVersion?: string;
  statistics?: PlateStatistics;
  /** `Metadata/plate_N.png` (PNG bytes). */
  thumbnail?: Uint8Array;
  /** Empty when the MD5 matches or there is no `.md5` entry. */
  diagnostics: Diagnostic[];
}

/** `slice_info.config` above this is not parsed (a diagnostic is added instead). */
const MAX_SLICE_INFO_BYTES = 4 * 1024 * 1024;

const unescape = (s: string): string =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

const isNameChar = (c: string): boolean => /[\w:.-]/.test(c);

interface Tag {
  /** Element name, `/name` for a closing tag. */
  name: string;
  attrs: Record<string, string>;
}

/**
 * One linear pass over the tags of `xml`: each character is visited a constant number of times, so
 * hostile input (unclosed tags or quotes) cannot make it quadratic. An unterminated tag ends the scan.
 * shortcut: no CDATA, and comments are only skipped when they hold no `>` inside a quote; use saxes if a
 * slicer starts emitting richer XML.
 */
function* tags(xml: string): Generator<Tag> {
  for (let i = xml.indexOf('<'); i >= 0; i = xml.indexOf('<', i)) {
    let j = i + 1;
    if (xml[j] === '/') j++;
    while (j < xml.length && isNameChar(xml[j]!)) j++;
    const name = xml.slice(i + 1, j);
    const attrs: Record<string, string> = {};
    let key = '';
    let eq = false;
    for (;;) {
      if (j >= xml.length) return;
      const c = xml[j]!;
      if (c === '>') break;
      if (c === '"' || c === "'") {
        const end = xml.indexOf(c, j + 1);
        if (end < 0) return;
        if (key && eq) attrs[key] = unescape(xml.slice(j + 1, end));
        key = '';
        eq = false;
        j = end + 1;
      } else if (c === '=') {
        eq = key !== '';
        j++;
      } else if (isNameChar(c)) {
        const start = j;
        while (j < xml.length && isNameChar(xml[j]!)) j++;
        key = xml.slice(start, j);
        eq = false;
      } else j++;
    }
    yield { name, attrs };
    i = j + 1;
  }
}

/** Reads the flat BBL `slice_info.config`: header items, then `<plate>`s holding the rest. */
function readSliceInfo(xml: string): { version?: string; plates: PlateStatistics[] } {
  const header: Record<string, string> = {};
  const plates: PlateStatistics[] = [];
  let plate: { metadata: Record<string, string>; filaments: PlateFilament[]; objects: string[] } | undefined;
  for (const { name, attrs: a } of tags(xml)) {
    if (name === 'header_item') {
      if (a.key) header[a.key] = a.value ?? '';
    } else if (name === 'plate') {
      // A <plate> inside an open one is ignored: its children join the open plate.
      plate ??= { metadata: {}, filaments: [], objects: [] };
    } else if (!plate) {
      continue;
    } else if (name === 'metadata') {
      if (a.key) plate.metadata[a.key] = a.value ?? '';
    } else if (name === 'filament') {
      plate.filaments.push({
        id: Number(a.id),
        type: a.type ?? '',
        color: a.color ?? '',
        usedMetres: Number(a.used_m),
        usedGrams: Number(a.used_g),
      });
    } else if (name === 'object') {
      plate.objects.push(a.name ?? '');
    } else if (name === '/plate') {
      const { metadata, filaments, objects } = plate;
      plate = undefined;
      const num = (k: string): number | undefined => {
        const n = Number(metadata[k]);
        return metadata[k] !== undefined && metadata[k] !== '' && Number.isFinite(n) ? n : undefined;
      };
      plates.push({
        index: num('index') ?? plates.length + 1,
        predictionSeconds: num('prediction'),
        weightGrams: num('weight'),
        printerModelId: metadata.printer_model_id,
        nozzleDiameters: (metadata.nozzle_diameters ?? '')
          .split(',')
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0),
        filaments,
        objects,
        metadata,
      });
    }
  }
  return { version: header['X-BBL-Client-Version'], plates };
}

/** Plate numbers that have a `Metadata/plate_N.gcode`, ascending. */
export function gcode3mfPlates(archive: Uint8Array): number[] {
  return openZip(archive)
    .entries.map((e) => /^Metadata\/plate_(\d+)\.gcode$/.exec(e.name)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Statistics, thumbnail and MD5 check of plate `n`. Throws if the plate's G-code entry is absent.
 * A missing `slice_info.config`, `.png` or `.md5` leaves that field undefined; an MD5 mismatch adds a
 * `gcode-3mf-md5` error diagnostic (the G-code can still be parsed). The MD5 hashes the inflated entry,
 * so the whole plate is inflated once here and again by `gcode3mfSource` (see its memory shortcut).
 */
export function readGcode3mfPlate(
  archive: Uint8Array,
  n: number,
  opts: { maxEntryBytes?: number } = {},
): Gcode3mfPlate {
  const zip = openZip(archive, opts);
  const names = new Set(zip.entries.map((e) => e.name));
  const entry = `Metadata/plate_${n}.gcode`;
  if (!names.has(entry)) throw new Error(`no ${entry} in the archive`);
  const diagnostics: Diagnostic[] = [];
  const text = (name: string): string | undefined =>
    names.has(name) ? new TextDecoder().decode(zip.inflated(name)) : undefined;

  const info = text('Metadata/slice_info.config');
  if (info !== undefined && info.length > MAX_SLICE_INFO_BYTES) {
    diagnostics.push({
      code: 'gcode-3mf-slice-info-size',
      severity: 'error',
      fileOffset: 0,
      message: `Metadata/slice_info.config is ${info.length} bytes, over the ${MAX_SLICE_INFO_BYTES} limit: statistics skipped`,
    });
  }
  const parsed = info === undefined || info.length > MAX_SLICE_INFO_BYTES ? undefined : readSliceInfo(info);
  const md5 = text(`${entry}.md5`)?.trim().toLowerCase();
  if (md5 !== undefined) {
    const actual = createHash('md5').update(zip.inflated(entry)).digest('hex');
    if (actual !== md5) {
      diagnostics.push({
        code: 'gcode-3mf-md5',
        severity: 'error',
        fileOffset: 0,
        message: `${entry} MD5 is ${actual}, but ${entry}.md5 says ${md5}: the G-code was changed or damaged after slicing`,
      });
    }
  }
  const png = `Metadata/plate_${n}.png`;
  return {
    plate: n,
    entry,
    slicerVersion: parsed?.version,
    statistics: parsed?.plates.find((p) => p.index === n),
    thumbnail: names.has(png) ? zip.inflated(png) : undefined,
    diagnostics,
  };
}
