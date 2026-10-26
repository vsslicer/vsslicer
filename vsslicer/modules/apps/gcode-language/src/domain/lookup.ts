// SPDX-License-Identifier: AGPL-3.0-or-later
import type { CatalogueEntry } from './catalogue.ts';

/** Entries by catalogue flavour, then by normalised code. */
export type CatalogueIndex = ReadonlyMap<string, ReadonlyMap<string, CatalogueEntry>>;

export const buildIndex = (entries: readonly CatalogueEntry[]): CatalogueIndex => {
  const index = new Map<string, Map<string, CatalogueEntry>>();
  for (const e of entries)
    for (const f of e.flavours) {
      if (!index.has(f)) index.set(f, new Map());
      // the catalogue repeats a few codes across files (reprap.json shares G1 and M104): the entry naming fewer flavours is the more specific one
      const known = index.get(f)?.get(e.code);
      if (!known || e.flavours.length < known.flavours.length) index.get(f)?.set(e.code, e);
    }
  return index;
};

/**
 * The catalogue flavour a flavour name (a header comment, or an override) stands for, or undefined when we do not know it.
 * "Marlin" and "Marlin Legacy" are marlin; unknown names such as "UltiGCode" give undefined, so nothing is flagged for them.
 */
export const resolveFlavour = (index: CatalogueIndex, name: string | undefined): string | undefined => {
  const n = name?.trim().toLowerCase();
  if (!n) return undefined;
  const key = n.startsWith('marlin') ? 'marlin' : n;
  return index.has(key) ? key : undefined;
};

/** `g01` and `G1` are the same command. */
export const normaliseCode = (word: string): string => {
  const w = word.toUpperCase();
  return /^[GMT]\d/.test(w) ? w.replace(/^([GMT])0+(?=\d)/, '$1') : w;
};

export interface CommandWord {
  /** Normalised code. */
  readonly code: string;
  readonly start: number;
  readonly end: number;
}

const COMMAND = /^(\s*(?:N\d+\s+)?)([GMT]\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*)/i;

/** The command word at the start of a line (a leading line number is skipped); comments are not commands. */
export const commandWord = (line: string): CommandWord | undefined => {
  const m = COMMAND.exec(line);
  if (!m || m[1] === undefined || !m[2]) return undefined;
  return { code: normaliseCode(m[2]), start: m[1].length, end: m[1].length + m[2].length };
};

/**
 * What hover shows for a code: the flavour's entry, or, with no flavour, the first entry of any flavour (catalogue order).
 * With a known flavour a command only another flavour documents has no entry.
 */
export const lookup = (index: CatalogueIndex, flavour: string | undefined, code: string): CatalogueEntry | undefined =>
  flavour ? index.get(flavour)?.get(code) : [...index.values()].map((m) => m.get(code)).find(Boolean);

/** Entries to offer for completion: the flavour's, or every distinct code when the flavour is unknown. */
export const entriesFor = (index: CatalogueIndex, flavour: string | undefined): CatalogueEntry[] =>
  flavour
    ? [...(index.get(flavour)?.values() ?? [])]
    : [...new Map([...index.values()].flatMap((m) => [...m])).values()];

/**
 * True when a G, M or T code is not in the (known) flavour's catalogue. Never true for an unknown flavour, and never for
 * extended commands: Klipper and RepRapFirmware macros (START_PRINT) are user-defined, so a name proves nothing.
 */
export const isUnknownCommand = (index: CatalogueIndex, flavour: string | undefined, code: string): boolean =>
  flavour !== undefined && /^[GMT]\d/.test(code) && !index.get(flavour)?.has(code);
