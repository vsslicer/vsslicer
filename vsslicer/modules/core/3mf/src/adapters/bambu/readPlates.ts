// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Package } from '../../domain/package.ts';
import type {
  Plate,
  PlateInstance,
  PlateLayout,
  PlateObjectBox,
  SliceFilament,
  SliceInfo,
  SliceWarning,
} from '../../domain/project/project.ts';
import { MAX_LAYER_PART_BYTES, walk } from './readLayerData.ts';

/*
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0; the file carries no per-file notice).
 * Ported from OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp: part names :233 and src/libslic3r/Format/bbs_3mf.hpp:34-41
 * (`Metadata/plate_N.{gcode,png,json}`), plate metadata in model_settings.config :4627-4770 and :4953-5010 (`plater_id`,
 * `plater_name`, `locked`, the file keys, `<model_instance>` metadata), slice_info.config :4770-4905 (`<plate>` selected by
 * `index`, `prediction`, `weight`, `outside`, `support_used`, `printer_model_id`, `<filament>`, `<warning>`), the thumbnail
 * fallback from the G-code name :1747-1751, and plate_N.json src/libslic3r/GCode/ThumbnailData.hpp:56-125. Written format
 * :8421-8605 and :8715-8960. Checked against BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp (same keys).
 * Differences: upstream keeps one instance per object on a plate (a `std::map` keyed by object id), we keep all; upstream
 * rejects plate ids that are not 1..N, we keep what is valid and say what was skipped; `<object>`, `<nozzle>` and
 * `<mixed_filament>` of slice_info.config are not read.
 */
export const MODEL_SETTINGS_PART = 'Metadata/model_settings.config';
export const SLICE_INFO_PART = 'Metadata/slice_info.config';

/** Rule 25: plates read from one package. */
export const MAX_PLATES = 1024;
/** Rule 25: a plate_N.json array (boxes, filaments, coordinates) longer than this is not read. */
export const MAX_LAYOUT_ITEMS = 10_000;
/** Rule 25: longest attribute value kept (real ones are file names and short lists). */
export const MAX_VALUE_CHARS = 65_536;
const MAX_NOTICES = 20;

const clip = (s: string | undefined): string => (s ?? '').slice(0, MAX_VALUE_CHARS);
const lower = (s: string): string => s.toLowerCase();

/** A plain non-negative integer, else undefined (upstream's `atoi` would read garbage as 0 or a prefix). */
const natural = (v: string | undefined): number | undefined =>
  v !== undefined && /^\d{1,10}$/.test(v) ? Number(v) : undefined;
const finite = (v: string | undefined): number | undefined =>
  v === undefined || v.trim() === '' || !Number.isFinite(Number(v)) ? undefined : Number(v);
const bool = (v: string | undefined): boolean | undefined => (v === 'true' ? true : v === 'false' ? false : undefined);

interface RawPlate {
  id?: number;
  sawId?: boolean;
  config: Map<string, string>;
  instances: PlateInstance[];
}

/** The `<plate>` entries of model_settings.config, in file order. A plate without a usable id is skipped. */
function readPlateEntries(bytes: Uint8Array, notices: string[]): RawPlate[] {
  const out: RawPlate[] = [];
  const ids = new Set<number>();
  let plate: RawPlate | undefined;
  let inst: { objectId?: number; instanceId?: number; identifyId?: number } | undefined;
  walk(bytes, {
    open(name, a) {
      if (name === 'plate') plate = { config: new Map(), instances: [] };
      else if (name === 'model_instance' && plate) inst = {};
      else if (name === 'metadata' && plate) {
        const key = clip(a['key']);
        const value = clip(a['value']);
        if (inst) {
          if (key === 'object_id') inst.objectId = natural(value);
          else if (key === 'instance_id') inst.instanceId = natural(value);
          else if (key === 'identify_id') inst.identifyId = natural(value);
        } else if (key === 'plater_id') {
          plate.sawId = true;
          const id = natural(value);
          if (id === undefined || id < 1)
            notices.push(
              `${MODEL_SETTINGS_PART}: plater_id "${value.slice(0, 40)}" is not a plate number: plate skipped.`,
            );
          else plate.id = id;
        } else if (key !== '') plate.config.set(key, value);
      }
    },
    text() {},
    close(name) {
      if (name === 'model_instance' && plate && inst) {
        if (inst.objectId === undefined || inst.instanceId === undefined)
          notices.push(`${MODEL_SETTINGS_PART}: a model_instance without object_id and instance_id: skipped.`);
        else
          plate.instances.push({
            objectId: inst.objectId,
            instanceId: inst.instanceId,
            ...(inst.identifyId !== undefined && { identifyId: inst.identifyId }),
          });
        inst = undefined;
      } else if (name === 'plate' && plate) {
        if (plate.id === undefined) {
          if (!plate.sawId) notices.push(`${MODEL_SETTINGS_PART}: a plate without plater_id: skipped.`);
        } else if (ids.has(plate.id)) notices.push(`${MODEL_SETTINGS_PART}: duplicate plate ${plate.id}: skipped.`);
        else if (out.length >= MAX_PLATES) throw new Error(`more than ${MAX_PLATES} plates`);
        else {
          ids.add(plate.id);
          out.push(plate);
        }
        plate = undefined;
      }
    },
  });
  return out;
}

