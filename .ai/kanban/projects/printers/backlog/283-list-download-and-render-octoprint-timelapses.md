---
id: 283
title: "List, download and render OctoPrint timelapses"
type: feature
priority: P2
effort: M
model: sonnet
area: [camera, octoprint]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [281, 280, 84, PLT-13, 327]
created: 2026-10-25
---

The OctoPrint provider: `GET /api/timelapse`, render of unrendered sets, download from the timelapse downloads path.

**Code:** `vsslicer/modules/camera-timelapse/src/adapters/...` (module: `camera-timelapse`, layer: `adapters`)

## Acceptance criteria

- [ ] Against recorded OctoPrint responses: list including unrendered sets, render request, download with progress and cancel
- [ ] The camera-api timelapse contract passes
- [ ] OctoPrint verified on recordings only (D5)

## Tasks

- [ ] Add recorded responses
- [ ] Write list, download and render
- [ ] Run the contract

## Progress

Not started.
