// SPDX-License-Identifier: AGPL-3.0-or-later
// shortcut: duplicates gcode-parser's SlicerTags flavour read, switch to gcode-parser's export once it has one
// (ParsedFile.flavourName exists since gcode-parser 0.11.0, but needs a full parse and there is no standalone header function).

/** How much of the file's head is scanned for the flavour comment. */
export const HEAD_BYTES = 64 * 1024;

const FLAVOUR_LINE = /^\s*;\s*(?:FLAVOR:|gcode_flavor\s*=)\s*(\S+)/;

/** The flavour name the head of a file states (`;FLAVOR:`, `; gcode_flavor =`), as written, the last one winning. */
export const detectFlavour = (head: string): string | undefined => {
  let name: string | undefined;
  for (const line of head.split(/\r?\n/)) name = FLAVOUR_LINE.exec(line)?.[1] ?? name;
  return name;
};

/** What the status bar shows: the override, else the detected name, else 'generic'. */
export const flavourLabel = (detected: string | undefined, override: string | undefined): string =>
  override || detected || 'generic';
