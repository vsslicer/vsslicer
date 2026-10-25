---
id: 143
title: Add the merge objects command
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [135, 134, 137]
created: 2026-10-25
---

Merges selected objects into one object with parts, keeping each part's name and transform.

**Code:** `vsslicer/modules/project-extension/src/application/commands/split/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Merge then split gives back the triangle sets
- [ ] Undo restores all objects and their plate membership
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Tests

## Progress

Not started.
