// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';

const evaluateCalls = vi.hoisted(() => ({ n: 0 }));
vi.mock('@vsslicer/profile-api', async (orig) => {
  const m = await orig<typeof import('@vsslicer/profile-api')>();
  return { ...m, evaluate: (...a: Parameters<typeof m.evaluate>) => (evaluateCalls.n++, m.evaluate(...a)) };
});
import { convertPrusaCondition as conv } from '../../src/adapters/conditions/convert.ts';
import { notesRegexToTags, PRUSA_NOTE_TAGS } from '../../src/adapters/conditions/tags.ts';

describe('section 6 rows', () => {
  test.each([
    ['nozzle_diameter[0]==0.4', 'nozzle.diameter == 0.4'],
    ['nozzle_high_flow[0]', "(nozzle.flow == 'high_flow')"],
    ['! nozzle_high_flow[0]', "not (nozzle.flow == 'high_flow')"],
    ['printer_model=="MK4"', "printer.model == 'MK4'"],
    ['printer_model=~/(MK4S|MK3.9S)/', 'printer.model =~ /(MK4S|MK3.9S)/'],
    ['printer_notes=~/.*PRINTER_VENDOR_PRUSA3D.*/', "('PRINTER_VENDOR_PRUSA3D' in printer.tags)"],
    ['printer_notes=~/.*HF_NOZZLE.*/', "('HF_NOZZLE' in printer.tags)"],
    ['printer_notes!~/.*PG.*/', "not ('PG' in printer.tags)"],
    ['a_x && b_y', null],
    ['printer_model=="A" || num_extruders>1', "printer.model == 'A' or printer.toolheads.count > 1"],
    ['tool.nozzle_diameter==0.4 and base_model=="MK4"', "nozzle.diameter == 0.4 and printer.family == 'MK4'"],
    ['feeder.type=="direct"', "feeder.type == 'direct'"],
  ])('%s', (src, want) => {
    const r = conv(src);
    if (want === null) expect(r.expression).toContain('printer.settings.');
    else expect(r.expression).toBe(want);
  });

  test('exact conversions are not lossy; multi-tag expansion is', () => {
    expect(conv('printer_notes=~/.*HF_NOZZLE.*/').lossy).toBe(false);
    const r = conv('printer_notes=~/.*MINI.*/');
    expect(r.lossy).toBe(true);
    expect(r.expression).toBe("('PRINTER_MODEL_MINI' in printer.tags or 'PRINTER_MODEL_MINIIS' in printer.tags)");
  });

  test('regex alternation and character classes expand against the tag vocabulary', () => {
    expect(notesRegexToTags('.*PRINTER_MODEL_MK2[^\\.].*').expression).toBe("'PRINTER_MODEL_MK2' in printer.tags");
  });
});

