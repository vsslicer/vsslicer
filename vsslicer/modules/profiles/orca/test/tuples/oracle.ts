// SPDX-License-Identifier: AGPL-3.0-or-later
// Shared by tuples.test.ts and generate-golden.ts: the tuples, how this module resolves one, and how a resolved value
// is compared with an OrcaSlicer `--export-settings` value (vsslicer/fixtures/profile-research/oracle.md).
import { applyOverrides, type PrinterModel } from '@vsslicer/profile-api';
import { fileURLToPath } from 'node:url';
import { splitOrcaPrinters } from '../../src/adapters/split/split.ts';
import { loadProfileTree } from '../../src/adapters/tree/load-tree.ts';
import { readOrcaTree, type OrcaTree, type PresetType } from '../../src/adapters/tree/read-tree.ts';

export type TreeId = 'orca' | 'bambu';
export interface Tuple {
  vendor: string;
  machine: string;
  process: string;
  filament: string;
}

/** `fixtures/orca` is cut from OrcaSlicer@09aa0114, `fixtures/bambu` from BambuStudio@79df7ae (fixtures/PROVENANCE.md). */
export const TUPLES: Readonly<Record<TreeId, readonly Tuple[]>> = {
  orca: [
    ['Voron', 'Voron 2.4 250 0.4 nozzle', '0.20mm Standard @Voron', 'Generic PLA @System'],
    ['Prusa', 'Prusa MINI 0.4 nozzle', '0.20mm Standard @MINI', 'Generic PLA @Prusa'],
    ['Creality', 'Creality CR-10 Max 0.4 nozzle', '0.20mm Standard @Creality CR10Max', 'Generic PLA @Creality'],
    ['Creality', 'Creality CR-10 0.4 nozzle', '0.20mm Standard @Creality CR-10 0.4 nozzle', 'CR-PLA @CR-10-all'],
    ['Elegoo', 'Elegoo Centauri 0.4 nozzle', '0.20mm Standard @Elegoo C 0.4 nozzle', 'Elegoo PLA @EC'],
    ['Elegoo', 'Elegoo Centauri 2 0.4 nozzle', '0.20mm Standard @Elegoo C2 0.4 nozzle', 'Elegoo PLA Basic @EC2'],
    ['Anycubic', 'Anycubic 4Max Pro 0.4 nozzle', '0.20mm Standard @Anycubic 4MaxPro', 'Generic PLA @Anycubic'],
    ['Qidi', 'Qidi X-Max 0.4 nozzle', '0.20mm Standard @Qidi XMax', 'Generic PLA @Qidi'],
    ['Ratrig', 'RatRig V-Core 3 200 0.4 nozzle', '0.20mm Standard @RatRig', 'Generic PLA @RatRig'],
    [
      'Flashforge',
      'Flashforge Adventurer 3 Series 0.4 Nozzle',
      '0.20mm Standard @Flashforge AD3 0.4 Nozzle',
      'Flashforge PLA',
    ],
    ['Snapmaker', 'Snapmaker J1 (0.4 nozzle)', '0.20 Standard @Snapmaker J1 (0.4 nozzle)', 'Snapmaker J1 PLA'],
    ['BBL', 'Bambu Lab H2C 0.4 nozzle', '0.20mm Standard @BBL H2C', 'Bambu PLA Basic @BBL H2C'],
    ['BBL', 'Bambu Lab A1 0.4 nozzle', '0.20mm Standard @BBL A1', 'Bambu PLA Basic @BBL A1'],
    ['BBL', 'Bambu Lab A1 mini 0.4 nozzle', '0.20mm Standard @BBL A1M', 'Bambu PLA Basic @BBL A1M'],
  ].map(([vendor, machine, process, filament]) => ({ vendor, machine, process, filament }) as Tuple),
  bambu: [
    ['BBL', 'Bambu Lab H2C 0.4 nozzle', '0.20mm Standard @BBL H2C', 'Bambu PLA Basic @BBL H2C'],
    ['BBL', 'Bambu Lab X1 Carbon 0.4 nozzle', '0.20mm Standard @BBL X1C', 'Bambu PLA Basic @BBL X1C'],
    ['BBL', 'Bambu Lab P1S 0.4 nozzle', '0.20mm Standard @BBL X1C', 'Bambu PLA Basic @BBL P1S 0.4 nozzle'],
    ['BBL', 'Bambu Lab A1 0.4 nozzle', '0.20mm Standard @BBL A1', 'Bambu PLA Basic @BBL A1'],
    ['BBL', 'Bambu Lab H2D 0.4 nozzle', '0.20mm Standard @BBL H2D', 'Bambu PLA Basic @BBL H2D'],
    ['BBL', 'Bambu Lab A1 mini 0.4 nozzle', '0.20mm Standard @BBL A1M', 'Bambu PLA Basic @BBL A1M'],
  ].map(([vendor, machine, process, filament]) => ({ vendor, machine, process, filament }) as Tuple),
};

