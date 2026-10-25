// SPDX-License-Identifier: AGPL-3.0-or-later
// Resolves `inherits` chains of OrcaSlicer profile JSON (read as data only) into one flat file.
// Usage: node flatten-profile.mjs <out.json> <profile.json> <search-dir>...
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [out, file, ...dirs] = process.argv.slice(2);
if (!out || !file || dirs.length === 0) throw new Error('usage: flatten-profile.mjs <out> <profile> <dir>...');

const byName = new Map();
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) walk(join(d, e.name));
    else if (e.name.endsWith('.json')) {
      try {
        const j = JSON.parse(readFileSync(join(d, e.name), 'utf8'));
        if (typeof j.name === 'string' && !byName.has(j.name)) byName.set(j.name, j);
      } catch {
        // not a profile
      }
    }
  }
};
dirs.forEach(walk);

const resolve = (p) => {
  if (!p.inherits) return { ...p };
  const parent = byName.get(p.inherits);
  if (!parent) throw new Error(`unresolved inherits: ${p.inherits}`);
  return { ...resolve(parent), ...p };
};
const flat = resolve(JSON.parse(readFileSync(file, 'utf8')));
delete flat.inherits;
flat.from = 'User';
writeFileSync(out, JSON.stringify(flat, null, 1));
