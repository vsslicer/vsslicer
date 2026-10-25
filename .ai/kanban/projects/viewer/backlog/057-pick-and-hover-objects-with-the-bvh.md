---
id: 57
title: Pick and hover objects with the BVH
type: feature
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [55, 75]
created: 2026-10-25
---

Raycast picking with the transferred BVH and highlight of hovered and selected objects.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/pick/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Click selects the right object on a multi-object fixture; hover highlights
- [ ] Picking uses the deserialised BVH from the worker

## Tasks

- [ ] Raycast
- [ ] Highlight
- [ ] Tests

## Progress

Not started.
