---
id: 342
title: "Add the cut plane gizmo: drag, numeric entry, flip and preview"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, editor]
story: US87
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [153, 336]
created: 2026-10-25
---

Places the cut plane by dragging it and by typing its position and angles, with flip, and shows the cut preview as two shaded halves.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/cut/plane.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Dragging and typing set the same plane; flip swaps upper and lower
- [ ] The preview shows both halves and the cut outline
- [ ] Escape cancels without a command

## Tasks

- [ ] Plane gizmo
- [ ] Numeric entry
- [ ] Preview
- [ ] Harness test

## Progress

Not started.
