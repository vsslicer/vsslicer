---
id: 344
title: "Add the connector panel: place plugs, dowels and snaps on the cut face, and dovetail"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, editor]
story: US88
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [342, 337]
created: 2026-10-25
---

Click the cut face to place a connector, choose type, style, shape, size, depth and clearance, drag to move, delete; the dovetail option with its angle, depth and count.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/cut/connectors.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Placements outside the face are refused with the reason
- [ ] The connector settings reach the cut payload and the preview shows plug and hole
- [ ] Dovetail options are mutually exclusive with point connectors as in Orca

## Tasks

- [ ] Placement
- [ ] Settings
- [ ] Dovetail
- [ ] Harness test

## Progress

Not started.
