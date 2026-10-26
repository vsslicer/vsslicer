// SPDX-License-Identifier: AGPL-3.0-or-later
// Writes the user's `quality_changes/` and `definition_changes/` `.inst.cfg` files, re-implemented from
// Uranium@e65ccc1:UM/Settings/InstanceContainer.py:488-523 (`serialize`; LGPL-3.0, no code copied) and Python's
// `configparser` layout: `[general]` (version, name, definition), `[metadata]`, `[values]`, each section followed by a
// blank line, a newline in a value continued as `\n\t`. `version = 4` is InstanceContainer.Version (:54);
// `setting_version = 27` is Cura@5bea2f8:cura/CuraApplication.py:145 `SettingVersion`, written only when the native
// metadata has none, so an imported file keeps its own. Values keep file order (Cura writes them sorted, so a file Cura
// wrote round-trips byte for byte). `{ expr }` is written back as `=expr`.
import type {
  Diagnostic,
  ExportResult,
  Exporter,
  ImportedEntity,
  ImportResult,
  SourceFile,
} from '@vsslicer/profile-api';
import type { CuraCfgKind } from '../../quality/read.ts';

export const CURA_SETTING_VERSION = 27;
/** Caps on one call: entities, and keys or characters per entity (rule 25). */
export const CURA_EXPORT_LIMITS = { maxEntities: 10_000, maxKeys: 100_000, maxChars: 4 * 1024 * 1024 } as const;

type Input = Pick<ImportResult, 'entities' | 'native'>;
const enc = new TextEncoder();
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const kindOf = (e: unknown): CuraCfgKind | undefined => {
  if (!isObj(e) || typeof e['id'] !== 'string' || !isObj(e['settings'])) return undefined;
  if (typeof e['model'] === 'string' && Array.isArray(e['toolheads'])) return 'definition_changes';
  if (typeof e['name'] === 'string' && typeof e['layer_height'] === 'number') return 'quality_changes';
  return undefined;
};

/** The id as Cura's loader reads it back: `+` is a space, `%xx` is a byte, and a leading `.` would hide the file. */
const fileName = (id: string) => `${encodeURIComponent(id).replaceAll('%20', '+').replace(/^\./, '%2E')}.inst.cfg`;

/** A key Uranium's parser can read back (FastConfigParser.py:18); a value just continues on `\n\t`. */
const goodKey = (k: string) => /^[^=\n\r\t ![<>][^=\n\r\t !]*$/.test(k);
const text = (v: string) => v.replaceAll('\r', '').replaceAll('\n', '\n\t');

function valueText(v: unknown): string | undefined {
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (isObj(v) && 'expr' in v && typeof v['expr'] === 'string') return `=${v['expr']}`;
  if (v === null || v === undefined) return undefined;
  return JSON.stringify(v);
}

export function writeCuraUserChanges(input: Input): ExportResult {
  const files: SourceFile[] = [];
  const diagnostics: Diagnostic[] = [];
  const err = (file: string, message: string, severity: Diagnostic['severity'] = 'error') =>
    diagnostics.length < 1000 && diagnostics.push({ severity, code: 'malformed-line', file, message });
  const entities: unknown[] = Array.isArray(input?.entities) ? input.entities : [];
  const lim = CURA_EXPORT_LIMITS;
  if (entities.length > lim.maxEntities) err('', `more than ${lim.maxEntities} entities; the rest are not written`);
  const used = new Set<string>();
  let chars = 0;
  for (const e of entities.slice(0, lim.maxEntities)) {
    const kind = kindOf(e);
    const ent = e as Record<string, unknown> & { id: string; settings: Record<string, unknown> };
    if (!kind) {
      err(String((e as { id?: unknown })?.id ?? ''), 'not a quality_changes or definition_changes entity; not written');
      continue;
    }
    const path = `${kind}/${fileName(ent.id)}`;
    const alias = path.toLowerCase();
    if (used.has(alias)) {
      err(path, 'same file name as an earlier entity; not written');
      continue;
    }
    used.add(alias);
    const nat = isObj(input.native?.[ent.id]) ? (input.native[ent.id] as Record<string, unknown>) : {};
    if (typeof nat['type'] === 'string' && nat['type'] !== kind) {
      err(path, `native type ${nat['type']} is not ${kind}; not written`);
      continue;
    }
    const definition = nat['definition'] ?? ent['model'];
    if (typeof definition !== 'string' || definition === '') {
      err(path, 'no definition in the native form; not written');
      continue;
    }
    const name = typeof nat['name'] === 'string' ? nat['name'] : typeof ent['name'] === 'string' ? ent['name'] : ent.id;
    // Native order, as Uranium keeps it (InstanceContainer.py:510-513); `type` leads only when the file had none.
    // `layer_height_estimated` is the importer's own marker, not file metadata.
    const meta: [string, string][] = 'type' in nat ? [] : [['type', kind]];
    for (const [k, v] of Object.entries(nat)) {
      if (k === 'type') meta.push([k, kind]);
      else if (['definition', 'name', 'version', 'id', 'container_type', 'layer_height_estimated'].includes(k))
        continue;
      else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') meta.push([k, String(v)]);
    }
    if (!meta.some(([k]) => k === 'setting_version')) meta.push(['setting_version', String(CURA_SETTING_VERSION)]);
    const values: [string, string][] = [];
    for (const [k, v] of Object.entries(ent.settings)) {
      const t = valueText(v);
      if (t === undefined) err(path, `${k} has no value; not written`, 'warning');
      else values.push([k, t]);
    }
    const bad = [...meta, ...values].find(([k]) => !goodKey(k));
    if (bad || values.length + meta.length > lim.maxKeys) {
      err(path, bad ? `key ${JSON.stringify(bad[0].slice(0, 40))} cannot be read back; not written` : 'too many keys');
      continue;
    }
    const section = (head: string, rows: [string, string][]) =>
      `[${head}]\n${rows.map(([k, v]) => `${k} = ${text(v)}\n`).join('')}\n`;
    const out =
      section('general', [
        ['version', '4'],
        ['name', name],
        ['definition', definition],
      ]) +
      section('metadata', meta) +
      section('values', values);
    chars += out.length;
    if (chars > lim.maxChars) {
      err(path, `over ${lim.maxChars} characters in all; the rest are not written`);
      break;
    }
    files.push({ path, bytes: enc.encode(out) });
  }
  return { files, diagnostics };
}

export const curaExporter: Exporter = {
  formats: ['cura'],
  canHandle: (entity: ImportedEntity) => kindOf(entity) !== undefined,
  export: async (input) => writeCuraUserChanges(input),
};
