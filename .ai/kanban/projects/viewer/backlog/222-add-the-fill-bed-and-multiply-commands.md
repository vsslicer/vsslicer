---
id: 222
title: Add the fill bed and multiply commands
type: feature
priority: P2
effort: M
model: sonnet
area: [arrange]
story: US60
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [221]
created: 2026-10-25
---

Adds copies as instances through the instance commands, as one undoable step.

**Code:** `vsslicer/modules/project-extension/src/application/commands/arrange/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Fill adds the fixture count of instances and undo removes them all
- [ ] Multiply adds n or reports how many fit
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Tests

## Progress

Not started.
