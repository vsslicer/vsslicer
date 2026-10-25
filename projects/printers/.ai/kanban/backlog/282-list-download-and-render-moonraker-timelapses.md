---
id: 282
title: "List, download and render Moonraker timelapses"
type: feature
priority: P2
effort: M
model: sonnet
area: [camera, moonraker]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [281, 280, 84, PLT-13, 325]
created: 2026-10-25
---

The Moonraker provider: files in the `timelapse` root (`/server/files/list?root=timelapse`), download from `/server/files/timelapse/<name>`, and `/machine/timelapse/render` for unrendered frames.

**Code:** `vsslicer/modules/camera-timelapse/src/adapters/...` (module: `camera-timelapse`, layer: `adapters`)

## Acceptance criteria

- [ ] Against recorded Moonraker responses (replay harness): list, render request, download with progress and cancel
- [ ] The camera-api timelapse contract passes
- [ ] Moonraker verified on recordings only (D5); missing timelapse component returns an 'not installed' state

## Tasks

- [ ] Add recorded responses
- [ ] Write list, download and render
- [ ] Run the contract

## Progress

Not started.
