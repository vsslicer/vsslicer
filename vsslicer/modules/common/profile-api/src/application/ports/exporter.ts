// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Diagnostic, ImportedEntity, ImportResult } from '../../domain/import-result/index.ts';
import type { ProfileFormat, SourceFile } from './importer.ts';

export interface ExportResult {
  files: SourceFile[];
  diagnostics: Diagnostic[];
}

export interface Exporter {
  readonly formats: readonly ProfileFormat[];
  /** Never throws. */
  canHandle(entity: ImportedEntity): boolean;
  /** Entities with their native forms (keyed by entity id, as an import returned them). Bad input gives diagnostics, never a rejection. */
  export(input: Pick<ImportResult, 'entities' | 'native'>): Promise<ExportResult>;
}
