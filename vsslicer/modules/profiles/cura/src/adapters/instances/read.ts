// SPDX-License-Identifier: AGPL-3.0-or-later
// Cura machine instances (`machine_instances/*.global.cfg`) as printer instances. Behaviour re-implemented from
// Uranium@e65ccc1 and Cura@5bea2f8 (both LGPL-3.0; no code copied):
//   Uranium UM/Settings/ContainerStack.py:345-364 serialize / :426 deserialize: `[general]` id, name, version (6),
//     `[metadata]` the stack's own keys, `[containers]` index to container id;
//   Cura cura/Settings/CuraContainerStack.py:409-419 index 5 is the variant, 6 the definition_changes, 7 the definition;
//   Cura cura/Settings/CuraContainerRegistry.py:581 an extruder stack belongs to a machine by its `machine` metadata,
//     ExtruderStack.py:52 its `position` is metadata;
//   Cura plugins/3MFReader/ThreeMFWorkspaceReader.py:51-61 and 3MFWriter/ThreeMFWorkspaceWriter.py:184-195 name the
//     network metadata keys `um_network_key`, `um_cloud_cluster_id`, `connection_type` and `octoprint_api_key`.
// UNVERIFIED: the key holding an OctoPrint URL (`octoprint_url`) is from the third-party OctoPrint plugin, not in the
// pinned Cura tree; no Cura app was available to save a fixture, so the test fixtures are built from the sources above.
import type { Diagnostic, InstanceImport, PrinterInstance, SourceFile } from '@vsslicer/profile-api';
import { validateConnection } from '@vsslicer/profile-api';
import { parseInstCfg } from '../definitions/inst-cfg.ts';
import { MAX_RESOURCE_DIAGNOSTICS, resolveResourceLimits, type CuraResourceLimits } from '../definitions/read.ts';

const DEFINITION_CHANGES = 6;
const STACK_VERSION = '6';
const utf8 = new TextDecoder('utf-8', { fatal: true });

export interface CuraInstancesImport {
  /** One per readable machine, in file order; the credential, if any, is beside the entity. */
  instances: InstanceImport[];
  /** Per instance id: the stack's `[metadata]` minus network keys, and the definition and variant ids. */
  native: Record<string, unknown>;
  diagnostics: Diagnostic[];
}

interface Stack {
  file: string;
  general: Map<string, string>;
  metadata: Map<string, string>;
  containers: Map<string, string>;
}

/** The file stem for a `<stem><suffix>` name directly under `dir/`, or undefined. */
function stemOf(path: string, dir: string, suffix: string): string | undefined {
  const parts = path.split('/');
  const name = parts.at(-1)!;
  if (parts.length !== 2 || parts[0] !== dir || !name.endsWith(suffix) || name.length === suffix.length)
    return undefined;
  return name.slice(0, -suffix.length);
}

const diameter = (v: string | undefined): number | undefined => {
  if (v === undefined || !/^\d+(?:\.\d+)?$/.test(v)) return undefined; // anchored, no nested quantifier: linear
  const n = Number(v);
  return n > 0 && Number.isFinite(n) ? n : undefined;
};

/**
 * Machines in `machine_instances/*.global.cfg`. `definition_changes/*.inst.cfg` and `extruders/*.extruder.cfg` are
 * read when present. `model` is the stack's definition id (container 7). The nozzle is `machine_nozzle_size` from the
 * definition_changes of the machine's position-0 extruder stack, else of the machine stack, and its entity id is the
 * diameter in mm (`0.4`); a size left to a variant or the definition default is not resolved here (toolheads stay
 * empty, with a warning). A stack with `octoprint_api_key` and an `octoprint_url` is an `octoprint` connection whose key is
 * returned as `credential` (when Ultimaker network keys are also present, OctoPrint wins and the Ultimaker key is ignored silently); any other network metadata is a diagnostic and no connection. The input is only read.
 */
