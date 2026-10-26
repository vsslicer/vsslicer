---
id: 211
title: Place items with rotation candidates and gravity to the centre or a corner
type: feature
priority: P1
effort: M
model: opus
area: [arrange]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [210]
created: 2026-10-25
---

Orders items, tries rotation candidates, picks the candidate that best satisfies the alignment (bed centre, corner) and records the pose. Ported from `OrcaSlicer@09aa0114:src/libslic3r/Arrange.cpp` and `ModelArrange.cpp` (AGPL-3.0) on `deps_src/libnest2d` (LGPL-3.0) (D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/arrange/src/application/place/` (module: `arrange`, layer: `application`)

## Acceptance criteria

- [ ] On the 10-object fixtures nothing overlaps and everything that fits is placed
- [ ] Rotation candidates are configurable; with none, objects keep their orientation
- [ ] Same input and options give the same result (deterministic)
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Ordering
- [ ] Rotation
- [ ] Alignment
- [ ] Tests

## Progress

Not started.
