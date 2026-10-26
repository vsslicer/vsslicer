// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { dataRoot } from '../src/index.js';
import { hashFiles, listJson } from '../scripts/tree.mjs';
import { SOURCES, defaultRepos, headOf, moduleRoot } from '../scripts/regenerate.mjs';

const counts: Record<string, number> = { orca: 14420, bambu: 3589 };
const sources: { name: string; repo: string; commit: string }[] = SOURCES;
const pinned = Object.fromEntries(
  readFileSync(join(moduleRoot, 'tree.sha256'), 'utf8')
    .trim()
    .split('\n')
    .map((l) => l.split(' ') as [string, string]),
);

describe('committed tree', () => {
  it.each(sources.map((s) => s.name))('%s has the expected files and the pinned hash', (name) => {
    const dir = join(dataRoot, name);
    const files = listJson(dir);
    expect(files).toHaveLength(counts[name] ?? -1);
    expect(hashFiles(dir, files)).toBe(pinned[name]);
  });

  it('carries licences, notice and the commits; package.json keeps the project licence field until Q20 (the data is AGPL-3.0-only, see NOTICE)', () => {
    for (const f of ['LICENSE-OrcaSlicer', 'LICENSE-BambuStudio', 'NOTICE', 'PROVENANCE.md']) {
      expect(existsSync(join(moduleRoot, f))).toBe(true);
    }
    const src = readFileSync(join(moduleRoot, 'source.commit'), 'utf8');
    for (const s of sources) expect(src).toContain(s.commit);
    expect(JSON.parse(readFileSync(join(moduleRoot, 'package.json'), 'utf8')).license).toBe('AGPL-3.0-or-later');
  });
});

const clones = sources.map((s) => ({ ...s, dir: join(defaultRepos, s.repo) }));
describe.skipIf(!clones.every((c) => existsSync(c.dir) && headOf(c.dir) === c.commit))('pinned clones', () => {
  it.each(clones.map((c) => [c.name, c.dir] as const))('%s clone matches the committed tree', (name, dir) => {
    const root = join(dir, 'resources', 'profiles');
    expect(hashFiles(root, listJson(root))).toBe(pinned[name]);
  });
});

describe('listJson refuses hostile trees', () => {
  const made: string[] = [];
  const tmp = () => {
    const d = mkdtempSync(join(tmpdir(), 'pdo-'));
    made.push(d);
    return d;
  };
  afterEach(() => {
    for (const d of made.splice(0)) rmSync(d, { recursive: true, force: true });
  });
  it('symlinks', () => {
    const d = tmp();
    writeFileSync(join(d, 'a.json'), '{}');
    symlinkSync(join(d, 'a.json'), join(d, 'b.json'));
    expect(() => listJson(d)).toThrow(/symlink/);
  });
  it('symlinked directories leaving the root', () => {
    const d = tmp();
    mkdirSync(join(d, 'in'));
    symlinkSync(tmp(), join(d, 'in', 'out'));
    expect(() => listJson(join(d, 'in'))).toThrow(/symlink/);
  });
  it('files over the cap, and skips non-json', () => {
    const d = tmp();
    writeFileSync(join(d, 'big.json'), 'x'.repeat(11));
    writeFileSync(join(d, 'x.png'), 'x'.repeat(11));
    expect(() => listJson(d, 10)).toThrow(/over/);
    expect(listJson(d, 11)).toEqual(['big.json']);
  });
});

describe('dataRoot', () => {
  it('resolves under a path containing a space', () => {
    const base = realpathSync(mkdtempSync(join(tmpdir(), 'pdo-')));
    try {
      const mod = join(base, 'my module');
      mkdirSync(join(mod, 'src'), { recursive: true });
      mkdirSync(join(mod, 'data'));
      copyFileSync(join(moduleRoot, 'src', 'index.ts'), join(mod, 'src', 'index.ts'));
      const out = execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          'import(process.argv[1]).then((m) => process.stdout.write(m.dataRoot))',
          pathToFileURL(join(mod, 'src', 'index.ts')).href,
        ],
        { encoding: 'utf8' },
      );
      expect(out.replace(/[\\/]+$/, '')).toBe(join(mod, 'data'));
      expect(out.endsWith(sep)).toBe(true);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
