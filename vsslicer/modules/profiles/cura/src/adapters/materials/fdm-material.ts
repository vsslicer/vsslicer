// SPDX-License-Identifier: AGPL-3.0-or-later
// Cura `fdmmaterial` XML (v1.3, fdm_materials@0c05969, CC0) to one `material` entity per file. The element-to-field
// table is profile-api's curaCatalogue.material (from Cura@5bea2f8:plugins/XmlMaterialProfile/XmlMaterialProfile.py,
// LGPL-3.0). Per-machine and per-hotend `<machine>` overrides are not read yet.
import type { Diagnostic, Material, SourceFile } from '@vsslicer/profile-api';
import { curaCatalogue } from '@vsslicer/profile-api';
import { SaxesParser } from 'saxes';
import { opendir } from 'node:fs/promises';
import { join } from 'node:path';
import { readCapped } from '../definitions/folder.ts';
import { MAX_RESOURCE_DIAGNOSTICS, resolveResourceLimits, type CuraResourceLimits } from '../definitions/read.ts';

/** Per-file XML caps (rule 25); file count and byte caps come from the shared resource limits. */
export const FDM_XML_LIMITS = Object.freeze({ maxDepth: 32, maxElements: 100_000, maxTextBytes: 64 * 1024 });

const SUFFIX = '.xml.fdm_material';
const num = (s: string): number | undefined => (s.trim() !== '' && Number.isFinite(+s) ? +s : undefined);

/** One file's fields by catalogue path (`metadata/GUID`, `settings/print temperature`), or a thrown reason. */
function scan(bytes: Uint8Array): Map<string, string> {
  const parser = new SaxesParser({ xmlns: true });
  const out = new Map<string, string>();
  const path: string[] = [];
  let text = '';
  let elements = 0;
  let key: string | undefined;
  parser.on('doctype', () => {
    throw new Error('a DOCTYPE is not accepted');
  });
  parser.on('opentag', (t) => {
    if (++elements > FDM_XML_LIMITS.maxElements) throw new Error(`more than ${FDM_XML_LIMITS.maxElements} elements`);
    if (path.length >= FDM_XML_LIMITS.maxDepth) throw new Error(`nested deeper than ${FDM_XML_LIMITS.maxDepth}`);
    path.push(t.local);
    text = '';
    key = t.local === 'setting' ? t.attributes['key']?.value : undefined;
  });
  const add = (s: string) => {
    if ((text += s).length > FDM_XML_LIMITS.maxTextBytes) throw new Error('a text node is too long');
  };
  parser.on('text', add);
  parser.on('cdata', add);
  parser.on('closetag', () => {
    // Only the file's own `metadata`, `properties` and top-level `settings` (not `<machine>` blocks) are read.
    const p = path.slice(1);
    const name = p[0] === 'settings' ? (p.length === 2 && key ? `settings/${key}` : '') : p.join('/');
    if (name && text.trim() !== '' && !out.has(name)) out.set(name, text.trim());
    path.pop();
    text = '';
    key = undefined;
  });
  parser.write(new TextDecoder('utf-8', { fatal: true }).decode(bytes)).close();
  if (path.length === 0 && elements === 0) throw new Error('no root element');
  return out;
}

export interface FdmMaterials {
  materials: Material[];
  /** Keys with no catalogue entry, by material id (kept for a round trip). */
  native: Record<string, { settings: Record<string, string> }>;
  diagnostics: Diagnostic[];
}

