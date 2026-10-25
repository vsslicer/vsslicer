// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fixturesDir, loadManifest, readGolden, summarise, type Summary } from './support/golden.ts';
import { interimSummary } from './support/interim-summary.ts';

const manifest = loadManifest();

describe('golden corpus', () => {
  it.each(manifest.files)('$path matches its golden JSON', (file) => {
    expect(existsSync(join(fixturesDir, file.path)), 'fixture file is missing').toBe(true);
    // a difference fails; regenerate deliberately with `pnpm golden:update`
    expect(summarise(interimSummary, file)).toEqual(readGolden(file));
  });

  it('manifest and fixture folders list the same files', () => {
    const onDisk = readdirSync(fixturesDir, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile() && e.name !== 'manifest.json' && e.name !== 'PROVENANCE.md')
      .map((e) => join(e.parentPath, e.name).slice(fixturesDir.length + 1))
      .sort();
    expect(onDisk).toEqual(manifest.files.map((f) => f.path).sort());
  });

  it('every fixture folder has a PROVENANCE.md', () => {
    for (const dir of new Set(manifest.files.map((f) => f.path.split('/')[0] ?? ''))) {
      expect(existsSync(join(fixturesDir, dir, 'PROVENANCE.md')), dir).toBe(true);
    }
  });

  it('records generator and version for every file, and a reason for every gap', () => {
    for (const f of manifest.files) expect(f.slicerVersion, f.path).not.toBe('');
    for (const p of manifest.pending) expect(p.reason, p.what).not.toBe('');
  });
});

describe('harness', () => {
  it('detects a changed summary', () => {
    const file = manifest.files[0];
    if (!file) throw new Error('empty corpus');
    const golden: Summary = readGolden(file);
    const changed = summarise((bytes, f) => {
      const s = interimSummary(bytes, f);
      return { ...s, interim: { ...(s['interim'] as object), g1: -1 } };
    }, file);
    expect(changed).not.toEqual(golden);
  });
});
