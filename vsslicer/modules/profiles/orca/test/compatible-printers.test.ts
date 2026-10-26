// SPDX-License-Identifier: AGPL-3.0-or-later
import { evaluate, parseCondition } from '@vsslicer/profile-api';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { MAX_PRINTER_NAMES, convertCompatiblePrinters } from '../src/adapters/conditions/compatible-printers.ts';

const ids = (m: Record<string, string>) => (n: string) => m[n];
const matches = (cond: string, id: string) => evaluate(cond, { printer: { id } });

describe('convertCompatiblePrinters', () => {
  test('exact when every name resolves', () => {
    const r = convertCompatiblePrinters(['A', 'B'], ids({ A: 'a1', B: 'b1' }));
    expect(r).toEqual({ condition: "printer.id in ['a1', 'b1']", lossy: false, diagnostics: [] });
    expect(parseCondition(r.condition!)).toBeTruthy();
    expect(matches(r.condition!, 'b1')).toEqual({ compatible: true });
    expect(matches(r.condition!, 'c1')).toEqual({ compatible: false });
  });

  test('empty list means no restriction', () => {
    expect(convertCompatiblePrinters([], ids({}))).toEqual({ lossy: false, diagnostics: [] });
  });

  test('unresolved name gives diagnostic and lossy flag, output still parses', () => {
    const r = convertCompatiblePrinters(['A', 'X'], ids({ A: 'a1' }));
    expect(r.lossy).toBe(true);
    expect(r.diagnostics).toHaveLength(1);
    expect(matches(r.condition!, 'a1').compatible).toBe(true);
    const none = convertCompatiblePrinters(['X'], ids({}));
    expect(none.condition).toBe('printer.id in []');
    expect(matches(none.condition!, 'a1')).toEqual({ compatible: false });
  });

  test('ids with quotes, backslashes, newlines and operators keep their meaning', () => {
    const hostile = ["a' or true or 'b", 'x\\', "it's\n\tok", '] or printer.id == "z'];
    const map = Object.fromEntries(hostile.map((h, i) => [`n${i}`, h]));
    const r = convertCompatiblePrinters(Object.keys(map), ids(map));
    expect(r.lossy).toBe(false);
    for (const h of hostile) expect(matches(r.condition!, h)).toEqual({ compatible: true });
    for (const o of ['a', 'b', 'z', 'x', 'true']) expect(matches(r.condition!, o)).toEqual({ compatible: false });
  });

  test('hostile input is bounded', () => {
    const many = Array.from({ length: MAX_PRINTER_NAMES + 50 }, (_, i) => `n${i}`);
    const r = convertCompatiblePrinters(many, (n) => n);
    expect(r.lossy).toBe(true);
    expect(parseCondition(r.condition!)).toBeTruthy();
    const long = convertCompatiblePrinters(['x'.repeat(10_000), 42, null], (n) => n);
    expect(long.diagnostics).toHaveLength(3);
  });
});

const orca = '/Users/jkiraly/Workspace/VSSlicer/.reference/repos/OrcaSlicer/resources/profiles/BBL/process';
describe.skipIf(!existsSync(orca))('real OrcaSlicer@09aa0114 BBL process profiles', () => {
  test('compatible_printers of a real profile converts', () => {
    const j = JSON.parse(readFileSync(join(orca, '0.06mm High Quality @BBL A1M 0.2 nozzle.json'), 'utf8'));
    const r = convertCompatiblePrinters(j.compatible_printers, (n) => n.toLowerCase().replaceAll(' ', '-'));
    expect(r.condition).toBe("printer.id in ['bambu-lab-a1-mini-0.2-nozzle']");
    expect(matches(r.condition!, 'bambu-lab-a1-mini-0.2-nozzle').compatible).toBe(true);
  });
});
