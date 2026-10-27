---
id: 150
title: "Generate the flow ratio tests: YOLO and two-pass"
type: feature
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US41
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [147]
created: 2026-10-25
---

Two flow tests: YOLO (one pass, fine steps) and two-pass (coarse then fine around the first pick); the sweep uses `M221` or the firmware's equivalent; target key `filament_flow_ratio`.

**Code:** `vsslicer/modules/core/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] Pass 2 centres on the pass 1 pick and its range is a unit-tested function of it
- [ ] The parser detects the flow factor per block for each firmware
- [ ] Bambu uses its supported command or the refusal

## Tasks

- [ ] Pass tables
- [ ] Models
- [ ] Plans
- [ ] Tests

## Progress

Not started.
