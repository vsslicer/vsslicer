---
id: 90
title: Clamp RRF M204 P0 and S0 so the RRF total is never NaN
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-planner (domain). Finding 3 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] M204 P0, T0 or S0 never makes the RRF total NaN; the accel clamps as RepRapFirmware does (cite source; test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Done. Verified in vsslicer/modules/gcode-planner: pnpm install, pnpm lint (eslint, prettier, tsc), pnpm test (8 files, 82 tests), pnpm build all pass. The new test fails with the clamp removed (checked) and passes with it.

Hunks of this card (both cards edit src/domain/rrf-planner.ts): the `MIN_ACCEL = 0.1` constant (cites RepRapFirmware@aebf629:src/Config/Configuration.h:56) and the `Math.max(v, MIN_ACCEL)` return in `accelCap`, covering override, M204 P/T and S values. Test: `clamps M204 P0, T0 and S0 ...` in test/rrf.test.ts.
Files: vsslicer/modules/gcode-planner/src/domain/rrf-planner.ts, vsslicer/modules/gcode-planner/test/rrf.test.ts.
CHANGELOG: - Fixed: the RRF planner clamps M204 P/T/S to 0.1 mm/s^2 as RepRapFirmware does, so M204 P0 or S0 no longer makes the total NaN.
Review (gcode9091-review): PASS, M204 S/P/T order and the 0.1 floor match GCodes5.cpp:344-354 and Configuration.h:56; module tests 84 pass, build and tsc pass; differential vs HEAD planner over 300 random single-kind-M204 files with and without override gives identical totals (default and override unchanged); lint only fails on other lanes' klipper.ts and CHANGELOG formatting.
