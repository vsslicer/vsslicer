---
id: 208
title: Lower the Orca inherited-keys cap to the measured need
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 8 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Lowered `MAX_INHERITED_KEYS` 4_000_000 -> 1_000_000 in profiles-prusa `src/adapters/import/import.ts` (pinned bundle needs 476 151, 2x headroom). Existing hostile test (`inherited keys are budgeted over the whole call`) sizes itself from the constant and still passes at 1M. New test pins the constant to [2x bundle, 1M]; no wall time.
Mutation probe: restored 4_000_000 -> new test fails; restored fix -> passes.
Verify: vitest 320 passed (13 files), build ok, `checks` ok. `pnpm lint` fails on one error NOT mine: test/tuples/tuples.test.ts:76 unused `_` (another card's file).
Release lines: CHANGELOG: "Lower the inherited-keys cap to 1,000,000 (PRF-208)". No export changes.

**Review passed (sp11-rev-prf-208)**

- Diff: `MAX_INHERITED_KEYS` 4_000_000 -> 1_000_000 (`src/adapters/import/import.ts:30`), plus one test (`test/adapters/import.test.ts:494`). This matches SP10 audit finding 8 exactly. Adapters layer only, no imports added, no export changes. (The card title says "Orca", but the audit and the code are profiles-prusa.)
- Ran in profiles-prusa: `pnpm install` ok, `pnpm build` ok, `pnpm test` 320/320 passed on two reruns. The first run had 1 failure, the golden PrusaResearch test, which passes alone and on reruns: load flake from parallel agents, not this card. `node scripts/run.mjs checks` ok. `pnpm lint` fails only on `test/tuples/tuples.test.ts:76` (unused `_`), which is PRF-42's file, not this card's.
- Real bundle still fits: the golden test (`import.test.ts:81-97`) imports pinned PrusaResearch.ini and asserts `codes(r)` is empty, so 1M does not cut the real bundle.
- Mutation probes (restored after, diff checked):
  - cap back to 4_000_000: the new test fails.
  - cap at 900_000 (below 2x the need): the new test fails.
  - budget `max: Infinity` (`import.ts:321`): the hostile test `inherited keys are budgeted over the whole call (1000000)` fails. So the bound is enforced at the new value, and the hostile test sizes itself from the constant.
- No wall-time asserts. CHANGELOG not edited; the release line in Progress is left for the coordinator.
