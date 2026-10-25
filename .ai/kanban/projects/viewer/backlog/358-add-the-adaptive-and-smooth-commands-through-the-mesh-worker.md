---
id: 358
title: Add the adaptive and smooth commands through the mesh worker
type: feature
priority: P2
effort: M
model: sonnet
area: [editor]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [356, 357, 355]
created: 2026-10-25
---

Adaptive (with the quality value) and smooth (with the radius) compute through the worker and then set the profile as one undoable command.

**Code:** `vsslicer/modules/project-extension/src/application/commands/layerheight/auto.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Adaptive on the fixtures sets the profile the mesh library returns for the same inputs
- [ ] Undo restores the previous profile; cancel changes nothing
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Worker call
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
