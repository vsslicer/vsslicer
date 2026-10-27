---
id: 175
title: "Add the Cura table entries: hooks and timelapse"
type: feature
priority: P2
effort: S
model: sonnet
area: [cura]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [174, 92]
created: 2026-10-25
---

Marks role-change hooks and timelapse keys `unsupported` for Cura (no engine key) with the reason, so the TimeLapse built-in step (US63) and the warnings follow.

**Code:** `vsslicer/modules/slicer/cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes
- [ ] Both entries say that Cura has no engine key and name the built-in step for timelapse
- [ ] The warning of US27 appears for an imported profile that sets them

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
