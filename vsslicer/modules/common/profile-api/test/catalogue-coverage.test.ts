// SPDX-License-Identifier: AGPL-3.0-or-later
// PRF-19: every key of every pinned slicer key list is mapped (a `native.<dialect>` name on an entry, which a
// native-only entry also has) or the test fails. The lists are committed fixtures written by tools/catalogue/keys.ts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { bambuCatalogue } from '../src/domain/catalogue/bambu.ts';
import { curaCatalogue } from '../src/domain/catalogue/cura.ts';
import { prusaCatalogue } from '../src/domain/catalogue/prusa.ts';
import { superslicerCatalogue } from '../src/domain/catalogue/superslicer.ts';
import { orcaCatalogue, type CatalogueFile } from '../src/index.ts';
import { GROUPS_OUTPUT } from '../tools/catalogue/generate.ts';
import { KEYS_DIR } from '../tools/catalogue/keys.ts';
import type { GroupReport } from '../tools/catalogue/groups.ts';

const COMMITS = {
  orca: 'OrcaSlicer@09aa0114',
  bambu: 'BambuStudio@79df7ae',
  prusa: 'PrusaSlicer@b028299',
  prusa3: 'PrusaSlicer@30ef591',
  superslicer: 'SuperSlicer@1f3d287',
  cura: 'Cura@5bea2f8',
};
const files: CatalogueFile[] = [orcaCatalogue, bambuCatalogue, prusaCatalogue, superslicerCatalogue, curaCatalogue];

/** The dialect keys no entry of `files` names, or only names through a bare native-only entry. */
export const unassigned = (dialect: string, keys: string[], entries: CatalogueFile['entries'][]) => {
  const named = new Set<string>();
  for (const es of entries)
    for (const e of Object.values(es)) {
      const n = (e.native as { [d: string]: { key?: string; conversion?: { keys?: string[] } } | undefined })[dialect];
      if (!n) continue;
      for (const k of n.conversion?.keys ?? []) named.add(k);
      if (!n.key) continue;
      named.add(n.key);
      // PrusaSlicer 3.0 hardware features are `tool.nozzle_diameter`; a split conversion (Cura width and depth) names several keys.
      named.add(n.key.slice(n.key.indexOf('.') + 1));
    }
  return keys.filter((k) => !named.has(k));
};

const list = (d: string) =>
  JSON.parse(readFileSync(join(KEYS_DIR, `${d}.json`), 'utf8')) as { commit: string; keys: string[] };
const report = JSON.parse(readFileSync(GROUPS_OUTPUT, 'utf8')) as GroupReport;

describe('catalogue coverage of the pinned key lists', () => {
  for (const [dialect, commit] of Object.entries(COMMITS)) {
    test(`${dialect}: every ${commit} key is mapped or native-only`, () => {
      const { commit: pinned, keys } = list(dialect);
      expect(pinned).toContain(commit);
      expect(keys.length).toBeGreaterThan(300);
      expect(
        unassigned(
          dialect,
          keys,
          files.map((f) => f.entries),
        ),
      ).toEqual([]);
    });
  }

  test('goes red when an entry is deleted', () => {
    const { keys } = list('superslicer');
    const entries = structuredClone(superslicerCatalogue.entries);
    const gone = Object.keys(entries)[0]!;
    const key = (entries[gone]!.native.superslicer as { key: string }).key;
    delete entries[gone];
    expect(unassigned('superslicer', keys, [entries, ...files.slice(0, 3).map((f) => f.entries)])).toContain(key);
  });

  test('the group report counts every key of every list once (shown plus hidden)', () => {
    for (const d of Object.keys(COMMITS)) {
      const { total } = report.counts[d as keyof typeof report.counts]!;
      const n = total!.shown + total!.hidden;
      // PrusaSlicer 3.0 also counts its 30 hardware features, which are not config keys.
      if (d === 'prusa3') expect(n).toBeGreaterThanOrEqual(list(d).keys.length);
      // Two Cura entries (printable_area, extruder_offset) each split into two Cura keys and count once.
      else expect(n, d).toBe(list(d).keys.length - (d === 'cura' ? 2 : 0));
    }
  });
});
