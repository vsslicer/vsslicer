---
id: 363
title: Resize and move a range by its handles
type: feature
priority: P2
effort: S
model: sonnet
area: [viewer, editor]
story: US93
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [362, 158]
created: 2026-10-25
---

Handles on the band edges resize it and a drag on the band moves it, with the same refusals and snapping; the range's overrides are edited in the override form.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/ranges/handles.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Resizing and moving are one undo step each and keep the range's overrides
- [ ] Handles refuse overlaps and out-of-height values with the reason
- [ ] Editing an override in the form is reflected in the band label

## Tasks

- [ ] Handles
- [ ] Refusals
- [ ] Harness test

## Progress

Not started.
