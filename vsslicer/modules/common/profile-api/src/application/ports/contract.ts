// SPDX-License-Identifier: AGPL-3.0-or-later
// Framework-free contract suites: an adapter's test awaits them; they reject with every violation found.
import { unsafePath } from '../../domain/bundle/index.ts';
import type { Diagnostic, ImportedEntity, ImportResult } from '../../domain/import-result/index.ts';
import type { Exporter, ExportResult } from './exporter.ts';
import type { Importer, SourceFile } from './importer.ts';

const text = (s: string) => new TextEncoder().encode(s);

const hostileFiles: SourceFile[] = [
  { path: 'empty.json', bytes: new Uint8Array() },
  { path: 'binary.ini', bytes: new Uint8Array([0xff, 0xfe, 0x00, 0xc3, 0x28, 0x80]) },
  { path: 'truncated.json', bytes: text('{"type": "machine", "inherits": ') },
  { path: 'broken.ini', bytes: text('[printer:\nkey without equals\n= \n') },
  { path: 'cyclic.json', bytes: text('{"name": "a", "inherits": "a", "type": "filament"}') },
  { path: '', bytes: text('x') },
];

// Deliberately malformed: an exporter receives whatever the store holds.
const hostileExports = [
  { entities: [{} as ImportedEntity], native: {} },
  { entities: [{ id: 'orphan' } as ImportedEntity], native: { orphan: 42 } },
  { entities: [], native: { missing: { a: 1 } } },
];

type Outcome<T> = { ok: true; value: T } | { ok: false; error: unknown };

async function attempt<T>(run: () => Promise<T> | T): Promise<Outcome<T>> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    return { ok: false, error };
  }
}

const severities = new Set(['error', 'warning', 'info']);

function diagnosticProblems(diagnostics: unknown): string[] {
  if (!Array.isArray(diagnostics)) return ['diagnostics is not an array'];
  return diagnostics.flatMap((d: Diagnostic, i) => {
    const out: string[] = [];
    if (!severities.has(d?.severity)) out.push(`diagnostic ${i} has severity ${String(d?.severity)}`);
    if (typeof d?.file !== 'string') out.push(`diagnostic ${i} has no file`);
    if (typeof d?.message !== 'string' || d.message === '') out.push(`diagnostic ${i} has no message`);
    if (d?.line !== undefined && !(Number.isInteger(d.line) && d.line >= 1))
      out.push(`diagnostic ${i} has line ${String(d.line)}`);
    return out;
  });
}

function importProblems(r: ImportResult, input: readonly SourceFile[]): string[] {
  if (!Array.isArray(r?.entities)) return ['entities is not an array'];
  if (typeof r.native !== 'object' || r.native === null) return ['native is not an object'];
  const out = diagnosticProblems(r.diagnostics);
  const ids = new Set(r.entities.map((e) => e?.id));
  for (const key of Object.keys(r.native)) if (!ids.has(key)) out.push(`native key ${key} names no returned entity`);
  if (input.length > 0 && r.entities.length === 0 && r.diagnostics?.length === 0)
    out.push('imported nothing without a diagnostic');
  return out;
}

function exportProblems(r: ExportResult, entityCount: number): string[] {
  if (!Array.isArray(r?.files)) return ['files is not an array'];
  const out = diagnosticProblems(r.diagnostics);
  r.files.forEach((f, i) => {
    if (typeof f?.path !== 'string' || f.path === '') out.push(`file ${i} has no path`);
    else if (f.path.includes('\\') || unsafePath(f.path))
      out.push(`file ${i} has an unsafe path ${JSON.stringify(f.path.slice(0, 64))}`);
    if (!(f?.bytes instanceof Uint8Array)) out.push(`file ${i} bytes are not a Uint8Array`);
  });
  if (entityCount > 0 && r.files.length === 0 && r.diagnostics?.length === 0)
    out.push('exported nothing without a diagnostic');
  return out;
}

function fail(name: string, problems: string[]): void {
  if (problems.length > 0) throw new Error(`${name} contract failed:\n- ${problems.join('\n- ')}`);
}

/** `samples`: files the importer must import with at least one entity and no error diagnostic. */
export async function runImporterContract(importer: Importer, samples: readonly SourceFile[] = []): Promise<void> {
  const problems: string[] = [];
  if (!(importer.formats?.length > 0)) problems.push('formats is empty');
  for (const file of [...hostileFiles, ...samples]) {
    const can = await attempt(() => importer.canHandle(file));
    if (!can.ok) problems.push(`canHandle(${JSON.stringify(file.path)}) threw: ${String(can.error)}`);
    else if (typeof can.value !== 'boolean') problems.push(`canHandle(${JSON.stringify(file.path)}) is not a boolean`);
  }
  const runs: [string, SourceFile[]][] = [
    ['no files', []],
    ...hostileFiles.map((f): [string, SourceFile[]] => [JSON.stringify(f.path), [f]]),
    ['all hostile files', hostileFiles],
  ];
  for (const [label, files] of runs) {
    const r = await attempt(() => importer.import(files));
    if (!r.ok) problems.push(`import(${label}) rejected: ${String(r.error)}`);
    else problems.push(...importProblems(r.value, files).map((p) => `import(${label}): ${p}`));
  }
  if (samples.length > 0) {
    const r = await attempt(() => importer.import(samples));
    if (!r.ok) problems.push(`import(samples) rejected: ${String(r.error)}`);
    else {
      problems.push(...importProblems(r.value, samples).map((p) => `import(samples): ${p}`));
      if (r.value.entities?.length === 0) problems.push('import(samples) returned no entity');
      if (r.value.diagnostics?.some((d) => d.severity === 'error')) problems.push('import(samples) reported an error');
      const accepts = (f: SourceFile) => {
        try {
          return importer.canHandle(f);
        } catch {
          return false; // already reported above
        }
      };
      if (!samples.some(accepts)) problems.push('canHandle accepts no sample');
    }
  }
  fail('Importer', problems);
}

/** `sample`: entities with native forms the exporter must write to at least one file with no error diagnostic. */
export async function runExporterContract(
  exporter: Exporter,
  sample?: Pick<ImportResult, 'entities' | 'native'>,
): Promise<void> {
  const problems: string[] = [];
  if (!(exporter.formats?.length > 0)) problems.push('formats is empty');
  const inputs = [{ entities: [], native: {} }, ...hostileExports];
  inputs.forEach((input, i) => {
    for (const entity of input.entities) {
      try {
        if (typeof exporter.canHandle(entity) !== 'boolean') problems.push(`canHandle(input ${i}) is not a boolean`);
      } catch (error) {
        problems.push(`canHandle(input ${i}) threw: ${String(error)}`);
      }
    }
  });
  for (const [i, input] of inputs.entries()) {
    const r = await attempt(() => exporter.export(input));
    if (!r.ok) problems.push(`export(input ${i}) rejected: ${String(r.error)}`);
    else problems.push(...exportProblems(r.value, input.entities.length).map((p) => `export(input ${i}): ${p}`));
  }
  if (sample) {
    const r = await attempt(() => exporter.export(sample));
    if (!r.ok) problems.push(`export(sample) rejected: ${String(r.error)}`);
    else {
      problems.push(...exportProblems(r.value, sample.entities.length).map((p) => `export(sample): ${p}`));
      if (r.value.files?.length === 0) problems.push('export(sample) wrote no file');
      if (r.value.diagnostics?.some((d) => d.severity === 'error')) problems.push('export(sample) reported an error');
    }
  }
  fail('Exporter', problems);
}
