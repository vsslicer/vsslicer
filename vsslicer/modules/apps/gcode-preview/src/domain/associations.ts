// SPDX-License-Identifier: AGPL-3.0-or-later
/** Default editor for `*.bgcode` and `*.gcode.3mf` (priority `default`). */
export const PREVIEW_VIEW_TYPE = 'vsslicer.gcode.preview';
/** The same editor for `*.gcode`, priority `option`: the default only through the setting below. */
export const GCODE_VIEW_TYPE = 'vsslicer.gcode.preview.gcode';
export const OPEN_GCODE_SETTING = 'vsslicer.gcode.preview.openGcodeByDefault';
export const GCODE_PATTERN = '*.gcode';

/**
 * The user's `workbench.editorAssociations` after applying the setting, or `undefined` when nothing
 * changes. Turning it off removes only an entry that points at our editor.
 */
export const nextAssociations = (
  current: Readonly<Record<string, string>>,
  openGcodeByDefault: boolean,
): Record<string, string> | undefined => {
  const ours = current[GCODE_PATTERN] === GCODE_VIEW_TYPE;
  if (openGcodeByDefault === ours) return undefined;
  const next = { ...current };
  if (openGcodeByDefault) next[GCODE_PATTERN] = GCODE_VIEW_TYPE;
  else delete next[GCODE_PATTERN];
  return next;
};
