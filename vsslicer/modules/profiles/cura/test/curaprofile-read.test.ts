// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { writeCuraProfileArchive } from '../src/adapters/archive/curaprofile-archive.ts';
import { readCuraProfile } from '../src/adapters/bundles/cura/read.ts';

const fixture = new Uint8Array(
  readFileSync(new URL('./fixtures/curaprofile/jeremy_petg_06_super_fast.curaprofile', import.meta.url)),
);
const cfg = (v: string, type = 'quality_changes') =>
  `[general]\nversion = 4\nname = N\ndefinition = fdmprinter\n\n[metadata]\nquality_type = draft\nsetting_version = ${v}\ntype = ${type}\n\n[values]\nlayer_height = 0.3\n`;

describe('readCuraProfile', () => {
  test('the real fixture: both entries, settings and parent quality', () => {
    const r = readCuraProfile(fixture, { settingVersion: 20 });
    expect(r.diagnostics).toEqual([]);
    expect(r.entities.map((e) => e.id)).toEqual([
      'creality_ender3pro_overture_petg #2',
      'creality_base_extruder_0_overture_petg #2',
    ]);
    const [glob, ext] = r.entities as unknown as {
      name: string;
      layer_height: number;
      settings: Record<string, unknown>;
    }[];
    expect(glob!.name).toBe('Overture_PETG');
    expect(glob!.layer_height).toBe(0.2);
    expect(glob!.settings['adhesion_type']).toBe('none');
    expect(ext!.settings['infill_pattern']).toBe('gyroid');
    expect(ext!.settings['material_print_temperature']).toBe('245');
    expect((r.native['creality_ender3pro_overture_petg #2'] as Record<string, string>)['quality_type']).toBe(
      'standard',
    );
    expect((r.native['creality_base_extruder_0_overture_petg #2'] as Record<string, string>)['quality_type']).toBe(
      'standard',
    );
    expect((r.native['creality_base_extruder_0_overture_petg #2'] as Record<string, string>)['position']).toBe('0');
  });
  test('an id starting with a dot imports under that id', () => {
    const r = readCuraProfile(writeCuraProfileArchive([{ id: '.dot', text: cfg('27') }]));
    expect(r.diagnostics).toEqual([]);
    expect(r.entities.map((e) => e.id)).toEqual(['.dot']);
  });
  test('only the global entry gives the extruders their layer height', () => {
    const ext = (extra: string) => cfg('27').replace('[metadata]', '[metadata]\nposition = 0') + extra;
    const r = readCuraProfile(
      writeCuraProfileArchive([
        { id: 'g', text: cfg('27') },
        { id: 'e1', text: ext('').replace('layer_height = 0.3', 'layer_height = 0.15') },
        { id: 'e2', text: ext('').replace('layer_height = 0.3\n', '') },
      ]),
    );
    const h = Object.fromEntries(
      r.entities.map((e) => [e.id, (e as unknown as { layer_height: number }).layer_height]),
    );
    expect(h).toEqual({ g: 0.3, e1: 0.15, e2: 0.3 });
  });
  test('another setting_version gives a version diagnostic per entry', () => {
    const r = readCuraProfile(fixture);
    expect(r.entities).toHaveLength(2);
    expect(r.diagnostics.map((d) => [d.severity, d.message])).toEqual([
      ['warning', 'setting_version 20, expected 27: saved by another Cura version'],
      ['warning', 'setting_version 20, expected 27: saved by another Cura version'],
    ]);
  });
  test('ids with a slash or hash stay opaque', () => {
    const z = writeCuraProfileArchive([{ id: 'a/b #2', text: cfg('27') }]);
    const r = readCuraProfile(z);
    expect(r.diagnostics).toEqual([]);
    expect(r.entities.map((e) => e.id)).toEqual(['a/b #2']);
  });
  test('a non-archive and an over-limit archive give an error, not a throw', () => {
    expect(readCuraProfile(new Uint8Array([1, 2, 3])).diagnostics[0]!.severity).toBe('error');
    const two = writeCuraProfileArchive([
      { id: 'a', text: cfg('27') },
      { id: 'b', text: cfg('27') },
    ]);
    expect(readCuraProfile(two, { archiveLimits: { maxEntries: 2 } }).entities).toHaveLength(2);
    const over = readCuraProfile(two, { archiveLimits: { maxEntries: 1 } });
    expect(over.entities).toEqual([]);
    expect(over.diagnostics[0]!.message).toMatch(/over the limit of 1/);
  });
  test('an entry that is not a quality_changes container is reported, not imported', () => {
    const r = readCuraProfile(writeCuraProfileArchive([{ id: 'x', text: cfg('27', 'quality') }]));
    expect(r.entities).toEqual([]);
    expect(r.diagnostics).toHaveLength(1);
  });
});
