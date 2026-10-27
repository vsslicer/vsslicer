---
id: 293
title: Add the camera service over the agent
type: feature
priority: P1
effort: M
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [292, 253, 28, 82, PLT-79, 339]
created: 2026-10-25
---

Registers the bundled sources with the agent and offers list, open, snapshot and close for a printer, so views need no protocol detail.

**Code:** `vsslicer/modules/apps/camera/src/application/...` (module: `camera-extension`, layer: `application`)

## Acceptance criteria

- [ ] Against the agent with the camera-api test servers: cameras of a fake printer list, `open` returns a stream URL usable by the player, `close` releases it
- [ ] Agent restart re-registers sources and re-opens active streams; an agent without camera methods yields a clear error
- [ ] No VS Code API in this layer (lint)

## Tasks

- [ ] Write the service and registration
- [ ] Handle restart and skew
- [ ] Write tests

## Progress

Not started.
