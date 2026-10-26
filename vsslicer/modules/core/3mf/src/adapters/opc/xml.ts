// SPDX-License-Identifier: AGPL-3.0-or-later
import { SaxesParser } from 'saxes';
import { MalformedXmlError } from '../../domain/errors.ts';

export interface XmlElement {
  /** Local name, namespace prefix dropped. */
  readonly name: string;
  /** Unprefixed attributes by name. */
  readonly attributes: Readonly<Record<string, string>>;
}

/** Deepest element nesting accepted, the same limit `readModel` uses. */
export const MAX_XML_DEPTH = 64;

/** Every start tag of a small XML part, in document order. Any XML error becomes `MalformedXmlError` naming `part`. */
export function startTags(bytes: Uint8Array, part: string): XmlElement[] {
  const parser = new SaxesParser({ xmlns: true });
  const found: XmlElement[] = [];
  let depth = 0;
  parser.on('closetag', () => depth--);
  parser.on('opentag', (tag) => {
    if (++depth > MAX_XML_DEPTH) throw new Error(`elements nested deeper than ${MAX_XML_DEPTH}`);
    const attributes: Record<string, string> = {};
    for (const a of Object.values(tag.attributes)) if (a.prefix === '') attributes[a.local] = a.value;
    found.push({ name: tag.local, attributes });
  });
  try {
    parser.write(new TextDecoder().decode(bytes)).close();
  } catch (cause) {
    throw new MalformedXmlError(part, cause instanceof Error ? cause.message : String(cause), { cause });
  }
  return found;
}
