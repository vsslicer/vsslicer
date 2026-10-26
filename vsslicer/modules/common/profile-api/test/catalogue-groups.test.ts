// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-18: groups, homes, hidden keys and override scopes of every catalogue key, and the group report.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { bambuCatalogue } from '../src/domain/catalogue/bambu.ts';
import { curaCatalogue } from '../src/domain/catalogue/cura.ts';
import { prusaCatalogue } from '../src/domain/catalogue/prusa.ts';
import { superslicerCatalogue } from '../src/domain/catalogue/superslicer.ts';
import { GROUPS, orcaCatalogue, type CatalogueFile, type Group } from '../src/index.ts';
import { tokenize } from '../tools/catalogue/cpp.ts';
import { CURA_OUTPUT } from '../tools/catalogue/cura.ts';
import {
  BAMBU_OUTPUT,
  GROUPS_OUTPUT,
  OUTPUT,
  outputs,
  PRUSA_OUTPUT,
  SUPERSLICER_OUTPUT,
} from '../tools/catalogue/generate.ts';
import {
  configClass,
  EPIC_TABLE,
  groupReport,
  type GroupReport,
  ORCA_DELTAS,
  overrideScope,
  tabGroup,
  tabPlaces,
} from '../tools/catalogue/groups.ts';
import { GUARDED_TIMEOUT, guarded } from './support/guard.ts';
import { REPOS } from '../tools/catalogue/prusa.ts';

const files: CatalogueFile[] = [orcaCatalogue, bambuCatalogue, prusaCatalogue, superslicerCatalogue, curaCatalogue];
const all = files.flatMap((f) => Object.entries(f.entries));
const report = JSON.parse(readFileSync(GROUPS_OUTPUT, 'utf8')) as GroupReport;

describe('the committed catalogue', () => {
  test('gives every key a group, a home of that group and an override scope', () => {
    expect(all).toHaveLength(804 + 103 + 122 + 279 + 622);
    for (const [key, e] of all) {
      const g = GROUPS.find((x) => x.id === e.group);
      expect(g, key).toBeDefined();
      expect(g!.homes as readonly string[], key).toContain(e.home);
      expect(Array.isArray(e.override_scope), key).toBe(true);
    }
  });

  test('keeps retraction in the printer (machine) with a material override', () => {
    for (const k of [
      'retraction_length',
      'retraction_speed',
      'deretraction_speed',
      'z_hop',
      'wipe',
      'retract_lift_above',
    ])
      expect(orcaCatalogue.entries[k], k).toMatchObject({
        group: 'machine',
        home: 'printer_model',
        overridable_in: ['material'],
      });
    for (const k of ['cura.retraction_enable', 'cura.retraction_count_max', 'prusa.travel_max_lift'])
      expect(curaCatalogue.entries[k] ?? prusaCatalogue.entries[k], k).toMatchObject({
        group: 'machine',
        overridable_in: ['material'],
      });
    // Nothing printer-homed stays in extrusion.
    expect(all.filter(([, e]) => e.group === 'extrusion' && e.home !== 'process').map(([k]) => k)).toEqual([]);
  });

  test('makes every printer key with a `<prefix>filament_<key>` copy overridable in the material', () => {
    const byKey = new Map(all);
    const twins = all.filter(
      ([k, e]) => e.home === 'printer_model' && byKey.has(k.replace(/^([a-z]+\.)?/, '$1filament_')),
    );
    expect(twins.length).toBeGreaterThanOrEqual(33);
    for (const [k, e] of twins) expect(e.overridable_in, k).toContain('material');
    for (const k of ['superslicer.filament_wipe_lift_length', 'superslicer.filament_wipe_min'])
      expect(superslicerCatalogue.entries[k], k).toMatchObject({ group: 'material', home: 'material' });
  });

  test('places PrusaSlicer 3.0 sheet and feeder features on their entities', () => {
    expect(prusaCatalogue.entries['prusa.hw_sheet_type']).toMatchObject({ group: 'machine', home: 'surface' });
    expect(prusaCatalogue.entries['prusa.hw_feeder_model']).toMatchObject({ group: 'machine', home: 'feeder' });
    expect(prusaCatalogue.entries['prusa.hw_printer_tool_count']).toMatchObject({ home: 'printer_model' });
  });

  test('records where a setting may be overridden', () => {
    const scope = (k: string) => orcaCatalogue.entries[k]!.override_scope;
    expect(scope('wall_loops')).toEqual(['object', 'part', 'height_range']);
    expect(scope('layer_height')).toEqual(['object', 'height_range']);
    expect(scope('brim_width')).toEqual(['object']);
    expect(scope('curr_bed_type')).toEqual(['plate']);
    expect(scope('spiral_mode')).toEqual(['plate']);
    expect(scope('nozzle_diameter')).toEqual([]);
    expect(curaCatalogue.entries['cura.infill_mesh']?.override_scope).toEqual(['object', 'part']);
  });

  test('has the P1 groups (multi_material, special, plate) as schema with pass-through keys', () => {
    for (const g of ['multi_material', 'special', 'plate'] as Group[]) {
      expect(GROUPS.map((x) => x.id)).toContain(g);
      expect(
        all.some(([, e]) => e.group === g),
        g,
      ).toBe(true);
    }
  });
});

