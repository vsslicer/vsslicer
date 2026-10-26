// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Vendor } from '../../domain/entities/index.ts';
import type { ImportResult } from '../../domain/import-result/index.ts';

/** The native profile formats, as recorded in `Vendor.source.format`. */
export type ProfileFormat = NonNullable<Vendor['source']>['format'];

/** One file as plain bytes: adapters read and write no file system themselves. */
export interface SourceFile {
  /** Path relative to the imported root (or a bare name); diagnostics cite it. */
  path: string;
  bytes: Uint8Array;
}

export interface Importer {
  readonly formats: readonly ProfileFormat[];
  /** Cheap sniff of name and bytes; never throws. */
  canHandle(file: SourceFile): boolean;
  /** A whole tree at once, since parents and includes live in other files. Bad input gives diagnostics, never a rejection. */
  import(files: readonly SourceFile[]): Promise<ImportResult>;
}
