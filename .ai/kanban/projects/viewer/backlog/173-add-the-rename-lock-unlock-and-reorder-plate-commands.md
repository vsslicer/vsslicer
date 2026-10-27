---
id: 173
title: "Add the rename, lock, unlock and reorder plate commands"
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US49
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [172]
created: 2026-10-25
---

Rename, lock, unlock and reorder; a locked plate refuses every other command.

**Code:** `vsslicer/modules/apps/project/src/application/commands/plates/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Every command except unlock on a locked plate is refused with the reason
- [ ] Reorder keeps instance membership
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Lock guard
- [ ] Tests

## Progress

Not started.
