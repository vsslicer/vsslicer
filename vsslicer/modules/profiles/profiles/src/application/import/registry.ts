// SPDX-License-Identifier: AGPL-3.0-or-later
// The importer registry (PRF-38): one composite Importer that routes each file to the first registered importer that
// claims it, runs them all, and keeps one failing importer from stopping the others.
import type { Diagnostic, Importer, ImportResult, SourceFile } from '@vsslicer/profile-api';

/** Files one import call accepts; more are refused whole. Orca's bundled tree is about 10k files. */
export const MAX_IMPORT_FILES = 50_000;
/** Longest path or message copied from input into a diagnostic. */
export const MAX_DIAGNOSTIC_TEXT = 1_024;

export const clip = (s: string) => (s.length > MAX_DIAGNOSTIC_TEXT ? `${s.slice(0, MAX_DIAGNOSTIC_TEXT)}…` : s);

/** Any thrown value as text; never throws itself (a value without a usable toString gets a fixed text). */
export const errorText = (error: unknown): string => {
  try {
    return String(error);
  } catch {
    return 'unprintable error';
  }
};

const claims = (importer: Importer, file: SourceFile) => {
  try {
    return importer.canHandle(file) === true;
  } catch {
    return false; // canHandle must never throw; one that does claims nothing
  }
};

const failed = (importer: Importer, file: SourceFile, reason: string): Diagnostic => ({
  severity: 'error',
  // shortcut: DiagnosticCode has no "importer failed" code; add one to profile-api when it next changes
  code: 'unreadable-folder',
  file: clip(file.path),
  message: clip(`the ${importer.formats.join('/')} importer failed: ${reason}`),
});

export function createImporterRegistry(importers: readonly Importer[]): Importer {
  const registered = [...importers];
  return {
    formats: [...new Set(registered.flatMap((i) => i.formats))],
    canHandle: (file) => registered.some((i) => claims(i, file)),
    async import(files) {
      const out: ImportResult = { entities: [], native: Object.create(null), diagnostics: [] };
      if (files.length > MAX_IMPORT_FILES) {
        out.diagnostics.push({
          severity: 'error',
          code: 'unreadable-folder',
          file: '',
          message: `${files.length} files is more than the ${MAX_IMPORT_FILES} one import reads`,
        });
        return out;
      }
      const batches = new Map<Importer, SourceFile[]>();
      for (const file of files) {
        const owner = registered.find((i) => claims(i, file));
        if (owner) {
          const batch = batches.get(owner);
          if (batch) batch.push(file);
          else batches.set(owner, [file]);
        } else
          out.diagnostics.push({
            severity: 'warning',
            code: 'unknown-type',
            file: clip(file.path),
            message: 'no registered importer reads this file',
          });
      }
      const runs = [...batches].map(async ([importer, batch]) => {
        try {
          return { importer, batch, result: await importer.import(batch) };
        } catch (error) {
          return { importer, batch, error: errorText(error) };
        }
      });
      for (const run of await Promise.all(runs)) {
        const r = run.result;
        if (!r || !Array.isArray(r.entities) || !Array.isArray(r.diagnostics) || typeof r.native !== 'object') {
          out.diagnostics.push(failed(run.importer, run.batch[0]!, run.error ?? 'it returned no import result'));
          continue;
        }
        // Loops, not push(...spread): a large tree's arrays would overflow the argument stack.
        for (const e of r.entities) out.entities.push(e);
        for (const d of r.diagnostics) out.diagnostics.push(d);
        for (const [id, value] of Object.entries(r.native ?? {})) out.native[id] = value;
      }
      return out;
    },
  };
}
