// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure helpers behind the layer/move sliders and the feature toggles.
import { MOVE_STRIDE, MoveFlag, MoveRole } from '@vsslicer/gcode-api';

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

/** The part of the saved view the sliders and toggles change. */
export interface ViewRules {
  layer: number | null;
  bottom?: number;
  move?: number;
  roleMask?: number;
  hiddenFlags?: number;
}

export type ViewEvent =
  | { kind: 'top' | 'bottom'; value: number }
  /** `max` is the slider's maximum: dragging to it means all moves. */
  | { kind: 'move'; value: number; max: number }
  | { kind: 'role'; value: number }
  | { kind: 'travel' }
  /** The playhead: it overwrites layer, move and bottom (the bottom stays below the top). */
  | { kind: 'play'; layer: number; move: number }
  /** A file arrived: a saved view is kept, a fresh one shows the whole print (the top layer). */
  | { kind: 'load'; layerCount: number };

/** The saved view after a control event; the rules the DOM handlers share, kept pure so Node tests them. */
export const nextView = <V extends ViewRules>(view: V | undefined, e: ViewEvent): V => {
  if (e.kind === 'load') return { ...view, layer: view?.layer ?? Math.max(0, e.layerCount - 1) } as V;
  if (!view) throw new Error('no saved view');
  const bottom = view.bottom ?? 0;
  switch (e.kind) {
    case 'top':
      return { ...view, layer: e.value, move: undefined, bottom: Math.min(bottom, e.value) };
    case 'bottom': {
      const layer = Math.max(e.value, view.layer ?? 0);
      return { ...view, bottom: e.value, layer, move: layer === view.layer ? view.move : undefined };
    }
    case 'move':
      return { ...view, move: e.value >= e.max ? undefined : e.value };
    case 'role':
      return { ...view, roleMask: ((view.roleMask ?? 0xffffffff) ^ (1 << e.value)) >>> 0 };
    case 'travel':
      return { ...view, hiddenFlags: (view.hiddenFlags ?? MoveFlag.Travel) ^ MoveFlag.Travel };
    case 'play':
      return { ...view, layer: e.layer, move: e.move, bottom: Math.min(bottom, e.layer) };
  }
};
