---
id: 137
title: Apply a sweep to G-code at layer changes
type: feature
priority: P2
effort: L
model: opus
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [134, 135, GCP-4, GCP-57]
created: 2026-10-25
---

Takes sliced text G-code and a plan and inserts the sweep command at the first move of each block, using `@vsslicer/gcode-parser` layers; follows the CAL2 decision on where the injection survives the engine's own commands.

**Code:** `vsslicer/modules/core/calibration/src/application/...` (module: `calibration`, layer: `application`)

## Acceptance criteria

- [ ] For a recorded Orca and Cura tower, the parser's state-change table shows the intended value from the first layer of each block to the last (oracle: the sweep definition)
- [ ] Inserted lines are marked with a comment so a second run is rejected rather than doubled
- [ ] A file without layer changes fails with a message and the input is untouched
- [ ] The output keeps every non-sweep line byte for byte (diff test)

## Tasks

- [ ] Layer lookup through the parser
- [ ] Insertion with markers
- [ ] Idempotence guard
- [ ] Tests on recorded outputs

## Progress

Not started.