export const fixtureRoot = (tree: TreeId): string => fileURLToPath(new URL(`./fixtures/${tree}`, import.meta.url));
export const goldenPath = (tree: TreeId): string => fileURLToPath(new URL(`./golden/${tree}.json`, import.meta.url));

export async function loadTree(tree: TreeId): Promise<OrcaTree> {
  const { files, diagnostics } = await loadProfileTree(fixtureRoot(tree));
  if (diagnostics.length) throw new Error(`fixture ${tree}: ${JSON.stringify(diagnostics[0])}`);
  return readOrcaTree(files);
}

export type Resolved = Record<'machine' | 'process' | 'filament', Record<string, unknown>>;

/** Machine: split into model and nozzle, then the nozzle's override applied; process and filament: the flattened preset. */
export function resolveTuple(tree: OrcaTree, t: Tuple): Resolved {
  const preset = (type: PresetType, name: string) => {
    const p = tree.presets.find((x) => x.type === type && x.name === name);
    if (!p) throw new Error(`${type} '${name}' did not resolve`);
    return p.settings;
  };
  const model = splitOrcaPrinters(tree).entities.find(
    (e): e is PrinterModel => (e as PrinterModel).nozzles?.includes(t.machine) === true,
  );
  if (!model) throw new Error(`'${t.machine}' was not split under a printer model`);
  return {
    machine: applyOverrides(model, { nozzle: { id: t.machine } }).entity.settings as Record<string, unknown>,
    process: preset('process', t.process),
    filament: preset('filament', t.filament),
  };
}

/**
 * Keys the export rewrites from the preset itself, not from its values: `from` becomes "project", the `*_settings_id`
 * keys become the preset names, `compatible_printers` and `renamed_from` are dropped (OrcaSlicer@09aa0114:src/OrcaSlicer.cpp:3106),
 * and `wall_infill_order` becomes `wall_sequence` (src/libslic3r/PrintConfig.cpp:9839-9851). Not compared.
 */
export const BOOKKEEPING: ReadonlySet<string> = new Set([
  'from',
  'printer_settings_id',
  'print_settings_id',
  'filament_settings_id',
  'compatible_printers',
  'renamed_from',
  'wall_infill_order',
]);

const one = (v: unknown): unknown =>
  v === 'nil' ? null : typeof v === 'string' && /^-?\d{1,20}(\.\d{1,20})?$/.test(v) ? String(Number(v)) : v;
/** The export re-serialises numbers ("0.10" is "0.1"), writes `nil` back, and stores scalar keys as one-element vectors. */
export const normalise = (v: unknown): unknown[] => (Array.isArray(v) ? v : [v]).map(one);

const str = (v: unknown[]): string[] => v.map((x) => String(x));
/**
 * How Orca's config loader rewrites a value it reads (each applied to the normalised resolved value; the result must
 * equal the export). Cites are OrcaSlicer@09aa0114:src/libslic3r/.
 */
