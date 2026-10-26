// SPDX-License-Identifier: AGPL-3.0-or-later
type Plain = { [key: string]: unknown };
const isPlain = (v: unknown): v is Plain => typeof v === 'object' && v !== null && !Array.isArray(v);

function mergeValue(a: unknown, b: unknown): unknown {
  if (b === undefined) return a;
  if (a === undefined || a === null) return b;
  if (b === null) return a; // null falls through to the parent value
  if (!isPlain(a) || !isPlain(b)) return b; // scalars and arrays: the later one replaces
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  // fromEntries defines own properties, so a JSON key named __proto__ stays data.
  return Object.fromEntries([...keys].map((k) => [k, mergeValue(a[k], b[k])]));
}

/**
 * Merges a chain left to right (parents first, the child last): the last non-null value wins, maps are
 * deep-merged, arrays and scalars are replaced, `null` falls through. Associative as long as a key keeps
 * the same kind (scalar, array, map) across the chain; a scalar between two maps resets the merge.
 */
export function merge<T extends object>(chain: readonly T[]): T {
  if (chain.length === 0) throw new RangeError('merge needs at least one entity');
  return chain.reduce((acc, next) => mergeValue(acc, next) as T);
}
