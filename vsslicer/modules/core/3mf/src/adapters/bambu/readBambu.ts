// SPDX-License-Identifier: AGPL-3.0-or-later
import type { DialectReader } from '../../application/readProject.ts';
import { createProject, type Dialect } from '../../domain/project/project.ts';
import { readLayerData } from './readLayerData.ts';
import { readBambuObjects } from './readObjects.ts';
import { readPlates } from './readPlates.ts';

/*
 * Ported from OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp:230 and :246-249 (the config part names), :2042-2081
 * (case-insensitive equals / starts-with dispatch), and src/libslic3r/Config.hpp:1619-1645 (ConfigOptionPoints:
 * `XxY` points split on `,`, rejecting `|`, `;` and `..`) with Config.cpp:894-921 (a JSON string array joins with `,`).
 * Checked against BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp:171, :186-189, :2110-2125.
 * Copyright (c) Bambu Lab and the BambuStudio and OrcaSlicer contributors (AGPL-3.0; the file carries no per-file notice).
 */
export const PROJECT_CONFIG = 'Metadata/project_settings.config';
export const EMBEDDED_PRESET_PREFIXES: readonly string[] = [
  'Metadata/print_setting_',
  'Metadata/process_settings_',
  'Metadata/filament_settings_',
  'Metadata/machine_settings_',
];

/** Rule 25: the project config is parsed only up to this size (real ones are ~100 KB); larger ones stay raw. */
export const MAX_CONFIG_BYTES = 16 * 1024 * 1024;
/** Rule 25: a bed polygon with more vertices than this is not exposed. */
export const MAX_AREA_POINTS = 4096;

const lower = (s: string): string => s.toLowerCase();
const isConfigPart = (name: string): boolean =>
  lower(name) === lower(PROJECT_CONFIG) || EMBEDDED_PRESET_PREFIXES.some((p) => lower(name).startsWith(lower(p)));

type Point = readonly [x: number, y: number];

/** `printable_area` of a parsed project config, or a reason it is unusable. `undefined` when the key is absent. */
export function parsePrintableArea(value: unknown): readonly Point[] | string | undefined {
  if (value === undefined) return undefined;
  const joined =
    typeof value === 'string'
      ? value
      : Array.isArray(value) && value.every((v) => typeof v === 'string')
        ? value.join(',')
        : undefined;
  if (joined === undefined) return 'printable_area is not a string or a list of strings';
  if (/[|;]|\.\./.test(joined)) return 'printable_area uses the exclusion-volume syntax';
  const items = joined.split(',', MAX_AREA_POINTS + 1);
  if (items.length > MAX_AREA_POINTS) return `printable_area has more than ${MAX_AREA_POINTS} points`;
  const points: Point[] = [];
  for (const item of items) {
    const xy = item.split('x');
    // shortcut: upstream reads a missing or garbled coordinate as 0; we refuse the area instead.
    const [x, y] = xy.map((c) => (c.trim() === '' ? NaN : Number(c)));
    if (xy.length !== 2 || !Number.isFinite(x) || !Number.isFinite(y))
      return `printable_area point "${item}" is not XxY`;
    points.push([x!, y!]);
  }
  return points;
}

/**
 * The `bambu` / `orca` dialect reader. Objects, parts and instances come from `readBambuObjects`. The project config
 * (`Metadata/project_settings.config`) and every embedded preset (`Metadata/{print_setting,process_settings,
 * filament_settings,machine_settings}_*`) are returned raw in `rawConfig` by part name; every other non-model part is
 * preserved. `printable_area` of the project config becomes `printableArea`; a config that is not JSON or holds an
 * unusable area leaves it absent with a notice.
 */
export const createBambuReader =
  (dialect: Extract<Dialect, 'bambu' | 'orca'>): DialectReader =>
  (pkg) => {
    const { objects, instances, notices } = readBambuObjects(pkg);
    const { notices: layerNotices, ...layerData } = readLayerData(pkg);
    notices.push(...layerNotices);
    const { plates, notices: plateNotices } = readPlates(pkg);
    notices.push(...plateNotices);
    // Instance k of an object is the k-th build item that names it; a plate lists (object, k).
    // shortcut: ids are matched as written, so an object renamed by readBambuObjects (clashing ids across parts) is missed.
    const plateOf = new Map<string, number>();
    for (const p of plates) for (const i of p.instances ?? []) plateOf.set(`${i.objectId}|${i.instanceId}`, p.id);
    const seen = new Map<number, number>();
    const placed = instances.map((inst) => {
      const k = seen.get(inst.objectId) ?? 0;
      seen.set(inst.objectId, k + 1);
      const plateId = plateOf.get(`${inst.objectId}|${k}`);
      return plateId === undefined ? inst : { ...inst, plateId };
    });
    const configs = pkg.parts.filter((p) => isConfigPart(p.name));
    const preserved = pkg.parts.filter((p) => !isConfigPart(p.name) && !lower(p.name).endsWith('.model'));
    let printableArea: readonly Point[] | undefined;
    const project = configs.find((p) => lower(p.name) === lower(PROJECT_CONFIG));
    if (project && project.bytes.length > MAX_CONFIG_BYTES)
      notices.push(`${project.name} is larger than ${MAX_CONFIG_BYTES} bytes: the printable area was not read.`);
    else if (project && project.bytes.length > 0) {
      let json: unknown;
      try {
        json = JSON.parse(new TextDecoder().decode(project.bytes));
      } catch (e) {
        notices.push(`${project.name} is not JSON (${e instanceof Error ? e.message : String(e)}): kept untouched.`);
      }
      const area =
        json && typeof json === 'object' && !Array.isArray(json)
          ? parsePrintableArea((json as Record<string, unknown>)['printable_area'])
          : undefined;
      if (typeof area === 'string') notices.push(`${area}: the printable area was not read.`);
      else printableArea = area;
    }
    return createProject({
      dialect,
      objects,
      instances: placed,
      plates,
      ...layerData,
      rawConfig: new Map(configs.map((p) => [p.name, p.bytes] as const)),
      preserved,
      ...(printableArea ? { printableArea } : {}),
      ...(notices.length ? { notices } : {}),
    });
  };
