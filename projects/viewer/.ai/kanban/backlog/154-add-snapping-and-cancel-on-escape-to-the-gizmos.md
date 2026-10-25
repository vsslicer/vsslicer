---
id: 154
title: Add snapping and cancel on Escape to the gizmos
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
depends_on: [153]
created: 2026-10-25
---

Grid, angle and scale snapping with modifier keys, and Escape cancels a drag without sending a command.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/gizmo/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Snap steps are 1 mm, 15 degrees and 10 percent by default and configurable
- [ ] Escape during a drag restores the object and sends no command

## Tasks

- [ ] Snapping
- [ ] Cancel
- [ ] Tests

## Progress

Not started.
