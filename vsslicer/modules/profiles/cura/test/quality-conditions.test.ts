// SPDX-License-Identifier: AGPL-3.0-or-later
import { evaluate, parseCondition } from '@vsslicer/profile-api';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { MAX_PATTERN_LENGTH } from '@vsslicer/profile-api';
import {
  MAX_EXCLUDED_MATERIALS,
  MAX_REGEX_CLAUSES,
  convertExcludeMaterials,
  convertQualityMetadata,
  curaMachineFlags,
  curaQualityDefinition,
} from '../src/adapters/conditions/quality-conditions.ts';

const ctx = (model: string, nozzle: string, base: string) => ({
  printer: { model },
  nozzle: { id: nozzle },
  material: { base },
});

const ALL = { hasMachineQuality: true, hasVariants: true, hasMaterials: true };

describe('convertQualityMetadata', () => {
  test('converts definition, variant, material; quality_type is returned apart', () => {
    const r = convertQualityMetadata(
      {
        definition: 'ultimaker_s5',
        variant: 'AA 0.25',
        material: 'generic_abs',
        quality_type: 'normal',
      },
      ALL,
    );
    expect(r).toEqual({
      condition: "printer.model == 'ultimaker_s5' and nozzle.id == 'AA 0.25' and material.base == 'generic_abs'",
      qualityType: 'normal',
      globalQuality: false,
      lossy: false,
      diagnostics: [],
    });
    expect(parseCondition(r.condition!)).toBeTruthy();
    expect(evaluate(r.condition!, ctx('ultimaker_s5', 'AA 0.25', 'generic_abs'))).toEqual({ compatible: true });
    expect(evaluate(r.condition!, ctx('ultimaker_s5', 'AA 0.4', 'generic_abs'))).toEqual({ compatible: false });
  });

  test('fdmprinter and empty-looking ids are exact; global_quality is returned apart', () => {
    const r = convertQualityMetadata({ definition: 'fdmprinter', global_quality: 'True', quality_type: 'draft' }, ALL);
    expect(r).toEqual({
      condition: "printer.model == 'fdmprinter'",
      qualityType: 'draft',
      globalQuality: true,
      lossy: false,
      diagnostics: [],
    });
    // fdmprinter qualities apply only to machines without has_machine_quality.
    expect(evaluate(r.condition!, ctx(curaQualityDefinition('creality_ender3', {}), 'x', 'y'))).toEqual({
      compatible: true,
    });
    const um = curaQualityDefinition('ultimaker_s3', {
      has_machine_quality: 'True',
      quality_definition: 'ultimaker_s5',
    });
    expect(um).toBe('ultimaker_s5');
    expect(evaluate(r.condition!, ctx(um, 'x', 'y'))).toEqual({ compatible: false });
    expect(curaQualityDefinition('ultimaker_s5', { has_machine_quality: true })).toBe('ultimaker_s5');
    expect(convertQualityMetadata({ material: 'global', variant: 'empty' }, ALL).condition).toBe(
      "nozzle.id == 'empty' and material.base == 'global'",
    );
    expect(convertQualityMetadata({}, ALL)).toEqual({ globalQuality: false, lossy: false, diagnostics: [] });
  });

  test('unusable values are dropped, flagged lossy', () => {
    const r = convertQualityMetadata({ definition: 7, variant: 'x'.repeat(10_000), material: 'pla' }, ALL);
    expect(r.condition).toBe("material.base == 'pla'");
    expect(r.lossy).toBe(true);
    expect(r.diagnostics).toHaveLength(2);
  });

  test('hostile names keep their meaning', () => {
    const v = `a' or true or 'b\\`;
    const r = convertQualityMetadata({ definition: v, variant: '"\n\t', material: ') or (' }, ALL);
    expect(evaluate(r.condition!, ctx(v, '"\n\t', ') or ('))).toEqual({ compatible: true });
    expect(evaluate(r.condition!, ctx('a', 'x', 'y'))).toEqual({ compatible: false });
  });
});