/** `*.xml.fdm_material` files to materials; a bad file is a diagnostic and the rest import. */
export function readFdmMaterials(files: readonly SourceFile[], limits: Partial<CuraResourceLimits> = {}): FdmMaterials {
  const lim = resolveResourceLimits(limits);
  const res: FdmMaterials = { materials: [], native: {}, diagnostics: [] };
  const diag = (severity: Diagnostic['severity'], file: string, message: string, line?: number) => {
    if (res.diagnostics.length < MAX_RESOURCE_DIAGNOSTICS) {
      res.diagnostics.push({ severity, code: 'malformed-line', file, message, ...(line ? { line } : {}) });
    }
  };
  const seen = new Set<string>();
  let total = 0;
  for (const [i, f] of files.entries()) {
    if (i >= lim.maxFiles) {
      diag('error', f.path, `more than ${lim.maxFiles} files; the rest are not read`);
      break;
    }
    total += f.bytes.length;
    if (f.bytes.length > lim.maxFileBytes || total > lim.maxTotalBytes) {
      diag('error', f.path, 'over the byte limit; not read');
      if (total > lim.maxTotalBytes) break;
      continue;
    }
    let fields: Map<string, string>;
    try {
      fields = scan(f.bytes);
    } catch (e) {
      diag('error', f.path, `not valid fdmmaterial XML: ${(e as Error).message.split('\n')[0]}`);
      continue;
    }
    const guid = fields.get('metadata/GUID');
    const diameter = num(fields.get('properties/diameter') ?? '');
    const brand = fields.get('metadata/name/brand');
    const type = fields.get('metadata/name/material');
    if (!guid || diameter === undefined || diameter <= 0 || !brand || !type) {
      diag('error', f.path, 'needs GUID, brand, material and a positive diameter');
      continue;
    }
    const id = `cura-material-${guid}`;
    if (seen.has(id)) {
      diag('error', f.path, `GUID ${guid} already read from another file`);
      continue;
    }
    seen.add(id);
    // Cura's rule (XmlMaterialProfile.py:573-576, :1100-1106): the label, else "<color> <material>", colour omitted if Generic.
    const color = fields.get('metadata/name/color');
    const label = fields.get('metadata/name/label') ?? (color && color !== 'Generic' ? `${color} ${type}` : type);
    const m: Material = {
      id,
      vendor: brand,
      name: `${brand} ${label}`,
      type,
      diameter,
      brand,
    };
    m.external_ids = { cura_guid: guid };
    const density = num(fields.get('properties/density') ?? '');
    if (density !== undefined) m.density = density;
    if (fields.get('metadata/color_code')) m.color = fields.get('metadata/color_code')!;
    const settings: Material['settings'] = {};
    const unmapped: Record<string, string> = Object.create(null); // a key may be `__proto__`
    for (const [name, value] of fields) {
      if (!name.startsWith('settings/')) continue;
      const target = curaCatalogue.material[name]?.setting;
      if (!target) unmapped[name.slice(9)] = value;
      else settings[target] = num(value) ?? value;
    }
    if (Object.keys(settings).length) m.settings = settings;
    if (Object.keys(unmapped).length) res.native[id] = { settings: unmapped };
    res.materials.push(m);
  }
  return res;
}

/** Reads the `.xml.fdm_material` files directly in `dir` (not below it); never follows a link (rule 25). */
export async function readFdmMaterialFolder(
  dir: string,
  limits: Partial<CuraResourceLimits> = {},
): Promise<FdmMaterials> {
  const lim = resolveResourceLimits(limits);
  const files: SourceFile[] = [];
  const res: FdmMaterials = { materials: [], native: {}, diagnostics: [] };
  const err = (file: string, message: string) =>
    res.diagnostics.length < MAX_RESOURCE_DIAGNOSTICS &&
    res.diagnostics.push({ severity: 'error', code: 'unreadable-folder', file, message });
  const names: string[] = [];
  let entries = 0;
  try {
    for await (const d of await opendir(dir)) {
      if (++entries > lim.maxFiles) {
        err(dir, `more than ${lim.maxFiles} entries; the rest are not read`);
        break;
      }
      if (d.isFile() && !d.name.startsWith('.') && d.name.toLowerCase().endsWith(SUFFIX)) names.push(d.name);
    }
  } catch (e) {
    err(dir, `not readable: ${(e as Error).message}`);
    return res;
  }
  let total = 0;
  for (const name of names.sort()) {
    const bytes = await readCapped(join(dir, name), lim.maxFileBytes);
    if (typeof bytes === 'string') err(name, bytes);
    else if ((total += bytes.length) > lim.maxTotalBytes) {
      err(name, `over ${lim.maxTotalBytes} bytes in all; the rest are not read`);
      break;
    } else files.push({ path: name, bytes });
  }
  const parsed = readFdmMaterials(files, limits);
  parsed.diagnostics.unshift(...res.diagnostics);
  return parsed;
}