describe('the group report (groups.json)', () => {
  test('is the report of the committed data', () => {
    expect(report).toEqual(JSON.parse(JSON.stringify(groupReport(files))));
  });

  test("matches E11's Orca column exactly once the listed Orca deltas are applied", () => {
    for (const { id } of GROUPS) {
      const c = report.counts.orca![id]!;
      expect(c.table, id).toBe(EPIC_TABLE[id].orca);
      const delta = Object.entries(ORCA_DELTAS).reduce((n, [k, d]) => {
        const e = orcaCatalogue.entries[k]!;
        return n + (!e.hidden && e.group === id ? 1 : 0) - (d.matrix === id ? 1 : 0);
      }, 0);
      expect(c.shown - c.table!, id).toBe(delta);
    }
    expect(report.counts.orca!.total).toEqual({ table: 637, shown: 651, hidden: 153 });
  });

  test('lists every hidden key, and only those, with a reason', () => {
    const hidden = all.filter(([, e]) => e.hidden).map(([k]) => k);
    expect(Object.keys(report.hidden).sort()).toEqual(hidden.sort());
    for (const [k, why] of Object.entries(report.hidden)) expect(why.length, k).toBeGreaterThan(10);
    expect(report.hidden['cura.center_object']).toMatch(/command_line_settings/);
    expect(report.hidden['prusa.hw_sheet_type']).toMatch(/hardware feature/);
  });

  test('throws when an Orca count drifts from the table without a listed delta', () => {
    const drifted = structuredClone(orcaCatalogue);
    drifted.entries.layer_height!.group = 'walls';
    expect(() => groupReport([drifted, ...files.slice(1)])).toThrow(/layers: 20 Orca keys shown, E11 has 21/);
  });
});

