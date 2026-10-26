// SPDX-License-Identifier: AGPL-3.0-or-later
// Cura `quality/` files, and the user's `quality_changes/` and `definition_changes/`, as unified entities.
// Behaviour re-implemented from Uranium@e65ccc1 and Cura@5bea2f8 (both LGPL-3.0; no code copied):
//   UM/MimeTypeDatabase.py:180-190 the container suffix is `inst.cfg` without a dot, matched case-insensitively from
//     the first `.` of the name, so `dagoma_sigma_0.8_pla_h0.6inst.cfg` is a container (6 011 quality files, not 6 010);
//   UM/MimeTypeDatabase.py:100-111 the id strips `.inst.cfg`; a name without that dotted suffix loses its last character;
//   plugins/LocalContainerProvider/LocalContainerProvider.py:395 the id is unquote_plus'd;
//   UM/Settings/InstanceContainer.py:535-547 `[general]` needs `version` and `definition`, :54 version 4, :632 name
//     defaults to the id; the `[metadata] type` names the container kind (`quality`, `quality_changes`, `definition_changes`);
//   cura/Machines/MachineNode.py:258 global_quality, MaterialNode.py:73-90 which metadata keys select a quality.
// Settings keep Cura's own keys; `=x` values are `{ expr }` and never evaluated.
import type { Diagnostic, ImportResult, Process, PrinterInstance, Settings, SourceFile } from '@vsslicer/profile-api';
import { convertQualityMetadata, curaMachineFlags, quoteLiteral } from '../conditions/quality-conditions.ts';
import {
  MAX_RESOURCE_DIAGNOSTICS,
  resolveResourceLimits,
  type CuraResourceLimits,
  type CuraResources,
} from '../definitions/read.ts';
import { parseInstCfg } from '../definitions/inst-cfg.ts';

export type CuraCfgKind = 'quality' | 'quality_changes' | 'definition_changes';

const SUFFIX = 'inst.cfg';
const utf8 = new TextDecoder('utf-8', { fatal: true });

/** The folder kind a path (relative to a Cura `resources/` or user data folder) belongs to, and its container id. */
export function curaCfgOf(path: string): { kind: CuraCfgKind; id: string } | undefined {
  const parts = path.split('/');
  const kind = parts[0] as CuraCfgKind;
  if (kind !== 'quality' && kind !== 'quality_changes' && kind !== 'definition_changes') return undefined;
  if (parts.length < 2 || (kind !== 'quality' && parts.length !== 2) || parts.some((p) => p.startsWith('.'))) {
    return undefined;
  }
  const name = parts.at(-1)!;
  const lower = name.toLowerCase();
  const dot = name.indexOf('.');
  if (dot < 0 || !lower.endsWith(SUFFIX) || lower.length - SUFFIX.length < dot) return undefined;
  const at = lower.lastIndexOf(`.${SUFFIX}`);
  const stem = at < 0 ? name.slice(0, -1) : name.slice(0, at);
  if (stem.length === 0) return undefined;
  const spaced = stem.replaceAll('+', ' ');
  try {
    return { kind, id: decodeURIComponent(spaced) };
  } catch {
    return { kind, id: spaced };
  }
}

interface Cfg {
  id: string;
  file: string;
  kind: CuraCfgKind;
  name: string;
  definition: string;
  metadata: Record<string, string>;
  settings: Settings;
}

