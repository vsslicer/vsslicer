---
id: 140
title: "Add the instance add, remove and set-count commands"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [137]
created: 2026-10-25
---

Adds or removes instances of an object, offsetting new ones so they do not overlap, on the object's plate.

**Code:** `vsslicer/modules/apps/project/src/application/commands/instances/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Set count from 1 to 4 and back is reversible; every instance stays on exactly one plate
- [ ] Removing the last instance is refused (delete the object instead)
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Offset rule
- [ ] Tests

## Progress

Not started.
