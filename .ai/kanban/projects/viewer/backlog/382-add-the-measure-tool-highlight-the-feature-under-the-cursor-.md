---
id: 382
title: "Add the measure tool: highlight the feature under the cursor, pick two and show the result"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer]
story: US95
milestone: "VSS:M5"
sprint: "VSS:SP33"
depends_on: [57, 381]
created: 2026-10-25
---

In measure mode the point, edge, circle or plane under the cursor is highlighted (through the BVH pick and the feature detection); picking two shows the distance, angle, diameter or plane separation as lines and a readout.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/measure/tool.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] On the fixtures hovering and picking give the expected measurements within 0.01 mm and 0.1 degree
- [ ] Measurements account for the object's transform and unit scale
- [ ] Escape leaves the mode and clears the lines; the model is never changed by measuring

## Tasks

- [ ] Hover and pick
- [ ] Lines and readout
- [ ] Harness test

## Progress

Not started.
