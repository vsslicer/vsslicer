---
id: 187
title: Move objects between plates by drag in the tree and the 3D view
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US51
milestone: "VSS:M4"
depends_on: [186, 185]
created: 2026-10-25
---

Drag an object onto a plate in the tree, or drag in 3D onto another plate's bed, to send the move-instance command.

**Code:** `vsslicer/modules/project-extension/src/presentation/tree/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Dragging onto a locked plate is refused with the reason
- [ ] The object keeps its position relative to the new bed

## Tasks

- [ ] Tree drag and drop
- [ ] 3D drop
- [ ] Test

## Progress

Not started.
