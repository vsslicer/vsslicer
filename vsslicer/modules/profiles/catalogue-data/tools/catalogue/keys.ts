// SPDX-License-Identifier: AGPL-3.0-only
// PRF-19: writes the pinned key lists (key names only) that test/catalogue-coverage.test.ts checks the catalogue against.
// Run from the module: node tools/catalogue/keys.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractDefs, extractDomain, readSource, tokenize } from './cpp.ts';
import { extractCura, FDMEXTRUDER, FDMPRINTER, CURA_COMMIT } from './cura.ts';
import { BAMBU_COMMIT, ORCA_COMMIT, PRINT_CONFIG } from './generate.ts';
import { headCommit, PINNED, PRUSA3_COMMIT, PRUSA_COMMIT, readPinned, REPOS, SUPERSLICER_COMMIT } from './prusa.ts';

export const KEYS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../test/fixtures/catalogue-keys');

const defKeys = (text: string) => [...extractDefs(tokenize(text)).keys()];

export const pinnedKeys = (repos = REPOS): { [dialect: string]: { commit: string; keys: string[] } } => {
  const read = (name: string, commit: string, path: string) => {
    const head = headCommit(join(repos, name));
    if (!head.startsWith(commit)) throw new Error(`${name} is at ${head}, not the pinned ${commit}`);
    return readSource(join(repos, name), join(repos, name, path));
  };
  const src = readPinned(repos);
  const domain = (['common', 'fdm'] as const).flatMap((f) => [...extractDomain(tokenize(src.prusa3[f])).keys()]);
  const cura = [
    ...extractCura(read('Cura', CURA_COMMIT, FDMPRINTER), FDMPRINTER),
    ...extractCura(read('Cura', CURA_COMMIT, FDMEXTRUDER), FDMEXTRUDER),
  ].map((s) => s.key);
  const sets = {
    orca: { commit: `OrcaSlicer@${ORCA_COMMIT}`, keys: defKeys(read('OrcaSlicer', ORCA_COMMIT, PRINT_CONFIG)) },
    bambu: { commit: `BambuStudio@${BAMBU_COMMIT}`, keys: defKeys(read('BambuStudio', BAMBU_COMMIT, PRINT_CONFIG)) },
    prusa: { commit: `PrusaSlicer@${PRUSA_COMMIT} (${PINNED.prusa.repo})`, keys: defKeys(src.prusa.printConfig) },
    // PrusaSlicer 3.0 keys: the domain definitions and the legacy 2.x copy it still loads.
    prusa3: { commit: `PrusaSlicer@${PRUSA3_COMMIT}`, keys: [...domain, ...defKeys(src.prusa3.legacy)] },
    superslicer: { commit: `SuperSlicer@${SUPERSLICER_COMMIT}`, keys: defKeys(src.superslicer.printConfig) },
    cura: { commit: `Cura@${CURA_COMMIT}`, keys: cura },
  };
  return Object.fromEntries(Object.entries(sets).map(([d, s]) => [d, { ...s, keys: [...new Set(s.keys)].sort() }]));
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(KEYS_DIR, { recursive: true });
  for (const [d, s] of Object.entries(pinnedKeys())) {
    writeFileSync(join(KEYS_DIR, `${d}.json`), `${JSON.stringify(s, null, 2)}\n`);
    console.log(`${d}: ${s.keys.length} keys @ ${s.commit}`);
  }
}
