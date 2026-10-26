// SPDX-License-Identifier: AGPL-3.0-or-later
import { SaxesParser } from 'saxes';
import type { Package } from '../../domain/package.ts';
import type {
  CustomGcode,
  CutConnector,
  CutInfo,
  LayerHeightProfile,
  LayerRange,
  PlateCustomGcodes,
} from '../../domain/project/project.ts';
import { MAX_XML_DEPTH } from '../opc/xml.ts';

/*
 * Ported from OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp: part names :235, :240, :244, :250 and the
 * case-insensitive dispatch :2015-2022, :2062, :2083; custom_gcode_per_layer.xml :3414-3480 (plates by `plate_info`,
 * a file without `plate` is plate 1, the pre-2.2 `gcode` attribute when `type` is absent); layer_config_ranges.xml
 * :3053-3098; layer_heights_profile.txt :2991-3050 (`object_id=N|z;h;...`, an even count above 4); cut_information.xml
 * :2718-2775. Checked against BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp.
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0; the file carries no per-file notice).
 */
export const CUSTOM_GCODE_PART = 'Metadata/custom_gcode_per_layer.xml';
export const LAYER_RANGES_PART = 'Metadata/layer_config_ranges.xml';
export const LAYER_HEIGHTS_PART = 'Metadata/layer_heights_profile.txt';
export const CUT_PART = 'Metadata/cut_information.xml';

/** Rule 25: a part larger than this is not read (real ones are ~100 KB). */
export const MAX_LAYER_PART_BYTES = 16 * 1024 * 1024;
/** Rule 25: entries (layers, ranges, options, connectors, profile values) read per part. */
export const MAX_LAYER_ENTRIES = 200_000;
const MAX_NOTICES = 20;

export interface LayerData {
  customGcodes: PlateCustomGcodes[];
  layerRanges: LayerRange[];
  layerHeightProfiles: LayerHeightProfile[];
  cuts: CutInfo[];
  notices: string[];
}

export type Attrs = Record<string, string>;
export interface Handlers {
  open(name: string, attrs: Attrs): void;
  text(text: string): void;
  close(name: string): void;
}

/** Plain SAX walk: throws on malformed XML, nesting over the depth cap or `MAX_LAYER_ENTRIES` elements. */
export function walk(bytes: Uint8Array, h: Handlers): void {
  const parser = new SaxesParser();
  let depth = 0;
  let elements = 0;
  parser.on('opentag', (tag) => {
    if (++depth > MAX_XML_DEPTH) throw new Error(`elements nested deeper than ${MAX_XML_DEPTH}`);
    if (++elements > MAX_LAYER_ENTRIES) throw new Error(`more than ${MAX_LAYER_ENTRIES} elements`);
    h.open(tag.name, tag.attributes);
  });
  parser.on('text', (t) => h.text(t));
  parser.on('closetag', (tag) => {
    depth--;
    h.close(tag.name);
  });
  parser.write(new TextDecoder().decode(bytes)).close();
}

const num = (v: string | undefined, what: string): number => {
  if (v === undefined || v.trim() === '' || !Number.isFinite(Number(v))) throw new Error(`${what} is not a number`);
  return Number(v);
};
const int = (v: string | undefined, what: string): number => {
  const n = num(v, what);
  if (!Number.isInteger(n)) throw new Error(`${what} is not an integer`);
  return n;
};
const rest = (attrs: Attrs, known: readonly string[]): Map<string, string> =>
  new Map(Object.entries(attrs).filter(([k]) => !known.includes(k)));

const LEGACY_TYPE = new Map([
  ['M600', 0],
  ['M601', 1],
  ['tool_change', 2],
]);

