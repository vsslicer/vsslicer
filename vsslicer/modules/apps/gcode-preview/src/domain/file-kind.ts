// SPDX-License-Identifier: AGPL-3.0-or-later
/** The three file types the preview opens. */
export type FileKind = 'gcode' | 'bgcode' | 'gcode.3mf';

/** Kind by file name (case-insensitive); `undefined` for anything else. */
export const fileKind = (name: string): FileKind | undefined => {
  const n = name.toLowerCase();
  if (n.endsWith('.gcode.3mf')) return 'gcode.3mf';
  if (n.endsWith('.bgcode')) return 'bgcode';
  if (n.endsWith('.gcode')) return 'gcode';
  return undefined;
};