describe('unknown input is flagged, never dropped', () => {
  test('unknown notes keyword', () => {
    const r = conv('printer_notes=~/.*NOT_A_KEYWORD.*/');
    expect(r).toMatchObject({ lossy: true, expression: '(printer.notes =~ /.*NOT_A_KEYWORD.*/)' });
    expect(r.diagnostics[0]).toContain('NOT_A_KEYWORD');
  });
  test('unknown identifier', () => {
    const r = conv('foo==1');
    expect(r.lossy).toBe(true);
    expect(r.expression).toBe('printer.settings.foo == 1');
  });
  test('mapped Prusa names go through the catalogue; unmapped stay native and lossy', () => {
    const m = conv('max_print_height>100');
    expect(m.expression).toMatch(/^printer\.settings\.(?!max_print_height)\w+ > 100$/);
    expect(m.lossy).toBe(false);
    expect(conv('foo==1')).toMatchObject({ lossy: true, expression: 'printer.settings.foo == 1' });
  });
  test('true/false pass through; other indexes and escapes are flagged', () => {
    expect(conv('true && !false')).toMatchObject({ expression: 'true and not false', lossy: false });
    const i = conv('printer_model[3]=="A"');
    expect(i.lossy).toBe(true);
    expect(i.diagnostics[0]).toContain('[3]');
    const e = conv('printer_model=="a\\nb"');
    expect(e.lossy).toBe(true);
    expect(e.diagnostics[0]).toContain('escape');
  });
  test('=~ is a whole-string match: only .*tag.* is exact', () => {
    expect(conv('printer_notes=~/.*PG.*/').lossy).toBe(false);
    for (const re of ['PG', '.*PG']) {
      const r = conv(`printer_notes=~/${re}/`);
      expect(r.lossy).toBe(true);
      expect(r.diagnostics.join()).toContain('whole-string');
    }
  });
  test('nozzle index other than 0 is lossy', () => {
    expect(conv('nozzle_diameter[1]==0.4').lossy).toBe(true);
  });
  test('syntax errors yield null with a diagnostic', () => {
    for (const s of ['a =', 'printer_model=="x', 'printer_model=~/abc', 'x # y', '(']) {
      const r = conv(s);
      expect(r.expression).toBeNull();
      expect(r.diagnostics.length).toBeGreaterThan(0);
    }
  });
});

describe('hostile input', () => {
  test('oversize is rejected without scanning', () => {
    expect(conv('a'.repeat(70_000)).expression).toBeNull();
  });
  test('too many tokens is rejected', () => {
    expect(conv(Array(9000).fill('1').join(' and ')).expression).toBeNull();
  });
  test('deep nesting is rejected by the parser, not a crash', () => {
    expect(conv('('.repeat(5000) + '1' + ')'.repeat(5000)).expression).toBeNull();
  });
  test('pathological regex core is not expanded', () => {
    const r = notesRegexToTags('.*(a+)+$.*');
    expect(r.unknown).toBe(true);
    const long = notesRegexToTags('A'.repeat(5000));
    expect(long.unknown).toBe(true);
  });
  test('exponential-backtracking notes pattern is matched in bounded steps', () => {
    const pat = `.*${'(.|.|.|.|.)'.repeat(18)}Z.*`;
    evaluateCalls.n = 0;
    const r = notesRegexToTags(pat);
    expect(r.expression).toBeTypeOf('string');
    // One linear-time NFA run per known tag, never an input-derived V8 RegExp.
    expect(evaluateCalls.n).toBeLessThanOrEqual(PRUSA_NOTE_TAGS.length);
  });
  test('a long flat and-chain converts', () => {
    expect(conv(Array(40).fill('nozzle_diameter[0]==0.4').join(' and ')).expression).not.toBeNull();
  });
});

const INI = join(
  import.meta.dirname,
  '../../../../../.reference/repos/PrusaSlicer-2.9/resources/profiles/PrusaResearch.ini',
);
describe.skipIf(!existsSync(INI))('PrusaResearch.ini@b028299', () => {
  const text = existsSync(INI) ? readFileSync(INI, 'utf8') : '';
  const conditions = [...text.matchAll(/^[a-z_]*condition *= *(.+)$/gm)].map((m) => m[1]!);

  test('the tag table is the keyword set of the printer_notes lines', () => {
    const kw = new Set<string>();
    for (const m of text.matchAll(/^printer_notes *= *(.*)$/gm))
      for (const k of m[1]!.matchAll(/\\n([A-Za-z0-9_.]+)/g)) kw.add(k[1]!);
    expect([...kw].sort()).toEqual([...PRUSA_NOTE_TAGS].sort());
  });

  test('every condition converts, parses, and has no unknown keyword or identifier', () => {
    expect(conditions.length).toBeGreaterThan(800);
    const bad = conditions
      .map((c) => ({ c, r: conv(c) }))
      .filter(({ r }) => r.expression === null || r.diagnostics.length);
    expect(bad.map(({ c, r }) => [c.slice(0, 120), r.diagnostics])).toEqual([]);
  });
});
