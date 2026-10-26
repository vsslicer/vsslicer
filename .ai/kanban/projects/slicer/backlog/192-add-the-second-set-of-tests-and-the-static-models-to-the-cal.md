---
id: 192
title: Add the second set of tests and the static models to the Calibration command
type: feature
priority: P2
effort: S
model: sonnet
area: [tasks, calibration]
story: US42
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [187, 158]
created: 2026-10-25
---

Raises the `@vsslicer/calibration` range to `^0.2.0`; the command lists PA, flow, input shaping, cornering and the static models from the registry.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The quick pick shows every registered entry grouped by kind
- [ ] A static model slices without a sweep and without a pick step
- [ ] Refusals of XT5 cover the new entries

## Tasks

- [ ] Raise the range
- [ ] Group listing
- [ ] Tests

## Progress

Not started.
