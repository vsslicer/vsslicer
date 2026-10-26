---
id: 142
title: Map a picked layer or block to its value
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US46
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [134, 133, GCP-4]
created: 2026-10-25
---

Given a plan and the parsed layer table of the sliced file, lists blocks with the layers they actually received and maps a picked layer index or block to its value.

**Code:** `vsslicer/modules/calibration/src/application/...` (module: `calibration`, layer: `application`)

## Acceptance criteria

- [ ] The first and last block of each generator map to the first and last value
- [ ] A layer in a block gap (purge line, raft) maps to nothing and says why
- [ ] Engines that shift Z by a layer (raft, first-layer height) are covered by a test

## Tasks

- [ ] Block listing from parsed layers
- [ ] Pick mapping
- [ ] Tests

## Progress

Not started.
