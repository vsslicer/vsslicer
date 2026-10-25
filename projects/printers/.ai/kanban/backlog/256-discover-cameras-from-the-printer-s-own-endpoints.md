---
id: 256
title: "Discover cameras from the printer's own endpoints"
type: feature
priority: P1
effort: S
model: sonnet
area: [camera, moonraker, octoprint, prusalink]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [255, 325, 327, 329]
created: 2026-10-25
---

Fetch the camera lists with the `AuthorizedFetch` the agent provides and return descriptors through the mappers.

**Code:** `vsslicer/modules/camera-mjpeg/src/adapters/...` (module: `camera-mjpeg`, layer: `adapters`)

## Acceptance criteria

- [ ] Against the camera-api snapshot server serving the recorded lists, discovery returns the expected descriptors for each family
- [ ] A 401 or an unreachable printer returns the typed auth or unreachable error, with a 5 s timeout

## Tasks

- [ ] Write the fetch layer
- [ ] Write tests against the local server

## Progress

Not started.
