---
id: 114
title: "Fixture: a klipper_estimator-style script rewrites the estimate and the MD5 stays right"
type: chore
priority: P1
effort: M
model: sonnet
area: [postprocess]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP24"
depends_on: [110, 111]
created: 2026-10-25
---

A fixture script that rewrites the time estimate, run through the pipeline; the assembled archive is checked.

**Code:** `vsslicer/modules/apps/slicer/` (module: `slicer-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The final `.gcode.3mf` contains the processed G-code and its MD5 equals the processed bytes
- [ ] The reader (`@vsslicer/gcode`) reports the rewritten estimate
- [ ] A script failure leaves no output in the sliced folder

## Tasks

- [ ] Fixture script
- [ ] Pipeline test
- [ ] Reader check

## Progress

Not started.
