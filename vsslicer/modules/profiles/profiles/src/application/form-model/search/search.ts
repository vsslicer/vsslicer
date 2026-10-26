// SPDX-License-Identifier: AGPL-3.0-or-later
// Settings search (PRF-71): one inverted index over the form model's keys, labels, native names and tooltips.
import type { Group, HomeEntity } from '@vsslicer/profile-api';
import type { FormField, FormModel } from '../form-model.ts';

/** Bounds on untrusted input: the query is cut, the index text is cut. All scanning is linear (split on a character class). */
export const MAX_QUERY_CHARS = 200;
export const MAX_QUERY_TOKENS = 8;
/** A prefix match visits at most this many index terms per query token. */
export const MAX_PREFIX_TERMS = 64;
export const MAX_RESULTS = 200;
const MAX_TEXT_CHARS = 2000;
const MAX_TOOLTIP_TOKENS = 200;

// Key, label and native-name hits outrank tooltip hits: 10 against 1, so any one name hit beats several tooltip hits.
const NAME_WEIGHT = 10;
const TOOLTIP_WEIGHT = 1;
const EXACT_FACTOR = 2; // a whole-term match against a prefix match
const WHOLE_NAME_BONUS = 1000; // the query is, whole, a key or native name: `wall_line_count`

export interface SearchHit {
  field: FormField;
  group: Group;
  home: HomeEntity;
  score: number;
}

export interface SearchIndex {
  /** Hits best first, ties in catalogue order; at most `limit` (default 50, capped at MAX_RESULTS). */
  search(query: string, limit?: number): SearchHit[];
  /** Index entries touched by the last `search` (terms visited plus postings read), for the operation-bound test. */
  readonly lastCost: number;
}

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

function lowerBound(sorted: string[], prefix: string): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid]! < prefix) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function buildSearchIndex(model: FormModel): SearchIndex {
  const hits: Omit<SearchHit, 'score'>[] = [];
  const postings = new Map<string, Map<number, number>>(); // term -> field index -> best weight
  const wholeNames = new Map<string, Set<number>>(); // a whole lowercase key, label or native name -> field indexes (a Set: one bonus per field)
  const add = (term: string, id: number, weight: number) => {
    let p = postings.get(term);
    if (!p) postings.set(term, (p = new Map()));
    if ((p.get(id) ?? 0) < weight) p.set(id, weight);
  };
  for (const g of model)
    for (const s of g.subgroups)
      for (const field of s.fields) {
        const id = hits.length;
        hits.push({ field, group: g.id, home: s.home });
        const names = [
          field.key,
          field.label,
          ...Object.values(field.entry.native).flatMap((n) => ('key' in n ? [n.key] : [])),
        ];
        for (const name of names) {
          const text = name.slice(0, MAX_TEXT_CHARS);
          const w = text.toLowerCase();
          let ids = wholeNames.get(w);
          if (!ids) wholeNames.set(w, (ids = new Set()));
          ids.add(id);
          for (const t of tokenize(text)) add(t, id, NAME_WEIGHT);
        }
        for (const t of tokenize((field.entry.tooltip ?? '').slice(0, MAX_TEXT_CHARS)).slice(0, MAX_TOOLTIP_TOKENS))
          add(t, id, TOOLTIP_WEIGHT);
      }
  const terms = [...postings.keys()].sort();

  const index: SearchIndex & { lastCost: number } = {
    lastCost: 0,
    search(query, limit = 50) {
      let cost = 0;
      const q = query.slice(0, MAX_QUERY_CHARS);
      const tokens = [...new Set(tokenize(q))].slice(0, MAX_QUERY_TOKENS);
      let acc: Map<number, number> | undefined;
      for (const tok of tokens) {
        const scores = new Map<number, number>();
        const start = lowerBound(terms, tok);
        for (let i = start; i < terms.length && i < start + MAX_PREFIX_TERMS && terms[i]!.startsWith(tok); i++) {
          const p = postings.get(terms[i]!)!;
          cost += 1 + p.size;
          const factor = terms[i] === tok ? EXACT_FACTOR : 1;
          for (const [id, w] of p) scores.set(id, Math.max(scores.get(id) ?? 0, w * factor));
        }
        // AND across tokens: keep only fields every token reached, summing the scores.
        const next = new Map<number, number>();
        for (const [id, s] of acc ?? scores) if (scores.has(id)) next.set(id, (acc ? s : 0) + scores.get(id)!);
        acc = next;
        cost += scores.size;
        if (acc.size === 0) break;
      }
      const whole = wholeNames.get(q.trim().toLowerCase());
      if (whole && acc) {
        cost += whole.size;
        for (const id of whole) if (acc.has(id)) acc.set(id, acc.get(id)! + WHOLE_NAME_BONUS);
      }
      index.lastCost = cost;
      return [...(acc ?? [])]
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .slice(0, Math.max(0, Math.min(limit, MAX_RESULTS)))
        .map(([id, score]) => ({ ...hits[id]!, score }));
    },
  };
  return index;
}
