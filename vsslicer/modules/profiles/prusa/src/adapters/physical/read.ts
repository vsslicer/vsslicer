// SPDX-License-Identifier: AGPL-3.0-or-later
import { MAX_CONNECTION_STRING, HOST_TYPES } from '@vsslicer/profile-api';
import type { Diagnostic, InstanceImport } from '@vsslicer/profile-api';
import { parseIni } from '../ini/index.ts';

/** JSON input cap in bytes, checked before parse. */
export const MAX_PHYSICAL_JSON_BYTES = 1024 * 1024;
/** Nesting depth cap, checked on the text before parse. */
export const MAX_PHYSICAL_JSON_DEPTH = 16;

export interface PhysicalImport {
  /** Absent when the file has no usable printer name. */
  instance?: InstanceImport;
  diagnostics: Diagnostic[];
}

export interface PhysicalOptions {
  /** Nozzle entity id of a printer preset; the physical printer file names the preset but not its nozzle. */
  nozzleOf?: (preset: string) => string | undefined;
}

/**
 * Physical printer host_type -> profile-api HostType. Only values both sides know are mapped.
 * 2.9: PrintConfig.cpp `def->set_enum<PrintHostType>({ { "prusalink", ...}, { "prusaconnect", ...}, { "octoprint", ...},
 * { "moonraker", ...}, { "duet", ...}, { "flashair", ...}, { "astrobox", ...}, { "repetier", ...}, { "mks", ...} })`.
 * 3.0: PhysicalPrinterJson.cpp adds `"prusalink_storage"` and `"sl1"`. Those and the rest have no connector here.
 */
const HOST_MAP: Record<string, (typeof HOST_TYPES)[number]> = {
  prusalink: 'prusalink',
  octoprint: 'octoprint',
  moonraker: 'moonraker',
  duet: 'duet',
};

interface Fields {
  name: string;
  presets: string[];
  host: string;
  hostType: string;
  credential: string;
}

function build(f: Fields, file: string, diagnostics: Diagnostic[], opts: PhysicalOptions): PhysicalImport {
  const diag = (severity: Diagnostic['severity'], code: Diagnostic['code'], message: string) =>
    diagnostics.push({ severity, code, file, message });
  if (!f.name) {
    diag('error', 'malformed-line', 'physical printer has no name; not imported');
    return { diagnostics };
  }
  const model = f.presets[0] ?? '';
  if (!model) diag('warning', 'unknown-parent', 'physical printer names no printer preset');
  const nozzle = model ? opts.nozzleOf?.(model) : undefined;
  if (!nozzle) diag('warning', 'unknown-parent', 'nozzle of the printer preset is unknown; toolheads left empty');
  const entity: InstanceImport['entity'] = {
    id: f.name,
    model,
    toolheads: nozzle ? [{ slot: 0, nozzle }] : [],
  };
  const hostType = HOST_MAP[f.hostType];
  if (!hostType) {
    diag(
      'warning',
      'unknown-type',
      `host_type "${f.hostType.slice(0, 64)}" has no connector; imported without a connection`,
    );
  } else if (!f.host || f.host.length > MAX_CONNECTION_STRING) {
    diag(
      'warning',
      'malformed-line',
      `print host is empty or over ${MAX_CONNECTION_STRING} characters; imported without a connection`,
    );
  } else {
    entity.connection = { host_type: hostType, url: f.host, secret_ref: `prusa-physical/${f.name}` };
  }
  const instance: InstanceImport = { entity };
  if (f.credential && entity.connection) instance.credential = f.credential;
  return { instance, diagnostics };
}

/**
 * Port of `unescape_strings_cstyle` (PrusaSlicer-2.9@b028299 Config.cpp:151-215): items split on `;`, optionally
 * double-quoted with `\\r` `\\n` and backslash-escaped characters inside; malformed input (where upstream returns false) returns undefined.
 */
function unescapeStrings(str: string): string[] | undefined {
  const out: string[] = [];
  let i = 0;
  while (i < str.length) {
    while (str[i] === ' ' || str[i] === '\t') if (++i === str.length) return out;
    let buf = '';
    if (str[i] === '"') {
      for (i++; i < str.length && str[i] !== '"'; i++) {
        let c = str[i]!;
        if (c === '\\') {
          if (++i === str.length) return undefined;
          c = str[i] === 'r' ? '\r' : str[i] === 'n' ? '\n' : str[i]!;
        }
        buf += c;
      }
      if (i === str.length) return undefined; // unterminated quote
      i++;
    } else for (; i < str.length && str[i] !== ';'; i++) buf += str[i];
    out.push(buf);
    while (str[i] === ' ' || str[i] === '\t') i++;
    if (i >= str.length) return out;
    if (str[i] !== ';') return undefined;
    if (++i === str.length) out.push('');
  }
  return out;
}

