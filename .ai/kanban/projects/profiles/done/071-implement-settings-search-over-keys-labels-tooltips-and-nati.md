---
id: 71
title: "Implement settings search over keys, labels, tooltips and native names"
type: feature
priority: P1
effort: M
model: sonnet
area: [form]
story: US31
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [135, 118]
created: 2026-10-25
---

A pure search index so `perimeters`, `wall_loops` and `wall_line_count` find the same field.

**Code:** `vsslicer/modules/profiles/src/application/form-model/search/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [x] `perimeters` (Prusa), `wall_loops` (Orca) and `wall_line_count` (Cura) return the same field first
- [x] A word from a tooltip finds its key; results rank key and label hits above tooltip hits
- [ ] Searching all ~800 keys takes under 20 ms (timing test)

## Tasks

- [x] Build the index
- [x] Ranking
- [x] Tests

## Progress

Not started.

Review (sp8-reviewer-18, 2026-10-26 08:18): FAIL

Ran: module `pnpm test` (34), `lint`, `build` and `node scripts/run.mjs checks` (exit 0) all pass. Probes ran in scratch against the full five-slicer catalogue (1930 fields). Criteria 1 and 2 hold. `perimeters`, `wall_loops`, `wall_line_count` and `WALL_LOOPS` all return `wall_loops` first. For 15 single words (wall, speed, fan, z, ...) no tooltip-only hit ranks above a name hit. The operation bound is real: at most 8 tokens × 64 prefix terms, with the query cut at 200 characters. The worst single-character query costs 4969 and an 8-token query 15057. Hostile queries (regex metacharacters, 1 MB input, lone surrogates, emoji, NUL) return quickly with bounded cost. Layering is fine: application layer only, no VS Code, and it imports profile-api only by package name.

Findings:
1. search.ts:74: the index build is quadratic in the number of fields that share a whole name. `wholeNames.set(w, [...(wholeNames.get(w) ?? []), id])` copies the array on every add. Probe with the same label on every field: 8000 fields 51 ms, 16000 fields 313 ms. Fields that share a native key: 8000 fields 1.4 s, 16000 fields 5.2 s (MAX_FORM_FIELDS is 20 000). Distinct names stay linear. Fix: push into the existing array, held as a Set so the same id is not added twice. Add a test that builds from a synthetic model in which many fields share one name.
2. search.ts:74 and 105-108: one field gets the whole-name bonus once per name that equals the query. Its key, its Orca native key and its Bambu native key all count, so `wall_loops` scores 3040 (804 fields are affected). Ranking is still correct today, but the bonus is meant to be a single 1000. Deduplicating the ids, as in finding 1, fixes both.
3. test/form-model-search.test.ts:41-42: the assertion that tooltip hits rank below name hits always passes. The results are sorted by score, so every hit before index `tooltipOnly` already has a score at least that high. Wanted: assert that no name hit appears after the first tooltip-only hit, as the review probe did. Use a word whose tooltip-only hits actually show up within the limit.
4. Card: criterion 3 still reads "under 20 ms (timing test)", the Tasks are unticked and Progress has no worker entry. Record the replacement criterion (an operation bound through `lastCost`, rule 5) and tick what is done. The first operation-bound assertion (test:55) is near-vacuous. The `perimeters` assertion (`lastCost < fieldCount`) is the one that bites, and it is acceptable.

Advisory: queries are not NFC-normalised. A decomposed `é` matches as `e` and a composed one finds nothing, which is harmless with today's English labels.

Worker entry (PRF-71-fix, 2026-10-26): fixed review findings 1-4. Whole-name map now holds a Set of field ids per name (no array copy per add; one 1000 bonus per field). Tests: tooltip-vs-name test now reads MAX_RESULTS hits, requires a tooltip-only hit to exist and no name hit (key, label or native key) after it; new test that the bonus is once per field; new test with many fields sharing a label and a native key, counting array elements iterated during build and comparing 1000 vs 2000 fields (ratio < 3, linear is 2, quadratic 4) plus the search `lastCost` ratio. Criterion 3 ("under 20 ms (timing test)") is replaced, per rule 5, by an operation bound: `lastCost` stays within tokens*(MAX_PREFIX_TERMS + MAX_PREFIX_TERMS*fieldCount) + fieldCount*tokens, and `perimeters` costs less than fieldCount. Criteria 1 and 2 and the three tasks are ticked; criterion 3 is left unticked as written, met in its replaced form. Module tests 36 pass, lint, build, `checks` pass. No lines for index.ts, CHANGELOG or dependencies beyond the earlier entry.

Review (sp8-reviewer-22, 2026-10-26 08:30): PASS

Re-review of the PRF-71-fix round against sp8-reviewer-18 findings 1-4.
1. Fixed: `search.ts:74-77` keeps a `Set<number>` per whole name and adds in place. Reviewer probe rerun (every field sharing one label and one native key): 8000 fields build 82 ms, 16000 fields 163 ms (was 1.4 s / 5.2 s), search cost 56 003 / 112 003, linear.
2. Fixed: one 1000 bonus per field; `wall_loops` top score 1060 (was 3040).
3. Fixed: the tooltip test reads MAX_RESULTS hits, requires a tooltip-only hit and no name hit after it. Mutation in scratch (TOOLTIP_WEIGHT 100) fails it. Further mutants: per-add array copy fails the scaling test, array push without dedup fails the bonus test; the unmutated copy passes all 7.
4. Criteria: 1 [x], 2 [x], 3 replaced per rule 5 by the `lastCost` operation bound (`test/form-model-search.test.ts` operation-bound and scaling tests): accepted, ticked here as met in its replaced form. The `Array.prototype[Symbol.iterator]` stub is restored in `finally`, wraps only the synchronous build, and counts elements (no clock); 15 consecutive runs of the file all passed.
Ran: module `pnpm test` 36 pass, `pnpm lint`, `pnpm build`, `node scripts/run.mjs checks` exit 0. Layers fine (application only, profile-api by package name); the only edit to an existing file is the `form-model/index.ts` sub-barrel, not the module `src/index.ts`.
