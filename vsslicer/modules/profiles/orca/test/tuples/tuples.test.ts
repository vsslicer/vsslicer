// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-128: resolved (printer, nozzle, material, process) values for 20 Orca and Bambu tuples against the oracle chosen
// in PRF-21 (vsslicer/fixtures/profile-research/oracle.md): OrcaSlicer CLI golden files for both trees, plus
// hand-checked expectations for the Bambu tree (docs/research/profiles.md:94-102). Fixtures only; no printer, no CLI.
import { merge } from '@vsslicer/profile-api';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import type { OrcaTree } from '../../src/adapters/tree/read-tree.ts';
import {
  compare,
  fixtureRoot,
  goldenPath,
  loadTree,
  resolveTuple,
  TUPLES,
  type Golden,
  type Resolved,
  type TreeId,
  type Tuple,
} from './oracle.ts';

const TREES = ['orca', 'bambu'] as const;
const golden = (tree: TreeId): Golden => JSON.parse(readFileSync(goldenPath(tree), 'utf8'));
const trees = new Map<TreeId, OrcaTree>();
beforeAll(async () => {
  for (const t of TREES) trees.set(t, await loadTree(t));
});

describe('tuples against the OrcaSlicer CLI export', () => {
  it('covers at least 20 tuples, the H2C 0.4 nozzle with Bambu PLA Basic and 0.20mm Standard among them', () => {
    expect(TUPLES.orca.length + TUPLES.bambu.length).toBeGreaterThanOrEqual(20);
    for (const tree of TREES) {
      const g = golden(tree);
      expect(g.orca).toMatch(/^OrcaSlicer-/);
      expect(
        g.tuples.map(({ vendor, machine, process, filament }) => ({ vendor, machine, process, filament })),
      ).toEqual(TUPLES[tree]);
      expect(TUPLES[tree]).toContainEqual({
        vendor: 'BBL',
        machine: 'Bambu Lab H2C 0.4 nozzle',
        process: '0.20mm Standard @BBL H2C',
        filament: 'Bambu PLA Basic @BBL H2C',
      });
    }
  });

  for (const tree of TREES)
    for (const [i, t] of TUPLES[tree].entries())
      it(`${tree}: ${t.machine} + ${t.process} + ${t.filament}`, () => {
        const g = golden(tree).tuples[i]!;
        expect(compare(g, resolveTuple(trees.get(tree)!, t))).toEqual([]);
        // the oracle compares real values, not only bookkeeping (counts are fixed by the golden file)
        expect(Object.keys(g.export.machine).length).toBeGreaterThan(50);
        expect(Object.keys(g.export.process).length).toBeGreaterThan(50);
        expect(Object.keys(g.export.filament).length).toBeGreaterThan(20);
      });
});

/** IDENTITY keys of read-tree.ts, which are not settings. */
const IDENTITY = new Set(['type', 'name', 'inherits', 'include', 'instantiation', 'setting_id', 'filament_id']);
type Layer = Record<string, unknown>;
type Order = 'parent-include-own' | 'own-include-parent' | 'include-parent-own';

/** An independent hand merge of the raw fixture files with profile-api's `merge`, in a chosen layer order. */
function handMerge(tree: TreeId, t: Tuple, order: Order): Resolved {
  const lists = { machine: 'machine_list', process: 'process_list', filament: 'filament_list' } as const;
  const layers = (type: keyof typeof lists, name: string, depth = 0): Layer[] => {
    if (depth > 32) throw new Error('chain too deep');
    for (const v of [t.vendor, 'OrcaFilamentLibrary']) {
      let index: Record<string, { name: string; sub_path: string }[]>;
      try {
        index = JSON.parse(readFileSync(join(fixtureRoot(tree), `${v}.json`), 'utf8'));
      } catch {
        continue;
      }
      const e = index[lists[type]]?.find((x) => x.name === name);
      if (!e) continue;
      const json = JSON.parse(readFileSync(join(fixtureRoot(tree), v, e.sub_path), 'utf8')) as Layer;
      const own = Object.fromEntries(Object.entries(json).filter(([k]) => !IDENTITY.has(k)));
      const parent = typeof json.inherits === 'string' ? layers(type, json.inherits, depth + 1) : [];
      const includes = ((json.include ?? []) as string[]).flatMap((n) => layers(type, n, depth + 1));
      if (order === 'parent-include-own') return [...parent, ...includes, own];
      if (order === 'include-parent-own') return [...includes, ...parent, own];
      return [own, ...includes, ...parent];
    }
    throw new Error(`${type} '${name}' is not in the ${tree} fixture`);
  };
  return {
    machine: merge(layers('machine', t.machine)),
    process: merge(layers('process', t.process)),
    filament: merge(layers('filament', t.filament)),
  };
}

