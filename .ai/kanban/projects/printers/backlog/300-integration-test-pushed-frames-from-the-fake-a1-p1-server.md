---
id: 300
title: Integration-test pushed frames from the fake A1/P1 server
type: chore
priority: P1
effort: S
model: sonnet
area: [camera, bambu]
story: US43
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [298, 267]
created: 2026-10-25
---

The A1/P1-style frame source end to end against the fake port-6000 server.

**Code:** `vsslicer/modules/camera-extension/` (module: `camera-extension`, layer: `n/a (integration tests)`)

## Acceptance criteria

- [ ] Frames from the fake server play in the panel; restart of the server reconnects; wrong access code shows the auth error
- [ ] Fixture only: no A1/P1 hardware (D5)

## Tasks

- [ ] Add the scenario

## Progress

Not started.
