// SPDX-License-Identifier: AGPL-3.0-or-later
// Rewrites test/golden/<file>.json for every corpus file. Usage: pnpm golden:update
import { interimSummary } from '../test/support/interim-summary.ts';
import { loadManifest, summarise, writeGolden } from '../test/support/golden.ts';

const { files } = loadManifest();
for (const file of files) writeGolden(file, summarise(interimSummary, file));
console.log(`wrote ${files.length} golden files to test/golden`);
