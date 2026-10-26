// SPDX-License-Identifier: AGPL-3.0-or-later
import { parseYaml, yamlGet, yamlScalar } from './parse.ts';
import type { YamlDiagnostic, YamlMap, YamlNode, YamlReason, YamlStream } from './parse.ts';

/** Variant levels below a root; a deeper variant is dropped with a diagnostic. */
export const MAX_PRESET_VARIANT_DEPTH = 32;
/** Variants read per file, all roots together; the rest are dropped with one diagnostic. */
export const MAX_PRESET_VARIANTS = 10_000;

/** The `kind` strings of ENUM_DESC(PresetKind) (PrusaSlicer@30ef591 PresetYamlDesc.hpp:7-16). */
export type PresetYamlKind =
  'printer' | 'print' | 'tool_print' | 'filament' | 'sla_printer' | 'sla_print' | 'sla_tool_print' | 'sla_material';
const KINDS: ReadonlySet<string> = new Set<PresetYamlKind>([
  'printer',
  'print',
  'tool_print',
  'filament',
  'sla_printer',
  'sla_print',
  'sla_tool_print',
  'sla_material',
]);
/** ENUM_DESC(ConditionMatchMode) (PresetYamlDesc.hpp:18-21). */
export type PresetMatchMode = 'first_match' | 'all_matches';

/** One node of PRESET_VARIANT_FIELDS (PresetYamlDesc.hpp:23-33; struct PresetNode, PresetTree.hpp:27-42). */
export interface PresetYamlNode {
  /** `''` when absent, as FIELD_DEFAULT `{}` leaves it. */
  id: string;
  name?: string;
  /** Raw condition text; parsing it is the condition-language card's job. */
  condition?: string;
  matchMode?: PresetMatchMode;
  inherits: string[];
  unconditionalInherits: string[];
  /** The `values` map verbatim (scalars stay strings); undefined when absent. */
  values?: YamlMap;
  features?: YamlMap;
  variants: PresetYamlNode[];
  line: number;
}

/** RootPresetNode (PresetYamlDesc.hpp:39-42): a node with a `kind`. */
export interface PresetYamlRoot extends PresetYamlNode {
  kind: PresetYamlKind;
}

export interface PresetYamlDocument {
  /** File order; PresetLoader::load appends each document's root (PresetLoader.cpp:54-63). */
  presets: PresetYamlRoot[];
  diagnostics: YamlDiagnostic[];
}

export interface PresetYamlOptions {
  /** The PrusaSlicer 3.0 YAML tree is read only when set; it is a moving upstream format pinned to @30ef591. */
  experimental?: boolean;
}

/** Reads one PrusaSlicer 3.0 `preset-*.yaml` stream into preset trees with variants nested; off unless `experimental`. */
export function readPresetYaml(
  input: string | Uint8Array,
  file: string,
  options: PresetYamlOptions = {},
): PresetYamlDocument {
  const off: YamlStream = { documents: [], diagnostics: [], stats: { nodes: 0, steps: 0 } };
  return readPresetStream(options.experimental === true ? parseYaml(input, file) : off, file, options);
}

/** {@link readPresetYaml} over an already parsed stream (exposed so the variant bounds can be tested past the YAML depth limit). */
export function readPresetStream(
  stream: YamlStream,
  file: string,
  options: PresetYamlOptions = {},
): PresetYamlDocument {
  const doc: PresetYamlDocument = { presets: [], diagnostics: [] };
  const warn = (reason: YamlReason, line: number, message: string) =>
    doc.diagnostics.push({ severity: 'warning', code: 'unknown-type', reason, file, line, message });
  if (options.experimental !== true) {
    doc.diagnostics.push({
      severity: 'warning',
      code: 'unknown-type',
      reason: 'experimental-off',
      file,
      message: 'the PrusaSlicer 3.0 YAML tree is experimental; set `experimental` to read it',
    });
    return doc;
  }
  doc.diagnostics.push(...stream.diagnostics);
  let variants = 0;
  let capped = false;

  const strings = (n: YamlNode | undefined, key: string): string[] => {
    if (n === undefined) return [];
    const out = n.kind === 'seq' ? n.items.map(yamlScalar) : [undefined];
    if (out.some((s) => s === undefined)) {
      warn('bad-record', n.line, `\`${key}\` is not a list of strings; ignored`);
      return [];
    }
    return out as string[];
  };
  const map = (n: YamlNode | undefined, key: string): YamlMap | undefined => {
    if (n === undefined || n.kind === 'map') return n;
    // an empty `values:` parses as the scalar ''; upstream reads it as an empty map
    if (!(n.kind === 'scalar' && n.value === '' && n.style === 'plain'))
      warn('bad-record', n.line, `\`${key}\` is not a map; ignored`);
    return undefined;
  };
  const node = (m: YamlMap, depth: number): PresetYamlNode => {
    const out: PresetYamlNode = {
      id: yamlScalar(yamlGet(m, 'id')) ?? '',
      inherits: strings(yamlGet(m, 'inherits'), 'inherits'),
      unconditionalInherits: strings(yamlGet(m, 'unconditional_inherits'), 'unconditional_inherits'),
      variants: [],
      line: m.line,
    };
    const name = yamlScalar(yamlGet(m, 'name'));
    if (name !== undefined) out.name = name;
    const condition = yamlScalar(yamlGet(m, 'condition'));
    if (condition !== undefined) out.condition = condition;
    const mode = yamlScalar(yamlGet(m, 'match_mode'));
    if (mode === 'first_match' || mode === 'all_matches') out.matchMode = mode;
    else if (mode !== undefined) warn('bad-record', m.line, `unknown match_mode "${mode}"; ignored`);
    const values = map(yamlGet(m, 'values'), 'values');
    if (values) out.values = values;
    const features = map(yamlGet(m, 'features'), 'features');
    if (features) out.features = features;
    const vs = yamlGet(m, 'variants');
    if (vs === undefined || (vs.kind === 'scalar' && vs.value === '')) return out;
    if (vs.kind !== 'seq') {
      warn('bad-record', vs.line, '`variants` is not a list; ignored');
      return out;
    }
    if (depth === MAX_PRESET_VARIANT_DEPTH) {
      warn('too-deep', vs.line, `variants nested deeper than ${MAX_PRESET_VARIANT_DEPTH}; dropped`);
      return out;
    }
    for (const v of vs.items) {
      if (variants === MAX_PRESET_VARIANTS) {
        if (!capped)
          warn('too-many-variants', v.line, `more than ${MAX_PRESET_VARIANTS} variants in the file; the rest dropped`);
        capped = true;
        break;
      }
      if (v.kind !== 'map') {
        warn('bad-record', v.line, 'variant is not a map; skipped');
        continue;
      }
      variants++;
      out.variants.push(node(v, depth + 1));
    }
    return out;
  };

  for (const { line, root } of stream.documents) {
    if (root === undefined) continue; // comment-only or already diagnosed
    const kind = yamlScalar(yamlGet(root, 'kind'));
    if (root.kind !== 'map' || kind === undefined) {
      warn('bad-record', line, 'document without a `kind`; skipped');
      continue;
    }
    if (!KINDS.has(kind)) {
      warn('bad-record', line, `unknown kind "${kind}"; skipped`);
      continue;
    }
    const preset: PresetYamlRoot = { kind: kind as PresetYamlKind, ...node(root, 0) };
    if (preset.id === '') warn('bad-record', line, `${kind} preset without an id`);
    doc.presets.push(preset);
  }
  return doc;
}
