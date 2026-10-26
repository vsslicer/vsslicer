// SPDX-License-Identifier: AGPL-3.0-or-later
import { SaxesParser } from 'saxes';
import { MalformedXmlError } from '../../domain/errors.ts';

export interface XmlElement {
  /** Local name, namespace prefix dropped. */
  readonly name: string;
  /** Unprefixed attributes by name. */
  readonly attributes: Readonly<Record<string, string>>;
}

/** Every start tag of a small XML part, in document order. Any XML error becomes `MalformedXmlError` naming `part`. */
export function startTags(bytes: Uint8Array, part: string): XmlElement[] {
  const parser = new SaxesParser({ xmlns: true });
  const found: XmlElement[] = [];
  parser.on('opentag', (tag) => {
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
