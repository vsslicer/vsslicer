---
id: 80
title: "Spike: pin Spoolman's Docker image and API, and test the websocket through the proxy"
type: spike
priority: P2
effort: S
model: opus
area: [spoolman]
story: US34
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [79]
created: 2026-10-25
---

Spoolman's image and API version drift. Pin an image tag, record the OpenAPI document as a fixture, and check whether websocket events work through Moonraker's `/server/spoolman/proxy` (fallback is polling on `sync_rate`).

**Code:** `vsslicer/modules/filament-spoolman/docs/` (module: `filament-spoolman`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A note with the pinned tag, the recorded OpenAPI fixture path and the websocket-through-proxy verdict
- [ ] The OpenAPI document is checked in under `test/fixtures/` with PROVENANCE

## Tasks

- [ ] Pull and pin the image
- [ ] Record the OpenAPI
- [ ] Test the proxy websocket on a recorded session

## Progress

Not started.
