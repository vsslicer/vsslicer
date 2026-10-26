// SPDX-License-Identifier: AGPL-3.0-or-later
import type { EntityBase, Settings } from '../entities/index.ts';
import { evaluate, type ConditionContext } from '../conditions/evaluate/evaluate.ts';
import { merge } from './merge.ts';

export interface OverridesApplied<T extends EntityBase> {
  /** The entity with the applying blocks merged over its `settings`, in order; `overrides` is removed. */
  entity: T;
  /** Indices into `overrides` of the blocks that applied, in order. */
  applied: number[];
  /** One message per block whose `when` could not be parsed or evaluated; such a block applies (PrusaSlicer: "compatible with everything"). */
  diagnostics: string[];
}

/**
 * Applies the `overrides` blocks whose `when` holds for `context`, in order, over the entity's `settings`.
 * A matching block with `match: 'first'` ends the scan (later blocks are skipped); `'all'` or unset continues.
 * Call after `resolve`, so inherited blocks are already merged in (arrays replace: the child's list wins).
 */
export function applyOverrides<T extends EntityBase>(entity: T, context: ConditionContext): OverridesApplied<T> {
  const applied: number[] = [];
  const diagnostics: string[] = [];
  const blocks: Settings[] = [entity.settings ?? {}];
  for (const [i, block] of (entity.overrides ?? []).entries()) {
    const r = evaluate(block.when, context);
    if (r.diagnostic) diagnostics.push(`overrides[${i}]: ${r.diagnostic}`);
    if (!r.compatible) continue;
    applied.push(i);
    blocks.push(block.settings);
    if (block.match === 'first') break;
  }
  const out: EntityBase = { ...entity, settings: merge(blocks) };
  delete out.overrides;
  return { entity: out as unknown as T, applied, diagnostics };
}
