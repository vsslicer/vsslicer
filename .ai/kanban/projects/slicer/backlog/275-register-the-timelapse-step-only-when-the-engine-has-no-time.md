---
id: 275
title: Register the TimeLapse step only when the engine has no timelapse key
type: feature
priority: P2
effort: S
model: sonnet
area: [postprocess]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [274, 184, 183, 106]
created: 2026-10-25
---

Adds the step to the pipeline for engines whose `time_lapse_gcode` entry is `unsupported`, and never for those that pass the key through.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] With the Cura table (unsupported) the step runs for a profile that asks for a timelapse; with Orca (supported) it does not
- [ ] A job without a timelapse request is untouched
- [ ] The report says which path produced the timelapse

## Tasks

- [ ] Table lookup
- [ ] Step registration
- [ ] Tests

## Progress

Not started.
