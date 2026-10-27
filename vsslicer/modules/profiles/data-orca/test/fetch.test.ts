// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { fetchPinned } from '../scripts/fetch.mjs';
import { generate } from '../scripts/generate.mjs';
import { headOf } from '../scripts/regenerate.mjs';
import { hashFiles, listJson } from '../scripts/tree.mjs';

const base = mkdtempSync(join(tmpdir(), 'pdo-fetch-'));
afterAll(() => rmSync(base, { recursive: true, force: true }));
const git = (dir: string, ...args: string[]) =>
  execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

// An "upstream" with a profile tree plus a file outside it that the sparse checkout must leave out.
const up = join(base, 'up');
mkdirSync(join(up, 'resources', 'profiles', 'V'), { recursive: true });
writeFileSync(join(up, 'resources', 'profiles', 'V.json'), '{"v":1}');
writeFileSync(join(up, 'resources', 'profiles', 'V', 'm.json'), '{"m":1}');
writeFileSync(join(up, 'build.sh'), 'exit 1');
git(up, 'init', '-q');
for (const [k, v] of [
  ['user.email', 't@t'],
  ['user.name', 't'],
  ['uploadpack.allowFilter', 'true'],
  ['uploadpack.allowAnySHA1InWant', 'true'],
]) {
  git(up, 'config', k!, v!);
}
git(up, 'add', '.');
git(up, 'commit', '-qm', 'one');
const commit = git(up, 'rev-parse', 'HEAD');
const url = pathToFileURL(up).href;
const tree = join(up, 'resources', 'profiles');
const pin = { name: 'repo', repo: 'Repo', commit, sha256: hashFiles(tree, listJson(tree)) };

describe('fetchPinned', () => {
  it('fetches the pinned commit, profiles only, then reuses it; generate fetches a missing clone', () => {
    const cache = join(base, 'cache');
    const dir = fetchPinned(pin, cache, url);
    expect(headOf(dir)).toBe(commit);
    expect(listJson(join(dir, 'resources', 'profiles'))).toEqual(['V.json', 'V/m.json']);
    expect(existsSync(join(dir, 'build.sh'))).toBe(false);
    git(up, 'commit', '-q', '--allow-empty', '-m', 'two'); // a refetch would not change the pinned head
    expect(fetchPinned(pin, cache, url)).toBe(dir);

    const out = join(base, 'data');
    const fetched: string[] = [];
    const fetch = (p: typeof pin) => (fetched.push(p.repo), fetchPinned(p, cache, url));
    expect(generate({ repos: join(base, 'empty'), outDir: out, pins: [pin], fetch })).toEqual([
      `Repo ${commit} 2 files`,
    ]);
    expect(fetched).toEqual(['Repo']);
  });
  it('replaces a cache dir that is not the pinned clone', () => {
    const cache = join(base, 'cache2');
    mkdirSync(join(cache, 'Repo'), { recursive: true });
    writeFileSync(join(cache, 'Repo', 'junk'), 'x');
    const dir = fetchPinned(pin, cache, url);
    expect(headOf(dir)).toBe(commit);
    expect(existsSync(join(dir, 'junk'))).toBe(false);
  });
});