describe('the oracle catches a merge-order bug', () => {
  for (const tree of TREES)
    it(`${tree}: a hand merge in Orca order agrees; parent last or includes under the parent disagree`, () => {
      const g = golden(tree);
      let withIncludes = 0;
      for (const [i, t] of TUPLES[tree].entries()) {
        const tuple = g.tuples[i]!;
        expect(compare(tuple, handMerge(tree, t, 'parent-include-own'))).toEqual([]);
        expect(compare(tuple, handMerge(tree, t, 'own-include-parent')).length).toBeGreaterThan(0);
        if (compare(tuple, handMerge(tree, t, 'include-parent-own')).length > 0) withIncludes++;
      }
      // every BBL machine includes G-code templates that replace its parent's (fdm_machine_common) G-code
      expect(withIncludes).toBeGreaterThanOrEqual(TUPLES[tree].filter((t) => t.vendor === 'BBL').length);
    });
});

/**
 * Hand-checked against the fixture files (Bambu rules: parent, then each include in order, then own keys;
 * docs/research/profiles.md:94-102). Each value names the layer that sets it last; paths are under
 * fixtures/bambu/BBL/ (BambuStudio@79df7ae).
 */
const HAND: readonly {
  machine: string;
  checks: readonly [type: keyof Resolved | 'filament_id' | 'setting_id', key: string, value: unknown, from: string][];
}[] = [
  {
    machine: 'Bambu Lab H2C 0.4 nozzle',
    checks: [
      [
        'machine',
        'printable_height',
        '325',
        'machine/fdm_bbl_3dp_002_common.json:276 over fdm_machine_common.json:116',
      ],
      ['machine', 'extruder_clearance_max_radius', '96', 'machine/Bambu Lab H2C 0.4 nozzle.json:39 (own)'],
      ['machine', 'machine_switch_extruder_time', '5', 'machine/fdm_bbl_3dp_002_common.json:245 (Bambu-only)'],
      ['machine', 'nozzle_diameter', ['0.4', '0.4'], 'machine/Bambu Lab H2C 0.4 nozzle.json:8'],
      ['machine', 'machine_start_gcode', ';===== machine: H2C =', 'template machine_start_gcode.json:4 (include)'],
      ['process', 'outer_wall_speed', ['200', '500', '500', '200', '500'], 'process/0.20mm Standard @BBL H2C.json:46'],
      ['process', 'prime_tower_lift_speed', '90', 'process/fdm_process_common.json:96 (Bambu-only)'],
      ['process', 'sparse_infill_density', '15%', 'process/fdm_process_common.json:112'],
      ['filament', 'nozzle_temperature', ['220', '220', '220'], 'filament/Bambu PLA Basic @BBL H2C.json:122'],
      ['filament', 'filament_max_volumetric_speed', ['25', '40', '25'], 'filament/Bambu PLA Basic @BBL H2C.json:45'],
      ['filament', 'filament_vendor', ['Bambu Lab'], 'filament/Bambu PLA Basic @base.json:29'],
      ['filament', 'filament_scarf_seam_type', ['none'], 'filament/fdm_filament_common.json:219 (Bambu-only)'],
      ['filament_id', '', 'GFA00', 'filament/Bambu PLA Basic @base.json:6 (inherited)'],
      ['setting_id', '', 'GFSA00_22', 'filament/Bambu PLA Basic @BBL H2C.json:6 (own)'],
    ],
  },
  {
    machine: 'Bambu Lab X1 Carbon 0.4 nozzle',
    checks: [
      ['machine', 'printable_height', '250', 'machine/fdm_machine_common.json:116'],
      ['machine', 'extruder_clearance_max_radius', '68', 'machine/fdm_bbl_3dp_001_common.json:35'],
      ['machine', 'machine_start_gcode', ';===== machine: X1-0.4 =', 'template machine_start_gcode.json:4 (include)'],
      ['process', 'initial_layer_speed', ['50', '50'], 'process/0.20mm Standard @BBL X1C.json:29 (own)'],
      ['process', 'top_shell_layers', '5', 'process/fdm_process_single_0.20.json:30'],
      ['filament', 'filament_max_volumetric_speed', ['21', '29'], 'filament/Bambu PLA Basic @BBL X1C.json:16'],
      ['filament_id', '', 'GFA00', 'filament/Bambu PLA Basic @base.json:6 (inherited)'],
      ['setting_id', '', 'GFSA00', 'filament/Bambu PLA Basic @BBL X1C.json:6'],
    ],
  },
  {
    machine: 'Bambu Lab P1S 0.4 nozzle',
    checks: [
      ['machine', 'printable_height', '250', 'machine/fdm_machine_common.json:116'],
      ['machine', 'extruder_clearance_max_radius', '68', 'machine/fdm_bbl_3dp_001_common.json:35'],
      ['machine', 'machine_start_gcode', ';===== machine: P1S-0.4 =', 'template machine_start_gcode.json:4 (include)'],
      ['process', 'initial_layer_speed', ['50', '50'], 'process/0.20mm Standard @BBL X1C.json:29'],
      [
        'filament',
        'filament_max_volumetric_speed',
        ['21', '29'],
        'filament/Bambu PLA Basic @BBL P1S 0.4 nozzle.json:20',
      ],
      ['setting_id', '', 'GFSA00_34', 'filament/Bambu PLA Basic @BBL P1S 0.4 nozzle.json:6'],
    ],
  },
  {
    machine: 'Bambu Lab A1 0.4 nozzle',
    checks: [
      ['machine', 'printable_height', '256', 'machine/Bambu Lab A1 0.4 nozzle.json:69 (own)'],
      ['machine', 'extruder_clearance_max_radius', '73', 'machine/Bambu Lab A1 0.4 nozzle.json:23 over 3dp_001:35'],
      ['machine', 'machine_start_gcode', ';===== machine: A1 =', 'template machine_start_gcode.json:4 (include)'],
      ['process', 'initial_layer_speed', ['50'], 'process/fdm_process_single_0.20.json:15'],
      ['process', 'top_shell_layers', '5', 'process/fdm_process_single_0.20.json:30'],
      ['filament', 'filament_max_volumetric_speed', ['21'], 'filament/Bambu PLA Basic @base.json:20'],
      ['setting_id', '', 'GFSA00_04', 'filament/Bambu PLA Basic @BBL A1.json:6'],
    ],
  },
  {
    machine: 'Bambu Lab H2D 0.4 nozzle',
    checks: [
      ['machine', 'printable_height', '325', 'machine/fdm_bbl_3dp_002_common.json:276'],
      ['machine', 'extruder_clearance_max_radius', '96', 'machine/Bambu Lab H2D 0.4 nozzle.json:35'],
      ['machine', 'machine_start_gcode', ';===== machine: H2D =', 'template machine_start_gcode.json:4 (include)'],
      ['process', 'initial_layer_speed', Array(7).fill('50'), 'process/0.20mm Standard @BBL H2D.json:55'],
      ['process', 'top_shell_layers', '5', 'process/fdm_process_dual_0.20_nozzle_0.4.json:45'],
      ['filament', 'filament_max_volumetric_speed', ['25', '40', '25'], 'filament/Bambu PLA Basic @BBL H2D.json:48'],
      ['setting_id', '', 'GFSA00_12', 'filament/Bambu PLA Basic @BBL H2D.json:6'],
    ],
  },
  {
    machine: 'Bambu Lab A1 mini 0.4 nozzle',
    checks: [
      ['machine', 'printable_height', '180', 'machine/Bambu Lab A1 mini 0.4 nozzle.json:69'],
      ['machine', 'extruder_clearance_max_radius', '73', 'machine/Bambu Lab A1 mini 0.4 nozzle.json:24'],
      ['machine', 'machine_start_gcode', ';===== machine: A1 mini =', 'template machine_start_gcode.json:4 (include)'],
      ['process', 'top_shell_layers', '5', 'process/fdm_process_single_0.20.json:30'],
      ['filament', 'filament_max_volumetric_speed', ['21'], 'filament/Bambu PLA Basic @base.json:20'],
      ['setting_id', '', 'GFSA00_02', 'filament/Bambu PLA Basic @BBL A1M.json:6'],
    ],
  },
];

describe('Bambu tuples against hand-checked expectations', () => {
  it('has a hand check for every Bambu tuple', () => {
    expect(HAND.map((h) => h.machine)).toEqual(TUPLES.bambu.map((t) => t.machine));
  });
  for (const [i, h] of HAND.entries())
    it(h.machine, () => {
      const tree = trees.get('bambu')!;
      const t = TUPLES.bambu[i]!;
      const r = resolveTuple(tree, t);
      const fil = tree.presets.find((p) => p.type === 'filament' && p.name === t.filament)!;
      for (const [type, key, value, from] of h.checks) {
        const got =
          type === 'filament_id' || type === 'setting_id'
            ? fil.external_ids[type]
            : key.endsWith('_gcode')
              ? String(r[type][key]).slice(0, String(value).length)
              : r[type][key];
        expect(got, `${type} ${key} (${from})`).toEqual(value);
      }
    });
});
