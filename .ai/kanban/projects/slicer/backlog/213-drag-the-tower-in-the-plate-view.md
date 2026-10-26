---
id: 213
title: Drag the tower in the plate view
type: feature
priority: P2
effort: M
model: sonnet
area: [multimaterial]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [208, VWR-201]
created: 2026-10-25
---

Shows the tower rectangle in the plate view and updates its position when dragged, through the `vsslicer.project` overlay API.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The rectangle shows at the placed position, and dragging updates the numeric fields and the setting
- [ ] A drag outside the bed is clamped with the reason from MM6
- [ ] With the overlay API absent, the panel falls back to numeric placement without an error

## Tasks

- [ ] Overlay client
- [ ] Drag handling
- [ ] Fallback
- [ ] Tests

## Progress

Not started.
