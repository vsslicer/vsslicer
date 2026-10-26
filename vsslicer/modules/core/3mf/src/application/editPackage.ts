// SPDX-License-Identifier: AGPL-3.0-or-later
import { InvalidPartEditError } from '../domain/errors.ts';
import type { Part } from '../domain/package.ts';
import type { OpenedPackage } from './openPackage.ts';
import type { ZipArchive } from './zipArchive.ts';

/** An opened package that can be changed by part and saved. Edits return a new package; the original is untouched. */
export interface EditablePackage extends OpenedPackage {
  /** The zip bytes: the input itself when nothing changed, otherwise the input with only the edited entries rewritten. */
  save(): Uint8Array;
  replacePart(name: string, bytes: Uint8Array): EditablePackage;
  /** Adds a part and registers `contentType` in `[Content_Types].xml` when its extension does not already give it. */
  addPart(name: string, contentType: string, bytes: Uint8Array): EditablePackage;
  /** Removes a part, its own `.rels`, its content-type Override and every relationship pointing at it. */
  removePart(name: string): EditablePackage;
}

/** What editing needs from the outside: the zip writer and the OPC text edits. */
export interface EditPackageDeps {
  writeZip(original: Uint8Array, changes: ReadonlyMap<string, Uint8Array | null>): Uint8Array;
  addContentType(xml: string, part: string, type: string): string;
  removeContentType(xml: string, part: string): string;
  dropRelationshipsTo(xml: string, source: string, target: string): string;
  resolveTarget(source: string, target: string): string;
}

const CONTENT_TYPES = '[Content_Types].xml';
const RELS = /(^|\/)_rels\/[^/]*\.rels$/i;
const enc = new TextEncoder();
const dec = new TextDecoder();
const relsOf = (part: string): string => {
  const slash = part.lastIndexOf('/') + 1;
  return `${part.slice(0, slash)}_rels/${part.slice(slash)}.rels`;
};
/** The part a `.rels` file belongs to ('' for the package). */
const ownerOf = (rels: string): string => {
  const at = rels.lastIndexOf('_rels/');
  return rels.slice(0, at) + rels.slice(at + 6, -5);
};

/** Wraps an opened package (and the bytes and zip it came from) with the editing operations. */
export function makeEditable(
  deps: EditPackageDeps,
  original: Uint8Array,
  zip: ZipArchive,
  opened: OpenedPackage,
  changes: ReadonlyMap<string, Uint8Array | null> = new Map(),
): EditablePackage {
  const names = new Set(opened.parts.map((p) => p.name));
  const next = (parts: Part[], more: Map<string, Uint8Array | null>): EditablePackage => {
    const merged = new Map([...changes, ...more]);
    const thumbnails = opened.thumbnails.filter((t) => parts.some((p) => p.name === t));
    return makeEditable(deps, original, zip, { ...opened, parts, thumbnails }, merged);
  };
  const current = (name: string): Uint8Array | undefined => {
    const c = changes.get(name);
    if (c !== undefined) return c ?? undefined;
    return zip.entries.some((e) => e.name === name) ? zip.inflated(name) : undefined;
  };
  const bad = (name: string, why: string): never => {
    throw new InvalidPartEditError(name, why);
  };
  const writable = (name: string): void => {
    if (opened.readOnly !== undefined) bad(name, 'the file is read-only');
  };
  const plain = (name: string): void => {
    if (!name || name.startsWith('/') || name.endsWith('/') || name === CONTENT_TYPES || RELS.test(name)) {
      bad(name, 'not a plain part name');
    }
  };

  return {
    ...opened,
    save: () => (changes.size === 0 ? original : deps.writeZip(original, changes)),
    replacePart(name, bytes) {
      writable(name);
      if (!names.has(name)) bad(name, 'no such part');
      return next(
        opened.parts.map((p) => (p.name === name ? { ...p, bytes } : p)),
        new Map([[name, bytes]]),
      );
    },
    addPart(name, contentType, bytes) {
      writable(name);
      plain(name);
      if (names.has(name)) bad(name, 'the part already exists');
      const types = dec.decode(current(CONTENT_TYPES));
      const more = new Map<string, Uint8Array | null>([
        [name, bytes],
        [CONTENT_TYPES, enc.encode(deps.addContentType(types, name, contentType))],
      ]);
      return next([...opened.parts, { name, contentType, relationships: [], bytes }], more);
    },
    removePart(name) {
      writable(name);
      if (!names.has(name)) bad(name, 'no such part');
      if (name === opened.rootModel) bad(name, 'it is the root model');
      const more = new Map<string, Uint8Array | null>([
        [name, null],
        [relsOf(name), null],
        [CONTENT_TYPES, enc.encode(deps.removeContentType(dec.decode(current(CONTENT_TYPES)), name))],
      ]);
      const relsFiles = new Set([...zip.entries.map((e) => e.name), ...changes.keys()].filter((n) => RELS.test(n)));
      for (const rels of relsFiles) {
        const bytes = rels === relsOf(name) ? undefined : current(rels);
        if (bytes === undefined) continue;
        const xml = dec.decode(bytes);
        const cleaned = deps.dropRelationshipsTo(xml, ownerOf(rels), name);
        if (cleaned !== xml) more.set(rels, enc.encode(cleaned));
      }
      // The types file is rewritten only when the Override was there.
      const types = dec.decode(current(CONTENT_TYPES));
      if (more.get(CONTENT_TYPES) && dec.decode(more.get(CONTENT_TYPES)!) === types) more.delete(CONTENT_TYPES);
      const parts = opened.parts
        .filter((p) => p.name !== name)
        .map((p) => ({
          ...p,
          relationships: p.relationships.filter((r) => r.external || deps.resolveTarget(p.name, r.target) !== name),
        }));
      return next(parts, more);
    },
  };
}
