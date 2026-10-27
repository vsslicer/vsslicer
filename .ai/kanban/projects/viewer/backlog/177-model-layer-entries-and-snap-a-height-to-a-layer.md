---
id: 177
title: Model layer entries and snap a height to a layer
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US53
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [171]
created: 2026-10-25
---

Entry types (pause, colour change, tool change, custom) with their parameters, ordering by height, and snapping a height to the nearest layer boundary given first-layer and layer heights.

**Code:** `vsslicer/modules/apps/project/src/domain/plates/layers.ts` (module: `project-extension`, layer: `domain`)

## Acceptance criteria

- [ ] Snap of 0.37 mm with 0.2 mm layers and 0.2 first layer gives 0.4 and reports it
- [ ] Two entries on one layer of the same kind are merged or refused (rule written in the test)
- [ ] Entries sort by height

## Tasks

- [ ] Types
- [ ] Snap
- [ ] Tests

## Progress

Not started.
