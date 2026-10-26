// SPDX-License-Identifier: AGPL-3.0-only
// The judgement pass (PRF-18): each catalogue key's group, home entity, hidden flag and override scope, from the place
// its own slicer shows it (Orca and Bambu `Tab.cpp` pages, SuperSlicer `.ui` pages, PrusaSlicer and Cura categories),
// and the group-count report against E11's table. Reads upstream sources as tokens; nothing upstream is built or run.
import type { CatalogueEntry, CatalogueFile, Dialect, Group, HomeEntity, OverrideScope } from '@vsslicer/profile-api';
import { GROUPS } from '@vsslicer/profile-api';
import { closing, literal, type Token } from './cpp.ts';

/** Where a slicer shows a key: its settings tab (`TabPrint`), page and option group, and the line that adds it. */
export interface GuiPlace {
  cls: string;
  page: string;
  group: string;
  line: number;
}

const isP = (t: Token | undefined, v: string) => t?.k === 'p' && t.v === v;
const isId = (t: Token | undefined, v: string) => t?.k === 'id' && t.v === v;

/** The body (`{` .. `}` token indices) of `cls::fn(...) {` or, with no class, of the free function `fn() {`. */
export const bodyOf = (t: Token[], cls: string | undefined, fn: string): [number, number] | undefined => {
  for (let i = 0; i + 3 < t.length; i++) {
    const at = cls
      ? isId(t[i], cls) && isP(t[i + 1], '::') && isId(t[i + 2], fn)
      : isId(t[i], fn) && !isP(t[i - 1], '::');
    const paren = cls ? i + 3 : i + 1;
    if (!at || !isP(t[paren], '(')) continue;
    const close = closing(t, paren);
    // `fn() const {` and `fn(args) {`: a definition; `fn();` is a call.
    let open = close + 1;
    while (open < t.length && t[open]!.k === 'id') open++;
    if (isP(t[open], '{')) return [open, closing(t, open)];
  }
  return undefined;
};

/** Config reads, writes and GUI toggles: a key named here is used by the page's code, not shown on it. */
const READS = new Set([
  'option',
  'opt',
  'opt_float',
  'opt_int',
  'opt_bool',
  'opt_string',
  'opt_enum',
  'opt_float_nullable',
  'opt_int_nullable',
  'opt_bool_nullable',
  'opt_serialize',
  'has',
  'set_key_value',
  'toggle_option',
  'toggle_line',
  'get_field',
]);

// shortcut: every other string literal of a build function that names a key counts as shown on the current page
// (VSS-3's scan did the same); match the append calls only if a page starts reading keys some other way.
const isRead = (t: Token[], i: number): boolean =>
  isP(t[i - 1], '(') && (isP(t[i - 2], '>') || (t[i - 2]?.k === 'id' && READS.has(t[i - 2]!.v)));

/** The axes Orca's machine-limit loops append (`"machine_max_jerk_" + axis`). */
const AXES = ['x', 'y', 'z', 'e'];

/**
 * The first page and option group each known key appears on, scanning the listed GUI build functions in order.
 * `calls` names helper functions whose body is scanned in place where they are called (`build_kinematics_page()`,
 * `publishable_printer_retraction_options()` in another file); each is scanned once, so the scan stays linear.
 */
