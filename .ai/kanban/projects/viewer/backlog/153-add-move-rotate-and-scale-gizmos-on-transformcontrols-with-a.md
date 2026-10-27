---
id: 153
title: "Add move, rotate and scale gizmos on TransformControls with a proxy drag"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [55, 57, 137, PLT-37]
created: 2026-10-25
---

Gizmos for the selection: during a drag a proxy moves, and on release one command is sent. Large meshes are never re-uploaded during a drag.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/gizmo/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Dragging the move, rotate and scale handles shows live feedback and sends exactly one command on release
- [ ] The mesh buffers are not re-uploaded during the drag
- [ ] Selection of an instance, object or part chooses the gizmo target

## Tasks

- [ ] TransformControls wrapper
- [ ] Proxy and commit
- [ ] Target selection

## Progress

Not started.
