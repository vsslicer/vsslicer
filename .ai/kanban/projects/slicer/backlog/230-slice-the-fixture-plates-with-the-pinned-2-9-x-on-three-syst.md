---
id: 230
title: Slice the fixture plates with the pinned 2.9.x on three systems
type: chore
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US70
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [228, 229, 1, GCP-3, GCP-4]
created: 2026-10-25
---

Slices the shared fixture plates with the Prusa profile tuples and checks layer count and roles as in I5.

**Code:** `vsslicer/modules/slicer/prusa/` (module: `slicer-prusa`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Layer count and role presence equal `expected.json` for every fixture on Linux, macOS and Windows runners
- [ ] The result is parsed by `@vsslicer/gcode-parser`
- [ ] Fixtures only (D5: no Prusa hardware)

## Tasks

- [ ] Fixture loop
- [ ] Assertions
- [ ] Three-OS CI

## Progress

Not started.