export type Rule = (v: unknown[], exported: unknown[], settings: Readonly<Record<string, unknown>>) => unknown[];
export const RULES: Readonly<Record<string, Rule>> = {
  // A vector is read element by element, each split on ',' (Config.cpp:1004-1030, ConfigOptionFloats::deserialize at
  // Config.hpp:932-945), and sized to the extruder or filament-variant count (Preset.cpp:301 extend_default_config_length).
  shape: (v, e) => {
    const flat = v.flatMap((x) => (typeof x === 'string' ? x.split(',').map(one) : [x]));
    return e.map((_, i) => flat[Math.min(i, flat.length - 1)]);
  },
  // An empty vector takes the option default (Config.hpp:937-939).
  'empty-default': (v, e) => (v.length === 0 ? e : v),
  // ConfigOptionString unquotes a quoted value (Config.hpp:1177-1180); an empty-string vector serialises as [].
  quoted: (v) => str(v).map((x) => x.replace(/^"(.*)"$/, '$1')),
  empty: (v) => (v.length === 1 && v[0] === '' ? [] : v),
  // coPercent options gain their "%" (PrintConfig.cpp:2574, :8730).
  percent: (v) => str(v).map((x) => (x.endsWith('%') ? x : `${x}%`)),
  // coPoint serialises "x,y" (PrintConfig.cpp:4525).
  point: (v) => str(v).map((x) => x.replace('x', ',')),
  // thumbnails is one string; each size gains the thumbnails_format extension (PrintConfig.cpp:8582, :10032-10041).
  thumbnails: (v) => [
    str(v)
      .flatMap((x) => x.split(','))
      .map((x) => x.trim())
      .map((x) => (x.includes('/') ? x : `${x}/PNG`))
      .join(', '),
  ],
  // handle_legacy value rewrites: zig-zag patterns (PrintConfig.cpp:9915-9921), ensure_vertical_shell_thickness
  // (:9880-9886), a negative ironing_angle or tree_support_wall_count (:9909-9910, :9826).
  'zig-zag': (v) => str(v).map((x) => (x === 'zig-zag' ? 'rectilinear' : x)),
  'ensure-vertical': (v) => str(v).map((x) => (x === '1' ? 'ensure_all' : x === '0' ? 'ensure_moderate' : x)),
  'negative-zero': (v) => str(v).map((x) => (x.startsWith('-') ? '0' : x)),
  // An old percentage in an absolute-only key is erased, so the export holds the default (PrintConfig.cpp:9793-9803).
  'percent-reset': (v, e) => (str(v).some((x) => x.includes('%')) ? e : v),
  // extruder_clearance_max_radius is renamed to extruder_clearance_radius and overwrites it (PrintConfig.cpp:9962-9963).
  'max-radius': (v, _e, s) =>
    s['extruder_clearance_max_radius'] === undefined ? v : normalise(s['extruder_clearance_max_radius']),
};

/** Rules that hold only for the keys handle_legacy names; the generator assigns them to no other key. */
export const RULE_KEYS: Readonly<Record<string, ReadonlySet<string>>> = {
  'zig-zag': new Set([
    'sparse_infill_pattern',
    'top_surface_pattern',
    'bottom_surface_pattern',
    'internal_solid_infill_pattern',
    'ironing_pattern',
    'support_ironing_pattern',
  ]),
  'ensure-vertical': new Set(['ensure_vertical_shell_thickness']),
  'negative-zero': new Set(['ironing_angle', 'tree_support_wall_count']),
  'percent-reset': new Set([
    'initial_layer_print_height',
    'initial_layer_speed',
    'internal_solid_infill_speed',
    'top_surface_speed',
    'support_interface_speed',
    'outer_wall_speed',
    'support_object_xy_distance',
  ]),
  thumbnails: new Set(['thumbnails']),
  'max-radius': new Set(['extruder_clearance_radius']),
};

export const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export interface GoldenTuple extends Tuple {
  /** Normalised export value of every resolved key the export has, per preset type. */
  export: Resolved;
  /** Keys whose value Orca's loader rewrites, with the RULES entry that reproduces it. */
  rules: Record<string, string>;
  /** Resolved keys the export lacks: renamed by handle_legacy or unknown to the CLI build (Bambu-only keys). */
  absent: string[];
}
export interface Golden {
  generator: string;
  orca: string;
  source: string;
  tuples: GoldenTuple[];
}

/** Problems between a resolution and the golden tuple; empty when they agree. */
export function compare(g: GoldenTuple, r: Resolved): string[] {
  const out: string[] = [];
  const absent = new Set(g.absent);
  for (const type of ['machine', 'process', 'filament'] as const) {
    for (const [key, raw] of Object.entries(r[type])) {
      if (BOOKKEEPING.has(key)) continue;
      const id = `${type}:${key}`;
      const v = normalise(raw);
      const e = g.export[type][key] as unknown[] | undefined;
      if (e === undefined) {
        if (!absent.delete(id)) out.push(`${id}: resolved, but neither in the export nor listed absent`);
        continue;
      }
      const rule = g.rules[id];
      const got = rule === undefined ? v : RULES[rule]!(v, e, r[type]);
      if (!same(got, e))
        out.push(`${id}: ${JSON.stringify(got).slice(0, 120)} where the oracle has ${JSON.stringify(e).slice(0, 120)}`);
    }
    for (const key of Object.keys(g.export[type]))
      if (!Object.hasOwn(r[type], key)) out.push(`${type}:${key}: in the oracle, not resolved`);
  }
  for (const id of absent) out.push(`${id}: listed absent, not resolved`);
  return out;
}
