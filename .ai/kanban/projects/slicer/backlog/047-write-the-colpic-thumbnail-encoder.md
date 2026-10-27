---
id: 47
title: Write the ColPic thumbnail encoder
type: feature
priority: P1
effort: M
model: opus
area: [engine]
story: US11
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [44, 45]
created: 2026-10-25
---

Encodes the ColPic format used by some Creality-class printers. May be ported from OrcaSlicer (AGPL-3.0, D2) with provenance if the text spec is not enough.

**Code:** `vsslicer/modules/slicer/output/src/domain/...` (module: `slicer-output`, layer: `domain`)

## Acceptance criteria

- [ ] Output is byte-identical to the reference fixture from Orca for the same image
- [ ] A decode test round-trips
- [ ] Any ported file has the notice and provenance line

## Tasks

- [ ] Read the format
- [ ] Implement
- [ ] Compare with the reference

## Progress

Not started.