describe('machine flags', () => {
  const meta = { definition: 'd', variant: 'v', material: 'm', quality_type: 'q' };
  const cases: [boolean, boolean, boolean, string][] = [
    [true, true, true, "printer.model == 'd' and nozzle.id == 'v' and material.base == 'm'"],
    [true, false, true, "printer.model == 'd' and material.base == 'm'"],
    [true, true, false, "printer.model == 'd'"],
    [true, false, false, "printer.model == 'd'"],
    [false, true, true, "printer.model == 'd'"],
    [false, false, true, "printer.model == 'd'"],
    [false, true, false, "printer.model == 'd'"],
    [false, false, false, "printer.model == 'd'"],
  ];
  test.each(cases)('has_machine_quality=%s has_variants=%s has_materials=%s', (q, v, m, condition) => {
    const r = convertQualityMetadata(meta, { hasMachineQuality: q, hasVariants: v, hasMaterials: m });
    expect(r).toEqual({ condition, qualityType: 'q', globalQuality: false, lossy: false, diagnostics: [] });
    expect(parseCondition(condition)).toBeTruthy();
  });

  test('flags parse like Uranium parseBool, with Cura defaults', () => {
    expect(curaMachineFlags({})).toEqual({ hasMachineQuality: false, hasVariants: false, hasMaterials: true });
    expect(curaMachineFlags({ has_machine_quality: 'True', has_variants: true, has_materials: 'False' })).toEqual({
      hasMachineQuality: true,
      hasVariants: true,
      hasMaterials: false,
    });
    expect(curaMachineFlags({ has_variants: 'no', has_materials: 0 })).toEqual({
      hasMachineQuality: false,
      hasVariants: false,
      hasMaterials: false,
    });
  });
});

