---
id: 149
title: "Add the set and clear override commands for objects, parts and modifiers"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [147, 148, 102, 103]
created: 2026-10-25
---

Sets or clears a key on an object, part or modifier after scope and value validation.

**Code:** `vsslicer/modules/apps/project/src/application/commands/overrides/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A refused key or invalid value leaves the model unchanged and returns the reason
- [ ] Set then undo restores the previous value or absence
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Registration
- [ ] Tests

## Progress

Not started.