export const tabPlaces = (
  t: Token[],
  fns: [cls: string, fn: string][],
  known: (key: string) => boolean,
  calls: { [fn: string]: { tokens: Token[]; cls?: string } } = {},
): Map<string, GuiPlace> => {
  const out = new Map<string, GuiPlace>();
  const scanned = new Set<string>();
  let state = { cls: '', page: '', group: '' };
  const place = (key: string, line: number) => {
    // Before its first page a build function reads the config (`m_config->option("nozzle_diameter")`): not a page.
    if (state.page !== '' && known(key) && !out.has(key)) out.set(key, { ...state, line });
  };
  const scan = (tokens: Token[], from: number, to: number) => {
    for (let i = from; i < to; i++) {
      const x = tokens[i]!;
      if (x.k === 'id' && isP(tokens[i + 1], '(')) {
        if (x.v === 'add_options_page' || x.v === 'new_optgroup') {
          const c = closing(tokens, i + 1, to);
          let end = i + 2;
          let depth = 0;
          for (; end < c; end++) {
            const v = tokens[end]!.k === 'p' ? tokens[end]!.v : '';
            if (v === '(' || v === '{') depth++;
            else if (v === ')' || v === '}') depth--;
            else if (v === ',' && depth === 0) break;
          }
          // Bambu names its extruder pages from a variable (`add_options_page(page_name, ...)`): keep the name.
          const title = literal(tokens, i + 2, end) ?? (end === i + 3 ? tokens[i + 2]!.v : '');
          if (x.v === 'add_options_page') state = { ...state, page: title, group: '' };
          else state = { ...state, group: title };
          // A title is not a key.
          i = c;
        } else if (Object.hasOwn(calls, x.v) && !scanned.has(x.v)) {
          scanned.add(x.v);
          const c = calls[x.v]!;
          const body = bodyOf(c.tokens, c.cls, x.v);
          if (!body) throw new Error(`${x.v}: no definition`);
          scan(c.tokens, body[0], body[1]);
        }
      } else if (x.k === 'str' && !isRead(tokens, i)) {
        // shortcut: `"prefix_" + axis` is expanded over Orca's four axes only; read the loop's list if another
        // concatenation appears on a page.
        if (isP(tokens[i + 1], '+')) for (const a of AXES) place(x.v + a, x.line);
        else place(x.v, x.line);
      }
    }
  };
  for (const [cls, fn] of fns) {
    const body = bodyOf(t, cls, fn);
    if (!body) throw new Error(`${cls}::${fn}: no definition`);
    state = { cls, page: '', group: '' };
    scan(t, body[0], body[1]);
  }
  return out;
};

/** The keys of `PRINT_CONFIG_CLASS_DEFINE(<cls>, ((Type, key)) ...)` in a PrintConfig.hpp. */
export const configClass = (t: Token[], cls: string): Set<string> => {
  const out = new Set<string>();
  for (let i = 0; i + 2 < t.length; i++) {
    if (!(isId(t[i], 'PRINT_CONFIG_CLASS_DEFINE') && isP(t[i + 1], '(') && isId(t[i + 2], cls))) continue;
    const end = closing(t, i + 1);
    for (let j = i + 3; j + 2 < end; j++)
      if (t[j]!.k === 'id' && isP(t[j + 1], ')') && isP(t[j + 2], ')')) out.add(t[j]!.v);
    return out;
  }
  throw new Error(`PRINT_CONFIG_CLASS_DEFINE(${cls}): not found`);
};

/**
 * Where a key may be overridden in a project, as Orca, Bambu, PrusaSlicer and SuperSlicer's object list allows: a
 * PrintRegionConfig key on an object, a part (modifier) and a height range (`SettingsFactory::get_options(true)`,
 * OrcaSlicer@09aa0114:src/slic3r/GUI/GUI_Factories.cpp:201); a PrintObjectConfig key on an object only, except
 * `layer_height`, which height ranges carry; a plate-tab key on a plate. Everything else is global.
 */
export const overrideScope = (
  key: string,
  classes: { object: Set<string>; region: Set<string> },
  plate: Set<string> = new Set(),
): OverrideScope[] => [
  ...(plate.has(key) ? (['plate'] as const) : []),
  ...(classes.region.has(key)
    ? (['object', 'part', 'height_range'] as const)
    : classes.object.has(key)
      ? key === 'layer_height'
        ? (['object', 'height_range'] as const)
        : (['object'] as const)
      : []),
];

// ---- Orca and Bambu Tab.cpp pages onto groups ----

/** The build functions whose pages the scan reads, in Orca's and Bambu's order (an earlier page wins). */
export const TAB_FUNCTIONS: [cls: string, fn: string][] = [
  ['TabPrint', 'build'],
  ['TabPrintPlate', 'build'],
  ['TabFilament', 'add_filament_overrides_page'],
  ['TabFilament', 'build'],
  ['TabPrinter', 'build_fff'],
  ['TabPrinter', 'build_unregular_pages'],
];

