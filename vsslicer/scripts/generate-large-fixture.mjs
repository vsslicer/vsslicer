#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Generates the large inputs (50, 200, 500 MB G-code budget files) that are too big to commit.
// Usage: node scripts/generate-large-fixture.mjs --kind <kind> --size <N>MB --seed <int> --out <path>
//   kind  what to generate; `gcode` is the only planned kind
//   size  target size, e.g. 50MB, 200MB, 500MB (within 1% of the target)
//   seed  integer; same kind + size + seed + generator version => byte-identical output
//   out   file to write, under .cache/large-fixtures/ (git-ignored, cached in CI keyed by this script's hash)
// Exit codes: 0 written, 1 failed, 2 bad arguments or not implemented yet.
// STUB: the gcode generator is filled in by the gcode-parser cards (GCP); change this file to invalidate the CI cache.
import { parseArgs } from 'node:util';

const usage = 'usage: generate-large-fixture.mjs --kind gcode --size 500MB --seed 1 --out .cache/large-fixtures/500mb.gcode';
let v;
try {
  ({ values: v } = parseArgs({ options: { kind: { type: 'string' }, size: { type: 'string' }, seed: { type: 'string' }, out: { type: 'string' } }, strict: true }));
} catch (e) {
  console.error(`${e.message}\n${usage}`);
  process.exit(2);
}
if (v.kind !== 'gcode' || !/^\d+MB$/.test(v.size ?? '') || !/^\d+$/.test(v.seed ?? '') || !v.out) {
  console.error(usage);
  process.exit(2);
}
console.error(`generate-large-fixture: kind ${v.kind} is not implemented yet`);
process.exit(2);
