---
id: 119
title: Replace the wall-time assert in gcode-planner planner.test.ts
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 4a of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Rule 26 plan (written before editing). Only one wall-time assert existed: planner.test.ts L116-118 (`constant-speed G4 lookup`, 2000 ms).
- Replaced by an operation count: the markers array is wrapped in a Proxy counting element reads. Linear lookup reads each marker a bounded number of times (<= 4 per marker); a per-move scan reads moves x markers. Plus a size ratio: doubling moves and markers (3k/200 -> 6k/400) must at most 2.5x the reads (quadratic gives 4x).
- Hang guard: the same file's second test (300k moves, 20k dwells) with a 60 s timeout, asserting only totalTime > 20000, never elapsed time.

Done. File: vsslicer/modules/gcode-planner/test/planner.test.ts (no src change).
Mutation probe: temporarily made constantSpeedPlanner's dwell lookup scan parsed.markers per move (quadratic). The count test failed: "expected 600400 to be less than or equal to 800". Source restored (git diff of src is empty). The 300k hang guard under that mutation did not finish within minutes, which is what a guard is for.
Bounds: the hostile case is the 300k-move / 20k-dwell file, kept as the hang-guard test.
`grep -rn "performance.now|Date.now" test/` in gcode-planner: no matches. Remaining toBeLessThan uses compare computed values, none are timings.
Verify in gcode-planner: lint ok, build ok, test 10 files, 101 passed + 1 expected fail. `node scripts/run.mjs checks` fails only on modules/mesh/test/zz-probe-397.test.ts (another worker's scratch probe, missing SPDX header), not on this card.

**Review passed (sp10-rev-gcp-119)**
- Ran in gcode-planner: install, lint (eslint, prettier, tsc) ok, build ok, test 10 files: 101 passed, 1 expected fail. `node scripts/run.mjs checks` exit 0 (licence and fixtures clean at review time).
- Rule 26: the one wall-time assert (old L116-118) is replaced by an operation count (Proxy counting index reads of `parsed.markers`, at most 4 per marker) plus a size ratio (inputs doubled, reads at most 2.5x). The 300k/20k test is now only a hang guard with a 60 s timeout and no timing assert. No `performance.now`/`Date.now` left in `test/`. This matches the audit's fix ("count marker visits through a spy").
- Mutation probes (in a mktemp copy of the module; src not touched):
  - A, a per-move scan of `parsed.markers` (the bug the test exists for): the count test fails with "expected 600400 to be less than or equal to 800". Pass.
  - B, a quadratic loop over moves that reads no markers (`seen.push(i); seen.includes(-1)` on each move): both tests pass. The count test reads 200/400 markers as before, and the hang guard finishes in 20 s, under its 60 s limit. The old 2 s assert would have failed here.
  - C, markers copied once with `slice()` and the copy scanned on each move: both pass (count test reads only during the copy; hang guard 23 s).
  - Vitest does fail a synchronous test that returns after its timeout (a 4 s busy loop against a 1 s timeout fails with "Test timed out"). A planner that never returns is not caught by the timeout, though: probe A ran over 10 minutes until it was killed. So the guard is only as good as the outer CI timeout.
- Judgement: the card does what the audit's settled fix asks for, which is to count marker visits, and the audit accepted "keep the timeout as hang guard" for everything else. B and C show that the test no longer catches superlinear work outside the markers array, or 20 s quadratic runs. That is a residual for the coordinator to weigh, not a FAIL against this card's criterion. If it is wanted, a follow-up could put a size-ratio count on whole-planner work (for example a Proxy on `parsed` counting `moveCount`/`moves`/`stateChanges` gets, which grows with each cursor pass), or bring the guard's 300k input down to where 20 s of quadratic work exceeds the timeout.
