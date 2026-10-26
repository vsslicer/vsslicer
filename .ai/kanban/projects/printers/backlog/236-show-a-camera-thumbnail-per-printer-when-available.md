---
id: 236
title: Show a camera thumbnail per printer when available
type: feature
priority: P2
effort: S
model: sonnet
area: [fleet]
story: US59
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [233, 304]
created: 2026-10-25
---

Fleet view shows a camera frame for printers whose camera is available; nothing when not.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

UNRESOLVED needs camera: a released snapshot/thumbnail API in `camera-api` or `camera-extension` (E38); the planner wires the camera release card.

## Acceptance criteria

- [ ] No thumbnail and no error when no camera is registered

## Tasks

- [ ] Hook
- [ ] Test

## Progress

Not started.