function readCustomGcodes(bytes: Uint8Array): PlateCustomGcodes[] {
  const plates: PlateCustomGcodes[] = [];
  // Layers outside any <plate> belong to plate 1 when no <plate> exists at all (:3465-3471).
  const loose: { items: CustomGcode[]; mode?: string } = { items: [] };
  let plate: { id?: number; items: CustomGcode[]; mode?: string } | undefined;
  let sawPlate = false;
  walk(bytes, {
    open(name, a) {
      if (name === 'plate') {
        sawPlate = true;
        plate = { items: [] };
      } else if (name === 'plate_info' && plate) plate.id = int(a['id'], 'plate_info id');
      else if (name === 'mode') (plate ?? loose).mode = a['value'] ?? '';
      else if (name === 'layer') {
        const color = a['color'] ?? '';
        let type: number, extra: string;
        if (a['type'] === undefined) {
          const gcode = a['gcode'] ?? '';
          type = LEGACY_TYPE.get(gcode) ?? 4;
          extra = type === 1 ? color : type === 4 ? gcode : '';
        } else {
          type = int(a['type'], 'layer type');
          extra = a['extra'] ?? '';
        }
        (plate ?? loose).items.push({
          printZ: num(a['top_z'], 'layer top_z'),
          type,
          extruder: int(a['extruder'], 'layer extruder'),
          color,
          extra,
          attributes: rest(a, ['top_z', 'type', 'extruder', 'color', 'extra']),
        });
      }
    },
    text() {},
    close(name) {
      if (name !== 'plate' || !plate) return;
      // A plate without plate_info is skipped (:3459).
      if (plate.id !== undefined)
        plates.push({ plateId: plate.id, ...(plate.mode !== undefined && { mode: plate.mode }), items: plate.items });
      plate = undefined;
    },
  });
  if (!sawPlate && (loose.items.length > 0 || loose.mode !== undefined))
    plates.push({ plateId: 1, ...(loose.mode !== undefined && { mode: loose.mode }), items: loose.items });
  return plates;
}

function readLayerRanges(bytes: Uint8Array, notices: string[]): LayerRange[] {
  const out = new Map<number, Map<string, LayerRange & { options: Map<string, string> }>>();
  let objectId: number | undefined; // undefined: outside an object, or one that is skipped
  let range: (LayerRange & { options: Map<string, string> }) | undefined;
  let option: string | undefined;
  let text = '';
  walk(bytes, {
    open(name, a) {
      if (name === 'object') {
        const id = a['id'] === undefined ? -1 : int(a['id'], 'object id');
        if (id <= 0) notices.push(`${LAYER_RANGES_PART}: invalid object id: object skipped.`);
        else if (out.has(id)) notices.push(`${LAYER_RANGES_PART}: duplicate object ${id}: skipped.`);
        else {
          objectId = id;
          out.set(id, new Map());
        }
      } else if (name === 'range' && objectId !== undefined) {
        const minZ = num(a['min_z'], 'range min_z');
        const maxZ = num(a['max_z'], 'range max_z');
        // Ranges with equal bounds merge, as upstream's map keyed by the bounds does (:3085).
        const ranges = out.get(objectId)!;
        range = ranges.get(`${minZ}|${maxZ}`) ?? { objectId, minZ, maxZ, options: new Map() };
        ranges.set(`${minZ}|${maxZ}`, range);
      } else if (name === 'option' && range) {
        option = a['opt_key'] ?? '';
        text = '';
      }
    },
    text(t) {
      if (option !== undefined) text += t;
    },
    close(name) {
      if (name === 'option' && range && option !== undefined) range.options.set(option, text);
      if (name === 'option') option = undefined;
      else if (name === 'range') range = undefined;
      else if (name === 'object') objectId = undefined;
    },
  });
  return [...out.values()].flatMap((r) => [...r.values()]);
}

