---
id: 144
title: "Add volumes: part, negative, modifier, enforcer and blocker from a primitive or a file"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US46
milestone: "VSS:M4"
depends_on: [135, 134, 53]
created: 2026-10-25
---

Adds a volume of a chosen kind to an object from a generated primitive or a mesh file, with a transform inside the object.

**Code:** `vsslicer/modules/project-extension/src/application/commands/volumes/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Each of the five kinds can be added, moved and removed
- [ ] Volume kinds are kept in the model as the kinds the writer maps to the Orca subtypes
- [ ] A file volume that fails to parse gives a typed error
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Primitive and file sources
- [ ] Tests

## Progress

Not started.
