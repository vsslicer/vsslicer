---
id: 361
title: "Add the brush, adaptive quality, smooth radius and reset controls"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, editor]
story: US92
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [360, 358, 359]
created: 2026-10-25
---

The editor panel: a brush with radius and strength on the curve, an adaptive button with a quality slider, a smooth button with a radius, and Reset. Each action is one undo step.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/layerheight/controls.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A brush drag raises the curve under the pointer; adaptive and smooth reproduce the library result; reset clears
- [ ] Every control is disabled with the reason when the file is read-only or the plate is locked
- [ ] Tested in the webview harness

## Tasks

- [ ] Brush
- [ ] Adaptive and smooth
- [ ] Reset
- [ ] Harness test

## Progress

Not started.
