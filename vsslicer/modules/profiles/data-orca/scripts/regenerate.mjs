// SPDX-License-Identifier: AGPL-3.0-or-later
// Rebuilds data/ from the pinned clones. Reads bytes only; runs nothing from the clones except
// `git rev-parse HEAD` (git, not upstream code). Usage: node scripts/regenerate.mjs [reposDir]
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashFiles, listJson } from './tree.mjs';

export const SOURCES = [
  { name: 'orca', repo: 'OrcaSlicer', commit: '09aa0114b4e145b89cd61015d8cdf29dbc15b008' },
  { name: 'bambu', repo: 'BambuStudio', commit: '79df7ae309be398ed30c9f397c13c9911c2edc57' },
];

const here = dirname(fileURLToPath(import.meta.url));
export const moduleRoot = resolve(here, '..');
export const defaultRepos = resolve(moduleRoot, '../../../.reference/repos');

export function headOf(clone) {
  return execFileSync('git', ['-C', clone, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repos = resolve(process.argv[2] ?? defaultRepos);
  const lines = [];
  const staged = SOURCES.map((s) => {
    const clone = join(repos, s.repo);
    const head = headOf(clone);
    if (head !== s.commit) throw new Error(`${s.repo} is at ${head}, expected ${s.commit}`);
    const root = join(clone, 'resources', 'profiles');
    return { s, root, files: listJson(root) };
  });
  rmSync(join(moduleRoot, 'data'), { recursive: true, force: true });
  for (const { s, root, files } of staged) {
    for (const f of files) {
      const dest = join(moduleRoot, 'data', s.name, f);
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(join(root, f), dest);
    }
    lines.push(`${s.repo} ${s.commit} ${files.length} files`);
  }
  writeFileSync(join(moduleRoot, 'source.commit'), lines.join('\n') + '\n');
  const sums = SOURCES.map((s) => {
    const dir = join(moduleRoot, 'data', s.name);
    return `${s.name} ${hashFiles(dir, listJson(dir))}`;
  });
  writeFileSync(join(moduleRoot, 'tree.sha256'), sums.join('\n') + '\n');
  console.log(lines.join('\n'));
}