describe('the Tab.cpp page scan', () => {
  const src = `
    void TabX::build() {
      m_config->option<ConfigOptionFloats>("a")->values;
      auto page = add_options_page(L("Quality"), "icon");
      auto optgroup = page->new_optgroup(L("Layer height"), L"icon");
      optgroup->append_single_option_line("a");
      optgroup->append_single_option_line("b", "doc#anchor");
      if (m_config->opt_bool("c")) toggle_option("c", true);
      optgroup = page->new_optgroup(L("Seam"));
      optgroup->append_single_option_line("b");
      append_option_line(optgroup, "m_" + axis);
      helper();
      helper();
    }
    void helper() { optgroup->append_single_option_line("h"); helper(); }`;
  const t = tokenize(src);
  const known = (k: string) => ['a', 'b', 'c', 'h', 'm_x', 'm_e'].includes(k);
  const places = tabPlaces(t, [['TabX', 'build']], known, { helper: { tokens: t } });

  test('takes the first page line of a key, skipping config reads and toggles', () => {
    expect(places.get('a')).toMatchObject({ cls: 'TabX', page: 'Quality', group: 'Layer height' });
    expect(places.get('b')).toMatchObject({ group: 'Layer height' });
    expect(places.has('c')).toBe(false);
    expect([...places.keys()].sort()).toEqual(['a', 'b', 'h', 'm_e', 'm_x']);
    expect(places.get('m_x')).toMatchObject({ group: 'Seam' });
  });

  test(
    'scans a helper once, even when it calls itself (rule 25: the scan stays linear)',
    () => {
      expect(places.get('h')).toMatchObject({ group: 'Seam' });
      const body = `
      const lines = Array.from({ length: 50_000 }, (_, i) => 'o->append_single_option_line("k' + i + '"); helper();');
      const big = cpp.tokenize('void T::build() { add_options_page(L("P")); ' + lines.join('\\n') + ' } void helper() { helper(); }');
      const p = groups.tabPlaces(big, [['T', 'build']], () => true, { helper: { tokens: big } });
      if (p.size !== 50_000) throw new Error('size ' + p.size);`;
      expect(guarded(body)).toBeUndefined();
    },
    GUARDED_TIMEOUT,
  );

  test('refuses a page with no group, so a new upstream page is grouped on purpose', () => {
    expect(tabGroup({ cls: 'TabPrint', page: 'Quality', group: 'Seam', line: 1 })).toBe('walls');
    expect(() => tabGroup({ cls: 'TabPrint', page: 'Brand new', group: '', line: 9 })).toThrow(/TAB_GROUPS/);
    expect(() => tabPlaces(t, [['TabX', 'missing']], known)).toThrow(/no definition/);
  });

  test('reads config classes and derives override scopes from them', () => {
    const hpp = tokenize(`PRINT_CONFIG_CLASS_DEFINE(PrintObjectConfig, ((ConfigOptionFloat, layer_height))
      ((ConfigOptionEnum<BrimType>, brim_type)))
      PRINT_CONFIG_CLASS_DEFINE(PrintRegionConfig, ((ConfigOptionInt, wall_loops)))`);
    const classes = { object: configClass(hpp, 'PrintObjectConfig'), region: configClass(hpp, 'PrintRegionConfig') };
    expect([...classes.object]).toEqual(['layer_height', 'brim_type']);
    expect(overrideScope('wall_loops', classes)).toEqual(['object', 'part', 'height_range']);
    expect(overrideScope('brim_type', classes, new Set(['brim_type']))).toEqual(['plate', 'object']);
    expect(overrideScope('layer_height', classes)).toEqual(['object', 'height_range']);
    expect(overrideScope('gcode_flavor', classes)).toEqual([]);
    expect(() => configClass(hpp, 'GCodeConfig')).toThrow(/not found/);
  });
});

// The pinned sources live in .reference (ignored); without them only the committed data is checked.
const sources = ['OrcaSlicer', 'BambuStudio', 'PrusaSlicer', 'PrusaSlicer-2.9', 'SuperSlicer', 'Cura'].every((r) =>
  existsSync(join(REPOS, r, '.git')),
);
describe.skipIf(!sources)('outputs(), on the pinned checkouts', () => {
  test('writes every data file and the report as committed', () => {
    const out = outputs();
    for (const path of [OUTPUT, BAMBU_OUTPUT, PRUSA_OUTPUT, SUPERSLICER_OUTPUT, CURA_OUTPUT, GROUPS_OUTPUT])
      expect(out.get(path), path).toBe(readFileSync(path, 'utf8'));
  });
});
