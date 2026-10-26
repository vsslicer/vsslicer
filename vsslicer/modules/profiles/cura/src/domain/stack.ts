// SPDX-License-Identifier: AGPL-3.0-or-later
// Cura's container stack lookup, re-implemented (no code copied; Cura and Uranium are LGPL-3.0):
//   Cura@5bea2f8:cura/Settings/CuraContainerStack.py:412-431 the slots, top first;
//   Uranium@e65ccc1:UM/Settings/ContainerStack.py:294-305 the first container with a non-None value wins, then the
//   next stack; Cura@5bea2f8:cura/Settings/ExtruderStack.py:135-136 an extruder stack's next stack is the global one.
import type { Settings, SettingValue } from '@vsslicer/profile-api';

/** A stack's slots, highest priority first. */
export const CURA_STACK_SLOTS = [
  'user',
  'quality_changes',
  'intent',
  'quality',
  'material',
  'variant',
  'definition_changes',
  'definition',
] as const;

export type CuraStackSlot = (typeof CURA_STACK_SLOTS)[number];

/** One container's settings per slot; an empty slot is left out. */
export type CuraStack = Partial<Readonly<Record<CuraStackSlot, Readonly<Settings>>>>;

/**
 * A key's raw value (a formula stays `{ expr }`) through `stacks` in order: an extruder stack, then the global stack.
 * A key that is not `settable_per_extruder` is looked up in the global stack alone (ExtruderStack.py:135-136).
 */
export function curaStackValue(key: string, ...stacks: readonly CuraStack[]): SettingValue | undefined {
  for (const stack of stacks) {
    for (const slot of CURA_STACK_SLOTS) {
      const value = stack[slot]?.[key];
      if (value !== undefined && value !== null && Object.hasOwn(stack[slot]!, key)) return value;
    }
  }
  return undefined;
}
