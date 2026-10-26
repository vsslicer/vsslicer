// SPDX-License-Identifier: AGPL-3.0-or-later
import type { CatalogueEntry } from '../domain/catalogue.ts';
import { commandWord, entriesFor, isUnknownCommand, lookup, type CatalogueIndex } from '../domain/lookup.ts';
import { tagAt } from '../domain/tags.ts';

export interface Hover {
  /** Markdown. */
  readonly markdown: string;
  readonly start: number;
  readonly end: number;
}

export interface UnknownCommand {
  readonly line: number;
  readonly start: number;
  readonly end: number;
  readonly code: string;
}

export interface Completion {
  readonly label: string;
  readonly detail: string;
  readonly documentation: string;
  readonly kind: 'command' | 'parameter';
}

const entryMarkdown = (e: CatalogueEntry): string => {
  const unverified = e.flavours.includes('bambu') && !/unverified/i.test(e.description);
  return [
    `**${e.code}**`,
    ...(unverified ? ['*Undocumented and unverified.*'] : []),
    e.description,
    ...(e.parameters.length ? ['', ...e.parameters.map((p) => `- \`${p.name}\`: ${p.description}`)] : []),
    '',
    `Flavours: ${e.flavours.join(', ')}`,
    '',
    `[Source](${e.source})`,
  ].join('\n');
};

/** The hover for a position in one line: a catalogued command word, or a slicer tag comment. */
export const hoverAt = (
  index: CatalogueIndex,
  flavour: string | undefined,
  line: string,
  column: number,
): Hover | undefined => {
  const cmd = commandWord(line);
  if (cmd && column >= cmd.start && column <= cmd.end) {
    const entry = lookup(index, flavour, cmd.code);
    return entry && { markdown: entryMarkdown(entry), start: cmd.start, end: cmd.end };
  }
  const t = tagAt(line);
  if (t && column >= t.start && column <= t.end)
    return { markdown: `**;${t.tag.name}**\n\n${t.tag.description}`, start: t.start, end: t.end };
  return undefined;
};

/** Commands while the cursor is in (or before) the first word, parameters of the line's command after it. */
export const completionsAt = (
  index: CatalogueIndex,
  flavour: string | undefined,
  line: string,
  column: number,
): Completion[] => {
  const before = line.slice(0, column);
  if (before.includes(';')) return [];
  const cmd = commandWord(before);
  if (!cmd || column <= cmd.end)
    return entriesFor(index, flavour).map((e) => ({
      label: e.code,
      detail: e.description,
      documentation: entryMarkdown(e),
      kind: 'command',
    }));
  const entry = lookup(index, flavour, cmd.code);
  const used = new Set(
    before
      .slice(cmd.end)
      .match(/[A-Za-z_]+/g)
      ?.map((w) => w.toUpperCase()),
  );
  return (entry?.parameters ?? [])
    .filter((p) => !used.has(p.name.toUpperCase()))
    .map((p) => ({ label: p.name, detail: p.description, documentation: p.description, kind: 'parameter' }));
};

/** G, M and T codes the (known) flavour's catalogue does not have. Empty for an unknown flavour. */
export const unknownCommands = (index: CatalogueIndex, flavour: string | undefined, text: string): UnknownCommand[] => {
  if (!flavour) return [];
  const found: UnknownCommand[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const cmd = commandWord(line);
    if (cmd && isUnknownCommand(index, flavour, cmd.code))
      found.push({ line: i, start: cmd.start, end: cmd.end, code: cmd.code });
  });
  return found;
};
