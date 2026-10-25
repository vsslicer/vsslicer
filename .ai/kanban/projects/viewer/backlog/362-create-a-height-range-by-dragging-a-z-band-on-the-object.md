---
id: 362
title: Create a height range by dragging a Z band on the object
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, editor]
story: US93
milestone: "VSS:M5"
sprint: "VSS:SP33"
depends_on: [150, 153, 177, 159]
created: 2026-10-25
---

Dragging along the object's Z axis in range mode creates a layer-range entry with the existing add-range command, snapped to layer boundaries, and opens the override form for it.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/ranges/drag.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A drag creates a range from z0 to z1 snapped to layers, as one undo step
- [ ] A drag that overlaps an existing range or leaves the object is refused with the reason
- [ ] The new range shows in the height-range table

## Tasks

- [ ] Range mode
- [ ] Snap
- [ ] Create and open form
- [ ] Harness test

## Progress

Not started.
