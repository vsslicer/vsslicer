---
id: 245
title: Write the camera contract kit
type: feature
priority: P1
effort: M
model: sonnet
area: [camera]
story: US40
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [243, 242]
created: 2026-10-25
---

One contract test any `CameraSource` must pass, run by each camera module against the local servers.

**Code:** `vsslicer/modules/common/camera-api/` (module: `camera-api`, layer: `n/a (test kit)`)

## Acceptance criteria

- [ ] Checks: snapshot always works; live works where declared; reconnect after the server restarts; wrong credentials surface as the auth-failure error state, never a hang
- [ ] The kit fails a deliberately broken source for each check (meta test)
- [ ] Exported as `@vsslicer/camera-api/testkit`

## Tasks

- [ ] Write the four contract checks
- [ ] Write the broken-source meta tests

## Progress

Not started.
