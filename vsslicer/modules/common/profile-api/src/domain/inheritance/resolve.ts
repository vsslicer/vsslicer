// SPDX-License-Identifier: AGPL-3.0-or-later
import type { EntityBase } from '../entities/index.ts';
import { InheritanceCycleError, UnknownParentError } from './errors.ts';
import { merge } from './merge.ts';

export type EntityLookup = (id: string) => EntityBase | undefined;

export interface Resolved<T extends EntityBase> {
  /** Parents merged left to right, then the entity itself. `id`, `inherits`, `abstract`, `renamed_from` and `meta` are its own. */
  entity: T;
  /** False when the entity itself is `abstract`; a concrete child of an abstract parent is selectable. */
  selectable: boolean;
}

const OWN_ONLY = ['id', 'inherits', 'abstract', 'renamed_from', 'meta'] as const;

function flatten(entity: EntityBase, lookup: EntityLookup, path: string[]): EntityBase {
  const parents = (entity.inherits ?? []).map((id) => {
    const at = path.indexOf(id);
    if (at >= 0) throw new InheritanceCycleError([...path.slice(at), id]);
    const parent = lookup(id);
    if (!parent) throw new UnknownParentError(entity.id, id);
    return flatten(parent, lookup, [...path, id]);
  });
  const merged: Record<string, unknown> = { ...merge<EntityBase>([...parents, entity]) };
  for (const k of OWN_ONLY) {
    if (entity[k] === undefined) delete merged[k];
    else merged[k] = entity[k];
  }
  return merged as unknown as EntityBase;
}

/** Resolves `entity.inherits` through `lookup`; throws `InheritanceCycleError` or `UnknownParentError`. */
export function resolve<T extends EntityBase>(entity: T, lookup: EntityLookup): Resolved<T> {
  return { entity: flatten(entity, lookup, [entity.id]) as T, selectable: entity.abstract !== true };
}