/** `<plate>` entries of slice_info.config by their `index`; a plate without a usable index is skipped (:4766-4772). */
function readSliceInfos(bytes: Uint8Array, notices: string[]): Map<number, SliceInfo> {
  const out = new Map<number, SliceInfo>();
  let open: { meta: Map<string, string>; filaments: SliceFilament[]; warnings: SliceWarning[] } | undefined;
  walk(bytes, {
    open(name, a) {
      if (name === 'plate') open = { meta: new Map(), filaments: [], warnings: [] };
      else if (!open) return;
      else if (name === 'metadata') {
        const key = clip(a['key']);
        if (key !== '') open.meta.set(key, clip(a['value']));
      } else if (name === 'filament') {
        const id = natural(a['id']);
        const usedMeters = finite(a['used_m']);
        const usedGrams = finite(a['used_g']);
        if (id === undefined || usedMeters === undefined || usedGrams === undefined)
          notices.push(`${SLICE_INFO_PART}: a filament without a numeric id, used_m and used_g: skipped.`);
        else
          open.filaments.push({
            id,
            type: clip(a['type']),
            color: clip(a['color']),
            usedMeters,
            usedGrams,
            trayInfoId: clip(a['tray_info_idx']),
            ...(bool(a['used_for_object']) !== undefined && { usedForObject: bool(a['used_for_object'])! }),
            ...(bool(a['used_for_support']) !== undefined && { usedForSupport: bool(a['used_for_support'])! }),
          });
      } else if (name === 'warning')
        open.warnings.push({
          message: clip(a['msg']),
          level: finite(a['level']) ?? 0,
          errorCode: clip(a['error_code']),
        });
    },
    text() {},
    close(name) {
      if (name !== 'plate' || !open) return;
      const { meta, filaments, warnings } = open;
      open = undefined;
      const index = natural(meta.get('index'));
      if (index === undefined)
        return void notices.push(`${SLICE_INFO_PART}: a plate without a numeric index: skipped.`);
      if (out.has(index)) return void notices.push(`${SLICE_INFO_PART}: duplicate plate ${index}: skipped.`);
      if (out.size >= MAX_PLATES) throw new Error(`more than ${MAX_PLATES} plates`);
      const num = (key: string, what: string): number | undefined => {
        const v = finite(meta.get(key));
        if (meta.has(key) && v === undefined)
          notices.push(`${SLICE_INFO_PART}: plate ${index} ${what} is not a number: left out.`);
        return v;
      };
      const predictionSeconds = num('prediction', 'prediction');
      const weightGrams = num('weight', 'weight');
      const flag = (key: string) => bool(meta.get(key));
      const attributes = new Map(meta);
      for (const k of ['index', 'prediction', 'weight', 'printer_model_id', 'support_used', 'outside'])
        attributes.delete(k);
      out.set(index, {
        ...(predictionSeconds !== undefined && { predictionSeconds }),
        ...(weightGrams !== undefined && { weightGrams }),
        ...(meta.has('printer_model_id') && { printerModelId: meta.get('printer_model_id')! }),
        ...(flag('support_used') !== undefined && { supportUsed: flag('support_used')! }),
        ...(flag('outside') !== undefined && { toolpathOutside: flag('outside')! }),
        filaments,
        warnings,
        attributes,
      });
    },
  });
  return out;
}

function list<T>(v: unknown, ok: (x: unknown) => x is T): T[] | undefined {
  return Array.isArray(v) && v.length <= MAX_LAYOUT_ITEMS && v.every(ok) ? (v as T[]) : undefined;
}
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isStr = (x: unknown): x is string => typeof x === 'string' && x.length <= MAX_VALUE_CHARS;

