// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// Walks src/index.ts's static import graph: the main entry must not reach the .gcode.3mf readers.
it('the main entry does not import @vsslicer/3mf, fflate or saxes', () => {
  const bare = new Set<string>();
  const seen = new Set<string>();
  const walk = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*'([^']+)'/g)) {
      const spec = m[1]!;
      if (spec.startsWith('.')) walk(resolve(dirname(file), spec));
      else bare.add(spec);
    }
  };
  walk(fileURLToPath(new URL('../src/index.ts', import.meta.url)));
  expect(seen.size).toBeGreaterThan(5);
  expect([...bare].filter((s) => /^(@vsslicer\/3mf|fflate|saxes)/.test(s))).toEqual([]);
});