describe('convertExcludeMaterials', () => {
  const excluded = (cond: string, base: string) => evaluate(cond, { material: { base } }).compatible === false;

  test('entries are substrings of the material id, as upstream', () => {
    const r = convertExcludeMaterials(['polymaker_', 'structur3d_dap100silicone']);
    expect(r).toEqual({
      condition: 'material.base !~ /.*(?:polymaker_|structur3d_dap100silicone).*/',
      lossy: false,
      diagnostics: [],
    });
    expect(excluded(r.condition!, 'polymaker_pla')).toBe(true);
    expect(excluded(r.condition!, 'x_structur3d_dap100silicone_175')).toBe(true);
    expect(excluded(r.condition!, 'generic_pla')).toBe(false);
  });

  test('regex syntax in entries is literal', () => {
    const r = convertExcludeMaterials(['a.b', "o'x/(|)*", '[x]-{2}\\', 'é\n😀']);
    expect(excluded(r.condition!, 'zz a.b zz')).toBe(true);
    expect(excluded(r.condition!, 'aXb')).toBe(false);
    expect(excluded(r.condition!, "-o'x/(|)*-")).toBe(true);
    expect(excluded(r.condition!, '[x]-{2}\\')).toBe(true);
    expect(excluded(r.condition!, 'xx')).toBe(false);
    expect(excluded(r.condition!, '_é\n😀_')).toBe(true);
  });

  test('empty list means no restriction', () => {
    expect(convertExcludeMaterials([])).toEqual({ lossy: false, diagnostics: [] });
  });

  test('long lists split into clauses that each fit the regex limit', () => {
    const names = Array.from({ length: 40 }, (_, i) => `vendor_${i}_`);
    const r = convertExcludeMaterials(names);
    expect(r.lossy).toBe(false);
    for (const m of r.condition!.matchAll(/!~ \/(.*?)\//g))
      expect(m[1]!.length).toBeLessThanOrEqual(MAX_PATTERN_LENGTH);
    expect(r.condition!.split(' and ').length).toBeGreaterThan(1);
    for (const n of names) expect(excluded(r.condition!, `${n}pla`)).toBe(true);
    expect(excluded(r.condition!, 'generic_pla')).toBe(false);
  });

  test('bounds list length, entry validity and clause count (hostile input)', () => {
    const many = Array.from({ length: MAX_EXCLUDED_MATERIALS + 10 }, (_, i) => `${'m'.repeat(180)}${i}`);
    const r = convertExcludeMaterials(many);
    expect(r.lossy).toBe(true);
    expect(r.condition!.split(' and ')).toHaveLength(MAX_REGEX_CLAUSES);
    expect(parseCondition(r.condition!)).toBeTruthy();
    expect(evaluate(`${r.condition!} and material.base == 'x'`, { material: { base: 'x' } })).toEqual({
      compatible: true,
    });
    expect(convertExcludeMaterials([1, '', 'x'.repeat(999), 'y'.repeat(195)]).condition).toBeUndefined();
  });
});

const cura = join(import.meta.dirname, '../../../../.reference/repos/Cura/resources');
describe.skipIf(!existsSync(cura))('real Cura@5bea2f8 resources', () => {
  test('ultimaker_s5 quality cfg converts', () => {
    const text = readFileSync(join(cura, 'quality/ultimaker_s5/um_s5_aa0.25_abs_0.1mm.inst.cfg'), 'utf8');
    const get = (k: string) => new RegExp(`^${k} = (.*)$`, 'm').exec(text)?.[1];
    const r = convertQualityMetadata(
      {
        definition: get('definition'),
        variant: get('variant'),
        material: get('material'),
        quality_type: get('quality_type'),
      },
      ALL,
    );
    expect(r.condition).toBe(
      "printer.model == 'ultimaker_s5' and nozzle.id == 'AA 0.25' and material.base == 'generic_abs'",
    );
  });

  test('rigid3d_hobby (no has_variants) ignores the quality variant, as Cura does', () => {
    const def = (id: string) => JSON.parse(readFileSync(join(cura, `definitions/${id}.def.json`), 'utf8'));
    const hobby = def('rigid3d_hobby');
    const machine = { ...def(hobby.inherits).metadata, ...hobby.metadata }; // resolved through inherits
    const text = readFileSync(join(cura, 'quality/rigid3d_base/abs/rigid3d_base_abs_low.inst.cfg'), 'utf8');
    const get = (k: string) => new RegExp(`^${k} = (.*)$`, 'm').exec(text)?.[1];
    expect(get('variant')).toBe('0.4mm Nozzle');
    const r = convertQualityMetadata(
      { definition: get('definition'), variant: get('variant'), material: get('material') },
      curaMachineFlags(machine),
    );
    expect(r.condition).toBe("printer.model == 'rigid3d_base' and material.base == 'generic_abs'");
    const model = curaQualityDefinition('rigid3d_hobby', machine);
    expect(evaluate(r.condition!, ctx(model, 'any nozzle', 'generic_abs'))).toEqual({ compatible: true });
  });

  test('ultimaker_sketch prefix entries exclude real fdm_materials ids', () => {
    const j = JSON.parse(readFileSync(join(cura, 'definitions/ultimaker_sketch.def.json'), 'utf8'));
    const r = convertExcludeMaterials(j.metadata.exclude_materials);
    expect(r.lossy).toBe(false);
    expect(evaluate(r.condition!, { material: { base: 'polymaker_polymax_pc_175' } })).toEqual({ compatible: false });
  });

  test('lulzbot_taz_pro_common exclude_materials converts', () => {
    const j = JSON.parse(readFileSync(join(cura, 'definitions/lulzbot_taz_pro_common.def.json'), 'utf8'));
    const r = convertExcludeMaterials(j.metadata.exclude_materials);
    expect(r.condition).toBe('material.base !~ /.*(?:structur3d_dap100silicone).*/');
  });
});