/**
 * 2.9 physical printer file: a header-less INI of `PhysicalPrinter::printer_options()` keys, written by
 * `this->config.save(this->file)` (Preset.cpp:1849). Keys: `preset_names` (`;`-joined), `host_type`, `print_host`,
 * `printhost_apikey`, `printhost_password`. The key list is Preset.cpp:1760-1772 (`s_PhysicalPrinter_opts`).
 * `name` is the file stem, which the caller knows. The source is only read.
 */
export function readPhysicalPrinterIni(
  input: string | Uint8Array,
  name: string,
  opts: PhysicalOptions = {},
): PhysicalImport {
  const doc = parseIni(input, name); // carries the 64 MiB cap and the entry caps
  const v = new Map<string, string>();
  for (const s of doc.sections)
    if (s.kind === 'root') for (const e of s.entries) if (!v.has(e.key)) v.set(e.key, e.value);
  // OctoPrint.cpp:597-604: `user` authenticates with the password, anything else with the API key.
  const cred =
    (v.get('printhost_authorization_type') === 'user' ? v.get('printhost_password') : v.get('printhost_apikey')) ?? '';
  const presets = unescapeStrings(v.get('preset_names') ?? v.get('preset_name') ?? '');
  if (!presets) {
    // Config.cpp:500 throws BadOptionValueException; Preset.cpp:1996-2021 skips the printer. The value is not quoted.
    return {
      diagnostics: [
        ...doc.diagnostics,
        { severity: 'error', code: 'malformed-line', file: name, message: 'preset_names is malformed; not imported' },
      ],
    };
  }
  return build(
    {
      name,
      presets: presets.filter(Boolean),
      host: v.get('print_host') ?? '',
      hostType: v.get('host_type') ?? 'prusalink', // ConfigOptionEnum default htPrusaLink, PrintConfig.cpp:2518
      credential: cred,
    },
    name,
    doc.diagnostics.slice(),
    opts,
  );
}

function depthOver(text: string, max: number): boolean {
  let d = 0;
  let inStr = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (inStr) {
      if (c === 92) i++;
      else if (c === 34) inStr = false;
    } else if (c === 34) inStr = true;
    else if (c === 123 || c === 91) {
      if (++d > max) return true;
    } else if (c === 125 || c === 93) d--;
  }
  return false;
}

const s = (j: Record<string, unknown>, k: string) => (typeof j[k] === 'string' ? (j[k] as string) : '');

/**
 * 3.0 physical printer file (`<data_dir>/physical_printer/*.json`, PhysicalPrinterStorage.cpp:25): one object with
 * `physical_printer_user_given_name`, `physical_printer_host`, `physical_printer_host_type`, `physical_printer_api_key`,
 * `physical_printer_password` and `hw_config` (PhysicalPrinterJson.cpp:93-109, read at :125-135). Like `get_str`, a
 * non-string value reads as empty. `hw_config` is required upstream but its content is not mapped here.
 */
export function readPhysicalPrinterJson(input: string, file: string, opts: PhysicalOptions = {}): PhysicalImport {
  const diagnostics: Diagnostic[] = [];
  const fail = (message: string): PhysicalImport => {
    diagnostics.push({ severity: 'error', code: 'invalid-json', file, message });
    return { diagnostics };
  };
  if (input.length > MAX_PHYSICAL_JSON_BYTES || Buffer.byteLength(input) > MAX_PHYSICAL_JSON_BYTES)
    return fail(`input is over ${MAX_PHYSICAL_JSON_BYTES} bytes; not read`);
  if (depthOver(input, MAX_PHYSICAL_JSON_DEPTH))
    return fail(`nesting deeper than ${MAX_PHYSICAL_JSON_DEPTH}; not read`);
  let j: unknown;
  try {
    j = JSON.parse(input);
  } catch {
    return fail('not valid JSON'); // the parser message can quote input, so it is not forwarded
  }
  if (typeof j !== 'object' || j === null || Array.isArray(j)) return fail('physical printer json is not an object');
  const o = j as Record<string, unknown>;
  if (!('hw_config' in o))
    diagnostics.push({
      severity: 'warning',
      code: 'malformed-line',
      file,
      message: 'missing hw_config (3.0 refuses such a file)',
    });
  const auth = s(o, 'physical_printer_authorization_type');
  // PhysicalPrinterJson.cpp:63: `none` carries no credential.
  const cred =
    auth === 'user' ? s(o, 'physical_printer_password') : auth === 'none' ? '' : s(o, 'physical_printer_api_key');
  return build(
    {
      name: s(o, 'physical_printer_user_given_name'),
      presets: [],
      host: s(o, 'physical_printer_host'),
      hostType: s(o, 'physical_printer_host_type') || 'prusalink',
      credential: cred,
    },
    file,
    diagnostics,
    opts,
  );
}
