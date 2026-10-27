---
id: 164
title: Test that each structural edit round-trips through save and the Orca CLI counts
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [163, 142, 143, 140, 139, 141, 138]
created: 2026-10-25
---

For move, rotate, scale, mirror, instances, units, split and merge: apply, save, reopen, slice, and compare object, part and instance counts and positions.

**Code:** `vsslicer/modules/apps/project/test/integration/structure/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Counts and positions after reopen equal the model
- [ ] The sliced output has the expected object and part counts
- [ ] Runs in CI on Linux

## Tasks

- [ ] Scenarios
- [ ] Slice and compare

## Progress

Not started.
