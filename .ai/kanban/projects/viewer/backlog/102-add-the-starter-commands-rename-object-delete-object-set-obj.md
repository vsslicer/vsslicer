---
id: 102
title: "Add the starter commands: rename object, delete object, set object transform"
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [101]
created: 2026-10-25
---

Three small commands that prove the core: rename an object, delete an object, set an object transform matrix.

**Code:** `vsslicer/modules/apps/project/src/application/commands/starter/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Each command inverts exactly; delete then undo restores the object at its index with its plate membership
- [ ] Each command is registered with the command generator of the property test
- [ ] A transform that is not finite is rejected with a named error

## Tasks

- [ ] Three commands
- [ ] Registration
- [ ] Tests

## Progress

Not started.
