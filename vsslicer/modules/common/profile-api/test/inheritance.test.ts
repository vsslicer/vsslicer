// SPDX-License-Identifier: AGPL-3.0-or-later
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { InheritanceCycleError, UnknownParentError, merge, resolve, type EntityBase } from '../src/index.ts';

const ent = (id: string, rest: Partial<EntityBase> = {}): EntityBase => ({ id, ...rest });
const lookupOf =
  (...all: EntityBase[]) =>
  (id: string) =>
    all.find((e) => e.id === id);

describe('merge', () => {
  test('the last entity wins', () => {
    expect(merge([{ a: 1, b: 1 }, { a: 2 }, { a: 3 }])).toEqual({ a: 3, b: 1 });
  });
  test('maps are deep-merged', () => {
    expect(merge([{ s: { '0': 0.4, '1': 0.4 } }, { s: { '1': 0.6 } }])).toEqual({ s: { '0': 0.4, '1': 0.6 } });
  });
  test('arrays are replaced', () => {
    expect(merge([{ l: [1, 2, 3] }, { l: [9] }])).toEqual({ l: [9] });
  });
  test('null falls through to the parent value, but stays null if nothing sets it', () => {
    expect(
      merge([
        { a: 1, n: { x: 1 } },
        { a: null, n: null, only: null },
      ]),
    ).toEqual({ a: 1, n: { x: 1 }, only: null });
  });
  test('a __proto__ key stays data', () => {
    const child = JSON.parse('{"__proto__": {"x": 1}}');
    const out = merge([{}, child]);
    expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
    expect(Object.keys(out)).toEqual(['__proto__']);
  });
  test('empty chain throws', () => {
    expect(() => merge([])).toThrow(RangeError);
  });

  // Keys keep one kind across the chain (s: scalar, a: array, m: map); null may replace any of them.
  const nul = <T>(a: fc.Arbitrary<T>) => fc.option(a, { nil: undefined });
  const leaf = fc.record(
    { s: nul(fc.oneof(fc.integer(), fc.constant(null))), a: nul(fc.oneof(fc.array(fc.integer()), fc.constant(null))) },
    { requiredKeys: [] },
  );
  const lvl1 = fc.record(
    { s: leaf.map((l) => l.s), a: leaf.map((l) => l.a), m: nul(fc.oneof(leaf, fc.constant(null))) },
    { requiredKeys: [] },
  );
  const doc = fc.record(
    { s: lvl1.map((l) => l.s), a: lvl1.map((l) => l.a), m: nul(fc.oneof(lvl1, fc.constant(null))) },
    { requiredKeys: [] },
  );
  test('merge is associative for chains of up to 5', () => {
    fc.assert(
      fc.property(fc.array(doc, { minLength: 1, maxLength: 5 }), fc.nat(), (chain, cut) => {
        const k = cut % chain.length;
        const flat = merge(chain);
        // split anywhere: merge(merge(left), merge(right)) equals merge(all)
        const left = chain.slice(0, k + 1);
        const right = chain.slice(k + 1);
        const split = right.length ? merge([merge(left), merge(right)]) : flat;
        expect(split).toEqual(flat);
      }),
      { numRuns: 500 },
    );
  });
});

describe('resolve', () => {
  const base = ent('base', { abstract: true, settings: { speed: 50, temp: { '0': 200 } }, renamed_from: ['old'] });
  const a = ent('a', { inherits: ['base'], settings: { speed: 60, infill: 'gyroid' } });
  const b = ent('b', { inherits: ['base'], settings: { speed: 70, temp: { '1': 210 } } });

  test('last parent wins, own settings win over parents', () => {
    const { entity } = resolve(ent('c', { inherits: ['a', 'b'], settings: { infill: 'grid' } }), lookupOf(base, a, b));
    expect(entity.settings).toEqual({ speed: 70, infill: 'grid', temp: { '0': 200, '1': 210 } });
    expect(entity.inherits).toEqual(['a', 'b']);
    expect(entity.id).toBe('c');
  });
  test('own settings win over every parent', () => {
    const { entity } = resolve(ent('c', { inherits: ['a', 'b'], settings: { speed: 1 } }), lookupOf(base, a, b));
    expect(entity.settings?.speed).toBe(1);
  });
  test('abstract is flagged non-selectable and not inherited; renamed_from is never inherited', () => {
    const abs = resolve(base, lookupOf(base));
    expect(abs.selectable).toBe(false);
    const child = resolve(a, lookupOf(base, a));
    expect(child.selectable).toBe(true);
    expect(child.entity.abstract).toBeUndefined();
    expect(child.entity.renamed_from).toBeUndefined();
  });
  test('diamond ancestry is not a cycle', () => {
    expect(() => resolve(ent('c', { inherits: ['a', 'b'] }), lookupOf(base, a, b))).not.toThrow();
  });
  test('a cycle raises InheritanceCycleError naming the loop', () => {
    const x = ent('x', { inherits: ['y'] });
    const y = ent('y', { inherits: ['z'] });
    const z = ent('z', { inherits: ['y'] });
    const err = (() => {
      try {
        resolve(x, lookupOf(x, y, z));
      } catch (e) {
        return e;
      }
    })();
    expect(err).toBeInstanceOf(InheritanceCycleError);
    expect((err as InheritanceCycleError).cycle).toEqual(['y', 'z', 'y']);
    expect((err as Error).message).toContain('y -> z -> y');
    expect(() => resolve(ent('s', { inherits: ['s'] }), lookupOf())).toThrow(InheritanceCycleError);
  });
  test('an unknown parent raises UnknownParentError naming child and parent', () => {
    const err = (() => {
      try {
        resolve(ent('c', { inherits: ['a', 'ghost'] }), lookupOf(base, a));
      } catch (e) {
        return e;
      }
    })() as UnknownParentError;
    expect(err).toBeInstanceOf(UnknownParentError);
    expect([err.child, err.parent]).toEqual(['c', 'ghost']);
    expect(err.message).toMatch(/"c".*"ghost"/);
  });
});
