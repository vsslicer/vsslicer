// SPDX-License-Identifier: AGPL-3.0-or-later
import { runExporterContract } from '@vsslicer/profile-api';
import type { SourceFile } from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import { CURA_EXPORT_LIMITS, curaExporter, writeCuraUserChanges } from '../src/adapters/export/cura/write.ts';
import { readCuraUserChanges } from '../src/adapters/quality/read.ts';

const enc = new TextEncoder();
const dec = new TextDecoder();
const file = (path: string, text: string): SourceFile => ({ path, bytes: enc.encode(text) });
const roundTrip = (f: SourceFile) => {
  const r = readCuraUserChanges([f]);
  expect(r.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  const out = writeCuraUserChanges(r);
  expect(out.diagnostics).toEqual([]);
  return out.files.map((x) => ({ path: x.path, text: dec.decode(x.bytes) }));
};

// Layout of a file Cura wrote (Python configparser): sorted values, a blank line after every section.
const quality = `[general]
version = 4
name = Fixture Fine
definition = fdmprinter

[metadata]
type = quality_changes
quality_type = normal
setting_version = 25
position = 0

[values]
layer_height = 0.16
wall_line_count = 3
infill_pattern = =\\n\\tsomething

`;
const withFormula = `[general]
version = 4
name = Printer A settings
definition = printer_a

[metadata]
type = definition_changes
setting_version = 27

[values]
machine_start_gcode = G28
	M104 S{material_print_temperature}
machine_width = 300
retraction_amount = =round(extruder_nr * 1.5, 2)

`;

describe('Cura user-change export', () => {
  test('a file Cura wrote is written back byte for byte, with its own setting_version', () => {
    const q = file('quality_changes/Fixture_Fine.inst.cfg', quality);
    const d = file('definition_changes/Printer_A_settings.inst.cfg', withFormula);
    expect(roundTrip(q)).toEqual([{ path: q.path, text: quality }]);
    expect(roundTrip(d)).toEqual([{ path: d.path, text: withFormula }]);
  });

  test('native metadata order is kept and the importer marker is not written', () => {
    const f = file(
      'quality_changes/o.inst.cfg',
      '[general]\nversion = 4\nname = O\ndefinition = fdmprinter\n\n[metadata]\nquality_type = fast\nposition = 0\ntype = quality_changes\nsetting_version = 25\n\n[values]\ninfill_sparse_density = 40\n\n',
    );
    expect(roundTrip(f)).toEqual([{ path: f.path, text: dec.decode(f.bytes) }]);
  });

  test('the module user fixtures round-trip apart from the final blank line', () => {
    const cfg = (g: string, m: string, v: string) =>
      `[general]\nversion = 4\n${g}\n\n[metadata]\n${m}\n\n[values]\n${v}\n`;
    const fixtures = [
      file(
        'quality_changes/my_profile.inst.cfg',
        cfg(
          'name = My profile\ndefinition = printer_a',
          'quality_type = fast\nposition = 0\ntype = quality_changes\nsetting_version = 25',
          'infill_sparse_density = 40\nlayer_height = 0.12',
        ),
      ),
      // no layer_height in [values]: the usual case, Cura stores only changed settings
      file(
        'quality_changes/no_height.inst.cfg',
        cfg(
          'name = No height\ndefinition = printer_a',
          'quality_type = fast\ntype = quality_changes\nsetting_version = 25',
          'infill_sparse_density = 40',
        ),
      ),
      file(
        'definition_changes/printer_a_settings.inst.cfg',
        cfg(
          'name = printer_a settings\ndefinition = printer_a',
          'type = definition_changes\nsetting_version = 25',
          'machine_start_gcode = =x\nmachine_width = 300',
        ),
      ),
    ];
    for (const f of fixtures) expect(roundTrip(f)).toEqual([{ path: f.path, text: dec.decode(f.bytes) + '\n' }]);
  });

  test('a {expr} value is written back as the original formula text', () => {
    const out = roundTrip(file('definition_changes/Printer_A_settings.inst.cfg', withFormula));
    expect(out[0]!.text).toContain('retraction_amount = =round(extruder_nr * 1.5, 2)\n');
  });

  test('a new file gets setting_version 27 and a type', () => {
    const r = writeCuraUserChanges({
      entities: [{ id: 'mine', name: 'Mine', layer_height: 0.2, settings: { layer_height: '0.2' } }],
      native: { mine: { definition: 'fdmprinter', quality_type: 'normal' } },
    });
    expect(dec.decode(r.files[0]!.bytes)).toBe(
      '[general]\nversion = 4\nname = Mine\ndefinition = fdmprinter\n\n[metadata]\ntype = quality_changes\nquality_type = normal\nsetting_version = 27\n\n[values]\nlayer_height = 0.2\n\n',
    );
    expect(r.files[0]!.path).toBe('quality_changes/mine.inst.cfg');
  });

  test('ids are percent-encoded so the loader reads the same id; a leading dot is hidden', () => {
    const r = writeCuraUserChanges({
      entities: [
        { id: 'a b/c+d', name: 'x', layer_height: 0.2, settings: {} },
        { id: '.hid', name: 'y', layer_height: 0.2, settings: {} },
      ],
      native: { 'a b/c+d': { definition: 'p' }, '.hid': { definition: 'p' } },
    });
    expect(r.files.map((f) => f.path)).toEqual([
      'quality_changes/a+b%2Fc%2Bd.inst.cfg',
      'quality_changes/%2Ehid.inst.cfg',
    ]);
  });

  test('refuses what cannot be read back: bad keys, no definition, wrong type, alias ids', () => {
    const e = (id: string, settings: Record<string, string> = {}) => ({ id, name: id, layer_height: 0.2, settings });
    const r = writeCuraUserChanges({
      entities: [
        e('badkey', { 'a=b': '1', ok: '2' }),
        e('spacekey', { 'a b': '1', 'c!d': '1', 'e\tf': '1' }),
        e('nodef'),
        e('wrongtype'),
        e('Dup'),
        e('dup'),
        e('inject', { x: 'a\n[values]\nevil = 1' }),
        { id: 'nothing' } as never,
      ],
      native: {
        badkey: { definition: 'p' },
        spacekey: { definition: 'p' },
        wrongtype: { definition: 'p', type: 'quality' },
        Dup: { definition: 'p' },
        dup: { definition: 'p' },
        inject: { definition: 'p' },
      },
    });
    expect(r.files.map((f) => f.path)).toEqual(['quality_changes/Dup.inst.cfg', 'quality_changes/inject.inst.cfg']);
    expect(r.diagnostics.map((d) => d.file)).toEqual(
      [
        'badkey',
        'quality_changes/spacekey.inst.cfg',
        'quality_changes/nodef.inst.cfg',
        'quality_changes/wrongtype.inst.cfg',
        'quality_changes/dup.inst.cfg',
        'nothing',
      ].map((f) => (f === 'badkey' ? 'quality_changes/badkey.inst.cfg' : f)),
    );
    // the injected header stays inside the value: reading it back gives one section set, one value
    const back = readCuraUserChanges([{ path: r.files[1]!.path, bytes: r.files[1]!.bytes }]);
    expect(back.entities[0]).toMatchObject({ settings: { x: 'a\n[values]\nevil = 1' } });
  });

  test('stops at the entity cap and the size cap', () => {
    const many = Array.from({ length: CURA_EXPORT_LIMITS.maxEntities + 1 }, (_, i) => ({
      id: `e${i}`,
      name: 'n',
      layer_height: 0.2,
      settings: {},
    }));
    const native = Object.fromEntries(many.map((e) => [e.id, { definition: 'p' }]));
    const r = writeCuraUserChanges({ entities: many, native });
    expect(r.files).toHaveLength(CURA_EXPORT_LIMITS.maxEntities);
    expect(r.diagnostics[0]!.message).toMatch(/more than/);
    const big = { id: 'big', name: 'n', layer_height: 0.2, settings: { k: 'x'.repeat(CURA_EXPORT_LIMITS.maxChars) } };
    const r2 = writeCuraUserChanges({ entities: [big], native: { big: { definition: 'p' } } });
    expect(r2.files).toEqual([]);
    expect(r2.diagnostics[0]!.message).toMatch(/characters/);
  });

  test('meets the Exporter contract', async () => {
    const sample = readCuraUserChanges([file('quality_changes/Fixture_Fine.inst.cfg', quality)]);
    await runExporterContract(curaExporter, sample);
  });
});
