---
id: 231
title: Compare `.bgcode` with the text G-code of the same slice
type: chore
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [230, 224, GCP-14]
created: 2026-10-25
---

Slices each fixture twice, with and without `binary_gcode`, parses both and compares.

**Code:** `vsslicer/modules/slicer/prusa/` (module: `slicer-prusa`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Parsed move sequences are equal for every fixture (oracle: the parser on both files)
- [ ] Thumbnail blocks are present in the `.bgcode` and match the requested sizes
- [ ] A mutation that drops one move from the `.bgcode` fails the test

## Tasks

- [ ] Double slice harness
- [ ] Move comparison
- [ ] Thumbnail check

## Progress

Not started.