/**
 * Tab, page and option group (or tab and page) onto E11's groups: the matrix's own mapping of Orca's pages
 * (feature-matrix.md §1, from VSS-3's page scan), extended to Bambu's page names. A place missing here fails the
 * generator, so a new upstream page is grouped on purpose. Judgement calls, each a difference from the matrix
 * count: filament start/end G-code (`TabFilament/Advanced`) is `gcode` (the epic table gives `gcode` a material home)
 * where the matrix counted it under filament; notes, dependencies and plugin configuration, which the matrix did not
 * count, sit with their tab (`special`, `material`, `machine`) or with G-code (plugin configuration).
 */
export const TAB_GROUPS: { [place: string]: Group } = {
  'TabPrint/Quality/Layer height': 'layers',
  'TabPrint/Quality/Precision': 'layers',
  'TabPrint/Quality/Z contouring': 'layers',
  'TabPrint/Quality/Line width': 'extrusion',
  'TabPrint/Quality/Ironing': 'shells_infill',
  'TabPrint/Quality': 'walls',
  'TabPrint/Strength/Walls': 'walls',
  'TabPrint/Strength': 'shells_infill',
  'TabPrint/Speed': 'speed',
  'TabPrint/Support': 'support',
  'TabPrint/Multimaterial': 'multi_material',
  'TabPrint/Others/Skirt': 'adhesion',
  'TabPrint/Others/Brim': 'adhesion',
  'TabPrint/Others/Bed adhension': 'adhesion',
  'TabPrint/Others/Prime tower': 'multi_material',
  'TabPrint/Others/Flush options': 'multi_material',
  'TabPrint/Others/Special mode': 'special',
  'TabPrint/Others/Fuzzy skin': 'special',
  'TabPrint/Others/Advanced': 'special',
  'TabPrint/Others/Notes': 'special',
  'TabPrint/Others': 'gcode',
  'TabPrintPlate/Plate Settings': 'plate',
  'TabFilament/Setting Overrides': 'material',
  'TabFilament/Filament': 'material',
  'TabFilament/Cooling': 'cooling',
  'TabFilament/Advanced': 'gcode',
  'TabFilament/Multimaterial': 'multi_material',
  'TabFilament/Multi Filament': 'multi_material',
  'TabFilament/Dependencies': 'material',
  'TabFilament/Notes': 'material',
  'TabPrinter/Basic information/Plugin Configuration': 'gcode',
  'TabPrinter/Basic information': 'machine',
  'TabPrinter/Machine G-code': 'gcode',
  'TabPrinter/Machine gcode': 'gcode',
  'TabPrinter/Notes': 'machine',
  'TabPrinter/Motion ability': 'machine',
  'TabPrinter/Multimaterial': 'multi_material',
  // The printer's extruder pages, retraction included: retraction lives in the printer, with a material override.
  'TabPrinter/Extruder': 'machine',
  'TabPrinter/page_name': 'machine',
};

export const tabGroup = (p: GuiPlace): Group => {
  const g = TAB_GROUPS[`${p.cls}/${p.page}/${p.group}`] ?? TAB_GROUPS[`${p.cls}/${p.page}`];
  if (!g)
    throw new Error(`${p.cls}/${p.page}/${p.group} (line ${p.line}): no group for this page; add it to TAB_GROUPS`);
  return g;
};

const TAB_HOMES: { [cls: string]: HomeEntity } = {
  TabPrint: 'process',
  TabPrintPlate: 'plate',
  TabFilament: 'material',
  TabPrinter: 'printer_model',
};

/** The home of a key in `group` shown by an entity's tab (`TabFilament`: material), within the group's homes. */
export const homeOf = (group: Group, tab: HomeEntity, key: string): HomeEntity => {
  const homes: readonly HomeEntity[] = GROUPS.find((g) => g.id === group)!.homes;
  if (group === 'machine' && /^nozzle_/.test(key)) return 'nozzle';
  return homes.includes(tab) ? tab : homes[0]!;
};

/** The config classes that decide a key's override scope (`PrintConfig.hpp`). */
export interface ConfigClasses {
  object: Set<string>;
  region: Set<string>;
}

