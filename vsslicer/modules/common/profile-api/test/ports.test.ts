// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, expectTypeOf, test } from 'vitest';
import type { Diagnostic, ImportedEntity, ImportResult } from '../src/domain/import-result/index.ts';
import type { Material, PrinterModel, Settings } from '../src/domain/entities/index.ts';
import { BUNDLE_LIMITS } from '../src/domain/bundle/index.ts';
import { entitySchemas } from '../src/domain/schema/index.ts';
import {
  runExporterContract,
  runImporterContract,
  type EntityKind,
  type Exporter,
  type ExportResult,
  type Importer,
  type ProfileFormat,
  type ProfileStore,
  type ResolvedProfile,
  type SourceFile,
} from '../src/application/ports/index.ts';

// A fake JSON importer: one entity per file, `{id, name, type: "material", ...}`.
const fakeImporter: Importer = {
  formats: ['orca-json'],
  canHandle: (f) => f.path.endsWith('.json'),
  async import(files) {
    const result: ImportResult = { entities: [], native: {}, diagnostics: [] };
    for (const f of files) {
      const diag = (code: Diagnostic['code'], message: string) =>
        result.diagnostics.push({ severity: 'error', code, file: f.path, message });
      let json: unknown;
      try {
        json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(f.bytes));
      } catch (e) {
        diag('invalid-json', String(e));
        continue;
      }
      const o = json as { id?: unknown; name?: unknown; type?: unknown };
      if (o?.type !== 'material' || typeof o.id !== 'string' || typeof o.name !== 'string') {
        diag('unknown-type', `unsupported preset in ${f.path}`);
        continue;
      }
      result.entities.push({ id: o.id, vendor: 'v', name: o.name, type: 'PLA', diameter: 1.75 } satisfies Material);
      result.native[o.id] = json;
    }
    return result;
  },
};

const sampleFile: SourceFile = {
  path: 'pla.json',
  bytes: new TextEncoder().encode('{"id": "pla", "name": "PLA", "type": "material"}'),
};

const fakeExporter: Exporter = {
  formats: ['orca-json'],
  canHandle: (e) => typeof e?.id === 'string',
  async export({ entities, native }) {
    const out: ExportResult = { files: [], diagnostics: [] };
    for (const e of entities) {
      if (typeof e?.id !== 'string' || !(e.id in native)) {
        out.diagnostics.push({
          severity: 'error',
          code: 'unknown-type',
          file: String(e?.id),
          message: 'no native form',
        });
        continue;
      }
      out.files.push({ path: `${e.id}.json`, bytes: new TextEncoder().encode(JSON.stringify(native[e.id])) });
    }
    return out;
  },
};

describe('importer contract', () => {
  test('a well-behaved fake passes, with samples', async () => {
    await expect(runImporterContract(fakeImporter, [sampleFile])).resolves.toBeUndefined();
  });

  test('an importer that throws on bad input fails', async () => {
    const throwing: Importer = {
      ...fakeImporter,
      async import(files) {
        for (const f of files) JSON.parse(new TextDecoder().decode(f.bytes));
        return fakeImporter.import(files);
      },
    };
    await expect(runImporterContract(throwing)).rejects.toThrow(/import\("truncated.json"\) rejected/);
  });

  test('a synchronous throw, a throwing canHandle and a silent drop all fail', async () => {
    const bad: Importer = {
      formats: [],
      canHandle: () => {
        throw new Error('boom');
      },
      import: (files) => {
        if (files.length > 1) throw new Error('sync');
        return Promise.resolve({ entities: [], native: { ghost: 1 }, diagnostics: [] });
      },
    };
    const error = await runImporterContract(bad, [sampleFile]).catch((e: Error) => e.message);
    expect(error).toMatch(/formats is empty/);
    expect(error).toMatch(/canHandle\("empty.json"\) threw/);
    expect(error).toMatch(/import\(all hostile files\) rejected: Error: sync/);
    expect(error).toMatch(/native key ghost names no returned entity/);
    expect(error).toMatch(/imported nothing without a diagnostic/);
    expect(error).toMatch(/canHandle accepts no sample/);
  });

  test('malformed diagnostics fail', async () => {
    const sloppy: Importer = {
      ...fakeImporter,
      import: async () => ({
        entities: [],
        native: {},
        diagnostics: [{ severity: 'fatal', code: 'cycle', file: 'a', line: 0, message: '' } as unknown as Diagnostic],
      }),
    };
    const error = await runImporterContract(sloppy).catch((e: Error) => e.message);
    expect(error).toMatch(/severity fatal/);
    expect(error).toMatch(/line 0/);
    expect(error).toMatch(/has no message/);
  });
});

