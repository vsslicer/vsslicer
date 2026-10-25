---
id: 335
title: Add the boolean command
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, mesh]
story: US86
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [101, 103, 135, 327]
created: 2026-10-25
---

Union, difference or intersection of selected objects or parts as one undoable command: the operands are replaced by the result object or part. The log holds the operands and the operation; the result is recomputed on replay with the pinned kernel.

**Code:** `vsslicer/modules/project-extension/src/application/commands/boolean/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Union, difference and intersection on fixtures give one object whose mesh is closed manifold
- [ ] Undo restores the original meshes and transforms exactly; redo reproduces the same triangles
- [ ] Operands that fail the manifold check refuse the command with the kernel's message and change nothing
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Refusal path
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
