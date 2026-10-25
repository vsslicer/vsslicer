---
id: 246
title: "Add the Repair mesh command: one undoable step that restores the original triangles"
type: feature
priority: P1
effort: M
model: opus
area: [repair]
story: US65
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [244, 101, 103]
created: 2026-10-25
---

Replaces an object's mesh with the repaired one. The history keeps a reference to the original mesh; the log stores the options and replay recomputes the repair.

**Code:** `vsslicer/modules/project-extension/src/application/commands/repair/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Undo restores the original triangle set exactly (array equality)
- [ ] The unrepairable outcome changes nothing and returns the report
- [ ] Replay of the log gives an equal mesh
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Replay
- [ ] Tests

## Progress

Not started.