/** Reads the files of `kinds` into Cfgs, under the same caps as readCuraResources. */
function readCfgs(
  files: readonly SourceFile[],
  kinds: readonly CuraCfgKind[],
  lim: CuraResourceLimits,
  diag: (severity: Diagnostic['severity'], code: Diagnostic['code'], file: string, message: string) => void,
): Cfg[] {
  const out: Cfg[] = [];
  const seen = new Map<string, string>();
  let total = 0;
  for (const [n, file] of files.entries()) {
    if (n >= lim.maxFiles) {
      diag('error', 'unreadable-folder', file.path, `more than ${lim.maxFiles} files; the rest are not read`);
      break;
    }
    const res = curaCfgOf(file.path);
    if (!res || !kinds.includes(res.kind)) continue;
    if (file.bytes.length > lim.maxFileBytes) {
      diag(
        'error',
        'unreadable-folder',
        file.path,
        `${file.bytes.length} bytes, over the ${lim.maxFileBytes} byte limit; not read`,
      );
      continue;
    }
    total += file.bytes.length;
    if (total > lim.maxTotalBytes) {
      diag('error', 'unreadable-folder', file.path, `over ${lim.maxTotalBytes} bytes in all; the rest are not read`);
      break;
    }
    const alias = `${res.kind}/${res.id.normalize('NFC').toLowerCase()}`;
    const first = seen.get(alias);
    if (first !== undefined) {
      diag('warning', 'unreadable-folder', file.path, `same id as ${first}; not read`);
      continue;
    }
    seen.set(alias, file.path);
    let text: string;
    try {
      text = utf8.decode(file.bytes);
    } catch {
      diag('error', 'malformed-line', file.path, 'not UTF-8');
      continue;
    }
    const cfg = parseInstCfg(text);
    const general = cfg.get('general');
    const definition = general?.get('definition');
    const version = general?.get('version');
    if (definition === undefined || version === undefined) {
      diag('error', 'malformed-line', file.path, 'no [general] definition and version');
      continue;
    }
    if (version !== '4') {
      diag('error', 'malformed-line', file.path, `version ${version}, expected 4`);
      continue;
    }
    const metadata = Object.fromEntries(cfg.get('metadata') ?? []);
    if (metadata['type'] !== undefined && metadata['type'] !== res.kind) {
      diag('warning', 'unknown-type', file.path, `type ${metadata['type']} in a ${res.kind} folder; not read`);
      continue;
    }
    out.push({
      id: res.id,
      file: file.path,
      kind: res.kind,
      name: general!.get('name') ?? res.id,
      definition,
      metadata,
      settings: Object.fromEntries(
        [...(cfg.get('values') ?? [])].map(([k, v]) => [k, v.startsWith('=') ? { expr: v.slice(1) } : v]),
      ),
    });
  }
  return out;
}

const makeDiag = () => {
  const diagnostics: Diagnostic[] = [];
  const diag = (severity: Diagnostic['severity'], code: Diagnostic['code'], file: string, message: string) => {
    if (diagnostics.length > MAX_RESOURCE_DIAGNOSTICS) return;
    if (diagnostics.length === MAX_RESOURCE_DIAGNOSTICS) message = 'further diagnostics suppressed';
    diagnostics.push({ severity, code, file, message });
  };
  return { diagnostics, diag };
};

/** `fdmprinter`'s `default_value` for `layer_height` (fdmprinter.def.json:822), the stand-in when only a formula sets it. */
const NOMINAL_LAYER_HEIGHT = 0.1;
const ESTIMATED = 'layer_height is a formula or unset; 0.1 mm is a stand-in, the formula stays in settings';

const positive = (v: unknown): number | undefined => {
  if (typeof v !== 'string' || !/^\d+(?:\.\d+)?$/.test(v)) return undefined; // anchored, no nested quantifier: linear
  const n = Number(v);
  return n > 0 && Number.isFinite(n) ? n : undefined;
};

/** The definition's own `layer_height` when a plain number: what Cura's stack ends on when no quality sets one. */
const definitionHeight = (resources: Pick<CuraResources, 'definitions'>, definition: string): number | undefined => {
  const v =
    resources.definitions.get(definition)?.settings['layer_height'] ??
    resources.definitions.get('fdmprinter')?.settings['layer_height'];
  // A definition `value: 0.2` reads as the expression `0.2`; a real formula stays unresolved.
  const n = typeof v === 'object' && v !== null && 'expr' in v ? v.expr : v;
  return positive(typeof n === 'number' ? String(n) : n);
};

/**
 * `quality/**` as `process` entities. `when` is the definition/variant/material clauses {@link convertQualityMetadata}
 * allows for the quality's machine; `quality_type`, `global_quality`, `weight` and the rest of `[metadata]` go to
 * `native[id]`. A quality that sets no numeric `layer_height` takes the one of the global quality of the same
 * definition and `quality_type` (or of `fdmprinter`'s), else the definition's own default, which is where Cura's stack
 * gets it; with none (a formula such as `round(0.4 * material_shrinkage_percentage_z / 100, 5)`) a 0.1 mm stand-in and a
 * warning, and `native[id].layer_height_estimated`.
 */
