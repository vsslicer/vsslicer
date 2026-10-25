---
id: 156
title: Add the lay-on-face pick mode
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US43
milestone: "VSS:M4"
sprint: "VSS:SP19"
depends_on: [138, 153, 57]
created: 2026-10-25
---

A toolbar mode: hover highlights a face, click sends the lay-on-face command with the BVH-picked triangle.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/gizmo/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Hover highlights the face under the cursor through the BVH
- [ ] Click lays the object flat; Escape leaves the mode

## Tasks

- [ ] Mode
- [ ] Highlight
- [ ] Test

## Progress

Not started.
