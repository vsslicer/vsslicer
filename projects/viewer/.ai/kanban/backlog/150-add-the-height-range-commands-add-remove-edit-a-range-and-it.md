---
id: 150
title: "Add the height-range commands: add, remove, edit a range and its overrides"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US48
milestone: "VSS:M4"
depends_on: [149]
created: 2026-10-25
---

Adds, removes and edits height ranges of an object and their overrides; refuses overlapping ranges and ranges outside the object height.

**Code:** `vsslicer/modules/project-extension/src/application/commands/ranges/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Overlap and out-of-height ranges are refused with the reason
- [ ] Range overrides use the same scope check at `height_range` level
- [ ] Each command inverts exactly
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Overlap rule
- [ ] Tests

## Progress

Not started.
