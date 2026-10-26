// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  runImporterContract,
  type Diagnostic,
  type ImportedEntity,
  type Importer,
  type ImportResult,
  type SourceFile,
} from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import { importProfiles, type ProfileSource } from '../src/application/import/import-profiles.ts';
import { createImporterRegistry } from '../src/application/import/registry.ts';

const file = (path: string, text = 'x'): SourceFile => ({ path, bytes: new TextEncoder().encode(text) });
const entity = (id: string) => ({ id }) as ImportedEntity;
const memory = (files: SourceFile[], label = 'mem:/profiles'): ProfileSource => ({ label, read: async () => files });
const valid = (e: ImportedEntity) => (typeof e.id === 'string' && e.id !== '' ? undefined : 'id must be non-empty');

/** Claims files by extension; turns each claimed file into one entity named after it, plus `extra` diagnostics. */
function fake(ext: string, extra: Diagnostic[] = [], calls: SourceFile[][] = []): Importer {
  return {
    formats: ['orca-json'],
    canHandle: (f) => f.path.endsWith(ext),
    async import(files) {
      calls.push([...files]);
      const entities = files.map((f) => entity(f.path));
      const native: Record<string, unknown> = {};
      for (const f of files) native[f.path] = { from: ext };
      return { entities, native, diagnostics: files.length === 0 ? [] : extra };
    },
  };
}
const rejecting: Importer = {
  formats: ['cura'],
  canHandle: (f) => f.path.endsWith('.cfg'),
  import: async () => {
    throw new Error('boom');
  },
};

const failureCodes: Diagnostic[] = [
  { severity: 'error', code: 'cycle', file: 'a.json', message: 'a inherits itself' },
  { severity: 'error', code: 'unknown-parent', file: 'a.json', line: 3, message: 'no parent b' },
  { severity: 'error', code: 'malformed-line', file: 'a.json', line: 7, message: 'no =' },
  { severity: 'error', code: 'invalid-json', file: 'a.json', message: 'truncated' },
  { severity: 'warning', code: 'unknown-type', file: 'a.json', message: 'type foo' },
  { severity: 'error', code: 'unreadable-folder', file: 'sub', message: 'EACCES' },
];

describe('importProfiles over the registry', () => {
  test('a failing importer yields coded diagnostics while the others still deliver', async () => {
    const registry = createImporterRegistry([fake('.json', failureCodes), rejecting, fake('.ini')]);
    const r = await importProfiles(memory([file('a.json'), file('b.cfg'), file('c.ini')]), registry, valid);
    expect(r.entities.map((e) => e.id).sort()).toEqual(['a.json', 'c.ini']);
    expect(r.diagnostics).toEqual([
      ...failureCodes,
      {
        severity: 'error',
        code: 'unreadable-folder',
        file: 'b.cfg',
        message: 'the cura importer failed: Error: boom',
      },
    ]);
    expect({ ...r.native }).toEqual({ 'a.json': { from: '.json' }, 'c.ini': { from: '.ini' } });
  });

  test('a source that cannot be read gives unreadable-folder and runs no importer', async () => {
    const calls: SourceFile[][] = [];
    const source: ProfileSource = {
      label: '/missing',
      read: async () => {
        throw new Error('ENOENT');
      },
    };
    const r = await importProfiles(source, createImporterRegistry([fake('.json', [], calls)]), valid);
    expect(r.entities).toEqual([]);
    expect(r.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'unreadable-folder',
        file: '/missing',
        message: 'cannot read the source: Error: ENOENT',
      },
    ]);
    expect(calls).toEqual([]);
  });

  // vitest runs in plain Node and `vscode` is not installed, so a stray import would fail this file's load.
  test('runs on an in-memory source in plain Node', async () => {
    const r = await importProfiles(memory([file('p.json')]), createImporterRegistry([fake('.json')]), valid);
    expect(r.entities).toEqual([{ id: 'p.json' }]);
  });

  test('an entity failing the schema is not returned and becomes a diagnostic, its native form dropped', async () => {
    const registry = createImporterRegistry([fake('.json')]);
    const schema = (e: ImportedEntity) => (e.id === 'bad.json' ? 'settings is not an object' : undefined);
    const r = await importProfiles(memory([file('ok.json'), file('bad.json')]), registry, schema);
    expect(r.entities).toEqual([{ id: 'ok.json' }]);
    expect({ ...r.native }).toEqual({ 'ok.json': { from: '.json' } });
    expect(r.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'invalid-json',
        file: 'mem:/profiles',
        message: 'bad.json fails the profile schema: settings is not an object',
      },
    ]);
  });

  test('a validator that throws rejects the entity rather than the import', async () => {
    const throwing = () => {
      throw new Error('schema compile');
    };
    const r = await importProfiles(memory([file('a.json')]), createImporterRegistry([fake('.json')]), throwing);
    expect(r.entities).toEqual([]);
    expect(r.diagnostics.map((d) => d.message)).toEqual(['a.json fails the profile schema: Error: schema compile']);
  });
});

