// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-129: Cura tuples (machine, nozzle variant, quality, user changes) resolved through this module's readers and
// stack lookup, against golden/cura.json. vsslicer/fixtures/profile-research/oracle.md names no Cura CLI, so the oracle
// is a hand merge, like Bambu's and Prusa's: cura_oracle.py, an independent Python reading of the Cura@5bea2f8 data
// files after the Uranium/Cura sources it cites, each expected value with its `file:line`. Fixtures: fixtures/PROVENANCE.md.
import { merge, type Process, type Settings, type SettingValue } from '@vsslicer/profile-api';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';
import { readCuraResourceFolder } from '../../src/adapters/definitions/folder.ts';
import { readCuraResources } from '../../src/adapters/definitions/read.ts';
import { readCuraQualities } from '../../src/adapters/quality/read.ts';
import { CURA_STACK_SLOTS, curaStackValue, type CuraStack, type CuraStackSlot } from '../../src/domain/stack.ts';

interface Expected {
  scope: 'extruder' | 'global';
  value: SettingValue;
  slot: string;
  source: string;
  /** Every `stack.slot` that sets the key, highest first. */
  set_in: string[];
}
interface Tuple {
  machine: string;
  extruder: string;
  variant: string;
  quality: string;
  global_quality: string;
  user: Record<'global' | 'extruder', Record<string, string>>;
  values: Record<string, Expected>;
}
interface Stacks {
  extruder: CuraStack;
  global: CuraStack;
}

const golden = JSON.parse(readFileSync(new URL('./golden/cura.json', import.meta.url), 'utf8')) as { tuples: Tuple[] };
const root = fileURLToPath(new URL('./fixtures', import.meta.url));

/** A user container's `[values]` as the quality reader keeps them: `=x` is the formula `x`. */
const userSettings = (v: Record<string, string>): Settings =>
  Object.fromEntries(Object.entries(v).map(([k, s]) => [k, s.startsWith('=') ? { expr: s.slice(1) } : s]));

const must = <T>(v: T | undefined, what: string): T => {
  if (v === undefined) throw new Error(`${what} did not resolve`);
  return v;
};

