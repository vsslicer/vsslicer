// SPDX-License-Identifier: AGPL-3.0-or-later

export interface SlicerTag {
  readonly name: string;
  readonly description: string;
}

/** Comment tags slicers write (Cura, Orca, PrusaSlicer, Bambu Studio); our own wording. */
export const TAGS: readonly SlicerTag[] = [
  {
    name: 'LAYER_CHANGE',
    description: 'Marks where a new layer starts (Orca, Bambu Studio, PrusaSlicer, SuperSlicer).',
  },
  { name: 'LAYER', description: 'Cura: the zero-based index of the layer that starts here.' },
  { name: 'LAYER_COUNT', description: 'Cura: how many layers the file has.' },
  {
    name: 'TYPE',
    description:
      'The kind of extrusion that follows, such as an outer wall, infill or skirt. The names differ by slicer.',
  },
  { name: 'HEIGHT', description: 'Layer height in millimetres for the moves that follow.' },
  { name: 'WIDTH', description: 'Extrusion line width in millimetres for the moves that follow.' },
  { name: 'TIME', description: 'Cura: the estimated print time in seconds, written in the header.' },
  { name: 'FLAVOR', description: 'The G-code flavour the slicer wrote; VSSlicer shows it in the status bar.' },
  { name: 'MESH', description: 'Cura: the model the following moves belong to.' },
  { name: 'WIPE_START', description: 'Start of a wipe move that retracts while moving over the print.' },
  { name: 'WIPE_END', description: 'End of a wipe move.' },
  {
    name: 'OBJECT_ID',
    description: 'Orca and Bambu Studio: the id of the object being printed (used for skipping objects).',
  },
];

const TAG_LINE = /^\s*;\s*([A-Z][A-Z_]*)(?=[:\s]|$)/;

/** The tag a comment line starts with, with the column range of its name. */
export const tagAt = (line: string): { tag: SlicerTag; start: number; end: number } | undefined => {
  const m = TAG_LINE.exec(line);
  const name = m?.[1];
  const tag = TAGS.find((t) => t.name === name);
  if (!m || !name || !tag) return undefined;
  const end = m[0].length;
  return { tag, start: end - name.length, end };
};