export function readCuraMachineInstances(
  files: readonly SourceFile[],
  limits: Partial<CuraResourceLimits> = {},
): CuraInstancesImport {
  const lim = resolveResourceLimits(limits);
  const diagnostics: Diagnostic[] = [];
  const diag = (severity: Diagnostic['severity'], code: Diagnostic['code'], file: string, message: string) => {
    if (diagnostics.length > MAX_RESOURCE_DIAGNOSTICS) return;
    if (diagnostics.length === MAX_RESOURCE_DIAGNOSTICS) message = 'further diagnostics suppressed';
    diagnostics.push({ severity, code, file, message });
  };

  const machines = new Map<string, Stack>();
  const extruders: Stack[] = [];
  const changes = new Map<string, Map<string, string>>();
  let total = 0;
  for (const [n, file] of files.entries()) {
    if (n >= lim.maxFiles) {
      diag('error', 'unreadable-folder', file.path, `more than ${lim.maxFiles} files; the rest are not read`);
      break;
    }
    const machine = stemOf(file.path, 'machine_instances', '.global.cfg');
    const extruder = stemOf(file.path, 'extruders', '.extruder.cfg');
    const change = stemOf(file.path, 'definition_changes', '.inst.cfg');
    if (machine === undefined && extruder === undefined && change === undefined) continue;
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
    let sections;
    try {
      sections = parseInstCfg(utf8.decode(file.bytes));
    } catch {
      diag('error', 'malformed-line', file.path, 'not UTF-8');
      continue;
    }
    const general = sections.get('general') ?? new Map<string, string>();
    if (change !== undefined) {
      changes.set(general.get('id') ?? change, sections.get('values') ?? new Map());
      continue;
    }
    if (general.get('version') !== STACK_VERSION || !general.has('id')) {
      diag('error', 'malformed-line', file.path, `no [general] id, or version is not ${STACK_VERSION}`);
      continue;
    }
    const stack: Stack = {
      file: file.path,
      general,
      metadata: sections.get('metadata') ?? new Map(),
      containers: sections.get('containers') ?? new Map(),
    };
    if (machine !== undefined) {
      if (machines.has(general.get('id')!))
        diag('warning', 'unreadable-folder', file.path, 'same id as another machine; not read');
      else machines.set(general.get('id')!, stack);
    } else extruders.push(stack);
  }

  const instances: InstanceImport[] = [];
  const native: Record<string, unknown> = Object.create(null); // ids come from the file: never a plain object's keys
  for (const [id, m] of machines) {
    const d = (msg: string, severity: Diagnostic['severity'] = 'warning', code: Diagnostic['code'] = 'unknown-type') =>
      diag(severity, code, m.file, msg);
    const model = m.containers.get('7') ?? '';
    if (!model) d('machine names no definition (container 7); not imported', 'error', 'malformed-line');
    if (!model) continue;
    const sizeIn = (s: Stack | undefined) =>
      changes.get(s?.containers.get(String(DEFINITION_CHANGES)) ?? '')?.get('machine_nozzle_size');
    const ext = extruders.find((e) => e.metadata.get('machine') === id && e.metadata.get('position') === '0');
    const size = diameter(sizeIn(ext) ?? sizeIn(m));
    if (size === undefined)
      d('nozzle size not set in definition_changes; toolheads left empty', 'warning', 'unknown-parent');
    const entity: PrinterInstance = {
      id,
      model,
      toolheads: size === undefined ? [] : [{ slot: 0, nozzle: String(size) }],
    };

    const instance: InstanceImport = { entity };
    const key = m.metadata.get('octoprint_api_key');
    const url = m.metadata.get('octoprint_url');
    if (key !== undefined || url !== undefined) {
      const connection = { host_type: 'octoprint', url: url ?? '', secret_ref: `cura-machine/${id}` };
      const issues = url ? validateConnection(connection) : [{ message: 'url is empty' }];
      if (issues.length > 0)
        d(
          `octoprint connection is invalid (${issues[0]!.message}); imported without a connection`,
          'warning',
          'malformed-line',
        );
      else {
        entity.connection = connection;
        if (key) instance.credential = key;
        else d('octoprint connection has no api key', 'warning', 'credential-missing');
      }
    } else if (['um_network_key', 'um_cloud_cluster_id', 'connection_type'].some((k) => m.metadata.has(k)))
      d(
        'network connection of an Ultimaker or other Cura device plugin has no connector here; imported without a connection',
      );
    instances.push(instance);
    Object.defineProperty(native, id, {
      enumerable: true,
      writable: true,
      configurable: true,
      value: {
        name: m.general.get('name'),
        definition: model,
        variant: m.containers.get('5'),
        metadata: Object.fromEntries(
          [...m.metadata].filter(([k]) => !['octoprint_api_key', 'um_network_key', 'um_cloud_cluster_id'].includes(k)),
        ),
      },
    });
  }
  return { instances, native, diagnostics };
}
