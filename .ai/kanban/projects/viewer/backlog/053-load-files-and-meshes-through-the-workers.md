---
id: 53
title: Load files and meshes through the workers
type: feature
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [52, 74, 75]
created: 2026-10-25
---

Use case that opens a file: reads the `Project` via the 3MF worker for 3MF, parses STL and OBJ meshes via the mesh pool, and reports progress and typed errors.

**Code:** `vsslicer/modules/project-extension/src/application/openFile.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] STL, OBJ and 3MF fixtures load to a ProjectModel with meshes
- [ ] Errors from E8 and E9 surface as typed results
- [ ] Cancellation stops work

## Tasks

- [ ] Use case
- [ ] Progress and cancel
- [ ] Tests

## Progress

Not started.