/**
 * Regroups the entries of one dialect's file by that dialect's pages. A key on a page gets the page's group and the
 * tab's home and is not hidden; a key on no page keeps the generator's nearest-category group and is hidden. Every
 * entry gets an override scope. `nameOf` gives the entry's key in the scanned source.
 */
export const assignTabs = (
  file: CatalogueFile,
  places: Map<string, GuiPlace>,
  classes: ConfigClasses,
  plate: Set<string>,
  nameOf: (key: string) => string = (k) => k,
): void => {
  for (const [key, e] of Object.entries(file.entries)) {
    const name = nameOf(key);
    const p = places.get(name);
    if (p) {
      e.group = tabGroup(p);
      e.home = homeOf(e.group, TAB_HOMES[p.cls]!, name);
      delete e.hidden;
      // Orca's filament page overrides these printer keys with `filament_<key>`.
      if (p.cls === 'TabPrinter' && file.entries[`filament_${key}`]) e.overridable_in = ['material'];
    } else e.hidden = true;
    e.override_scope = e.home === 'plate' ? ['plate'] : overrideScope(name, classes, plate);
  }
};

// ---- SuperSlicer `.ui` pages and PrusaSlicer keys ----

/**
 * SuperSlicer `.ui` file, page (and group) onto E11's groups, as the matrix counts them (feature-matrix.md §1:
 * Width & Flow is extrusion, Modifying slices special, Speed & PA and the overrides material, Output options
 * G-code, `extruder.ui` machine). A place missing here fails the generator.
 */
export const UI_GROUPS: { [place: string]: Group } = {
  'print/Perimeters & Shell/Horizontal shells': 'shells_infill',
  'print/Perimeters & Shell/Infill': 'shells_infill',
  'print/Perimeters & Shell/Avoid crossing perimeters': 'extrusion',
  'print/Perimeters & Shell': 'walls',
  'print/Infill': 'shells_infill',
  'print/Slicing/Modifying slices': 'special',
  'print/Slicing': 'layers',
  'print/Speed': 'speed',
  'print/Width & Flow': 'extrusion',
  'print/Skirt & Brim': 'adhesion',
  'print/Support material': 'support',
  'print/Multiple extruders': 'multi_material',
  'print/Output options': 'gcode',
  'print/Notes': 'special',
  'filament/Filament': 'material',
  'filament/Cooling': 'cooling',
  'filament/Multimaterial': 'multi_material',
  'filament/Speed & Pressure advance': 'material',
  'filament/Notes': 'material',
  filament_override: 'material',
  'printer_fff/Custom G-code': 'gcode',
  printer_fff: 'machine',
  extruder: 'machine',
};

const UI_HOMES: { [file: string]: HomeEntity } = {
  print: 'process',
  filament: 'material',
  filament_override: 'material',
  printer_fff: 'printer_model',
  extruder: 'printer_model',
};

/** The group and home of a key on a SuperSlicer `.ui` page (`file` is the path of the `.ui` file). */
export const uiGroup = (file: string, page: string, group: string, key: string): { group: Group; home: HomeEntity } => {
  const ui = /([a-z_]+)\.ui$/.exec(file)?.[1] ?? '';
  const g = UI_GROUPS[`${ui}/${page}/${group}`] ?? UI_GROUPS[`${ui}/${page}`] ?? UI_GROUPS[ui];
  if (!g || !UI_HOMES[ui]) throw new Error(`${file}: ${page} > ${group}: no group for this page; add it to UI_GROUPS`);
  return { group: g, home: homeOf(g, UI_HOMES[ui], key) };
};

/**
 * PrusaSlicer keys with no Orca equivalent whose nearest-category group (from key patterns) is wrong. PrusaSlicer
 * 2.9 gives most of them no category, so this is the judgement: `prusa.` key -> group, home.
 */
export const PRUSA_GROUPS: { [key: string]: { group: Group; home: HomeEntity } } = {
  // Prusa category "Layers and Perimeters" (PrusaSlicer@b028299:src/libslic3r/PrintConfig.cpp, gap_fill_enabled).
  'prusa.gap_fill_enabled': { group: 'walls', home: 'process' },
  // M73 remaining-time output.
  'prusa.remaining_times': { group: 'gcode', home: 'printer_model' },
  'prusa.multimaterial_purging': { group: 'multi_material', home: 'printer_model' },
  'prusa.nozzle_high_flow': { group: 'machine', home: 'nozzle' },
};

