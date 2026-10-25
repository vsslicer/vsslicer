---
id: US97
title: "Auto-orient objects to the least overhang"
status: reviewed
epic: VSS:E55
---

As a user, I want each object turned to the orientation with the least overhang and the best bed contact, so that I need fewer supports.

## Acceptance criteria

- [ ] Overhang area after auto-orient is less than or equal to Orca's result on the same fixtures; chosen rotations match Orca's within its tie tolerance (§3 Auto-orient)
- [ ] Runs in a worker per object or per plate with progress and cancel
- [ ] One run is one undoable command
- [ ] The port from Orient.cpp carries notices and a `Ported from` line; `orient(objects)` is exported by the mesh library for the slicer's pre-slice option
- [ ] Verified only on fixtures (D5)

## Out of scope

- Orientation by print time or strength
