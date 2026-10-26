---
id: 92
title: Validate KlipperOptions.checkpointInterval
type: bug
priority: P1
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-planner (domain). Finding 6 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] checkpointInterval must be a positive integer, else RangeError (test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Done. `createKlipperPlanner` throws RangeError unless `checkpointInterval` is undefined or `Number.isInteger(ci) && ci >= 1` (0, -1, 0.5, 1.5, NaN, Infinity all tested).
Verified in the module: pnpm install, lint (eslint, tsc ok; prettier flags CHANGELOG.md only, not edited by me), test (84 passed, 8 files), build ok.
Hunks: `vsslicer/modules/gcode-planner/src/domain/klipper.ts` (check beside the `resolution` check in createKlipperPlanner); `vsslicer/modules/gcode-planner/test/klipper.test.ts` (new describe 'createKlipperPlanner checkpointInterval').
CHANGELOG: - Fixed: `createKlipperPlanner` rejects a `checkpointInterval` that is not a positive integer (RangeError).

Review (gcp9293-review): PASS, diff read, lint/test (84)/build green, RangeError for 0,-1,0.5,1.5,NaN,Infinity; undefined and 1 accepted; matches audit fix.
