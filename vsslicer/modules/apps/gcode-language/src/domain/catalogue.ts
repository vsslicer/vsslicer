// SPDX-License-Identifier: AGPL-3.0-or-later

export interface CatalogueParameter {
  readonly name: string;
  readonly description: string;
}

/** One G-code command. The description is our own wording; `source` is where the behaviour is documented. */
export interface CatalogueEntry {
  readonly code: string;
  readonly parameters: readonly CatalogueParameter[];
  readonly flavours: readonly string[];
  readonly description: string;
  readonly source: string;
}

/** Pages an entry may cite: RepRap wiki, Marlin, Prusa Buddy and its Prusa-Firmware command list, Klipper (docs and source), RepRapFirmware (Duet) and OrcaSlicer (Bambu templates). */
const SOURCES: readonly { host: string; path: string }[] = [
  { host: 'reprap.org', path: '/wiki/G-code' },
  { host: 'marlinfw.org', path: '/docs/gcode' },
  { host: 'github.com', path: '/prusa3d/Prusa-Firmware-Buddy' },
  { host: 'github.com', path: '/SoftFever/OrcaSlicer' },
  { host: 'github.com', path: '/Klipper3d/klipper' },
  { host: 'help.prusa3d.com', path: '/article/prusa-firmware-specific-g-code-commands_112173' },
  { host: 'www.klipper3d.org', path: '/G-Codes.html' },
  { host: 'docs.duet3d.com', path: '' },
];

/** Standard codes, or Klipper extended commands such as SET_PRESSURE_ADVANCE. */
const CODE = /^([GMT]\d+(\.\d+)?|[A-Z][A-Z0-9_]+)$/;

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

const sourceProblem = (source: unknown): string | undefined => {
  if (!isText(source)) return 'missing source link';
  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return `source is not a URL: ${source}`;
  }
  const ok =
    url.protocol === 'https:' &&
    SOURCES.some((s) => url.hostname === s.host && (url.pathname === s.path || url.pathname.startsWith(`${s.path}/`)));
  return ok
    ? undefined
    : `source is not an allowed reference (reprap.org/wiki/G-code, marlinfw.org/docs/gcode, docs.duet3d.com, www.klipper3d.org/G-Codes.html, github.com/prusa3d/Prusa-Firmware-Buddy, github.com/SoftFever/OrcaSlicer, github.com/Klipper3d/klipper or help.prusa3d.com/article/prusa-firmware-specific-g-code-commands_112173): ${source}`;
};

/** Every problem with one raw entry; empty when it is valid. */
export const validateEntry = (raw: unknown): string[] => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return ['entry is not an object'];
  const e = raw as Record<string, unknown>;
  const problems: string[] = [];
  if (typeof e.code !== 'string' || !CODE.test(e.code)) problems.push(`invalid code: ${String(e.code)}`);
  if (!isText(e.description)) problems.push('missing description');
  if (!Array.isArray(e.flavours) || e.flavours.length === 0 || !e.flavours.every(isText))
    problems.push('missing flavour list');
  if (!Array.isArray(e.parameters)) problems.push('parameters must be a list');
  else {
    e.parameters.forEach((p: unknown, i) => {
      const q = p as Record<string, unknown> | null;
      if (!isText(q?.name) || !isText(q?.description)) problems.push(`parameter ${i} needs a name and a description`);
    });
  }
  const s = sourceProblem(e.source);
  if (s) problems.push(s);
  return problems;
};

/** Validates a whole file's worth of raw entries, including duplicate codes within one flavour. Throws listing every problem. */
export const parseEntries = (raw: unknown, where: string): CatalogueEntry[] => {
  if (!Array.isArray(raw)) throw new Error(`${where}: expected a list of entries`);
  const problems: string[] = [];
  const seen = new Set<string>();
  raw.forEach((entry, i) => {
    const label = `${where}[${i}]${typeof entry?.code === 'string' ? ` ${entry.code}` : ''}`;
    for (const p of validateEntry(entry)) problems.push(`${label}: ${p}`);
    for (const f of Array.isArray(entry?.flavours) ? entry.flavours : []) {
      const key = `${f}:${entry.code}`;
      if (seen.has(key)) problems.push(`${label}: duplicate ${entry.code} for flavour ${f}`);
      seen.add(key);
    }
  });
  if (problems.length) throw new Error(problems.join('\n'));
  return raw as CatalogueEntry[];
};
