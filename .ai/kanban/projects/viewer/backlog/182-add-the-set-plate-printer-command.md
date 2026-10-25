---
id: 182
title: Add the set-plate-printer command
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [173, 170, PRF-144]
created: 2026-10-25
---

Sets or clears the printer instance reference of a plate.

**Code:** `vsslicer/modules/project-extension/src/application/commands/plates/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Set then undo restores the previous reference
- [ ] An instance id not known to the store is refused
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Tests

## Progress

Not started.
