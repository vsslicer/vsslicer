// SPDX-License-Identifier: AGPL-3.0-or-later
// Publish-time generator: copies the profile JSON trees from OrcaSlicer and Bambu Studio checkouts
// into data/ and checks them against source.commit and tree.sha256. Reads bytes only; the only
// process run is git. Usage: node scripts/generate.mjs [reposDir] (or VSS_PROFILE_REPOS). Per-repo override:
// VSS_REPO_<ORCASLICER|BAMBUSTUDIO>. A missing clone is fetched at its pinned commit (fetch.mjs, PLT-224).
import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashFiles, listJson, MAX_FILE_BYTES, MAX_FILES, MAX_TOTAL_BYTES } from './tree.mjs';
import { defaultRepos, headOf, moduleRoot } from './regenerate.mjs';
import { fetchPinned } from './fetch.mjs';

const NAMES = { OrcaSlicer: 'orca', BambuStudio: 'bambu' };

/** Pins from source.commit ("<Repo> <sha> <n> files") and tree.sha256 ("<name> <sha256>"). */
export function readPins(root = moduleRoot) {
  const lines = (f) => readFileSync(join(root, f), 'utf8').trim().split('\n');
  const sums = Object.fromEntries(lines('tree.sha256').map((l) => l.split(' ')));
  return lines('source.commit').map((l) => {
    const [repo, commit] = l.split(' ');
    const name = NAMES[repo];
    if (!name || !/^[0-9a-f]{40}$/.test(commit ?? '') || !sums[name]) throw new Error(`bad pin line: ${l}`);
    return { name, repo, commit, sha256: sums[name] };
  });
}

export function generate({
  repos = defaultRepos,
  outDir = join(moduleRoot, 'data'),
  pins = readPins(),
  head = headOf,
  maxBytes = MAX_FILE_BYTES,
  maxFiles = MAX_FILES,
  maxTotal = MAX_TOTAL_BYTES,
  rename = renameSync,
  fetch = fetchPinned,
} = {}) {
  const out = resolve(outDir);
  let totalFiles = 0;
  let totalBytes = 0;
  const staged = pins.map((p) => {
    const local = resolve(process.env[`VSS_REPO_${p.repo.toUpperCase()}`] ?? join(repos, p.repo));
    const clone = existsSync(local) ? local : fetch(p);
    const got = head(clone);
    if (got !== p.commit) throw new Error(`commit mismatch: ${p.repo} is at ${got}, expected ${p.commit}`);
    const root = join(clone, 'resources', 'profiles');
    // A symlinked resources/ or profiles/ would pass listJson (it trusts its own root): check here.
    const realClone = realpathSync(clone);
    const realRoot = realpathSync(root);
    if (!realRoot.startsWith(realClone + sep)) throw new Error(`profiles root leaves the clone: ${root}`);
    const files = listJson(root, maxBytes, maxFiles, maxTotal);
    // Caps hold across trees, and are checked before anything is copied.
    totalFiles += files.length;
    if (totalFiles > maxFiles) throw new Error(`more than ${maxFiles} files in total`);
    for (const f of files) totalBytes += statSync(join(root, f)).size;
    if (totalBytes > maxTotal) throw new Error(`total over ${maxTotal} bytes`);
    return { p, root, files };
  });
  // Stage beside the target, verify, then swap, so a failed run leaves no half-written data/.
  const tmp = `${out}.tmp`;
  const old = `${out}.old`;
  rmSync(tmp, { recursive: true, force: true });
  try {
    const lines = [];
    for (const { p, root, files } of staged) {
      const dir = join(tmp, p.name);
      for (const f of files) {
        const dest = resolve(dir, f);
        if (!dest.startsWith(dir + sep)) throw new Error(`path leaves the target root: ${f}`);
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(join(root, f), dest);
      }
      const sum = hashFiles(dir, listJson(dir, maxBytes, maxFiles, maxTotal));
      if (sum !== p.sha256) throw new Error(`tree hash mismatch for ${p.name}: got ${sum}, expected ${p.sha256}`);
      lines.push(`${p.repo} ${p.commit} ${files.length} files`);
    }
    // Swap by rename: if the second rename fails the old data/ is put back.
    rmSync(old, { recursive: true, force: true });
    const had = existsSync(out);
    if (had) rename(out, old);
    try {
      rename(tmp, out);
    } catch (e) {
      if (had) renameSync(old, out);
      throw e;
    }
    return lines;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
    rmSync(old, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repos = process.argv[2] ?? process.env.VSS_PROFILE_REPOS ?? defaultRepos;
  console.log(generate({ repos: resolve(repos) }).join('\n'));
}
