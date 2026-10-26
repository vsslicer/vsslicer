// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-42: resolved (printer, nozzle, material, process) values for 21 PrusaSlicer and SuperSlicer tuples against the
// hand-checked oracle chosen in PRF-21 (oracle.ts). Fixtures only (D5): no printer, no CLI.
import { applyOverrides, merge, type ImportResult, type PrinterModel } from '@vsslicer/profile-api';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { importPrusaIni, type PrusaNative } from '../../src/adapters/import/import.ts';
import { parseIni, type IniSection } from '../../src/adapters/ini/index.ts';
import { PRUSA, SUPERSLICER, type Kind, type Tuple } from './oracle.ts';

const FILES = { prusa: 'PrusaResearch-cut.ini', superslicer: 'superslicer.ini' } as const;
type Eco = keyof typeof FILES;
const TUPLES: Record<Eco, readonly Tuple[]> = { prusa: PRUSA, superslicer: SUPERSLICER };
const KINDS = ['printer', 'print', 'filament'] as const;
const NAME = (t: Tuple, k: Kind) => (k === 'printer' ? t.printer : k === 'print' ? t.print : t.filament);

const bytes = (eco: Eco) => readFileSync(new URL(`./fixtures/${FILES[eco]}`, import.meta.url));
const file = (eco: Eco) => ({ path: FILES[eco], bytes: bytes(eco) });
const imported = { prusa: importPrusaIni([file('prusa')]), superslicer: importPrusaIni([file('superslicer')]) };
const unsplit = {
  prusa: importPrusaIni([file('prusa')], { splitVariants: false }),
  superslicer: importPrusaIni([file('superslicer')], { splitVariants: false }),
};
const sections = (eco: Eco) => {
  const out: Record<Kind, Map<string, IniSection>> = { printer: new Map(), print: new Map(), filament: new Map() };
  for (const s of parseIni(bytes(eco), FILES[eco]).sections)
    if (s.kind === 'printer' || s.kind === 'print' || s.kind === 'filament') out[s.kind].set(s.name, s);
  return out;
};
const raw = { prusa: sections('prusa'), superslicer: sections('superslicer') };

type Values = Record<Kind, Record<string, string>>;

/** The module's resolution: the flattened native values, as `importPrusaIni` keeps them beside each entity. */
function nativeValues(r: ImportResult, t: Tuple): Values {
  const v = (k: Kind) => {
    const n = r.native[NAME(t, k)] as PrusaNative | undefined;
    if (!n || n.kind !== k) throw new Error(`${k} '${NAME(t, k)}' did not import`);
    return n.values;
  };
  return { printer: v('printer'), print: v('print'), filament: v('filament') };
}

/** The unified settings: the printer through its model's nozzle override (profile-api `applyOverrides`). */
function unifiedSettings(r: ImportResult, t: Tuple): Record<Kind, Record<string, unknown>> {
  const settings = (id: string) => {
    const e = r.entities.find((x) => x.id === id) as { settings?: Record<string, unknown> } | undefined;
    if (!e?.settings) throw new Error(`'${id}' has no settings`);
    return e.settings;
  };
  const model = r.entities.find((e): e is PrinterModel => (e as PrinterModel).nozzles?.includes(t.printer) === true);
  return {
    printer: model
      ? (applyOverrides(model, { nozzle: { id: t.printer } }).entity.settings as Record<string, unknown>)
      : settings(t.printer),
    print: settings(t.print),
    filament: settings(t.filament),
  };
}

type Order = 'last-parent-wins' | 'first-parent-wins';
/**
 * An independent hand merge of the raw sections with profile-api's `merge` (later layers win): the parents' flattened
 * values in list order (or reversed, the seeded bug), then the section's own keys. `renamed_from` is not inherited.
 */
