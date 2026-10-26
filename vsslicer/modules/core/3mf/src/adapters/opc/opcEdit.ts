// SPDX-License-Identifier: AGPL-3.0-or-later
// Text edits of [Content_Types].xml and .rels files. They splice the original text, so everything else in the file stays as written.
// shortcut: attribute values containing '>' or a prefixed default namespace are not handled, add with a real XML writer if a slicer emits them.
import { resolveTarget } from './opc.ts';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const attr = (tag: string, name: string): string | undefined =>
  new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`)
    .exec(tag)
    ?.slice(1)
    .find((v) => v !== undefined);
const norm = (partName: string): string => partName.replace(/^\//, '').toLowerCase();

/** Registers `type` for `part`: nothing if it already resolves to it, else a Default for its extension, else an Override. */
export function addContentType(xml: string, part: string, type: string): string {
  const tags = xml.match(/<(?:Default|Override)\b[^>]*>/g) ?? [];
  const ext = part.includes('.') ? part.slice(part.lastIndexOf('.') + 1).toLowerCase() : '';
  const sameType = (t: string): boolean => attr(t, 'ContentType')?.toLowerCase() === type.toLowerCase();
  const override = tags.find((t) => t.startsWith('<Override') && norm(attr(t, 'PartName') ?? '') === norm(part));
  const dflt = ext
    ? tags.find((t) => t.startsWith('<Default') && attr(t, 'Extension')?.toLowerCase() === ext)
    : undefined;
  if (override ? sameType(override) : dflt && sameType(dflt)) return xml;
  const clean = override ? xml.replace(override, '') : xml;
  const entry =
    ext && !dflt
      ? `<Default Extension="${esc(ext)}" ContentType="${esc(type)}"/>`
      : `<Override PartName="/${esc(part)}" ContentType="${esc(type)}"/>`;
  return clean.replace(/<\/Types\s*>/, `${entry}</Types>`);
}

/** Drops the Override of `part`; its extension Default stays, other parts may use it. */
export function removeContentType(xml: string, part: string): string {
  return xml.replace(/\s*<Override\b[^>]*>(?:\s*<\/Override>)?/g, (m) =>
    norm(attr(m, 'PartName') ?? '') === norm(part) ? '' : m,
  );
}

/** Drops the relationships of a `.rels` file (owned by `source`, '' for the package) that point at `target`. */
export function dropRelationshipsTo(xml: string, source: string, target: string): string {
  return xml.replace(/\s*<Relationship\b[^>]*?(?:\/>|>\s*<\/Relationship>)/g, (m) => {
    const t = attr(m, 'Target');
    const external = attr(m, 'TargetMode')?.toLowerCase() === 'external';
    return t !== undefined && !external && resolveTarget(source, t) === target ? '' : m;
  });
}
