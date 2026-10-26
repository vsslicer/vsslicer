// SPDX-License-Identifier: AGPL-3.0-or-later
import { readModel } from './readModel.ts';

type CoreModel = ReturnType<typeof readModel>;

const parsed = new WeakMap<Uint8Array, { part: string; model: CoreModel }>();

/**
 * `readModel` memoised on the identity of the bytes (and the part name, which only shows in errors), so dialect
 * detection, the dialect reader and the core fallback share one parse. Weak: nothing outlives the bytes. A failed
 * parse is not cached. The returned model is shared and must not be mutated.
 */
export function readModelOnce(bytes: Uint8Array, part: string): CoreModel {
  const hit = parsed.get(bytes);
  if (hit?.part === part) return hit.model;
  const model = readModel(bytes, part);
  parsed.set(bytes, { part, model });
  return model;
}
