// SPDX-License-Identifier: AGPL-3.0-or-later
// The import use case (PRF-38): read a source, run the importers, and return only entities that pass the schema.
import type { ImportedEntity, Importer, ImportResult, SourceFile } from '@vsslicer/profile-api';
import { clip, errorText } from './registry.ts';

/** Where profiles come from (a folder, a dropped bundle, memory in tests). */
export interface ProfileSource {
  /** Names the source in diagnostics, e.g. the folder path. */
  readonly label: string;
  /** Every file of the tree; rejects when the source cannot be read. */
  read(): Promise<readonly SourceFile[]>;
}

/** Checks one entity against the profile schema: `undefined` when valid, otherwise why not. */
export type EntityValidator = (entity: ImportedEntity) => string | undefined;

export async function importProfiles(
  source: ProfileSource,
  importer: Importer,
  validate: EntityValidator,
): Promise<ImportResult> {
  let files: readonly SourceFile[];
  try {
    files = await source.read();
  } catch (error) {
    return {
      entities: [],
      native: Object.create(null),
      diagnostics: [
        {
          severity: 'error',
          code: 'unreadable-folder',
          file: clip(source.label),
          message: clip(`cannot read the source: ${errorText(error)}`),
        },
      ],
    };
  }
  const result = await importer.import(files);
  const entities: ImportedEntity[] = [];
  const diagnostics = [...result.diagnostics]; // never write into the importer's own (possibly frozen) array
  for (const entity of result.entities) {
    let reason: string | undefined;
    try {
      reason = validate(entity);
    } catch (error) {
      reason = errorText(error);
    }
    if (reason === undefined) {
      entities.push(entity);
      continue;
    }
    diagnostics.push({
      severity: 'error',
      // shortcut: DiagnosticCode has no schema code; invalid-json is the nearest until profile-api adds one
      code: 'invalid-json',
      file: clip(source.label),
      message: clip(`${errorText(entity?.id)} fails the profile schema: ${reason}`),
    });
  }
  const native: Record<string, unknown> = Object.create(null);
  for (const { id } of entities) if (Object.hasOwn(result.native, id)) native[id] = result.native[id];
  return { entities, native, diagnostics };
}
