// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ZipArchive } from '../../application/zipArchive.ts';
import { MalformedXmlError, MissingRootModelError } from '../../domain/errors.ts';
import type { Package, Part, Relationship } from '../../domain/package.ts';
import { startTags } from './xml.ts';

export const START_PART_TYPE = 'http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel';
const CONTENT_TYPES = '[Content_Types].xml';
const isRels = (name: string): boolean => /(^|\/)_rels\/[^/]*\.rels$/i.test(name);

export interface ContentTypes {
  /** Lower-cased extension to type. */
  readonly defaults: ReadonlyMap<string, string>;
  /** Lower-cased part name (no leading slash) to type. */
  readonly overrides: ReadonlyMap<string, string>;
}

/** Resolves a relationship target against the part that owns it ('' for the package root). Returns a part name without leading slash. */
export function resolveTarget(source: string, target: string): string {
  const path = target.startsWith('/') ? target.slice(1) : `${source.slice(0, source.lastIndexOf('/') + 1)}${target}`;
  const out: string[] = [];
  for (const seg of path.split('/')) {
    if (seg === '..') out.pop();
    else if (seg !== '.' && seg !== '') out.push(seg);
  }
  return out.join('/');
}

export function readContentTypes(zip: ZipArchive): ContentTypes {
  if (!zip.entries.some((e) => e.name === CONTENT_TYPES)) throw new MissingRootModelError();
  const defaults = new Map<string, string>();
  const overrides = new Map<string, string>();
  for (const el of startTags(zip.inflated(CONTENT_TYPES), CONTENT_TYPES)) {
    const type = el.attributes.ContentType;
    if (el.name === 'Default' && el.attributes.Extension !== undefined && type !== undefined) {
      defaults.set(el.attributes.Extension.toLowerCase(), type);
    } else if (el.name === 'Override' && el.attributes.PartName !== undefined && type !== undefined) {
      overrides.set(el.attributes.PartName.replace(/^\//, '').toLowerCase(), type);
    }
  }
  return { defaults, overrides };
}

/** Relationships of `source` ('' for the package), `[]` when it has no `.rels`. Types and targets are kept as written. */
export function readRelationships(zip: ZipArchive, source: string): Relationship[] {
  const slash = source.lastIndexOf('/') + 1;
  const rels = `${source.slice(0, slash)}_rels/${source.slice(slash)}.rels`;
  if (!zip.entries.some((e) => e.name === rels)) return [];
  const list: Relationship[] = [];
  for (const el of startTags(zip.inflated(rels), rels)) {
    if (el.name !== 'Relationship') continue;
    const { Id: id, Type: type, Target: target, TargetMode: mode } = el.attributes;
    if (id === undefined || type === undefined || target === undefined) {
      throw new MalformedXmlError(rels, 'a Relationship lacks Id, Type or Target');
    }
    list.push({ id, type, target, external: mode?.toLowerCase() === 'external' });
  }
  return list;
}

/** Reads the OPC layer of a 3MF into a `Package`: every non-rels part with its content type, relationships and inflated bytes. */
export function readPackage(zip: ZipArchive): Package {
  const types = readContentTypes(zip);
  const start = readRelationships(zip, '').find((r) => !r.external && r.type === START_PART_TYPE);
  const rootModel = start && resolveTarget('', start.target);
  if (rootModel === undefined || !zip.entries.some((e) => e.name === rootModel)) throw new MissingRootModelError();
  const parts: Part[] = zip.entries
    .filter((e) => e.name !== CONTENT_TYPES && !e.name.endsWith('/') && !isRels(e.name))
    .map((e) => ({
      name: e.name,
      contentType:
        types.overrides.get(e.name.toLowerCase()) ??
        types.defaults.get(e.name.slice(e.name.lastIndexOf('.') + 1).toLowerCase()) ??
        'application/octet-stream',
      relationships: readRelationships(zip, e.name),
      bytes: zip.inflated(e.name),
    }));
  return { rootModel, parts };
}
