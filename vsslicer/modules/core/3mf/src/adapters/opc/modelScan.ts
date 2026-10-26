// SPDX-License-Identifier: AGPL-3.0-or-later
import { SaxesParser } from 'saxes';
import { MalformedXmlError } from '../../domain/errors.ts';
import { MAX_XML_DEPTH } from './xml.ts';

export const PRODUCTION_NS = 'http://schemas.microsoft.com/3dmanufacturing/production/2015/06';

export interface ModelScan {
  /** Namespace URI of each entry of the root `requiredextensions`; an undeclared prefix is kept as written. */
  readonly requiredExtensions: readonly string[];
  /** Every `p:path` (production extension) in the model, as written. */
  readonly productionPaths: readonly string[];
}

/** One SAX pass over a model part. Any XML error becomes `MalformedXmlError` naming `part`. */
export function scanModel(bytes: Uint8Array, part: string): ModelScan {
  const parser = new SaxesParser({ xmlns: true });
  const requiredExtensions: string[] = [];
  const productionPaths: string[] = [];
  let root = true;
  let depth = 0;
  parser.on('closetag', () => depth--);
  parser.on('opentag', (tag) => {
    if (++depth > MAX_XML_DEPTH) throw new Error(`elements nested deeper than ${MAX_XML_DEPTH}`);
    for (const a of Object.values(tag.attributes)) {
      if (a.uri === PRODUCTION_NS && a.local === 'path') productionPaths.push(a.value);
      else if (root && a.prefix === '' && a.local === 'requiredextensions') {
        for (const prefix of a.value.split(/\s+/).filter(Boolean)) requiredExtensions.push(tag.ns[prefix] ?? prefix);
      }
    }
    root = false;
  });
  try {
    parser.write(new TextDecoder().decode(bytes)).close();
  } catch (cause) {
    throw new MalformedXmlError(part, cause instanceof Error ? cause.message : String(cause), { cause });
  }
  return { requiredExtensions, productionPaths };
}
