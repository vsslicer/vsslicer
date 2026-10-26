---
id: 88
title: Free reported Klipper moves before the next G4 or M400
type: bug
priority: P0
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-planner (domain). Finding 1 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] A 3M-move Klipper file with no G4/M400 plans within the preview worker's memory cap; memory held is bounded by the lookahead window (test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Done. `commit` in klipper.ts now splices the reported prefix off `order` once `head > 4096` (checkpoints still store `order.slice(head)`, so replay is unchanged). Test in trapezoids.test.ts (20k moves, no G4/M400): asserts the prefix splice happens (fails with the fix disabled) and trapezoidsFor matches the full pass. The test checks the drop directly, not a 3M-move heap run.
Verified: pnpm lint, test (80 passed), build all pass.
CHANGELOG: - Fixed: Klipper planner no longer holds every reported move until the next G4/M400 (memory bounded on long files).
Files: vsslicer/modules/gcode-planner/src/domain/klipper.ts, test/trapezoids.test.ts.

- Review (gcp88-review): PASS. Lint, 80 tests and build pass. Heap probe (1M-move Klipper zigzag, no G4/M400, built dist): extra peak heap 7.1 MB (2.0 MB with M400 every 1000 moves); completes under --max-old-space-size=120; control with the splice disabled 444.6 MB and OOM at 120 MB. Memory criterion met.
