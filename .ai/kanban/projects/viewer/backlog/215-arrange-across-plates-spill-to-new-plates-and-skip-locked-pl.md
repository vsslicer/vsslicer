---
id: 215
title: "Arrange across plates: spill to new plates and skip locked plates"
type: feature
priority: P1
effort: M
model: opus
area: [arrange]
story: US59
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [212]
created: 2026-10-25
---

Fills plates in order, starts a new plate when allowed, never touches a plate flagged locked, and respects the 36 plate limit passed in options. Ported from `OrcaSlicer@09aa0114:src/libslic3r/Arrange.cpp` and `ModelArrange.cpp` (AGPL-3.0) on `deps_src/libnest2d` (LGPL-3.0) (D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/arrange/src/application/multiPlate.ts` (module: `arrange`, layer: `application`)

## Acceptance criteria

- [ ] A 50-object fixture spills to the expected number of plates
- [ ] Items on locked plates keep their poses and are obstacles of nothing
- [ ] With new plates not allowed, the rest is reported unplaced by name
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Plate loop
- [ ] Locked rule
- [ ] Limit
- [ ] Tests

## Progress

Not started.
