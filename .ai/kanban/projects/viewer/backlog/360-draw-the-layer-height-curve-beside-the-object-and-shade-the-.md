---
id: 360
title: Draw the layer-height curve beside the object and shade the bands on it
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, editor]
story: US92
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [356, 55]
created: 2026-10-25
---

A curve of layer height against Z beside the selected object, with the same Z axis as the object, and bands on the object shaded by layer height.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/layerheight/curve.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The curve of the fixture profile matches its samples (snapshot) and follows the object's Z scale
- [ ] The bands show faster (taller) layers in a lighter tone and finer layers darker, with a legend
- [ ] Selecting another object swaps the curve

## Tasks

- [ ] Curve view
- [ ] Band shading
- [ ] Snapshots

## Progress

Not started.
