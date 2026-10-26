// SPDX-License-Identifier: AGPL-3.0-or-later
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generate, readPins } from '../scripts/generate.mjs';
import { hashFiles, listJson } from '../scripts/tree.mjs';
import { moduleRoot } from '../scripts/regenerate.mjs';

const fixture = resolve(__dirname, 'fixture');
const COMMIT = 'a'.repeat(40);
const made: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), 'pdo-gen-'));
  made.push(d);
  return d;
};
afterEach(() => {
  for (const d of made.splice(0)) rmSync(d, { recursive: true, force: true });
});
const profiles = (repos: string) => join(repos, 'Repo', 'resources', 'profiles');
const sha = (dir: string) => hashFiles(dir, listJson(dir));
const run = (repos: string, over: Record<string, unknown> = {}) => {
  const out = join(tmp(), 'data');
  const pins = [{ name: 'repo', repo: 'Repo', commit: COMMIT, sha256: sha(profiles(fixture)) }];
  return { out, go: () => generate({ repos, outDir: out, pins, head: () => COMMIT, ...over }) };
};
/** Copy of the fixture in a scratch dir to mutate. */
const scratch = () => {
  const d = tmp();
  cpSync(fixture, d, { recursive: true });
  return d;
};

describe('generate', () => {
  it('copies only json and matches the pinned hash', () => {
    const { out, go } = run(fixture);
    expect(go()).toEqual([`Repo ${COMMIT} 2 files`]);
    expect(listJson(join(out, 'repo'))).toEqual(['V.json', 'V/m.json']);
    expect(existsSync(join(out, 'repo', 'V', 'skip.png'))).toBe(false);
    expect(existsSync(`${out}.tmp`)).toBe(false);
  });
  it('fails on a commit mismatch', () => {
    expect(run(fixture, { head: () => 'b'.repeat(40) }).go).toThrow(/commit mismatch/);
  });
  it('fails on a hash mismatch and leaves no data/', () => {
    const repos = scratch();
    writeFileSync(join(profiles(repos), 'V.json'), '{"a":2}');
    const { out, go } = run(repos, {
      pins: [{ name: 'repo', repo: 'Repo', commit: COMMIT, sha256: sha(profiles(fixture)) }],
    });
    expect(go).toThrow(/tree hash mismatch/);
    expect(existsSync(out)).toBe(false);
  });
  it('refuses a symlink', () => {
    const repos = scratch();
    symlinkSync(join(profiles(repos), 'V.json'), join(profiles(repos), 'link.json'));
    expect(run(repos).go).toThrow(/symlink/);
  });
  it('refuses a symlinked directory leaving the source root', () => {
    const repos = scratch();
    symlinkSync(tmp(), join(profiles(repos), 'out'));
    expect(run(repos).go).toThrow(/symlink/);
  });
  it('refuses too many files, a big file and a big total', () => {
    expect(run(fixture, { maxFiles: 1 }).go).toThrow(/more than 1 files/);
    expect(run(fixture, { maxBytes: 5 }).go).toThrow(/over 5 bytes/);
    expect(run(fixture, { maxTotal: 10 }).go).toThrow(/total over 10/);
  });
  const two = (over: Record<string, unknown>) => {
    const sha256 = sha(profiles(fixture));
    const pins = ['one', 'two'].map((name) => ({ name, repo: 'Repo', commit: COMMIT, sha256 }));
    return run(fixture, { pins, ...over });
  };
  it('refuses more files than the cap across all trees', () => {
    // each tree has 2 files (under 3), together 4
    const { out, go } = two({ maxFiles: 3 });
    expect(go).toThrow(/more than 3 files in total/);
    expect(existsSync(out)).toBe(false);
  });
  it('refuses more bytes than the cap across all trees, before copying', () => {
    const dir = profiles(fixture);
    const one = listJson(dir).reduce((n, f) => n + statSync(join(dir, f)).size, 0);
    const { out, go } = two({ maxTotal: one + 1 });
    expect(go).toThrow(/total over/);
    expect(existsSync(out)).toBe(false);
    expect(existsSync(`${out}.tmp`)).toBe(false);
  });
  it('refuses a profiles root that is a symlink leaving the clone', () => {
    const repos = scratch();
    const outside = tmp();
    writeFileSync(join(outside, 'x.json'), '{}');
    rmSync(join(repos, 'Repo', 'resources', 'profiles'), { recursive: true });
    symlinkSync(outside, profiles(repos));
    expect(run(repos).go).toThrow(/leaves the clone/);
  });
});

describe('readPins', () => {
  it('reads the committed pins', () => {
    const pins = readPins(moduleRoot);
    expect(pins.map((p) => p.name)).toEqual(['orca', 'bambu']);
    expect(readFileSync(join(moduleRoot, '.gitignore'), 'utf8')).toContain('data/');
  });
});