/**
 * Retraction and travel lift live in the printer (`machine`): the keys the generators placed in `extrusion` with a
 * printer home move there. Any printer key whose filament has its own copy (`<prefix>filament_<key>`, the Orca,
 * PrusaSlicer and SuperSlicer filament overrides) is overridable in the material, and a copy on no page sits in
 * `material` with its shown siblings.
 */
export const retractionInMachine = (file: CatalogueFile, twin: (key: string) => CatalogueEntry | undefined): void => {
  for (const [key, e] of Object.entries(file.entries)) {
    if (e.home !== 'printer_model') continue;
    if (e.group === 'extrusion') e.group = 'machine';
    const t = twin(key);
    if (!t) continue;
    e.overridable_in = ['material'];
    if (t.hidden && t.home === 'material') t.group = 'material';
  }
};

// ---- The group-count report (groups.json) ----

/** The dialects E11's table has a column for, in its order. */
export const TABLE_DIALECTS = ['prusa3', 'superslicer', 'bambu', 'orca', 'cura'] as const;
type TableDialect = (typeof TABLE_DIALECTS)[number];

/**
 * E11's table (`.ai/kanban/epics/E11-unified-schema-and-evaluator.md`, from feature-matrix.md §1): keys per group on
 * the slicer's GUI pages (Cura: per category, all keys). `null`: the table gives no number (PrusaSlicer spreads its
 * special modes; its plate settings are per-bed containers). Bambu's column is the matrix's approximation.
 */
export const EPIC_TABLE: { [G in Group]: { [D in TableDialect]: number | null } } = {
  layers: { prusa3: 37, superslicer: 28, bambu: 13, orca: 21, cura: 15 },
  walls: { prusa3: 22, superslicer: 67, bambu: 37, orca: 75, cura: 34 },
  shells_infill: { prusa3: 15, superslicer: 55, bambu: 54, orca: 70, cura: 86 },
  support: { prusa3: 51, superslicer: 46, bambu: 41, orca: 49, cura: 110 },
  adhesion: { prusa3: 13, superslicer: 19, bambu: 7, orca: 20, cura: 79 },
  speed: { prusa3: 47, superslicer: 54, bambu: 49, orca: 50, cura: 76 },
  extrusion: { prusa3: 19, superslicer: 43, bambu: 9, orca: 9, cura: 25 },
  cooling: { prusa3: 17, superslicer: 20, bambu: 23, orca: 23, cura: 17 },
  material: { prusa3: 34, superslicer: 64, bambu: 58, orca: 70, cura: 60 },
  multi_material: { prusa3: 56, superslicer: 53, bambu: 42, orca: 97, cura: 30 },
  machine: { prusa3: 52, superslicer: 77, bambu: 51, orca: 104, cura: 101 },
  gcode: { prusa3: 16, superslicer: 31, bambu: 15, orca: 22, cura: 12 },
  special: { prusa3: null, superslicer: 17, bambu: 16, orca: 22, cura: 126 },
  plate: { prusa3: null, superslicer: 0, bambu: 5, orca: 5, cura: 0 },
};

/**
 * Every Orca key whose place here differs from where the matrix counted it (VSS-3's page scan,
 * `.reference/notes/VSS-3-features-bambustudio-orcaslicer.md`): `matrix` is the group it counted the key in, absent
 * when it did not count it. With these, each Orca group's `shown` equals E11's number; groupReport checks it.
 */
