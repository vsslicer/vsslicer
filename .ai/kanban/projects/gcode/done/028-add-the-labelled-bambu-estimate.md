---
id: 28
title: Add the labelled Bambu estimate
type: feature
priority: P1
effort: M
model: sonnet
area: [planner]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-28-worker
depends_on: [24]
created: 2026-10-25
---

Closed firmware: Marlin model with profile jerk and accel and the file's M204/M205.

## Acceptance criteria

- [x] Bambu files use the Marlin planner and the result carries `estimate: true` (test)
- [x] M622/M623 conditional blocks are treated as executed and flagged
- [x] Limits source is recorded

## Tasks

- [x] Flavour routing
- [x] Flag plumbing
- [x] Tests

## Progress

Done. `bambuPlanner` wraps `marlinPlanner` and returns a `BambuTiming` (estimate true, planner `bambu`, `limitsSource` profile/default/mixed from the Marlin fields' sources, `conditionalBlocks` from M622/M623 markers, timed as executed; an unclosed M622 runs to file end). `isBambuFile` (slicer bambustudio or an M620-M623/M1002 marker) and `plannerFor` route Bambu/Klipper/Marlin; RRF falls back to Marlin until GCP-27.
Verified: `pnpm lint` (only a prettier warning in limits.ts, not mine), `pnpm test` (52 pass), `pnpm build`.
Unverified: the meaning of M622 J conditions (no public dictionary); Orca files for non-Bambu printers without those markers route to Marlin.
Files: vsslicer/modules/gcode-planner/src/domain/bambu.ts, test/bambu.test.ts, src/index.ts, CHANGELOG.md.
