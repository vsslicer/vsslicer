// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { BAMBU_COMMIT, ORCA_COMMIT } from '../tools/catalogue/generate.ts';

const provenance = readFileSync(join(import.meta.dirname, '../PROVENANCE.md'), 'utf8');

// PRF-179: a regenerated catalogue from a new upstream commit must update PROVENANCE.md too.
test.each([
  ['OrcaSlicer', ORCA_COMMIT],
  ['BambuStudio', BAMBU_COMMIT],
])('PROVENANCE.md names the full %s commit the catalogue was generated from', (_, short) => {
  expect(provenance).toMatch(new RegExp(`\`${short}[0-9a-f]{${40 - short.length}}\``));
  expect(provenance).toMatch(/AGPL-3\.0-only/);
});