export const ORCA_DELTAS: { [key: string]: { matrix?: Group; reason: string } } = {
  ...Object.fromEntries(
    ['acceleration', 'jerk'].flatMap((m) =>
      AXES.map((a) => [
        `machine_max_${m}_${a}`,
        { reason: 'appended as "machine_max_<limit>_" + axis; VSS-3 missed it' },
      ]),
    ),
  ),
  nozzle_diameter: { reason: 'on the extruder page; VSS-3 met it first in a config read before any page' },
  notes: { reason: 'process notes: the matrix counts no Notes page' },
  filament_notes: { reason: 'filament notes: the matrix counts no Notes page' },
  printer_notes: { reason: 'printer notes: the matrix counts no Notes page' },
  compatible_printers: { reason: 'filament Dependencies page, which the matrix does not count' },
  compatible_printers_condition: { reason: 'filament Dependencies page, which the matrix does not count' },
  compatible_prints: { reason: 'filament Dependencies page, which the matrix does not count' },
  compatible_prints_condition: { reason: 'filament Dependencies page, which the matrix does not count' },
  print_plugin_config_overrides: { reason: 'Plugin Configuration group, which VSS-3 did not read' },
  filament_plugin_config_overrides: { reason: 'Plugin Configuration group, which VSS-3 did not read' },
  printer_plugin_config_overrides: { reason: 'Plugin Configuration group, which VSS-3 did not read' },
  filament_start_gcode: { matrix: 'material', reason: 'filament G-code is gcode (home material), not filament' },
  filament_end_gcode: { matrix: 'material', reason: 'filament G-code is gcode (home material), not filament' },
  filament_change_extrusion_role_gcode: {
    matrix: 'material',
    reason: 'filament G-code is gcode (home material), not filament',
  },
  imex_gantry_count: { matrix: 'machine', reason: 'IDEX/IQEX Configuration group of the multimaterial page' },
  imex_tools_per_gantry: { matrix: 'machine', reason: 'IDEX/IQEX Configuration group of the multimaterial page' },
  imex_tool_layout: { matrix: 'machine', reason: 'IDEX/IQEX Configuration group of the multimaterial page' },
  imex_mode_active_tools: {
    matrix: 'multi_material',
    reason: 'hidden: written by the IDEX modes widget (set_key_value), which the scan does not read as a page line',
  },
  imex_mode_gcodes: {
    matrix: 'multi_material',
    reason: 'hidden: written by the IDEX modes widget (set_key_value), which the scan does not read as a page line',
  },
  first_layer_print_sequence: { matrix: 'plate', reason: 'hidden: the plate tab creates it but shows no line for it' },
  other_layers_print_sequence: { matrix: 'plate', reason: 'hidden: the plate tab creates it but shows no line for it' },
  thumbnails_format: { matrix: 'machine', reason: 'hidden: its page line is commented out (Tab.cpp:5514)' },
};

/** Why a hidden key is hidden, from the dialect that owns it and the source its provenance cites. */
export const hiddenReason = (key: string, e: CatalogueEntry): string => {
  const p = e.provenance ?? '';
  if (key.startsWith('cura.')) return 'Cura command_line_settings: set by the front end, on no settings page';
  if (key.startsWith('superslicer.')) return 'on no SuperSlicer@1f3d287 .ui page';
  if (key.startsWith('bambu.')) return 'on no BambuStudio@79df7ae Tab.cpp page';
  if (key.startsWith('prusa.hw_'))
    return 'PrusaSlicer@30ef591 hardware feature of the printer model (vendor.yaml, ValueMapBuilder.cpp), on no settings page';
  if (key.startsWith('prusa.'))
    return p.includes('slic3r-domain')
      ? 'PrusaSlicer@30ef591 category Hidden'
      : 'in no PrusaSlicer preset list (Preset.cpp), so on no settings page';
  return 'on no OrcaSlicer@09aa0114 Tab.cpp page';
};

interface Count {
  table: number | null;
  shown: number;
  hidden: number;
}

export interface GroupReport {
  notice: string;
  /** Per dialect and group: E11's number, and the catalogue's keys of that dialect shown on a page and hidden. */
  counts: { [D in Dialect]?: { [G in Group]?: Count } & { total: Count } };
  /** Why the other dialects' counts differ from E11's table. */
  notes: { [D in Dialect]?: string };
  /** Orca keys placed elsewhere than the matrix counted them, which reconcile Orca's counts with E11's table. */
  orca_deltas: typeof ORCA_DELTAS;
  /** Every hidden key, with the reason. */
  hidden: { [key: string]: string };
}

