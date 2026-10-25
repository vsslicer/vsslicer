---
id: 300
title: Hold paint layers in the ProjectModel and decode them on load
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [101, 245, 291, 296]
created: 2026-10-25
---

Decodes the paint channels of each volume into `PaintLayer`s through the mesh worker, remaps them through the repair index map, and converts PrusaSlicer 2.x layers (supports, seam, mmu segmentation) into the same model. Layers are held per volume and kind in the ProjectModel.

**Code:** `vsslicer/modules/project-extension/src/application/paint/load.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Orca, Bambu Studio and Prusa 2.9 fixtures load with layers equal to the codec's decode of their strings
- [ ] A repaired-on-load mesh keeps its paint on the same geometry
- [ ] A project without paint loads with no layers and no cost
- [ ] No VS Code import

## Tasks

- [ ] Layer store
- [ ] Decode through the worker
- [ ] Repair remap
- [ ] Prusa conversion
- [ ] Tests

## Progress

Not started.
