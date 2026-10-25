---
id: 172
title: "Add the create, duplicate and delete plate commands"
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US49
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [171, 102, 103, 170]
created: 2026-10-25
---

Create appends a plate; duplicate copies instances with new ids; delete removes the plate and moves nothing (its instances are deleted and restored on undo). The limit is 36 plates.

**Code:** `vsslicer/modules/project-extension/src/application/commands/plates/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Create at 36 plates is refused with a named error
- [ ] Duplicate of a plate copies its settings and instances
- [ ] Delete then undo restores membership and order
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Limit
- [ ] Tests

## Progress

Not started.
