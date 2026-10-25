// SPDX-License-Identifier: AGPL-3.0-or-later
// Writes shipped-extensions.txt into package.json `extensionPack` (`--check`: only verify, exit 1 on drift).
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);

/** @param {string} text one extension id per line, `#` comments */
export const parseIds = (text) => {
  const ids = text
    .split('\n')
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean);
  for (const id of ids)
    if (!/^[a-z0-9][a-z0-9-]*\.[a-z0-9][a-z0-9-]*$/i.test(id)) throw new Error(`invalid extension id: ${id}`);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`duplicate extension id: ${dup}`);
  return ids;
};

if (import.meta.filename === process.argv[1]) {
  const file = new URL('package.json', root);
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  pkg.extensionPack = parseIds(readFileSync(new URL('shipped-extensions.txt', root), 'utf8'));
  const next = `${JSON.stringify(pkg, null, 2)}\n`;
  if (next === readFileSync(file, 'utf8')) process.exit(0);
  if (process.argv.includes('--check')) {
    console.error('package.json extensionPack is out of date: run pnpm build');
    process.exit(1);
  }
  writeFileSync(file, next);
}