function readHeightProfiles(bytes: Uint8Array, notices: string[]): LayerHeightProfile[] {
  const out = new Map<number, LayerHeightProfile>();
  let values = 0;
  for (const line of new TextDecoder().decode(bytes).replace(/\n$/, '').split('\n')) {
    const halves = line.split('|');
    const idParts = halves[0]?.split('=');
    if (halves.length !== 2 || idParts?.length !== 2) {
      notices.push(`${LAYER_HEIGHTS_PART}: a line is not "object_id=N|z;h;...": skipped.`);
      continue;
    }
    const objectId = /^\s*\d{1,10}\s*$/.test(idParts[1]!) ? Number(idParts[1]) : 0;
    if (objectId === 0) notices.push(`${LAYER_HEIGHTS_PART}: invalid object id: line skipped.`);
    else if (out.has(objectId)) notices.push(`${LAYER_HEIGHTS_PART}: duplicate object ${objectId}: skipped.`);
    else {
      const items = halves[1]!.split(';');
      const profile = items.map((s) => (s.trim() === '' ? NaN : Number(s)));
      if (items.length <= 4 || items.length % 2 !== 0 || !profile.every(Number.isFinite))
        notices.push(`${LAYER_HEIGHTS_PART}: object ${objectId} has an invalid profile: skipped.`);
      else if ((values += items.length) > MAX_LAYER_ENTRIES)
        throw new Error(`more than ${MAX_LAYER_ENTRIES} profile values`);
      else out.set(objectId, { objectId, profile });
    }
  }
  return [...out.values()];
}

function readCuts(bytes: Uint8Array, notices: string[]): CutInfo[] {
  type Cut = { objectId: number; cutId?: CutInfo['cutId']; connectors: CutConnector[] };
  const out = new Map<number, Cut>();
  let cut: Cut | undefined;
  walk(bytes, {
    open(name, a) {
      if (name === 'object') {
        const id = a['id'] === undefined ? -1 : int(a['id'], 'object id');
        if (id <= 0) notices.push(`${CUT_PART}: invalid object id: object skipped.`);
        else if (out.has(id)) notices.push(`${CUT_PART}: duplicate object ${id}: skipped.`);
        else out.set(id, (cut = { objectId: id, connectors: [] }));
      } else if (name === 'cut_id' && cut)
        cut.cutId = {
          id: int(a['id'], 'cut_id id'),
          checkSum: int(a['check_sum'], 'cut_id check_sum'),
          connectorsCount: int(a['connectors_cnt'], 'cut_id connectors_cnt'),
        };
      else if (name === 'connector' && cut)
        cut.connectors.push({
          volumeId: int(a['volume_id'], 'connector volume_id'),
          type: int(a['type'], 'connector type'),
          rTolerance: num(a['r_tolerance'], 'connector r_tolerance'),
          hTolerance: num(a['h_tolerance'], 'connector h_tolerance'),
          attributes: rest(a, ['volume_id', 'type', 'r_tolerance', 'h_tolerance']),
        });
    },
    text() {},
    close(name) {
      if (name === 'object') cut = undefined;
    },
  });
  return [...out.values()];
}

/**
 * Reads the four optional layer-related parts of a Bambu or Orca package. A part that is absent, empty, over
 * `MAX_LAYER_PART_BYTES` or malformed yields nothing for it, with a notice for the last two; the part itself stays in
 * `preserved`. Unknown attributes of layers and connectors stay raw in `attributes`.
 */
export function readLayerData(pkg: Package): LayerData {
  const data: LayerData = { customGcodes: [], layerRanges: [], layerHeightProfiles: [], cuts: [], notices: [] };
  const run = (name: string, read: (bytes: Uint8Array) => void): void => {
    const part = pkg.parts.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (!part || part.bytes.length === 0) return;
    if (part.bytes.length > MAX_LAYER_PART_BYTES) {
      data.notices.push(`${part.name} is larger than ${MAX_LAYER_PART_BYTES} bytes: not read.`);
      return;
    }
    try {
      read(part.bytes);
    } catch (e) {
      data.notices.push(
        `${part.name} could not be read (${e instanceof Error ? e.message : String(e)}): kept untouched.`,
      );
    }
  };
  run(CUSTOM_GCODE_PART, (b) => (data.customGcodes = readCustomGcodes(b)));
  run(LAYER_RANGES_PART, (b) => (data.layerRanges = readLayerRanges(b, data.notices)));
  run(LAYER_HEIGHTS_PART, (b) => (data.layerHeightProfiles = readHeightProfiles(b, data.notices)));
  run(CUT_PART, (b) => (data.cuts = readCuts(b, data.notices)));
  // Rule 25: a hostile file can make one notice per entry.
  if (data.notices.length > MAX_NOTICES)
    data.notices.splice(MAX_NOTICES, Infinity, `and ${data.notices.length - MAX_NOTICES} more notices`);
  return data;
}
