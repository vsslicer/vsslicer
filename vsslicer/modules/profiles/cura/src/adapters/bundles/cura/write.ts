// SPDX-License-Identifier: AGPL-3.0-or-later
// Writes a Cura `.curaprofile` (layout: docs/spikes/curaprofile.md, PRF-111): a zip with one STORED entry per
// `quality_changes` container, named by its id, the global container first. Each entry's text is what the folder writer
// gives for that entity, so `readCuraProfile(writeCuraProfile(x))` equals x. Machine settings (`definition_changes`)
// are not part of a profile and are skipped with a warning. A setting whose key names a credential is never written.
import type { Diagnostic, ImportResult } from '@vsslicer/profile-api';
import {
  CuraArchiveError,
  writeCuraProfileArchive,
  type CuraArchiveLimits,
} from '../../archive/curaprofile-archive.ts';
import { CURA_EXPORT_LIMITS, writeCuraUserChanges } from '../../export/cura/write.ts';

const SECRET_KEY = /(api_?key|password|passwd|secret|token|credential|access_?code|auth)/i;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export interface CuraProfileExport {
  bytes: Uint8Array;
  diagnostics: Diagnostic[];
}

export function writeCuraProfile(
  input: Pick<ImportResult, 'entities' | 'native'>,
  options: { archiveLimits?: Partial<CuraArchiveLimits> } = {},
): CuraProfileExport {
  const diagnostics: Diagnostic[] = [];
  const warn = (file: string, message: string, severity: Diagnostic['severity'] = 'warning') =>
    diagnostics.length < 1000 && diagnostics.push({ severity, code: 'malformed-line', file, message });
  const all: unknown[] = Array.isArray(input?.entities) ? input.entities : [];
  if (all.length > CURA_EXPORT_LIMITS.maxEntities)
    warn('', `more than ${CURA_EXPORT_LIMITS.maxEntities} entities; the rest are not written`, 'error');
  const native = isObj(input?.native) ? input.native : {};
  const nativeOf = (id: string): Record<string, unknown> =>
    Object.hasOwn(native, id) && isObj(native[id]) ? (native[id] as Record<string, unknown>) : {};

  const profiles: { id: string; text: string; global: boolean }[] = [];
  for (const raw of all.slice(0, CURA_EXPORT_LIMITS.maxEntities)) {
    const e = isObj(raw) ? raw : {};
    const id = typeof e['id'] === 'string' ? e['id'] : undefined;
    if (id === undefined || !isObj(e['settings'])) {
      warn(String(id ?? ''), 'not an entity with settings; not written');
      continue;
    }
    const nat = Object.create(null) as Record<string, unknown>;
    for (const [k, v] of Object.entries(nativeOf(id))) {
      if (SECRET_KEY.test(k)) warn(id, `${k} looks like a credential; not written`);
      else nat[k] = v;
    }
    // The folder writer decides the kind; a machine-settings entity has a model, a quality one a layer height.
    const settings = Object.create(null) as Record<string, unknown>;
    for (const [k, v] of Object.entries(e['settings'])) {
      if (SECRET_KEY.test(k)) warn(id, `${k} looks like a credential; not written`);
      else settings[k] = v;
    }
    const one = writeCuraUserChanges({
      entities: [{ ...e, settings } as never],
      native: Object.assign(Object.create(null), { [id]: nat }),
    });
    const file = one.files.find((f) => f.path.startsWith('quality_changes/'));
    diagnostics.push(...one.diagnostics.slice(0, 1000 - diagnostics.length));
    if (!file) {
      if (one.files.length) warn(id, 'machine settings are not part of a .curaprofile; not written');
      continue;
    }
    profiles.push({ id, text: new TextDecoder().decode(file.bytes), global: nat['position'] === undefined });
  }
  // Cura's importer tells the global container from the extruders by `position`; it writes the global one first.
  profiles.sort((a, b) => Number(b.global) - Number(a.global));
  try {
    return { bytes: writeCuraProfileArchive(profiles, options.archiveLimits), diagnostics };
  } catch (e) {
    if (!(e instanceof CuraArchiveError)) throw e;
    warn('', e.message.slice(0, 200), 'error');
    return { bytes: new Uint8Array(), diagnostics };
  }
}