describe('exporter contract', () => {
  test('a well-behaved fake passes, with a sample', async () => {
    const sample = await fakeImporter.import([sampleFile]);
    await expect(runExporterContract(fakeExporter, sample)).resolves.toBeUndefined();
  });

  test('an exporter that throws on bad input fails', async () => {
    const throwing: Exporter = {
      ...fakeExporter,
      canHandle: (e) => e.id.length > 0,
      async export(input) {
        for (const e of input.entities) if (!(e.id in input.native)) throw new Error('no native');
        return fakeExporter.export(input);
      },
    };
    const error = await runExporterContract(throwing).catch((e: Error) => e.message);
    expect(error).toMatch(/canHandle\(input 1\) threw/);
    expect(error).toMatch(/export\(input 1\) rejected/);
  });

  test('silent drops and bad files fail', async () => {
    const silent: Exporter = {
      formats: ['prusa-ini'],
      canHandle: () => true,
      export: async ({ entities }) => ({
        files: entities.length ? [] : [{ path: '', bytes: 'x' as unknown as Uint8Array }],
        diagnostics: [],
      }),
    };
    const error = await runExporterContract(silent, { entities: [{ id: 'a' } as ImportedEntity], native: {} }).catch(
      (e: Error) => e.message,
    );
    expect(error).toMatch(/exported nothing without a diagnostic/);
    expect(error).toMatch(/file 0 has no path/);
    expect(error).toMatch(/not a Uint8Array/);
    expect(error).toMatch(/export\(sample\) wrote no file/);
  });

  const writing = (path: string): Exporter => ({
    formats: ['orca-json'],
    canHandle: () => true,
    export: async ({ entities }) => ({
      files: entities.length ? [{ path, bytes: new Uint8Array() }] : [],
      diagnostics: [],
    }),
  });
  const withPath = (path: string) =>
    runExporterContract(writing(path), { entities: [{ id: 'a' } as ImportedEntity], native: { a: 1 } });

  test('a safe nested output path passes', async () => {
    await expect(withPath('printer/a b.json')).resolves.toBeUndefined();
  });

  test.each([
    ['absolute', '/etc/passwd'],
    ['absolute backslash', '\\x.json'],
    ['dot-dot segment', 'a/../b.json'],
    ['leading dot-dot', '../b.json'],
    ['backslash', 'a\\b.json'],
    ['drive letter', 'C:b.json'],
    ['NUL', 'a\0b.json'],
    ['over the length cap', 'a'.repeat(BUNDLE_LIMITS.maxPathLength + 1)],
  ])('an output path that is %s fails', async (_, path) => {
    await expect(withPath(path)).rejects.toThrow(/file 0 has an unsafe path/);
  });
});

// Checked by `tsc -p tsconfig.test.json` (part of `pnpm test`).
describe('port types', () => {
  test('formats are the Vendor.source formats', () => {
    expectTypeOf<ProfileFormat>().toEqualTypeOf<'prusa-ini' | 'prusa-yaml' | 'orca-json' | 'bambu-json' | 'cura'>();
    expectTypeOf<Importer['formats']>().toEqualTypeOf<readonly ProfileFormat[]>();
    expectTypeOf<Exporter['formats']>().toEqualTypeOf<readonly ProfileFormat[]>();
  });

  test('importer and exporter work on bytes, not paths on disk', () => {
    expectTypeOf<SourceFile>().toEqualTypeOf<{ path: string; bytes: Uint8Array }>();
    expectTypeOf<Importer['import']>().toEqualTypeOf<(files: readonly SourceFile[]) => Promise<ImportResult>>();
    expectTypeOf<Exporter['export']>().parameter(0).toEqualTypeOf<Pick<ImportResult, 'entities' | 'native'>>();
    expectTypeOf<ExportResult>().toEqualTypeOf<{ files: SourceFile[]; diagnostics: Diagnostic[] }>();
  });

  test('ProfileStore has exactly the read methods', () => {
    expectTypeOf<keyof ProfileStore>().toEqualTypeOf<
      'get' | 'list' | 'query' | 'resolve' | 'compatibleMaterials' | 'compatibleProcesses' | 'onDidChange'
    >();
    // Typechecked only, never called.
    const probe = (store: ProfileStore) => {
      expectTypeOf(store.get('printer_model', 'x')).resolves.toEqualTypeOf<PrinterModel | undefined>();
      expectTypeOf(store.list('material')).resolves.toEqualTypeOf<Material[]>();
      expectTypeOf(store.query('material', { external_id: 'GFA00' })).resolves.toEqualTypeOf<Material[]>();
      expectTypeOf(store.resolve).parameters.toEqualTypeOf<[string, readonly string[], string]>();
    };
    expectTypeOf(probe).toBeFunction();
    expectTypeOf<ResolvedProfile['unified']['materials']>().toEqualTypeOf<Settings[]>();
  });

  test('entity kinds match the schemas', () => {
    expectTypeOf<EntityKind>().toEqualTypeOf<keyof typeof entitySchemas>();
  });
});
