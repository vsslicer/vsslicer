// SPDX-License-Identifier: AGPL-3.0-or-later
/** Bounds on untrusted profile input: names per list, characters per name or id. */
export const MAX_PRINTER_NAMES = 2000;
export const MAX_NAME_LENGTH = 256;
/** Stays below the parser's 64 KiB source limit (not exported by profile-api 0.1.0). */
const MAX_SOURCE_LENGTH = 60_000;

export interface ConditionConversion {
  /** Unified `when` condition; undefined means "no restriction" (an empty list). */
  condition?: string;
  /** True when the condition is not equivalent to the source. */
  lossy: boolean;
  diagnostics: string[];
}

/** Quotes a value as a unified-condition string literal; only the escapes the lexer knows are used. */
export function quoteLiteral(value: string): string {
  return `'${value.replace(/[\\'\n\t]/g, (c) => (c === '\n' ? '\\n' : c === '\t' ? '\\t' : `\\${c}`))}'`;
}

/**
 * Orca/Bambu `compatible_printers: [names]` to `printer.id in [...]`.
 * `resolveId` maps a printer preset name to its unified id. Exact only when every name resolves;
 * unresolved names are dropped with a diagnostic and the result is lossy (it may then match nothing).
 */
export function convertCompatiblePrinters(
  names: readonly unknown[],
  resolveId: (name: string) => string | undefined,
): ConditionConversion {
  if (names.length === 0) return { lossy: false, diagnostics: [] };
  const diagnostics: string[] = [];
  const ids: string[] = [];
  let length = 'printer.id in []'.length;
  names.forEach((name, i) => {
    if (i >= MAX_PRINTER_NAMES) {
      if (i === MAX_PRINTER_NAMES)
        diagnostics.push(`compatible_printers has more than ${MAX_PRINTER_NAMES} entries; the rest are ignored`);
      return;
    }
    if (typeof name !== 'string' || name.length > MAX_NAME_LENGTH) {
      diagnostics.push(`compatible_printers[${i}] is not a string of at most ${MAX_NAME_LENGTH} characters`);
      return;
    }
    const id = resolveId(name);
    if (id === undefined || id.length === 0 || id.length > MAX_NAME_LENGTH) {
      diagnostics.push(`compatible_printers[${i}]: printer '${name.slice(0, 80)}' does not resolve to an id`);
      return;
    }
    const quoted = quoteLiteral(id);
    if (length + quoted.length + 2 > MAX_SOURCE_LENGTH) {
      diagnostics.push('compatible_printers condition too long; remaining entries are ignored');
      return;
    }
    length += quoted.length + 2;
    ids.push(quoted);
  });
  return { condition: `printer.id in [${ids.join(', ')}]`, lossy: diagnostics.length > 0, diagnostics };
}
