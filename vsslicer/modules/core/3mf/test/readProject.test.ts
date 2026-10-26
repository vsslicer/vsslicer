// SPDX-License-Identifier: AGPL-3.0-or-later
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { createReadProject } from '../src/application/readProject.ts';
import type { ReadProjectDeps } from '../src/application/readProject.ts';
import type { Package } from '../src/domain/package.ts';
import { createProject, openPackage } from '../src/index.ts';
import type { Dialect } from '../src/index.ts';
import { readProject } from '../src/readProject.ts';

const part = (name: string) => ({ name, contentType: 'x', relationships: [], bytes: new Uint8Array([1, 2]) });
const pkg: Package = {
  rootModel: '3D/3dmodel.model',
  parts: [part('3D/3dmodel.model'), part('3D/Objects/o.model'), part('Metadata/Slic3r_PE.config'), part('Other/x.bin')],
};
const orcaMeta = new Map([['Application', 'OrcaSlicer-2.3.0']]);
const make = (over: Partial<ReadProjectDeps> = {}) =>
  createReadProject({
    readCore: () => createProject({ dialect: 'core' }),
    readMetadata: () => orcaMeta,
    ...over,
  });
const fromReader = createProject({ dialect: 'orca' });

describe('createReadProject', () => {
  test('uses the detected dialect reader', () => {
    const p = make({ readers: new Map([['orca', () => fromReader]]) })(pkg);
    expect(p).toBe(fromReader);
  });

  test('a core package never reaches a reader', () => {
    const p = make({
      readMetadata: () => new Map(),
      readers: new Map<Dialect, () => never>([
        [
          'core',
          () => {
            throw new Error('no');
          },
        ],
      ]),
    })({ ...pkg, parts: pkg.parts.slice(0, 2) });
    expect(p.dialect).toBe('core');
    expect(p.notices).toBeUndefined();
  });

  test('a core package keeps its non-model parts', () => {
    const p = make({ readMetadata: () => new Map() })({
      ...pkg,
      parts: [...pkg.parts.slice(0, 2), part('Other/x.bin')],
    });
    expect(p.preserved.map((x) => x.name)).toEqual(['Other/x.bin']);
    expect(p.notices).toBeUndefined();
  });

  test.each([
    [
      'disabled',
      { readers: new Map([['orca' as Dialect, () => fromReader]]), disabled: new Set<Dialect>(['orca']) },
      'disabled',
    ],
    ['missing', {}, 'no reader'],
    [
      'failing',
      {
        readers: new Map<Dialect, () => never>([
          [
            'orca',
            () => {
              throw new Error('boom');
            },
          ],
        ]),
      },
      'failed: boom',
    ],
  ])('%s reader falls back to core with a notice and keeps unknown parts', (_n, deps, text) => {
    const p = make(deps)(pkg);
    expect(p.dialect).toBe('core');
    expect(p.notices).toHaveLength(1);
    expect(p.notices![0]).toContain('orca');
    expect(p.notices![0]).toContain(text);
    expect(p.preserved.map((x) => x.name)).toEqual(['Metadata/Slic3r_PE.config', 'Other/x.bin']);
    expect(p.preserved[1]!.bytes).toBe(pkg.parts[3]!.bytes);
  });

  test('fallback keeps what the core read already preserved', () => {
    const kept = part('kept.bin');
    const p = make({ readCore: () => createProject({ dialect: 'core', preserved: [kept] }) })(pkg);
    expect(p.preserved[0]).toBe(kept);
  });

  test('an error of the core read propagates', () => {
    const run = make({
      readCore: () => {
        throw new Error('core broke');
      },
    });
    expect(() => run(pkg)).toThrow('core broke');
  });
});

describe('readProject on fixtures', () => {
  const dir = join(__dirname, 'fixtures/real');
  test.each(readdirSync(dir).filter((f) => f.endsWith('.3mf')))(
    '%s has a dialect and keeps its non-model parts',
    (f) => {
      const pk = openPackage(readFileSync(join(dir, f)));
      const p = readProject(pk);
      expect(['core', 'bambu', 'orca', 'prusa2', 'prusa3', 'cura']).toContain(p.dialect);
      expect(p.objects.length).toBeGreaterThan(0);
      expect(p.notices ?? []).toEqual([]);
      const kept = new Set(p.preserved.map((x) => x.name));
      for (const part of pk.parts)
        if (!part.name.toLowerCase().endsWith('.model'))
          expect(kept.has(part.name) || p.rawConfig.has(part.name)).toBe(true);
    },
  );

  test('a Bambu file is read by the bambu reader, with its project config kept raw', () => {
    const p = readProject(openPackage(readFileSync(join(__dirname, 'fixtures/real/pa_pattern.3mf'))));
    expect(p.dialect).toBe('bambu');
    expect(p.notices ?? []).toEqual([]);
    expect(p.rawConfig.has('Metadata/project_settings.config')).toBe(true);
  });

  test('a PrusaSlicer 2.x file is read by the prusa2 reader, not the core fallback', () => {
    const p = readProject(openPackage(readFileSync(join(__dirname, 'fixtures/real/fdm_roundtrip1.3mf'))));
    expect(p.dialect).toBe('prusa2');
    expect(p.notices ?? []).toEqual([]);
  });
});
