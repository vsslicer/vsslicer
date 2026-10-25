---
id: 305
title: "Add paint mode: kind, state palette, cursor size, enter and exit"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [55, 57, 301]
created: 2026-10-25
---

The shared shell of the painting tools: a toolbar to enter support, seam or colour painting, choose enforcer or blocker (or a filament), cursor shape and size, and leave with Escape. Tools plug into it.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/paint/mode.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Enter and exit restore the previous selection and camera
- [ ] Painting is only available in the editable mode, and is greyed with the reason when the file is read-only
- [ ] Cursor size changes with the wheel plus a modifier and shows the cursor on the surface
- [ ] Tested in the webview harness

## Tasks

- [ ] Toolbar
- [ ] Cursor
- [ ] Enter and exit
- [ ] Harness test

## Progress

Not started.
