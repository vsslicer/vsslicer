---
id: 46
title: Write the BTT TFT thumbnail encoder
type: feature
priority: P1
effort: M
model: opus
area: [engine]
story: US11
milestone: "VSS:M3"
depends_on: [44, 45]
created: 2026-10-25
---

Encodes the BTT TFT thumbnail comment format. Written from the spec text; if the spec is not enough it may be ported from OrcaSlicer (AGPL-3.0, D2) with notice and a `Ported from OrcaSlicer@09aa0114:<path>` line (path recorded at port time).

**Code:** `vsslicer/modules/slicer-output/src/domain/...` (module: `slicer-output`, layer: `domain`)

## Acceptance criteria

- [ ] Output is byte-identical to the reference fixture from Orca for the same image
- [ ] A decode test (own decoder in tests) round-trips
- [ ] Any ported file has the notice and provenance line (licence check passes)

## Tasks

- [ ] Read the format
- [ ] Implement
- [ ] Compare with the reference

## Progress

Not started.
