---
id: 98
title: Run the effect tests against the pinned CuraEngine and commit the report
type: chore
priority: P1
effort: M
model: sonnet
area: [cura, engine]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP25"
depends_on: [97, 92, 77]
created: 2026-10-25
---

Same effect tests as Orca, run through the Cura resolution path.

**Code:** `vsslicer/modules/slicer/cura/` (module: `slicer-cura`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Every row's effect test passes for Cura where the entry is supported (scarf via `scarf_joint_seam_length`, fuzzy skin, tree supports, patterns)
- [ ] Committed report equals the regenerated one; a version bump without regenerating fails CI
- [ ] Entries marked unsupported are skipped with their entries asserted

## Tasks

- [ ] Adapter callback
- [ ] Run tests
- [ ] Commit report

## Progress

Not started.
