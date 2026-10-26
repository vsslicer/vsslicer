// SPDX-License-Identifier: AGPL-3.0-only
// One option definition as a catalogue entry: its type, group, home and fields (PRF-14). Shared by the Orca, Bambu,
// Prusa and SuperSlicer generators; a module of its own so generate.ts and prusa.ts do not import each other.
import type { CatalogueEntry, CatalogueFile, EnumOption, Group, HomeEntity, SettingType } from '@vsslicer/profile-api';
import type { Def, Value } from './cpp.ts';

const PLATE_KEYS = new Set([
  'curr_bed_type',
  'first_layer_print_sequence',
  'first_layer_sequence_choice',
  'other_layers_print_sequence',
  'other_layers_print_sequence_nums',
  'other_layers_sequence_choice',
]);

// shortcut: groups and homes come from key-name patterns and Orca's preset lists, not from Tab.cpp pages;
// refine per key when a page-accurate grouping matters (E11 review).
const PROCESS_GROUPS: [RegExp, Group][] = [
  [/gcode|post_process|filename_format|label_object|exclude_object|comments|thumbnail|binary|line_number/, 'gcode'],
  [/support|raft/, 'support'],
  [/skirt|brim|draft_shield|elefant|elephant/, 'adhesion'],
  [
    /prime_tower|wipe_tower|flush|ooze|wiping|single_extruder|purge|_filament$|tool_?change|nozzle_change|prime_volume/,
    'multi_material',
  ],
  [/speed|accel|jerk|junction|velocity|slowdown|slow_down/, 'speed'],
  [/infill|^top_|^bottom_|ironing|shell|solid/, 'shells_infill'],
  [/wall|perimeter|seam|bridge|overhang|hole|contour|outer|scarf|loop|role_based/, 'walls'],
  [/line_width|flow|extru|retract|travel|wipe|z_hop|crossing/, 'extrusion'],
  [/layer|slic|resolution|precision|xy_|z_offset|spiral|vase|print_sequence|adaptive/, 'layers'],
];
const MATERIAL_GROUPS: [RegExp, Group][] = [
  [/gcode/, 'gcode'],
  [
    /ramming|toolchange|loading|cooling_moves|cooling_initial|cooling_final|tube|wipe|flush|purge|prime|multitool|nozzle_change/,
    'multi_material',
  ],
  [/fan|cool|slow_down|layer_time|exhaust|aux/, 'cooling'],
];
const PRINTER_GROUPS: [RegExp, Group][] = [
  [/gcode|thumbnail|host|binary|relative_e|time_lapse|timelapse|change_filament|print_host|printhost|api_key/, 'gcode'],
  [/retract|z_hop|^wipe|deretract|lift|travel_slope/, 'extrusion'],
  [
    /prime|purge|wipe_tower|single_extruder_multi|cooling_tube|parking|extra_loading|high_current|tool_?change|nozzle_change|ramming|manual_filament/,
    'multi_material',
  ],
];
const pick = (key: string, rules: [RegExp, Group][], fallback: Group): Group =>
  rules.find(([re]) => re.test(key))?.[1] ?? fallback;

const placeOf = (key: string, lists: { print: Set<string>; filament: Set<string>; printer: Set<string> }) => {
  const listed = lists.print.has(key) || lists.filament.has(key) || lists.printer.has(key);
  if (PLATE_KEYS.has(key)) return { group: 'plate' as Group, home: 'plate' as HomeEntity, listed: true };
  const home: HomeEntity = lists.print.has(key)
    ? 'process'
    : lists.filament.has(key) || (!listed && key.startsWith('filament_'))
      ? 'material'
      : lists.printer.has(key) ||
          (!listed &&
            /^(machine_|printer_|printable_|bed_|extruder_|nozzle_|print_host|printhost|host_|thumbnails)/.test(key))
        ? /^nozzle_/.test(key)
          ? 'nozzle'
          : 'printer_model'
        : 'process';
  const group =
    home === 'process'
      ? pick(key, PROCESS_GROUPS, 'special')
      : home === 'material'
        ? pick(key, MATERIAL_GROUPS, 'material')
        : home === 'nozzle'
          ? 'machine'
          : pick(key, PRINTER_GROUPS, 'machine');
  return { group, home, listed };
};

