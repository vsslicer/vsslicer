---
id: 180
title: "Track plate state: valid, stale and sliced, with the artefacts in .vsslicer/sliced"
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US56
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [174, 122]
created: 2026-10-25
---

Marks a plate stale when its content changes after slicing, lists the artefacts in `.vsslicer/sliced/` per plate, and raises state events.

**Code:** `vsslicer/modules/apps/project/src/application/plateState.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Editing an object on a sliced plate marks that plate stale and no other
- [ ] A new artefact in `sliced/` marks the plate sliced and valid
- [ ] Events fire on each transition

## Tasks

- [ ] State machine
- [ ] Artefact scan through the folder store
- [ ] Tests

## Progress

Not started.
