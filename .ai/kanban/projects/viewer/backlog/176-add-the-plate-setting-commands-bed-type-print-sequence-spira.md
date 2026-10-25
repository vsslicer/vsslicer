---
id: 176
title: "Add the plate setting commands: bed type, print sequence, spiral mode, filament order and maps"
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [173]
created: 2026-10-25
---

One command per setting group with validation (closed enums, filament ids present in the project).

**Code:** `vsslicer/modules/project-extension/src/application/commands/plates/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Each setting changes and undoes
- [ ] An unknown filament id in a map is refused
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Validation
- [ ] Tests

## Progress

Not started.
