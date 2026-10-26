// SPDX-License-Identifier: AGPL-3.0-or-later
// Port of PrusaSlicer's `flatten_configbundle_hierarchy` (PrusaSlicer@b028299:src/libslic3r/PresetBundle.cpp:1311-1447,
// AGPL-3.0) and `unescape_strings_cstyle` (PrusaSlicer@b028299:src/libslic3r/Config.cpp:151-220), rewritten.
import type { Diagnostic } from '@vsslicer/profile-api';
import type { IniSection } from '../ini/index.ts';

/** Longest `inherits` chain, counted in sections; the pinned PrusaResearch.ini needs 10. Deeper sections are not imported. */
export const MAX_INHERITS_DEPTH = 32;
/** Parents one section may name; the pinned bundle names at most 5. Extra names are ignored with a diagnostic. */
export const MAX_PARENTS = 16;

export interface Flattened {
  section: IniSection;
  /** Own keys first, then inherited ones; `inherits` is kept verbatim only when it names parents outside the file. */
  values: Map<string, string>;
  /** Parents outside the file (a user preset's system parents), or those of the last-listed parent that has some. */
  inherits: string[];
}

/** Shared by every file of one import call: keys copied from a parent, so inheritance cannot amplify input without limit. */
export interface Budget {
  copies: number;
  readonly max: number;
}

export type Diag = (severity: Diagnostic['severity'], code: Diagnostic['code'], line: number, message: string) => void;

/**
 * `a; "b;c"; d` -> [`a`, `b;c`, `d`], or undefined when malformed. As upstream, leading blanks are skipped, an
 * unquoted word runs to the next `;` (trailing blanks kept) and a quoted one unescapes `\n`, `\r` and `\x` -> `x`.
 */
export function splitList(str: string): string[] | undefined {
  const out: string[] = [];
  if (str === '') return out;
  let i = 0;
  const blanks = () => {
    while (i < str.length && (str[i] === ' ' || str[i] === '\t')) i++;
    return i === str.length;
  };
  for (;;) {
    if (blanks()) return out;
    let word = '';
    if (str[i] === '"') {
      for (i++; i < str.length && str[i] !== '"'; i++) {
        let c = str[i]!;
        if (c === '\\') {
          if (++i === str.length) return undefined;
          c = str[i]!;
          if (c === 'r') c = '\r';
          else if (c === 'n') c = '\n';
        }
        word += c;
      }
      if (i === str.length) return undefined;
      i++;
    } else {
      const end = str.indexOf(';', i);
      word = str.slice(i, end < 0 ? str.length : end);
      i = end < 0 ? str.length : end;
    }
    out.push(word);
    if (i === str.length || blanks()) return out;
    if (str[i] !== ';') return undefined;
    if (++i === str.length) {
      out.push('');
      return out;
    }
  }
}

/**
 * Flattens the sections of one kind from one file. Parents are applied last-listed first and only fill keys
 * the child lacks, so the last parent wins and the child beats all; `renamed_from` is never inherited.
 * Parents outside the file are an error in a vendor bundle and kept as `inherits` in a user file (upstream
 * keeps them for system presets, `:1366-1374`). Sections in a cycle, too deep or past the budget are not
 * returned; abstract (`*name*`) sections are flattened into their children and then dropped.
 */
export function flattenKind(
  sections: readonly IniSection[],
  vendorBundle: boolean,
  budget: Budget,
  diag: Diag,
): Flattened[] {
  interface Node {
    section: IniSection;
    values: Map<string, string>;
    parents: Node[];
    external: string[];
    children: Node[];
    pending: number;
    depth: number;
  }
  const byName = new Map<string, Node>();
  const nodes: Node[] = [];
  for (const section of sections) {
    if (byName.has(section.name)) continue; // the parser already warned; boost would reject the file
    const values = new Map<string, string>();
    for (const e of section.entries) if (!values.has(e.key)) values.set(e.key, e.value); // ptree find: first wins
    const node: Node = { section, values, parents: [], external: [], children: [], pending: 0, depth: 1 };
    byName.set(section.name, node);
    nodes.push(node);
  }

  for (const node of nodes) {
    const raw = node.values.get('inherits');
    if (raw === undefined) continue;
    const line = node.section.entries.find((e) => e.key === 'inherits')!.line;
    let names = splitList(raw);
    if (!names) {
      diag('error', 'malformed-line', line, `[${node.section.name}] has an invalid inherits value; parents ignored`);
      continue;
    }
    if (names.length > MAX_PARENTS) {
      diag(
        'error',
        'malformed-line',
        line,
        `[${node.section.name}] names more than ${MAX_PARENTS} parents; rest ignored`,
      );
      names = names.slice(0, MAX_PARENTS);
    }
    for (const name of names) {
      const parent = byName.get(name);
      if (parent) {
        node.parents.push(parent);
        parent.children.push(node);
      } else if (vendorBundle) {
        diag('error', 'unknown-parent', line, `[${node.section.name}] inherits unknown "${name.slice(0, 256)}"`);
      } else node.external.push(name);
    }
    node.pending = node.parents.length;
    if (!node.external.length) node.values.delete('inherits'); // flattened away, as upstream erases it (:1367)
  }

  // Kahn's algorithm: a node is merged once all its parents are; the rest are in or behind a cycle.
  const queue = nodes.filter((n) => n.pending === 0);
  const done: Node[] = [];
  let over = false;
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]!;
    for (const c of node.children) if (--c.pending === 0) queue.push(c);
    // a child of a too-deep parent is deeper still, so it is refused here too
    node.depth = 1 + Math.max(0, ...node.parents.map((p) => p.depth));
    if (node.depth > MAX_INHERITS_DEPTH) {
      diag(
        'error',
        'malformed-line',
        node.section.line,
        `[${node.section.name}] inherits deeper than ${MAX_INHERITS_DEPTH} levels; not imported`,
      );
      continue;
    }
    // upstream merges the `inherits` key like any other, so the last-listed parent with system parents passes them on
    if (!node.external.length) node.external = node.parents.findLast((p) => p.external.length)?.external ?? [];
    // shortcut: `custom_parameters_*` JSON is replaced, not deep-merged as upstream does (:1415-1433); the pinned bundle has none
    for (let p = node.parents.length - 1; p >= 0 && !over; p--) {
      for (const [key, value] of node.parents[p]!.values) {
        if (++budget.copies > budget.max) {
          over = true;
          break;
        }
        if (key !== 'renamed_from' && key !== 'inherits' && !node.values.has(key)) node.values.set(key, value);
      }
    }
    if (over) {
      diag(
        'error',
        'malformed-line',
        node.section.line,
        `more than ${budget.max} inherited keys in one import; rest not imported`,
      );
      break;
    }
    done.push(node);
  }
  if (!over) {
    for (const n of nodes) {
      if (n.pending > 0)
        diag('error', 'cycle', n.section.line, `[${n.section.name}] has cyclic inherits; not imported`);
    }
  }
  return done
    .filter((n) => !n.section.abstract)
    .map((n) => ({ section: n.section, values: n.values, inherits: n.external }));
}
