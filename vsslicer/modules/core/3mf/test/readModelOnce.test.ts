// SPDX-License-Identifier: AGPL-3.0-or-later
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Package } from '../src/domain/package.ts';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const calls = vi.hoisted(() => ({ n: 0, names: [] as string[] }));
vi.mock('../src/adapters/model/readModel.ts', async (orig) => {
  const m = await orig<typeof import('../src/adapters/model/readModel.ts')>();
  return {
    ...m,
    readModel: (...a: Parameters<typeof m.readModel>) => {
      calls.n++;
      calls.names.push(a[1]);
      return m.readModel(...a);
    },
  };
});

const { readModelOnce } = await import('../src/adapters/model/readModelOnce.ts');
const { readProject } = await import('../src/readProject.ts');
const { openPackage } = await import('../src/index.ts');
const { createReadProject } = await import('../src/application/readProject.ts');
const { readProject: readCore } = await import('../src/adapters/model/resolveProject.ts');

const model = (n: number) =>
  new TextEncoder().encode(
    `<model xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources/><build/><!--${n}--></model>`,
  );

beforeEach(() => {
  calls.n = 0;
  calls.names = [];
});

describe('readModelOnce', () => {
  test('the same bytes are parsed once and share the result', () => {
    const b = model(1);
    expect(readModelOnce(b, 'a.model')).toBe(readModelOnce(b, 'a.model'));
    expect(calls.n).toBe(1);
  });

  test('equal content in other bytes, or another part name, is parsed again', () => {
    readModelOnce(model(1), 'a.model');
    readModelOnce(model(1), 'a.model');
    const b = model(2);
    readModelOnce(b, 'a.model');
    readModelOnce(b, 'b.model');
    expect(calls.n).toBe(4);
  });

  test('a failed parse is not cached', () => {
    const bad = new TextEncoder().encode('<nope');
    expect(() => readModelOnce(bad, 'x.model')).toThrow();
    expect(() => readModelOnce(bad, 'x.model')).toThrow();
    expect(calls.n).toBe(2);
  });
});

const dir = join(__dirname, 'fixtures/real');
const fixtures = readdirSync(dir).filter((f) => f.endsWith('.3mf'));
const load = (f: string) => openPackage(readFileSync(join(dir, f)));

describe('readProject parses each root model once', () => {
  test.each(fixtures)('%s', (f) => {
    const pk = load(f);
    readProject(pk);
    expect(calls.names.filter((n) => n === pk.rootModel)).toHaveLength(1);
    expect(new Set(calls.names).size).toBe(calls.names.length);
  });

  test('also when the dialect reader fails and the core read is the fallback', () => {
    const f = fixtures.find((x) => readProject(load(x)).dialect !== 'core');
    expect(f).toBeDefined();
    const pk = load(f!);
    calls.names = [];
    const failing = (p: Package) => {
      readModelOnce(p.parts.find((x) => x.name === p.rootModel)!.bytes, p.rootModel);
      throw new Error('boom');
    };
    const read = createReadProject({
      readCore,
      readMetadata: (p) => readModelOnce(p.parts.find((x) => x.name === p.rootModel)!.bytes, p.rootModel).metadata,
      readers: new Map((['bambu', 'orca', 'cura', 'prusa2'] as const).map((d) => [d, failing])),
    });
    const project = read(pk);
    expect(project.notices?.join()).toContain('its reader failed: boom');
    expect(calls.names.filter((n) => n === pk.rootModel)).toHaveLength(1);
  });
});
