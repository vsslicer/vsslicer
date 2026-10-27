// SPDX-License-Identifier: AGPL-3.0-or-later
// PLT-224: fetches a pinned upstream commit when no local clone exists (a CI checkout has no .reference). Shallow,
// blobless, sparse to resources/profiles: about 43 MB for both repos. Runs git only, never upstream code; generate.mjs
// then checks the commit and the tree hash, so a stale or tampered cache fails there.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { headOf } from './regenerate.mjs';

export const URLS = {
  OrcaSlicer: 'https://github.com/OrcaSlicer/OrcaSlicer.git',
  BambuStudio: 'https://github.com/bambulab/BambuStudio.git',
};

export const defaultCache = resolve(process.env.VSS_PROFILE_FETCH_CACHE ?? join(tmpdir(), 'vsslicer-profile-repos'));

/** Clone dir for `pin` under `cache`, at `pin.commit`; reused when already there. */
export function fetchPinned(pin, cache = defaultCache, url = URLS[pin.repo]) {
  const dir = join(cache, pin.repo);
  if (existsSync(dir)) {
    try {
      if (headOf(dir) === pin.commit) return dir;
    } catch {
      // not a usable clone: fetch again
    }
    rmSync(dir, { recursive: true, force: true });
  }
  if (!url) throw new Error(`no upstream URL for ${pin.repo}`);
  mkdirSync(dir, { recursive: true });
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
  console.error(`fetching ${pin.repo}@${pin.commit} into ${dir}`);
  git('init', '-q');
  git('config', 'core.longpaths', 'true'); // Windows: deep profile paths
  git('remote', 'add', 'origin', url);
  git('sparse-checkout', 'set', '--no-cone', '/resources/profiles/');
  git('fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', pin.commit);
  git('-c', 'advice.detachedHead=false', 'checkout', '-q', 'FETCH_HEAD');
  return dir;
}
