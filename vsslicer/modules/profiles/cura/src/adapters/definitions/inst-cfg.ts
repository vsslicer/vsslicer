// SPDX-License-Identifier: AGPL-3.0-or-later
// `.inst.cfg` text as Uranium reads it, re-implemented line by line (no code copied; Uranium is LGPL-3.0):
//   Uranium@e65ccc1:UM/FastConfigParser.py:17 a `[word]` header starts a section, a repeated header replaces it (:30);
//   :18 a `key = value` line starts a key, any other line continues the value; trailing whitespace is dropped;
//   :29 a continuation written as `\n\t` reads as `\n`.
// The regex quirks on malformed input (a key starting mid-line) are not reproduced; this parser is linear.

/** Section name to key to raw value, in file order. */
export type CfgSections = Map<string, Map<string, string>>;

const HEADER = /^\[(\w+)\]$/;
/** Characters FastConfigParser's key lookahead refuses (`[^=\n\t !<>\[]`, FastConfigParser.py:18). */
const NOT_KEY = new Set(['\t', ' ', '!', '<', '>', '[']);

export function parseInstCfg(text: string): CfgSections {
  const sections: CfgSections = new Map();
  let section: Map<string, string> | undefined;
  let key: string | undefined;
  let value = '';
  const flush = () => {
    if (section && key !== undefined) section.set(key, value.trimEnd().replaceAll('\n\t', '\n'));
    key = undefined;
  };
  for (const raw of text.split('\n')) {
    // shortcut: CRLF is read as LF; Cura's header regex would refuse it.
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    const header = HEADER.exec(line);
    if (header) {
      flush();
      section = new Map();
      sections.set(header[1]!, section);
      continue;
    }
    const k = keyOf(line);
    if (k) {
      flush();
      key = k.key;
      value = line.slice(k.valueStart);
    } else if (key !== undefined) value += `\n${line}`;
  }
  flush();
  return sections;
}

function keyOf(line: string): { key: string; valueStart: number } | undefined {
  const eq = line.indexOf('=');
  let end = eq;
  while (end > 0 && (line[end - 1] === ' ' || line[end - 1] === '\t')) end--;
  if (end <= 0) return undefined;
  for (let i = 0; i < end; i++) if (NOT_KEY.has(line[i]!)) return undefined;
  let valueStart = eq + 1;
  while (line[valueStart] === ' ' || line[valueStart] === '\t') valueStart++;
  return { key: line.slice(0, end), valueStart };
}
