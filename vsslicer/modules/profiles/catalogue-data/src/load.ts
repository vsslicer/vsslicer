// SPDX-License-Identifier: AGPL-3.0-only
// Bounds for catalogue JSON (PRF-192): checked before any caller treats the value as a catalogue.

export interface CatalogueLimits {
  /** UTF-8 bytes of one file's text. */
  maxBytes: number;
  /** Object keys plus array elements over the whole value. */
  maxKeys: number;
  /** Nesting depth; the top-level object is depth 1. */
  maxDepth: number;
}

/** The largest file today (orca.json) is about 0.7 MB, 16k keys, depth 8. */
export const CATALOGUE_LIMITS: Readonly<CatalogueLimits> = Object.freeze({
  maxBytes: 16 * 1024 * 1024,
  maxKeys: 1_000_000,
  maxDepth: 32,
});

export type CatalogueJson = { readonly [key: string]: unknown };

export class CatalogueDataError extends Error {
  override name = 'CatalogueDataError';
}

function limitsOf(limits: Partial<CatalogueLimits> | undefined): CatalogueLimits {
  const out = { ...CATALOGUE_LIMITS, ...limits };
  for (const [name, value] of Object.entries(out))
    if (!Number.isSafeInteger(value) || value <= 0 || value > CATALOGUE_LIMITS[name as keyof CatalogueLimits])
      throw new RangeError(
        `${name} must be a whole number from 1 to ${CATALOGUE_LIMITS[name as keyof CatalogueLimits]}`,
      );
  return out;
}

/** Checks a parsed value's key count and depth; returns it as a JSON object or throws CatalogueDataError. */
export function checkCatalogueJson(value: unknown, limits?: Partial<CatalogueLimits>): CatalogueJson {
  const { maxKeys, maxDepth } = limitsOf(limits);
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new CatalogueDataError('catalogue JSON must be an object');
  let keys = 0;
  const stack: [unknown, number][] = [[value, 1]];
  while (stack.length > 0) {
    const [node, depth] = stack.pop()!;
    if (typeof node !== 'object' || node === null) continue;
    if (depth > maxDepth) throw new CatalogueDataError(`catalogue JSON nests deeper than ${maxDepth}`);
    const children = Array.isArray(node) ? node : Object.values(node);
    keys += children.length;
    if (keys > maxKeys) throw new CatalogueDataError(`catalogue JSON has more than ${maxKeys} keys`);
    for (const child of children) stack.push([child, depth + 1]);
  }
  return value as CatalogueJson;
}

/** Parses one catalogue file's text within the limits. */
export function parseCatalogueJson(text: string, limits?: Partial<CatalogueLimits>): CatalogueJson {
  const { maxBytes } = limitsOf(limits);
  // UTF-8 never has fewer bytes than UTF-16 code units, so the length check bounds the encode below.
  if (text.length > maxBytes || new TextEncoder().encode(text).length > maxBytes)
    throw new CatalogueDataError(`catalogue JSON is larger than ${maxBytes} bytes`);
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new CatalogueDataError(`catalogue JSON does not parse: ${(error as Error).message}`);
  }
  return checkCatalogueJson(value, limits);
}
