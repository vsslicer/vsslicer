---
id: 189
title: Pick the best block in a quick pick and jump the preview to it
type: feature
priority: P2
effort: M
model: sonnet
area: [tasks, calibration]
story: US46
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [187, 147, GCP-50, GCP-52]
created: 2026-10-25
---

After slicing, lists the plan's blocks with value and the layers they received (`CAL12`) and moves the preview to the picked block's layers through the preview exports.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Picking block N moves the preview to the first layer of that block (stub of the preview API in the test)
- [ ] Escape leaves everything as it was
- [ ] The list shows value, unit and layer range for each block

## Tasks

- [ ] Block list
- [ ] Preview jump
- [ ] Tests

## Progress

Not started.
