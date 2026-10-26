---
id: 93
title: Keep G4 time in files with no moves
type: bug
priority: P2
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-planner (domain). Finding 7 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] A file with only G4 dwell gets a total equal to the dwell in all five planners (harness test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Done. A G4 in a file with no moves now counts in totalTime for klipper, marlin, reprapfirmware, prusa-buddy, constant-speed and bambu (wraps marlin). Test: all six give 30 for one 30 s G4.
Also: constant-speed ignored G4 entirely; it now applies G4 dwells before the move at their index and after the last move (same as marlin/rrf).
Verified: pnpm lint/test (84 passed)/build as for GCP-92.
Hunks: `vsslicer/modules/gcode-planner/src/domain/timing.ts` (`finish`: `this.time += this.lead`); `vsslicer/modules/gcode-planner/src/domain/klipper.ts` (end of plan: `else out.dwell(lead + added(moveCount))` when nothing is held); `vsslicer/modules/gcode-planner/src/domain/planner.ts` (constantSpeedPlanner: local `dwell` helper, called before each move and after the loop); `vsslicer/modules/gcode-planner/test/planner.test.ts` (imports, describe 'G4 in a file with no moves').
CHANGELOG: - Fixed: a G4 dwell in a file with no moves is counted in totalTime; the constant-speed planner now honours G4.

Fix round: constantSpeedPlanner now builds a Map<moveIndex, seconds> from the G4 markers once before the loop (src/domain/planner.ts, as marlin.ts:482-490); the 300k moves / 20k markers case now runs well under the 2 s guard in test/planner.test.ts ('constant-speed G4 lookup'). Verified: pnpm lint/test (94 passed, includes GCP-89 part C tests)/build green. Prior FAIL (O(moves x markers), 11.4 s) addressed. CHANGELOG unchanged.

Review (gcp93-rereview): PASS, constant-speed dwell lookup is a Map built once (planner.ts:52-58); own probe 300k moves: 0 markers 24 ms, 20k markers 32 ms (totalTime +20000 s exact); lint, 94 tests, build green; earlier G4 behaviour in all six planners unchanged.
