---
id: 139
title: Add the mirror command with winding correction
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [136, 137]
created: 2026-10-25
---

Mirrors an object on X, Y or Z by flipping its mesh and triangle winding so the stored transform keeps a positive determinant.

**Code:** `vsslicer/modules/apps/project/src/application/commands/transform/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] The mirrored fixture has outward normals (statistics agree) and a positive-determinant transform
- [ ] Mirror twice equals the original mesh; undo restores the original
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Winding fix
- [ ] Tests

## Progress

Not started.
