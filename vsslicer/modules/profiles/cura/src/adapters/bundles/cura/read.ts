// SPDX-License-Identifier: AGPL-3.0-or-later
// Reads a Cura `.curaprofile` export (layout: docs/spikes/curaprofile.md, PRF-111) as the user's quality_changes
// entities. Each zip entry is one `quality_changes` container named by its id; the entries go through the same reader as a
// user's `quality_changes/` folder. The parent quality is the entry's `quality_type`, kept in `native[id]` (a quality
// id is not derivable from it without the printer, so no `inherits` that could dangle). Cura writes no application
// version, only `[metadata] setting_version`; one that is not the target's gets a warning (Cura itself refuses such a
// container, CuraContainerRegistry.py:94-100, Cura@5bea2f8, LGPL-3.0, re-implemented).
import type { Diagnostic, ImportResult } from '@vsslicer/profile-api';
import { CuraArchiveError, readCuraProfileArchive, type CuraArchiveLimits } from '../../archive/curaprofile-archive.ts';
import { CURA_SETTING_VERSION } from '../../export/cura/write.ts';
import { readCuraUserChanges } from '../../quality/read.ts';

// An entry id is opaque (it may hold `/`, `#`, spaces); the folder reader decodes it with unquote_plus.
const fileName = (id: string) => `quality_changes/${encodeURIComponent(id).replace(/^\./, '%2E')}.inst.cfg`;

/**
 * `data` is the `.curaprofile` bytes. `settingVersion` is the Cura setting version to expect (default: the one
 * the exporter writes). A corrupt or over-limit archive gives an error diagnostic and no entities.
 */
export function readCuraProfile(
  data: Uint8Array,
  options: { settingVersion?: number; archiveLimits?: Partial<CuraArchiveLimits> } = {},
): ImportResult {
  const expected = options.settingVersion ?? CURA_SETTING_VERSION;
  let result: ImportResult;
  try {
    const entries = readCuraProfileArchive(data, options.archiveLimits);
    const files = entries.map((e) => ({ path: fileName(e.id), bytes: new TextEncoder().encode(e.text) }));
    // An extruder entry sets no layer_height of its own: it takes the global entry's (the one without `position`).
    const first = readCuraUserChanges(files);
    const globals: ImportResult = {
      entities: first.entities.filter((e) => (first.native[e.id] as Record<string, string>)['position'] === undefined),
      native: Object.fromEntries(
        Object.entries(first.native).map(([id, n]) => [id, { ...(n as object), global_quality: 'True' }]),
      ),
      diagnostics: [],
    };
    result = readCuraUserChanges(files, globals);
  } catch (e) {
    if (!(e instanceof CuraArchiveError)) throw e;
    return {
      entities: [],
      native: Object.create(null),
      diagnostics: [{ severity: 'error', code: 'unreadable-folder', file: '', message: e.message }],
    };
  }
  const diagnostics: Diagnostic[] = [...result.diagnostics];
  for (const e of result.entities) {
    const v = (result.native[e.id] as Record<string, string>)['setting_version'];
    if (v !== String(expected)) {
      diagnostics.push({
        severity: 'warning',
        code: 'unknown-type',
        file: fileName(e.id),
        message: `setting_version ${v ?? 'missing'}, expected ${expected}: saved by another Cura version`.slice(0, 200),
      });
    }
  }
  return { ...result, diagnostics };
}