describe('createImporterRegistry', () => {
  test('passes the importer contract as a composite importer', async () => {
    const registry = createImporterRegistry([fake('.json'), rejecting, fake('.ini')]);
    await runImporterContract(registry, [file('vendor.json'), file('printer.ini')]);
  });

  test('routes each file to the first importer that claims it; unclaimed files get unknown-type', async () => {
    const first: SourceFile[][] = [];
    const second: SourceFile[][] = [];
    const throwsOnCanHandle: Importer = {
      formats: ['prusa-ini'],
      canHandle: () => {
        throw new Error('sniff');
      },
      import: async () => ({ entities: [entity('never')], native: {}, diagnostics: [] }),
    };
    const registry = createImporterRegistry([throwsOnCanHandle, fake('.json', [], first), fake('n', [], second)]);
    expect(registry.formats).toEqual(['prusa-ini', 'orca-json']);
    expect(registry.canHandle(file('x.json'))).toBe(true);
    expect(registry.canHandle(file('x.txt'))).toBe(false);
    const r = await registry.import([file('a.json'), file('b.json'), file('c.txt')]);
    expect(first.map((b) => b.map((f) => f.path))).toEqual([['a.json', 'b.json']]);
    expect(second).toEqual([]);
    expect(r.diagnostics).toEqual([
      { severity: 'warning', code: 'unknown-type', file: 'c.txt', message: 'no registered importer reads this file' },
    ]);
  });

  test('an importer returning no result shape gives a diagnostic instead of breaking the merge', async () => {
    const broken: Importer = {
      formats: ['bambu-json'],
      canHandle: () => true,
      import: async () => ({ entities: null }) as unknown as ImportResult,
    };
    const r = await createImporterRegistry([broken]).import([file('a.json')]);
    expect(r.entities).toEqual([]);
    expect(r.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'unreadable-folder',
        file: 'a.json',
        message: 'the bambu-json importer failed: it returned no import result',
      },
    ]);
  });
});

describe('bounds', () => {
  test('50000 files are read; 50001 are refused whole and no importer runs', async () => {
    const calls: SourceFile[][] = [];
    const registry = createImporterRegistry([fake('.json', [], calls)]);
    const files = Array.from({ length: 50_000 }, (_, i) => file(`${i}.json`, ''));
    const ok = await registry.import(files);
    expect(ok.entities).toHaveLength(50_000);
    expect(calls).toHaveLength(1);
    const refused = await registry.import([...files, file('one-more.json')]);
    expect(refused.entities).toEqual([]);
    expect(refused.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'unreadable-folder',
        file: '',
        message: '50001 files is more than the 50000 one import reads',
      },
    ]);
    expect(calls).toHaveLength(1);
  }, 30_000);

  test('paths and messages copied into diagnostics are clipped to 1024 characters', async () => {
    const long = 'p'.repeat(5_000);
    const r = await createImporterRegistry([fake('.json')]).import([file(long)]);
    expect(r.diagnostics[0]!.file).toBe(`${'p'.repeat(1_024)}…`);
    const atCap = await createImporterRegistry([fake('.json')]).import([file('p'.repeat(1_024))]);
    expect(atCap.diagnostics[0]!.file).toBe('p'.repeat(1_024));
    const overCap = await createImporterRegistry([fake('.json')]).import([file('p'.repeat(1_025))]);
    expect(overCap.diagnostics[0]!.file).toBe(`${'p'.repeat(1_024)}…`);
    const unreadable: ProfileSource = {
      label: long,
      read: async () => {
        throw new Error(long);
      },
    };
    const u = await importProfiles(unreadable, createImporterRegistry([fake('.json')]), valid);
    expect(u.diagnostics[0]!.file).toHaveLength(1_025);
    expect(u.diagnostics[0]!.message).toHaveLength(1_025);
  });

  test('a thrown value with no toString is reported, not rethrown, from an importer and from the validator', async () => {
    const unprintable: Importer = {
      formats: ['cura'],
      canHandle: (f) => f.path.endsWith('.cfg'),
      import: async () => {
        throw Object.create(null);
      },
    };
    const registry = createImporterRegistry([fake('.json'), unprintable]);
    const r = await importProfiles(memory([file('a.json'), file('b.cfg')]), registry, () => {
      throw Object.create(null);
    });
    expect(r.entities).toEqual([]);
    expect(r.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'unreadable-folder',
        file: 'b.cfg',
        message: 'the cura importer failed: unprintable error',
      },
      {
        severity: 'error',
        code: 'invalid-json',
        file: 'mem:/profiles',
        message: 'a.json fails the profile schema: unprintable error',
      },
    ]);
  });

  test("an importer's frozen result is not written into", async () => {
    const frozen: Importer = {
      formats: ['orca-json'],
      canHandle: () => true,
      import: async () =>
        Object.freeze({
          entities: Object.freeze([entity('')]),
          native: Object.freeze({}),
          diagnostics: Object.freeze([]) as unknown as Diagnostic[],
        }) as ImportResult,
    };
    const r = await importProfiles(memory([file('a.json')]), frozen, valid);
    expect(r.entities).toEqual([]);
    expect(r.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'invalid-json',
        file: 'mem:/profiles',
        message: ' fails the profile schema: id must be non-empty',
      },
    ]);
  });

  test('ids __proto__ and constructor stay plain native keys', async () => {
    const r = await importProfiles(
      memory([file('__proto__'), file('constructor')]),
      createImporterRegistry([
        {
          formats: ['orca-json'],
          canHandle: () => true,
          async import(files) {
            const native = Object.create(null) as Record<string, unknown>;
            for (const f of files) native[f.path] = { polluted: true };
            return { entities: files.map((f) => entity(f.path)), native, diagnostics: [] };
          },
        },
      ]),
      valid,
    );
    expect(Object.keys(r.native).sort()).toEqual(['__proto__', 'constructor']);
    expect(Object.getPrototypeOf(r.native)).toBeNull();
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
});
