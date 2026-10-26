---
id: 91
title: Honour M204 S after M204 P in the RRF planner
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-planner (domain). Finding 4 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] A later M204 S changes print and travel accel in the RRF planner as RepRapFirmware does (cite source; test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Done. Verified in vsslicer/modules/gcode-planner: pnpm install, pnpm lint (eslint, prettier, tsc), pnpm test (8 files, 82 tests), pnpm build all pass.

Hunks of this card (same file as GCP-90, which owns MIN_ACCEL and the Math.max clamp): the `STATE_CHANGE_STRIDE, StateChangeOffset` import, the `m204`/`foldAccel` block that walks parsed.stateChanges in file order (S sets print and travel, P print, T travel, latest wins; GCodes5.cpp:344-354), the `accelCap` body reading `m204.print/travel` (override still wins, else flavour default), and the `foldAccel()` call at the top of the move loop. gcode-parser untouched. Test: `lets a later M204 S override an earlier P or T ...` in test/rrf.test.ts (P then S, T then S, S then P).
Files: vsslicer/modules/gcode-planner/src/domain/rrf-planner.ts, vsslicer/modules/gcode-planner/test/rrf.test.ts.
CHANGELOG: - Fixed: the RRF planner honours the latest of M204 S, P and T, so M204 S after M204 P changes print and travel acceleration.
Review (gcode9091-review): PASS, M204 S/P/T order and the 0.1 floor match GCodes5.cpp:344-354 and Configuration.h:56; module tests 84 pass, build and tsc pass; differential vs HEAD planner over 300 random single-kind-M204 files with and without override gives identical totals (default and override unchanged); lint only fails on other lanes' klipper.ts and CHANGELOG formatting.
