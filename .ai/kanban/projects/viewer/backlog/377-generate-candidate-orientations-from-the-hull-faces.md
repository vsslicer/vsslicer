---
id: 377
title: Generate candidate orientations from the hull faces
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [376, 375]
created: 2026-10-25
---

Builds the set of candidate rotations: one per large hull face laid flat, plus the extra candidates Orca adds. Ported from the candidate generation of `OrcaSlicer@09aa0114:src/libslic3r/Orient.cpp` (AGPL-3.0, D2; overhang and bottom-area weights at `Orient.hpp:34,60`).

**Code:** `vsslicer/modules/core/mesh/src/application/orient/candidates.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Every fixture's Orca-chosen rotation is within the candidate set (up to symmetry)
- [ ] Duplicates within 1 degree are removed; the candidate count is bounded (limit tested)
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port candidates
- [ ] De-duplicate
- [ ] Tests

## Progress

Not started.
