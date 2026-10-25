---
id: 274
title: Write the TimeLapse step for Cura output
type: feature
priority: P2
effort: M
model: sonnet
area: [postprocess]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP28"
created: 2026-10-25
---

Inserts the timelapse commands at each layer change of Cura G-code (trigger command, optional park head, pause delay, feed rate), following the behaviour of Cura's own TimeLapse script (AGPL-3.0/LGPL provenance noted).

**Code:** `vsslicer/modules/slicer-extension/src/domain/...` (module: `slicer-extension`, layer: `domain`)

## Acceptance criteria

- [ ] The inserted block appears at every layer change from the second layer on, and only there (parser test on a recorded Cura output)
- [ ] Park position and delay options change the block as documented
- [ ] The step refuses output without layer markers

## Tasks

- [ ] Read Cura's script
- [ ] Write the transform
- [ ] Tests

## Progress

Not started.
