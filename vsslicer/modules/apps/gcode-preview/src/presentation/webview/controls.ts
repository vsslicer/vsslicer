// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure helpers behind the layer/move sliders and the feature toggles.
import { MOVE_STRIDE, MoveRole } from '@vsslicer/gcode-api';

/** Display name per `MoveRole` value, from the key names ("ExternalPerimeter" to "External perimeter"). */
export const roleName = (role: number): string => {
  const key = Object.keys(MoveRole).find((k) => MoveRole[k as keyof typeof MoveRole] === role) ?? `Role ${role}`;
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/ ([A-Z])/g, (_, c: string) => ` ${c.toLowerCase()}`);
};

/** Roles that occur in the moves, ascending. */
export const presentRoles = (moves: ArrayBuffer): number[] => {
  const seen = new Set<number>();
  const v = new DataView(moves);
  for (let o = 16; o < moves.byteLength; o += MOVE_STRIDE) seen.add(v.getUint8(o));
  return [...seen].sort((a, b) => a - b);
};