let stacksOf: (t: Tuple) => Stacks;
beforeAll(async () => {
  const folder = await readCuraResourceFolder(root, {}, ['definitions', 'extruders', 'variants', 'quality']);
  expect(folder.diagnostics).toEqual([]);
  const res = readCuraResources(folder.files);
  expect(res.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  const q = readCuraQualities(folder.files, res);
  expect(q.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  const quality = new Map(q.entities.map((e) => [e.id, (e as Process).settings ?? {}]));
  stacksOf = (t) => ({
    extruder: {
      user: userSettings(t.user.extruder),
      quality: must(quality.get(t.quality), t.quality),
      variant: must(res.variants.get(t.variant), t.variant).settings,
      definition: must(res.extruders.get(t.extruder), t.extruder).settings,
    },
    global: {
      user: userSettings(t.user.global),
      quality: must(quality.get(t.global_quality), t.global_quality),
      definition: must(res.definitions.get(t.machine), t.machine).settings,
    },
  });
});

/** The stacks a key is read through, with their names: a key not settable per extruder is read in the global stack. */
const inScope = (s: Stacks, e: Expected): [string, CuraStack][] =>
  e.scope === 'extruder'
    ? [
        ['extruder', s.extruder],
        ['global', s.global],
      ]
    : [['global', s.global]];

/** The same lookup as a profile-api merge: every slot's value, lowest first, so the highest non-null one wins. */
const viaMerge = (key: string, stacks: CuraStack[]): unknown =>
  merge(
    stacks
      .toReversed()
      .flatMap((st) => CURA_STACK_SLOTS.toReversed().map((slot) => ({ [key]: st[slot]?.[key] }) as Settings)),
  )[key];

const setIn = (key: string, named: [string, CuraStack][]): string[] =>
  named.flatMap(([n, st]) => CURA_STACK_SLOTS.filter((slot) => st[slot]?.[key] != null).map((slot) => `${n}.${slot}`));

const valueAt = (s: Stacks, at: string, key: string): SettingValue | undefined => {
  const [stack, slot] = at.split('.') as ['extruder' | 'global', CuraStackSlot];
  return s[stack][slot]?.[key];
};

describe('Cura tuples against the hand merge of Cura@5bea2f8', () => {
  test('there are at least 20 tuples, each checking every key', () => {
    expect(golden.tuples.length).toBeGreaterThanOrEqual(20);
    for (const t of golden.tuples) expect(Object.keys(t.values).length).toBe(18);
  });

  test.each(golden.tuples.map((t) => [`${t.machine} ${t.variant} ${t.quality}`, t] as const))(
    '%s resolves to the oracle',
    (_, t) => {
      const s = stacksOf(t);
      for (const [key, e] of Object.entries(t.values)) {
        const named = inScope(s, e);
        const stacks = named.map(([, st]) => st);
        expect(
          { key, value: curaStackValue(key, ...stacks), merged: viaMerge(key, stacks), set_in: setIn(key, named) },
          e.source,
        ).toEqual({ key, value: e.value, merged: e.value, set_in: e.set_in });
      }
    },
  );

  // Each step of the order: some key set in both slots, with different values, resolves to the higher one.
  test.each([
    ['global.definition', 'extruder.definition'],
    ['extruder.definition', 'extruder.variant'],
    ['extruder.variant', 'extruder.quality'],
    ['extruder.quality', 'extruder.user'],
    ['global.definition', 'global.quality'],
    ['global.quality', 'global.user'],
  ])('the fixtures prove %s under %s', (low, high) => {
    const proofs = golden.tuples.flatMap((t) => {
      const s = stacksOf(t);
      return Object.entries(t.values).filter(([key, e]) => {
        const named = inScope(s, e);
        const at = setIn(key, named);
        const value = curaStackValue(key, ...named.map(([, st]) => st));
        return (
          at[0] === high &&
          at.includes(low) &&
          JSON.stringify(valueAt(s, low, key)) !== JSON.stringify(value) &&
          JSON.stringify(value) === JSON.stringify(e.value)
        );
      });
    });
    expect(proofs.length).toBeGreaterThan(0);
  });

  test('a key not settable per extruder ignores a different value in the extruder stack', () => {
    const proofs = golden.tuples.flatMap((t) => {
      const s = stacksOf(t);
      return Object.entries(t.values).filter(
        ([key, e]) =>
          e.scope === 'global' &&
          setIn(key, [['extruder', s.extruder]]).length > 0 &&
          JSON.stringify(curaStackValue(key, s.extruder)) !== JSON.stringify(e.value),
      );
    });
    expect(proofs.length).toBeGreaterThan(0);
  });

  // A seeded merge-order bug: two adjacent slots, or the two stacks, swapped. Each must change some resolved value.
  const mismatches = (seed: (s: Stacks) => Stacks): number =>
    golden.tuples
      .flatMap((t) => {
        const s = seed(stacksOf(t));
        return Object.entries(t.values).map(([key, e]) => {
          const stacks = e.scope === 'extruder' ? [s.extruder, s.global] : [s.global];
          return JSON.stringify(curaStackValue(key, ...stacks)) !== JSON.stringify(e.value);
        });
      })
      .filter(Boolean).length;
  const swap = (st: CuraStack, a: CuraStackSlot, b: CuraStackSlot): CuraStack => ({ ...st, [a]: st[b], [b]: st[a] });

  test.each([
    ['user', 'quality'],
    ['quality', 'variant'],
    ['variant', 'definition'],
  ] as const)('swapping %s and %s fails the comparison', (a, b) => {
    expect(mismatches((s) => ({ extruder: swap(s.extruder, a, b), global: swap(s.global, a, b) }))).toBeGreaterThan(0);
  });

  test('reading the global stack before the extruder stack fails the comparison', () => {
    expect(mismatches((s) => ({ extruder: s.global, global: s.extruder }))).toBeGreaterThan(0);
  });
});
