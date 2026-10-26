// SPDX-License-Identifier: AGPL-3.0-or-later
// External oracle for convertPrusaCondition + evaluate: real PrusaSlicer conditions with expectations worked
// out by hand from PrusaSlicer's semantics (see test/fixtures/conditions/PROVENANCE.md), not from this code.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluate, type ConditionContext } from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import { convertPrusaCondition } from '../../src/adapters/conditions/convert.ts';
import { PRUSA_NOTE_TAGS } from '../../src/adapters/conditions/tags.ts';

interface Prusa29 {
  printer_model: string;
  printer_notes: string;
  nozzle_diameter: number[];
  nozzle_high_flow: boolean[];
  single_extruder_multi_material: boolean;
}
interface Prusa30 {
  printer: { base_model: string; model: string };
  tool: { nozzle_diameter: number; nozzle_high_flow: boolean };
  feeder?: Record<string, string | boolean>;
}
interface Case {
  c: string;
  p: string;
  want: boolean;
  why: string;
  knownLossy?: string;
}

const dir = join(import.meta.dirname, '../fixtures/conditions');
const read = <T>(f: string): T => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T;
const printers = read<{ prusa29: Record<string, Prusa29>; prusa30: Record<string, Prusa30> }>('printers.json');
const { conditions, cases } = read<{ conditions: Record<string, string>; cases: Case[] }>('cases.json');

/** The unified context a Prusa printer preset maps to. Every fixture printer comes from the PrusaResearch bundle. */
function contextOf(name: string): ConditionContext {
  const p29 = printers.prusa29[name];
  if (p29) {
    const tags = p29.printer_notes.split('\n').filter((l) => PRUSA_NOTE_TAGS.includes(l));
    return {
      printer: {
        vendor: 'PrusaResearch',
        model: p29.printer_model,
        tags,
        toolheads: { count: p29.nozzle_diameter.length },
        features: { single_extruder_multi_material: p29.single_extruder_multi_material },
      },
      nozzle: { diameter: p29.nozzle_diameter[0]!, flow: p29.nozzle_high_flow[0] ? 'high_flow' : 'standard' },
    };
  }
  const p30 = printers.prusa30[name];
  if (!p30) throw new Error(`no printer fixture '${name}'`);
  return {
    printer: { family: p30.printer.base_model, model: p30.printer.model },
    nozzle: { diameter: p30.tool.nozzle_diameter, flow: p30.tool.nozzle_high_flow ? 'high_flow' : 'standard' },
    ...(p30.feeder ? { feeder: p30.feeder } : {}),
  };
}

/** Converts and evaluates one case; returns the problems found (empty when the evaluator agrees with the oracle). */
function check(k: Case): string[] {
  const src = conditions[k.c];
  if (src === undefined) return [`no condition '${k.c}'`];
  const conv = convertPrusaCondition(src);
  if (conv.expression === null) return [`not converted: ${conv.diagnostics.join('; ')}`];
  const r = evaluate(conv.expression, contextOf(k.p));
  // evaluate answers `true` on any fault, so a diagnostic would pass every `want: true` case vacuously.
  if (r.diagnostic) return [`evaluation fault: ${r.diagnostic}`];
  if (k.knownLossy) {
    const out: string[] = [];
    if (r.compatible === k.want) out.push('known-lossy case now matches: drop knownLossy');
    if (!conv.lossy) out.push('known-lossy case not flagged lossy by the converter');
    return out;
  }
  return r.compatible === k.want ? [] : [`got ${r.compatible}, hand-computed ${k.want} (${k.why})`];
}

describe('hand-computed Prusa compatibility conditions', () => {
  test('the sample is large enough and covers the required constructs', () => {
    const used = new Set(cases.map((k) => k.c));
    const ini = [...used].filter((c) => c.startsWith('ini:'));
    const srcs = [...used].map((c) => conditions[c]!);
    expect(cases.length).toBeGreaterThanOrEqual(50);
    expect(ini.length).toBeGreaterThanOrEqual(40);
    for (const needle of [/nozzle_diameter\[0\]/, /printer_model=~/, /printer_notes=~/, /!~/, / and /, / or /, /! /])
      expect(srcs.some((s) => needle.test(s))).toBe(true);
    expect(srcs.some((s) => /tool\.|feeder\.|base_model/.test(s))).toBe(true);
    expect(new Set(cases.map((k) => k.want))).toEqual(new Set([true, false]));
  });

  test.each(cases.map((k) => [`${k.c} on ${k.p} -> ${k.want}`, k] as const))('%s', (_, k) => {
    expect(check(k)).toEqual([]);
  });

  test('a deliberately wrong expectation is detected (the suite is not vacuous)', () => {
    for (const k of cases.filter((x) => !x.knownLossy)) {
      expect(check({ ...k, want: !k.want }), `${k.c} on ${k.p}`).not.toEqual([]);
    }
  });
});