/** `plate_N.json`; undefined when it is not the shape the slicer writes. */
function readLayout(bytes: Uint8Array): PlateLayout | undefined {
  const j: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (typeof j !== 'object' || j === null || Array.isArray(j)) return undefined;
  const o = j as Record<string, unknown>;
  const bboxAll = list(o['bbox_all'], isNum);
  const filamentIds = list(o['filament_ids'], isNum);
  const filamentColors = list(o['filament_colors'], isStr);
  const boxes = list(o['bbox_objects'] ?? [], (x): x is Record<string, unknown> => typeof x === 'object' && x !== null);
  if (!bboxAll || !filamentIds || !filamentColors || !boxes) return undefined;
  const objects: PlateObjectBox[] = [];
  for (const b of boxes) {
    const bbox = list(b['bbox'], isNum);
    if (!isNum(b['id']) || !bbox || !isStr(b['name'])) return undefined;
    objects.push({ id: b['id'], name: b['name'], bbox });
  }
  return {
    bboxAll,
    filamentIds,
    filamentColors,
    objects,
    ...(isNum(o['nozzle_diameter']) && { nozzleDiameter: o['nozzle_diameter'] }),
    ...(isStr(o['bed_type']) && { bedType: o['bed_type'] }),
    ...(isNum(o['version']) && { version: o['version'] }),
  };
}

/**
 * Plates of a Bambu or Orca package: from model_settings.config their id, name, lock, instances (object and instance
 * number) and image and G-code file names; from slice_info.config the time, weight, filaments and warnings of the plates it
 * lists (a plate it does not list has no `slice`: unsliced); from `Metadata/plate_N.json` its layout. `thumbnail` falls
 * back to the G-code name with `.png` (:1747-1751). `gcodePart` is set only when the package holds the part (the
 * `gcode_file` metadata, else `Metadata/plate_N.gcode`). A part that is absent, empty, over `MAX_LAYER_PART_BYTES` or
 * malformed yields nothing for it, with a notice for the last two. Unknown plate metadata stays raw in `config`.
 */
export function readPlates(pkg: Package): { plates: Plate[]; notices: string[] } {
  const notices: string[] = [];
  const parts = new Map(pkg.parts.map((p) => [lower(p.name), p]));
  const run = <T>(name: string, read: (bytes: Uint8Array) => T): T | undefined => {
    const part = parts.get(lower(name));
    if (!part || part.bytes.length === 0) return undefined;
    if (part.bytes.length > MAX_LAYER_PART_BYTES) {
      notices.push(`${part.name} is larger than ${MAX_LAYER_PART_BYTES} bytes: not read.`);
      return undefined;
    }
    try {
      return read(part.bytes);
    } catch (e) {
      notices.push(`${part.name} could not be read (${e instanceof Error ? e.message : String(e)}): kept untouched.`);
      return undefined;
    }
  };
  const entries = run(MODEL_SETTINGS_PART, (b) => readPlateEntries(b, notices)) ?? [];
  const slices =
    (entries.length > 0 && run(SLICE_INFO_PART, (b) => readSliceInfos(b, notices))) || new Map<number, SliceInfo>();
  for (const index of slices.keys())
    if (!entries.some((e) => e.id === index))
      notices.push(`${SLICE_INFO_PART}: slice info for unknown plate ${index}: ignored.`);

  // Rule 25: plates may name one part; parse each distinct part once.
  const layouts = new Map<string, PlateLayout | undefined>();
  const plates = entries.map((e): Plate => {
    const id = e.id!;
    const config = new Map(e.config);
    const take = (key: string): string | undefined => {
      const v = config.get(key);
      config.delete(key);
      return v === '' ? undefined : v;
    };
    const name = take('plater_name');
    const locked = bool(take('locked'));
    const gcodeName = take('gcode_file');
    const thumbnail =
      take('thumbnail_file') ??
      (gcodeName && /\.gcode/.test(gcodeName) ? gcodeName.replaceAll('.gcode', '.png') : undefined);
    const noLightThumbnail = take('thumbnail_no_light_file');
    const topImage = take('top_file');
    const pickImage = take('pick_file');
    const layoutName = config.get('pattern_bbox_file') || `Metadata/plate_${id}.json`;
    const gcodePart = [gcodeName, `Metadata/plate_${id}.gcode`]
      .map((n) => n && parts.get(lower(n))?.name)
      .find((n) => n);
    const key = lower(layoutName);
    if (!layouts.has(key)) layouts.set(key, run(layoutName, readLayout));
    const layout = layouts.get(key);
    const slice = slices.get(id);
    return {
      id,
      ...(name !== undefined && { name }),
      config,
      ...(locked !== undefined && { locked }),
      instances: e.instances,
      ...(thumbnail !== undefined && { thumbnail }),
      ...(noLightThumbnail !== undefined && { noLightThumbnail }),
      ...(topImage !== undefined && { topImage }),
      ...(pickImage !== undefined && { pickImage }),
      ...(gcodePart !== undefined && { gcodePart }),
      ...(slice && { slice }),
      ...(layout && { layout }),
    };
  });
  // Rule 25: a hostile file can make one notice per entry.
  if (notices.length > MAX_NOTICES)
    notices.splice(MAX_NOTICES, Infinity, `and ${notices.length - MAX_NOTICES} more notices`);
  return { plates, notices };
}
