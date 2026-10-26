---
id: 9
title: "Apply overrides[] blocks with match first or all"
type: feature
priority: P0
effort: S
model: sonnet
area: [schema, evaluator]
story: US2
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [6, 8]
created: 2026-10-25
---

Selects the `overrides` blocks of an entity whose `when` holds for a context and merges them, like PrusaSlicer 3.0 `variants`.

**Code:** `vsslicer/modules/profile-api/src/domain/inheritance/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] `match: first` applies only the first true block; `match: all` applies every true block in order
- [x] The example `nozzle.diameter == 0.6 and nozzle.flow == 'high_flow'` applies only for that nozzle
- [x] An unparsable `when` skips nothing silently: the block is applied and a diagnostic is returned

## Tasks

- [x] Write applyOverrides
- [x] Write the tests

## Progress

Done. `applyOverrides(entity, context)` in `src/domain/inheritance/overrides.ts` (exported from the package index via `inheritance/index.ts`) returns `{entity, applied, diagnostics}`: entity `settings` with each matching block merged in order (via `merge`), `overrides` removed.
- Semantics: `match` is per block. A matching block with `match: 'first'` ends the scan; `'all'` or unset continues (unset = all, my choice; research gives no default).
- Condition faults: uses PRF-8 `evaluate`; a parse/eval fault yields compatible=true, so the block applies and `overrides[i]: <message>` is added to `diagnostics`.
- Call after `resolve` (inherited `overrides` arrays are replaced by the child's, as arrays do in merge).
- Verified: `pnpm lint && pnpm build && pnpm test` pass (new test/overrides.test.ts, 5 tests: high-flow example, all, first, unparsable when, no mutation).
- Not done: no lockfile change; src/index.ts untouched (already `export *` from inheritance/index.ts).

Changelog: Added `applyOverrides` to apply `overrides[]` blocks with `match: first | all`.
- Review passed (prf9-reviewer): build/lint/test green now (213 tests); unset match=all and applying a block on a failed when match the card and PRF-8 evaluate semantics (research documents no default; PrusaSlicer match_mode first_match/all_matches only); runs after resolve, input not mutated (shallow copy, merge builds new settings).
