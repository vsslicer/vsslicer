// SPDX-License-Identifier: AGPL-3.0-or-later
// Keeps the repository small: no fixture over 5 MB, every folder directly under a `fixtures` root has PROVENANCE.md.
// Roots: <root>/fixtures and <root>/modules/<group>/<module>/test/fixtures. Usage: node scripts/check-fixtures.mjs [vsslicer-dir]
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const maxBytes = 5 * 1024 * 1024;
// Hand-written lint/licence violations, not captured data: size cap still applies, PROVENANCE.md does not.
const provenanceExempt = ['modules/tooling/tooling/test/fixtures'];

const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()) : []);
const files = (p) => readdirSync(p, { withFileTypes: true, recursive: true }).filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name)).filter((f) => !f.includes('node_modules')); // installed deps are not committed

export function checkFixtures(root) {
  const fixtureRoots = [join(root, 'fixtures'), ...dirs(join(root, 'modules')).flatMap((g) => [g.name, ...dirs(join(root, 'modules', g.name)).map((m) => `${g.name}/${m.name}`)]).map((m) => join(root, 'modules', m, 'test', 'fixtures'))].filter(existsSync);
  const problems = [];
  for (const r of fixtureRoots) {
    const rel = relative(root, r).split('\\').join('/');
    for (const f of files(r)) {
      const size = statSync(f).size;
      if (size > maxBytes) problems.push(`${relative(root, f)}: ${size} bytes exceeds the ${maxBytes} byte cap (generate large inputs with scripts/generate-large-fixture.mjs)`);
    }
    if (provenanceExempt.includes(rel)) continue;
    for (const d of dirs(r)) if (!existsSync(join(r, d.name, 'PROVENANCE.md'))) problems.push(`${rel}/${d.name}: missing PROVENANCE.md`);
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = checkFixtures(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
  for (const p of problems) console.error(p);
  process.exit(problems.length ? 1 : 0);
}
