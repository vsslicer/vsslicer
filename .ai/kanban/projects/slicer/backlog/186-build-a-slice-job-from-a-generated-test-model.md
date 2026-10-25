---
id: 186
title: Build a slice job from a generated test model
type: feature
priority: P2
effort: M
model: sonnet
area: [tasks, calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [107, VWR-91, 147, PRF-140]
created: 2026-10-25
---

Wraps the generated mesh in a temporary project with the user's printer, process and material profile (through the 3MF writer) and returns a `SliceJob` for the normal engine path.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] The temporary project opens in `readProject` with one object, the chosen profile tuple and the plate settings the plan asks for
- [ ] The temporary files live in the job's staging area and are removed on success and failure
- [ ] The job flows through `Slicer.slice` with the fake engine in a plain Node test

## Tasks

- [ ] Project builder
- [ ] Plan to plate settings
- [ ] Cleanup
- [ ] Tests

## Progress

Not started.
