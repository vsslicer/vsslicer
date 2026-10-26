// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  Feeder,
  Material,
  Nozzle,
  PrinterInstance,
  PrinterModel,
  Process,
  Surface,
  Vendor,
} from '../entities/index.ts';

export type Severity = 'error' | 'warning' | 'info';

/** Every problem an importer reports; closed, so consumers can switch on it exhaustively. */
export type DiagnosticCode =
  | 'cycle'
  | 'unknown-parent'
  | 'malformed-line'
  | 'invalid-json'
  | 'unknown-type'
  | 'unreadable-folder'
  | 'credential-missing';

export interface Diagnostic {
  severity: Severity;
  code: DiagnosticCode;
  /** The source file (or folder) the problem was found in. */
  file: string;
  /** 1-based line; absent when the problem concerns the whole file or folder. */
  line?: number;
  message: string;
}

export type ImportedEntity = Vendor | PrinterModel | Nozzle | Surface | Feeder | Material | Process | PrinterInstance;

export interface ImportResult {
  entities: ImportedEntity[];
  /** Native-format content with no unified counterpart, kept verbatim for round trips, keyed by entity id. */
  native: Record<string, unknown>;
  diagnostics: Diagnostic[];
}

/** A printer instance read from a connector; the secret travels beside the entity, never inside it. */
export interface InstanceImport {
  entity: PrinterInstance;
  credential?: string;
}
