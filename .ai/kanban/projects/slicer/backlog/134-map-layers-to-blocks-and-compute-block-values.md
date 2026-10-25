---
id: 134
title: Map layers to blocks and compute block values
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US43
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [133]
created: 2026-10-25
---

Pure functions from a layer height, first layer height and block size to the block of a layer, and from a block range and step to its value, linear or stepped.

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] `blockForLayer(z)` places the layer at the first layer boundary correctly for 0.2 and 0.28 layer heights (regression: off-by-one as in Orca's `floor(z-0.4)` retraction formula)
- [ ] Block values for temperature, retraction and speed ranges equal a hand-computed table at both ends of the range
- [ ] A range that gives fewer than two blocks is refused with a message

## Tasks

- [ ] Block geometry
- [ ] Value ladder
- [ ] Regression test

## Progress

Not started.
