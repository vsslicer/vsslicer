---
id: 182
title: Run the P2 effect tests against the pinned CuraEngine and commit the report
type: chore
priority: P2
effort: M
model: sonnet
area: [cura, engine]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [174, 175, 176, 177, 179, 169, 98, 159, 160]
created: 2026-10-25
---

Wires the new effect tests to `CuraEngine` and regenerates the capability report for the pinned version.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Every new row's effect test passes for CuraEngine where the entry is supported, and unsupported entries are asserted
- [ ] The committed report equals the regenerated one
- [ ] Per-feature extruder assignment shows the assigned tool numbers per role

## Tasks

- [ ] Adapter callback
- [ ] Run all new effect tests
- [ ] Commit the report

## Progress

Not started.
