---
id: 359
title: Add the brush adjustment command
type: feature
priority: P2
effort: S
model: sonnet
area: [editor]
story: US92
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [356, 357, 355]
created: 2026-10-25
---

One brush drag is one command holding the before and after profile of the changed samples.

**Code:** `vsslicer/modules/apps/project/src/application/commands/layerheight/brush.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Execute then undo restores the profile exactly
- [ ] A drag that clamps at the limit still inverts exactly
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
