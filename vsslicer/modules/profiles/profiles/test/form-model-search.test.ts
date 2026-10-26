// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  bambuCatalogue,
  curaCatalogue,
  orcaCatalogue,
  prusaCatalogue,
  superslicerCatalogue,
  type Catalogue,
} from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import { buildFormModel, type FormModel } from '../src/application/form-model/form-model.ts';
import {
  buildSearchIndex,
  MAX_PREFIX_TERMS,
  MAX_QUERY_CHARS,
  MAX_QUERY_TOKENS,
  MAX_RESULTS,
} from '../src/application/form-model/search/search.ts';

const full: Catalogue = Object.assign(
  {},
  ...[orcaCatalogue, bambuCatalogue, prusaCatalogue, superslicerCatalogue, curaCatalogue].map((c) => c.entries),
);
const model = buildFormModel(full);
const fieldCount = model.reduce((n, g) => n + g.subgroups.reduce((m, s) => m + s.fields.length, 0), 0);
const index = buildSearchIndex(model);

describe('settings search', () => {
  test('native names of three slicers find the same field first', () => {
    const firsts = ['perimeters', 'wall_loops', 'wall_line_count'].map((q) => index.search(q)[0]?.field.key);
    expect(firsts).toEqual(['wall_loops', 'wall_loops', 'wall_loops']);
  });

  test('a tooltip word finds its key, below name hits', () => {
    const q = 'walls per layer'; // from the wall_loops tooltip
    expect(index.search(q).map((h) => h.field.key)).toContain('wall_loops');
    const hits = index.search('wall', MAX_RESULTS);
    const isName = (h: (typeof hits)[number]) =>
      /wall/i.test(
        [h.field.key, h.field.label, ...Object.values(h.field.entry.native).map((n) => ('key' in n ? n.key : ''))].join(
          ' ',
        ),
      );
    const tooltipOnly = hits.findIndex((h) => !isName(h));
    expect(tooltipOnly).toBeGreaterThan(0); // the limit reaches tooltip-only hits, so the next check is not vacuous
    expect(hits.slice(tooltipOnly).filter(isName)).toEqual([]);
  });

  test('the whole-name bonus counts once per field, however many of its names equal the query', () => {
    const hit = index.search('wall_loops')[0]!;
    // key + Orca key + Bambu key all equal the query; still one bonus of 1000 on top of the token scores
    expect(hit.score).toBeLessThan(2000);
  });

  test('many fields sharing a label and a native key: build and search stay linear', () => {
    const synth = (n: number): FormModel => {
      const base = model[0]!.subgroups[0]!.fields.find((f) => Object.values(f.entry.native).some((x) => 'key' in x))!;
      const [slicer, nat] = Object.entries(base.entry.native).find(([, x]) => 'key' in x)!;
      const fields = Array.from({ length: n }, (_, i) => ({
        ...base,
        key: `k${i}`,
        label: 'shared label',
        entry: { ...base.entry, native: { [slicer]: nat } },
      }));
      return [{ ...model[0]!, subgroups: [{ ...model[0]!.subgroups[0]!, fields }] }];
    };
    const nativeKey = (Object.values(synth(1)[0]!.subgroups[0]!.fields[0]!.entry.native)[0] as { key: string }).key;
    const measure = (n: number) => {
      // count the array elements iterated (spread copies) while building: a per-add array copy shows as quadratic
      const orig = Array.prototype[Symbol.iterator];
      let iterated = 0;
      Array.prototype[Symbol.iterator] = function* (this: unknown[]) {
        for (let i = 0; i < this.length; i++) {
          iterated++;
          yield this[i];
        }
      } as typeof orig;
      let built: ReturnType<typeof buildSearchIndex>;
      try {
        built = buildSearchIndex(synth(n));
      } finally {
        Array.prototype[Symbol.iterator] = orig;
      }
      built.search('shared label', 5);
      const labelCost = built.lastCost;
      built.search(nativeKey, 5);
      return { build: iterated, search: Math.max(labelCost, built.lastCost) };
    };
    const small = measure(1000);
    const large = measure(2000);
    expect(large.build / small.build).toBeLessThan(3); // linear is 2, quadratic is 4
    expect(large.search / small.search).toBeLessThan(3);
  });

  test('a query matching nothing, or only punctuation, returns nothing', () => {
    expect(index.search('zzzqqq')).toEqual([]);
    expect(index.search('  ---  ')).toEqual([]);
  });

  test('operation bound: a query reads a bounded share of the index', () => {
    for (const q of ['perimeters', 'wall_loops', 'wall_line_count', 'temperature', 'a']) {
      index.search(q);
      const tokens = Math.min(q.split(/[^a-z0-9]+/).length, MAX_QUERY_TOKENS);
      expect(index.lastCost).toBeLessThanOrEqual(
        tokens * (MAX_PREFIX_TERMS + MAX_PREFIX_TERMS * fieldCount) + fieldCount * tokens,
      );
    }
    index.search('perimeters');
    expect(index.lastCost).toBeLessThan(fieldCount); // an exact rare term touches few entries, not every key
  });

  test('hostile input is bounded', () => {
    const long = ('perimeters ' + 'x'.repeat(50)).repeat(5000);
    expect(long.length).toBeGreaterThan(MAX_QUERY_CHARS);
    expect(() => index.search(long)).not.toThrow();
    const many = Array.from({ length: 5000 }, (_, i) => `t${i}`).join(' ');
    index.search(many);
    expect(index.lastCost).toBeLessThan(fieldCount * MAX_QUERY_TOKENS * 2);
    expect(index.search('e', 1_000_000).length).toBeLessThanOrEqual(MAX_RESULTS);
    expect(index.search('e', -5)).toEqual([]);
    expect(index.search('\u0000'.repeat(10_000))).toEqual([]);
  });
});
