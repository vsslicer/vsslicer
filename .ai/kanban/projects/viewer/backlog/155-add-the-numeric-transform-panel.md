---
id: 155
title: Add the numeric transform panel
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [137, 152]
created: 2026-10-25
---

A panel with position, rotation and scale fields for the selection, in world or local space, that sends the same commands as the gizmo.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/panels/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Typing a position moves the object by that amount and undoes
- [ ] Invalid text is refused inline
- [ ] Fields update when the object changes by gizmo or undo

## Tasks

- [ ] Panel
- [ ] Space switch
- [ ] Tests

## Progress

Not started.
