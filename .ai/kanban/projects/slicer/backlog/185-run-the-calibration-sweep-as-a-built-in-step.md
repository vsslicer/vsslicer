---
id: 185
title: Run the calibration sweep as a built-in step
type: feature
priority: P2
effort: S
model: sonnet
area: [tasks, calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [184, 147]
created: 2026-10-25
---

Registers `applySweep` from `@vsslicer/calibration` as a pipeline step that runs only for calibration jobs.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] A calibration job on the fake engine shows the sweep commands in the committed G-code (parsed); a normal job is untouched
- [ ] A sweep failure fails the slice naming the step
- [ ] Package.json range is `@vsslicer/calibration` `^0.1.0`

## Tasks

- [ ] Step adapter
- [ ] Job flag
- [ ] Tests

## Progress

Not started.
