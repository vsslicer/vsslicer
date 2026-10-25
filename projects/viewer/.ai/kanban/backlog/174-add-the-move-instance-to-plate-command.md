---
id: 174
title: Add the move-instance-to-plate command
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US50
milestone: "VSS:M4"
depends_on: [173, 140]
created: 2026-10-25
---

Moves an instance to another plate; refuses a locked source or target.

**Code:** `vsslicer/modules/project-extension/src/application/commands/plates/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] The instance is on exactly one plate before and after, and undo restores it
- [ ] A locked source or target refuses the move
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Tests

## Progress

Not started.