export const REPORT_NOTICE =
  'Generated by tools/catalogue/generate.ts (PRF-18) from the catalogue data files; key names only, no ported text. ' +
  "`table` is E11's group table, `shown` the dialect's keys in that group on a GUI page of the slicer (Cura: not a " +
  'command-line setting), `hidden` the rest. A key counts once per dialect that names it. Do not edit; regenerate.';

/** Why the other columns do not match key for key: a key shared with Orca sits in Orca's group (D9). */
export const DIALECT_NOTES: { [D in Dialect]?: string } = {
  bambu:
    "E11's Bambu column is the matrix's approximation from Orca's layout; Bambu names of Orca keys take Orca's group, " +
    'and bambu. keys their BambuStudio@79df7ae Tab.cpp page.',
  prusa: "E11 has no PrusaSlicer 2.9 column. Prusa names of Orca keys take Orca's group; prusa. keys their category.",
  prusa3:
    "E11's PrusaSlicer column counts the 3.0 GUI headings (Layers & Surfaces holds perimeters and shells); here 3.0 " +
    "names of Orca keys take Orca's group, and 3.0 legacy and hardware names count as hidden.",
  superslicer:
    "SuperSlicer names of Orca and prusa. keys take that entry's group; superslicer. keys their .ui page, as the " +
    'matrix counts them.',
  cura:
    "E11's Cura column counts every key by Cura category. The 138 Cura names of Orca keys take Orca's group; " +
    'start/end G-code moves from machine_settings to gcode and retraction from travel to machine (with a material ' +
    'override); command-line settings are hidden.',
};

const DIALECTS: Dialect[] = ['orca', 'bambu', 'prusa', 'prusa3', 'superslicer', 'cura'];

/**
 * Group counts per dialect against E11's table, and the hidden keys with their reasons. `files[0]` is orca.json; its
 * counts must match the table exactly once ORCA_DELTAS are applied, or this throws.
 */
export const groupReport = (files: CatalogueFile[]): GroupReport => {
  const counts: GroupReport['counts'] = {};
  const hidden: { [key: string]: string } = {};
  for (const d of DIALECTS) {
    const table = (g: Group) =>
      (TABLE_DIALECTS as readonly string[]).includes(d) ? EPIC_TABLE[g][d as TableDialect] : null;
    const c: { [g: string]: Count } = Object.fromEntries(
      GROUPS.map((g) => [g.id, { table: table(g.id), shown: 0, hidden: 0 }]),
    );
    for (const f of files)
      for (const e of Object.values(f.entries)) if (e.native[d]) c[e.group]![e.hidden ? 'hidden' : 'shown']++;
    const sum = (k: 'shown' | 'hidden') => Object.values(c).reduce((n, x) => n + x[k], 0);
    const tables = Object.values(c).map((x) => x.table);
    c.total = {
      table: tables.every((x) => x === null) ? null : tables.reduce<number>((n, x) => n + (x ?? 0), 0),
      shown: sum('shown'),
      hidden: sum('hidden'),
    };
    counts[d] = c as GroupReport['counts'][Dialect];
  }
  for (const f of files)
    for (const [key, e] of Object.entries(f.entries)) if (e.hidden) hidden[key] = hiddenReason(key, e);
  const orca = files[0]!.entries;
  for (const g of GROUPS) {
    const c = counts.orca![g.id]!;
    const delta = Object.entries(ORCA_DELTAS).reduce((n, [key, d]) => {
      const e = orca[key];
      if (!e) throw new Error(`${key}: ORCA_DELTAS names no Orca entry`);
      return n + (!e.hidden && e.group === g.id ? 1 : 0) - (d.matrix === g.id ? 1 : 0);
    }, 0);
    if (c.shown - c.table! !== delta)
      throw new Error(`${g.id}: ${c.shown} Orca keys shown, E11 has ${c.table}, ORCA_DELTAS explain ${delta}`);
  }
  const sorted = Object.fromEntries(Object.entries(hidden).sort(([a], [b]) => (a < b ? -1 : 1)));
  return { notice: REPORT_NOTICE, counts, notes: DIALECT_NOTES, orca_deltas: ORCA_DELTAS, hidden: sorted };
};