export function readCuraQualities(
  files: readonly SourceFile[],
  resources: Pick<CuraResources, 'definitions'>,
  limits: Partial<CuraResourceLimits> = {},
): ImportResult {
  const lim = resolveResourceLimits(limits);
  const { diagnostics, diag } = makeDiag();
  const cfgs = readCfgs(files, ['quality'], lim, diag);
  const globalHeight = new Map<string, number>();
  for (const c of cfgs) {
    const h = positive(c.settings['layer_height']);
    if (h !== undefined && c.metadata['global_quality'] === 'True') {
      globalHeight.set(`${c.definition}\0${c.metadata['quality_type']}`, h);
    }
  }
  const entities: Process[] = [];
  const native: Record<string, unknown> = Object.create(null); // an id may be `__proto__`
  for (const c of cfgs) {
    const type = c.metadata['quality_type'];
    const height =
      positive(c.settings['layer_height']) ??
      globalHeight.get(`${c.definition}\0${type}`) ??
      globalHeight.get(`fdmprinter\0${type}`) ??
      definitionHeight(resources, c.definition);
    if (height === undefined) diag('warning', 'unknown-type', c.file, ESTIMATED);
    const flags = curaMachineFlags(resources.definitions.get(c.definition)?.metadata ?? {});
    // A quality outside `fdmprinter` is a machine quality by construction, whatever its definition's own flag says.
    if (c.definition !== 'fdmprinter') flags.hasMachineQuality = true;
    const conv = convertQualityMetadata({ ...c.metadata, definition: c.definition }, flags);
    for (const m of conv.diagnostics) diag('warning', 'unknown-type', c.file, m);
    entities.push({
      id: c.id,
      name: c.name,
      layer_height: height ?? NOMINAL_LAYER_HEIGHT,
      ...(conv.condition !== undefined && { when: conv.condition }),
      settings: c.settings,
    });
    native[c.id] = {
      definition: c.definition,
      ...c.metadata,
      ...(height === undefined && { layer_height_estimated: true }),
    };
  }
  return { entities, native, diagnostics };
}

/**
 * The user's `quality_changes/*` as `process` entities and `definition_changes/*` as `printer_instance` diffs
 * (`model` is the definition, `toolheads` empty, `settings` the changed values). A quality_changes `when` is the
 * definition alone: the stack that picks the base quality is not in these files. A user change that sets no numeric
 * `layer_height` takes the one of the global quality in `qualities` (the {@link readCuraQualities} result) for its
 * definition and `quality_type`, else `fdmprinter`'s; with none it gets a stand-in like a quality does. `position` stays in `native[id]`.
 */
export function readCuraUserChanges(
  files: readonly SourceFile[],
  qualities?: ImportResult,
  limits: Partial<CuraResourceLimits> = {},
): ImportResult {
  const lim = resolveResourceLimits(limits);
  const { diagnostics, diag } = makeDiag();
  const base = new Map<string, number>();
  for (const e of qualities?.entities ?? []) {
    const n = qualities!.native[e.id] as Record<string, string>;
    if (n['global_quality'] === 'True' && !n['layer_height_estimated'])
      base.set(`${n['definition']}\0${n['quality_type']}`, (e as Process).layer_height);
  }
  const entities: (Process | PrinterInstance)[] = [];
  const native: Record<string, unknown> = Object.create(null); // an id may be `__proto__`
  for (const c of readCfgs(files, ['quality_changes', 'definition_changes'], lim, diag)) {
    if (c.kind === 'definition_changes') {
      entities.push({ id: c.id, model: c.definition, toolheads: [], settings: c.settings });
      native[c.id] = { definition: c.definition, name: c.name, ...c.metadata };
      continue;
    }
    const type = c.metadata['quality_type'];
    const height =
      positive(c.settings['layer_height']) ?? base.get(`${c.definition}\0${type}`) ?? base.get(`fdmprinter\0${type}`);
    if (height === undefined) diag('warning', 'unknown-type', c.file, ESTIMATED);
    entities.push({
      id: c.id,
      name: c.name,
      layer_height: height ?? NOMINAL_LAYER_HEIGHT,
      when: `printer.model == ${quoteLiteral(c.definition)}`,
      settings: c.settings,
    });
    native[c.id] = {
      definition: c.definition,
      ...c.metadata,
      ...(height === undefined && { layer_height_estimated: true }),
    };
  }
  return { entities, native, diagnostics };
}