function handMerge(map: Map<string, IniSection>, name: string, order: Order, depth = 0): Record<string, string> {
  const s = map.get(name);
  if (!s || depth > 32) throw new Error(`no section '${name}' or chain too deep`);
  const own: Record<string, string> = {};
  for (const e of s.entries) if (!Object.hasOwn(own, e.key)) own[e.key] = e.value;
  const parents = (own['inherits'] ?? '')
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const parent = handMerge(map, p, order, depth + 1);
      delete parent['renamed_from'];
      return parent;
    });
  if (order === 'first-parent-wins') parents.reverse();
  const out = merge([...parents, own]) as Record<string, string>;
  delete out['inherits'];
  return out;
}
const handValues = (eco: Eco, t: Tuple, order: Order): Values => ({
  printer: handMerge(raw[eco].printer, t.printer, order),
  print: handMerge(raw[eco].print, t.print, order),
  filament: handMerge(raw[eco].filament, t.filament, order),
});

/** The checks of `t` that `v` breaks; empty when all hold. */
const failed = (t: Tuple, v: Values) =>
  t.checks
    .filter(([k, key, value]) => v[k][key] !== value)
    .map(([k, key, value]) => `${k}:${key}=${v[k][key]} not ${value}`);

describe('Prusa and SuperSlicer tuples against the hand-checked oracle', () => {
  it('covers at least 20 tuples, both dialects, and imports the fixtures cleanly', () => {
    expect(PRUSA.length + SUPERSLICER.length).toBeGreaterThanOrEqual(20);
    expect(SUPERSLICER.length).toBeGreaterThanOrEqual(4);
    for (const eco of ['prusa', 'superslicer'] as const) {
      expect(imported[eco].diagnostics.filter((d) => d.severity !== 'info')).toEqual([]);
      for (const t of TUPLES[eco])
        for (const k of KINDS) expect((imported[eco].native[NAME(t, k)] as PrusaNative).dialect).toBe(eco);
    }
  });

  it('cites, for every check, a section of the fixture that sets the value itself', () => {
    for (const eco of ['prusa', 'superslicer'] as const)
      for (const t of TUPLES[eco])
        for (const [k, key, value, section, line] of t.checks) {
          const e = raw[eco][k].get(section)?.entries.find((x) => x.key === key);
          expect(e?.value, `${eco} [${k}:${section}] ${key}`).toBe(value);
          // the SuperSlicer fixture is the source; Prusa lines are those of the upstream PrusaResearch.ini
          if (eco === 'superslicer') expect(e?.line).toBe(line);
        }
  });

  for (const eco of ['prusa', 'superslicer'] as const)
    for (const t of TUPLES[eco])
      it(`${eco}: ${t.printer} + ${t.print} + ${t.filament}`, () => {
        const r = imported[eco];
        const values = nativeValues(r, t);
        expect(failed(t, values)).toEqual([]);
        // every resolved key, not only the checked ones, equals the independent hand merge
        expect(values).toEqual(handValues(eco, t, 'last-parent-wins'));
        // the printer's nozzle override gives back the preset's own unified settings
        const unified = unifiedSettings(r, t);
        expect(unified.printer).toEqual(
          (unsplit[eco].entities.find((e) => e.id === t.printer) as { settings: unknown }).settings,
        );
        for (const [k, key, value] of t.unified ?? []) expect(unified[k][key], `${k}:${key}`).toEqual(value);
      });

  it('drops renamed_from from an inheriting preset', () => {
    const v = nativeValues(imported.superslicer, SUPERSLICER[0]!);
    expect(raw.superslicer.printer.get('*direct_drive*')!.entries.some((e) => e.key === 'renamed_from')).toBe(true);
    expect(Object.hasOwn(v.printer, 'renamed_from')).toBe(false);
  });
});

describe('the oracle catches a merge-order bug', () => {
  it('agrees with a last-parent-wins hand merge; a first-parent-wins one fails every tuple with a multi-parent conflict (all but MK2.5S)', () => {
    let caught = 0;
    for (const eco of ['prusa', 'superslicer'] as const)
      for (const t of TUPLES[eco]) {
        expect(failed(t, handValues(eco, t, 'last-parent-wins'))).toEqual([]);
        if (failed(t, handValues(eco, t, 'first-parent-wins')).length) caught++;
      }
    expect(caught).toBeGreaterThanOrEqual(20);
  });
});