/** A data file as committed: two-space JSON and a final newline. */
export const render = (file: CatalogueFile): string => `${JSON.stringify(file, null, 2)}\n`;

const TYPES: { [co: string]: SettingType } = {
  Bool: 'bool',
  Int: 'int',
  Float: 'float',
  Percent: 'percent',
  FloatOrPercent: 'float_or_percent',
  FloatsOrPercents: 'float_or_percent',
  String: 'string',
  Enum: 'enum',
  Point: 'point',
  Point3: 'point',
  Points: 'polygon',
  PointsGroups: 'polygon',
};

const humanize = (key: string) => key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** The lists that place a key: the preset lists of each entity, and the keys stored once per extruder. */
export interface Placement {
  print: Set<string>;
  filament: Set<string>;
  printer: Set<string>;
  perExtruder: Set<string>;
}

/** One definition as a catalogue entry. `source` is the provenance prefix (`OrcaSlicer@09aa0114:src/...`). */
export const toEntry = (
  d: Def,
  lists: Placement,
  maps: Map<string, Map<string, string>>,
  source: string,
): CatalogueEntry => {
  const co = d.co.slice(2);
  const plural = /s$|Groups$/.test(co) && co !== 'FloatOrPercent';
  const scalarCo =
    co === 'FloatsOrPercents'
      ? co
      : co
          .replace(/Groups$/, '')
          .replace(/s$/, '')
          .replace(/^Point$/, plural ? 'Points' : 'Point');
  const { group, home, listed } = placeOf(d.key, lists);
  let type: SettingType = TYPES[co === 'PointsGroups' ? co : scalarCo] ?? TYPES[co]!;
  const values = d.enumValues ?? [...(maps.get(d.enumType ?? '')?.values() ?? [])];
  const enumOptions: EnumOption[] = values.map((value, i) => {
    const label = d.enumLabels?.[i];
    return label ? { value, label } : { value };
  });
  if (type === 'string' && /gcode/.test(d.key)) type = 'gcode';
  if (type === 'enum' && enumOptions.length === 0) type = 'string';
  // Plural keys: one value per extruder (extruder and variant keys), one per material (a material entity is one
  // filament), or a plain list.
  // Machine limits hold [normal, silent] values, not one per extruder.
  const isPerExtruder =
    plural && lists.perExtruder.has(d.key) && co !== 'PointsGroups' && !/^machine_(max|min)_/.test(d.key);
  const isMaterialScalar = plural && !isPerExtruder && home === 'material' && !/^compatible_/.test(d.key);
  if (isPerExtruder && co === 'Points') type = 'point';
  const isList = plural && !isPerExtruder && !isMaterialScalar && !(co === 'Points' && !isPerExtruder);
  let value = d.value;
  // `ConfigOptionBool(0)`
  const asBool = (v: Value | undefined): Value | undefined =>
    Array.isArray(v) ? v.map((x) => asBool(x) as Value) : typeof v === 'number' ? v !== 0 : v;
  if (type === 'bool') value = asBool(value);
  // A scalar written as `ConfigOptionBool{ false }`, or one value per extruder or material.
  if (Array.isArray(value) && (isPerExtruder || isMaterialScalar || (!plural && !['point', 'polygon'].includes(type))))
    value = value[0];
  const hidden = d.mode === 'comDevelop' || !listed;
  const label = d.fullLabel ?? d.label;
  const entry: CatalogueEntry = {
    group,
    home,
    type,
    ...(isList ? { list: true } : {}),
    ...(isPerExtruder ? { per_extruder: true } : {}),
    ...(d.sidetext ? { unit: d.sidetext } : {}),
    ...(type === 'enum' ? { enum: enumOptions } : {}),
    ...(d.min !== undefined ? { min: d.min } : {}),
    ...(d.max !== undefined ? { max: d.max } : {}),
    ...(value !== undefined ? { default: value } : {}),
    label: label || humanize(d.key),
    ...(d.tooltip ? { tooltip: d.tooltip } : {}),
    native: { orca: { key: d.key } },
    ...(hidden ? { hidden: true } : {}),
    provenance: `${source}:${d.line}${label ? '' : ' (label generated from the key)'}`,
  };
  return entry;
};
