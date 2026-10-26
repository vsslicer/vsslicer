// SPDX-License-Identifier: AGPL-3.0-or-later
import { parseYaml, yamlGet, yamlScalar } from './parse.ts';
import type { YamlDiagnostic, YamlMap } from './parse.ts';

/** The `kind` discriminants HwConfigLoader::load dispatches on (PrusaSlicer@30ef591 HwConfigLoader.cpp:174-209). */
export type VendorYamlKind = 'vendor' | 'printer' | 'printer_config' | 'tool' | 'feeder' | 'sheet';

export interface VendorYamlRecord {
  kind: VendorYamlKind;
  /** The `id` scalar; `''` when absent (each such record is warned). */
  id: string;
  /** Line of the record's `---` (1 for the first document). */
  line: number;
  /** The whole document, verbatim, for the mapping card to read fields from. */
  node: YamlMap;
}

/**
 * The native `vendor.yaml` tree, grouped by kind as HwConfigLoader groups it. Not an `ImportResult`: like
 * the INI reader's `IniDocument`, mapping to profile-api entities is a later card's job.
 */
export interface VendorYamlDocument {
  vendor: VendorYamlRecord | undefined;
  printers: VendorYamlRecord[];
  printerConfigs: VendorYamlRecord[];
  tools: VendorYamlRecord[];
  feeders: VendorYamlRecord[];
  sheets: VendorYamlRecord[];
  diagnostics: YamlDiagnostic[];
}

export interface VendorYamlOptions {
  /** The PrusaSlicer 3.0 YAML tree is read only when set; it is a moving upstream format pinned to @30ef591. */
  experimental?: boolean;
}

const GROUP = {
  printer: 'printers',
  printer_config: 'printerConfigs',
  tool: 'tools',
  feeder: 'feeders',
  sheet: 'sheets',
} as const;

/** Reads a PrusaSlicer 3.0 `vendor.yaml` stream into records by `kind`; off unless `experimental` is set. */
export function readVendorYaml(
  input: string | Uint8Array,
  file: string,
  options: VendorYamlOptions = {},
): VendorYamlDocument {
  const doc: VendorYamlDocument = {
    vendor: undefined,
    printers: [],
    printerConfigs: [],
    tools: [],
    feeders: [],
    sheets: [],
    diagnostics: [],
  };
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
  const stream = parseYaml(input, file);
  doc.diagnostics.push(...stream.diagnostics);
  const warn = (line: number, message: string) =>
    doc.diagnostics.push({ severity: 'warning', code: 'unknown-type', reason: 'bad-record', file, line, message });
  const seen = new Set<string>();
  for (const { line, root } of stream.documents) {
    if (root === undefined) continue; // comment-only or already diagnosed
    const kind = yamlScalar(yamlGet(root, 'kind'));
    if (root.kind !== 'map' || kind === undefined) {
      warn(line, 'document without a `kind`; skipped');
      continue;
    }
    if (kind !== 'vendor' && !Object.hasOwn(GROUP, kind)) {
      warn(line, `unknown kind "${kind}"; skipped`);
      continue;
    }
    const id = yamlScalar(yamlGet(root, 'id')) ?? '';
    if (id === '') warn(line, `${kind} without an id`);
    const record: VendorYamlRecord = { kind: kind as VendorYamlKind, id, line, node: root };
    if (kind === 'vendor') {
      if (doc.vendor) warn(line, 'second `kind: vendor` document; it replaces the first, as HwConfigLoader does');
      doc.vendor = record;
      continue;
    }
    // printer_configs are a list upstream (emplace_back); the other kinds are maps keyed by id, and emplace keeps the first
    const key = `${kind}\0${id}`;
    if (kind !== 'printer_config' && seen.has(key)) {
      warn(line, `duplicate ${kind} id "${id}"; HwConfigLoader keeps the first`);
      continue;
    }
    seen.add(key);
    doc[GROUP[kind as keyof typeof GROUP]].push(record);
  }
  return doc;
}
