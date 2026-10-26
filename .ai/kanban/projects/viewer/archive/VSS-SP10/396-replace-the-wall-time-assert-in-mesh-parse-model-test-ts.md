---
id: 396
title: Replace the wall-time assert in mesh parse-model.test.ts
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 4b of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Plan (rule 26, written before the change):
- The only wall-time assert in mesh/test is `parse-model.test.ts` "one endless line, fed in chunks, is refused fast" (grep `performance.now|Date.now|hrtime|toBeLessThan` over mesh/test found just that one).
- Replacement: a counting chunk iterable; the test asserts chunks consumed before the `MalformedMeshError` is <= 32 (1 MiB line cap / 64 KiB chunks = 17). Without the cap all 200 chunks are consumed (and joining is quadratic).
- Hang guard: the same test carries a 30 s vitest timeout.


Done: `mesh/test/parse-model.test.ts` now counts chunks consumed via a generator (200 offered, 64 KiB each, 1 MiB line cap) and asserts <= 32 (actual 17); the test carries a 30 s timeout as hang guard. The wall-time assert is gone; grep over mesh/test finds no other `performance.now|Date.now|hrtime`.
Probe: `MAX_LINE_CHARS` check in `text.ts` disabled -> the test fails (all 200 chunks consumed); restored.
Bounds: the 1 MiB line cap is unchanged and is what the hostile test (endless line) exercises.
Verify: mesh `pnpm lint`, `pnpm build`, `pnpm test` (78 passed, 1 skipped), `node scripts/run.mjs checks` pass.

**Review passed (sp10-rev-vwr-396-397)**
- Ran in `vsslicer/modules/mesh`: `pnpm install`, `pnpm lint` (eslint, prettier, tsc clean), `pnpm build`, `pnpm test` (11 files, 78 passed, 1 skipped); `node scripts/run.mjs checks` exit 0.
- Rule 26: the one test (`test/parse-model.test.ts` "one endless line, fed in chunks...") replaces `performance.now() < 2000` with a counting generator (200 x 64 KiB offered, asserts <= 32 consumed, actual 17); the hang guard is the test's own 30 s vitest timeout. Grep `performance.now|Date.now|hrtime` over `mesh/test`: no hits left; the remaining `toBeLessThan*` hits are size/index asserts, not time.
- Probe: line cap check in `src/adapters/text.ts:17` raised to 4x -> test fails "expected 65 to be <= 32"; the card's own probe (cap disabled) consumes all 200. Restored. Quadratic joining is bounded by the cap (each join is at most 1 MiB + one chunk), so an unbounded or loosened cap is exactly what the count catches.
