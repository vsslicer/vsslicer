---
id: 101
title: "Make the ProjectModel editable: execute, undo, redo and change events"
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [100]
created: 2026-10-25
---

`ProjectModel.execute(command)` applies a command, pushes a step, and raises change events; `undo` and `redo` move along the history. State changes only through commands.

**Code:** `vsslicer/modules/apps/project/src/application/projectModel.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Execute then undo restores the model to equality with the start; redo returns to the end
- [ ] Change events carry the command and the affected ids
- [ ] A new command after an undo drops the redo tail
- [ ] No VS Code import

## Tasks

- [ ] History stack
- [ ] Events
- [ ] Tests

## Progress

Not started.
