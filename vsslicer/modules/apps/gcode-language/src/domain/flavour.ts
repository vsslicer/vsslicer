// SPDX-License-Identifier: AGPL-3.0-or-later
// shortcut: duplicates gcode-parser's SlicerTags flavour read, switch to gcode-parser's export once it has one
// (ParsedFile.flavourName exists since gcode-parser 0.11.0, but needs a full parse and there is no standalone header function).

/** How much of the file's head is scanned for the flavour comment. */
export const HEAD_BYTES = 64 * 1024;

const FLAVOUR_LINE = /^\s*;\s*(?:FLAVOR:|gcode_flavor\s*=)\s*(\S+)/;

/** Printer models whose firmware has its own catalogue. Bambu Studio and Orca write `gcode_flavor = marlin` for Bambu printers. */
const PRINTER_MODEL = /^\s*;\s*printer_model\s*=\s*(.*)$/;
// Buddy firmware boards (github.com/prusa3d/Prusa-Firmware-Buddy README); MK3S and older run Prusa-Firmware (Marlin 1)
const BUDDY_MODEL = /^(?:MINI|MK3\.5|MK3\.9|MK4|XL|COREONE)/;

const firmwareOf = (model: string): string | undefined =>
  model.startsWith('Bambu Lab') ? 'bambu' : BUDDY_MODEL.test(model) ? 'prusa-buddy' : undefined;

/**
 * The flavour name the head of a file states (`;FLAVOR:`, `; gcode_flavor =`), as written, the last one winning;
 * `bambu` or `prusa-buddy` instead when a Marlin (or unstated) flavour comes with a Bambu Lab or Prusa Buddy `printer_model`.
 */
export const detectFlavour = (head: string): string | undefined => {
  let name: string | undefined;
  let firmware: string | undefined;
  for (const line of head.split(/\r?\n/)) {
    name = FLAVOUR_LINE.exec(line)?.[1] ?? name;
    const model = PRINTER_MODEL.exec(line)?.[1];
    if (model !== undefined) firmware = firmwareOf(model.trim());
  }
  return firmware && (!name || name.toLowerCase().startsWith('marlin')) ? firmware : name;
};

/** What the status bar shows: the override, else the detected name, else 'generic'. */
export const flavourLabel = (detected: string | undefined, override: string | undefined): string =>
  override || detected || 'generic';
