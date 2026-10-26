---
id: 298
title: Integration-test cameras against the local MJPEG and snapshot servers
type: chore
priority: P1
effort: M
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [296, 297, 260, PLT-15]
created: 2026-10-25
---

End-to-end in the extension test host: printer fixture, agent, camera-mjpeg, proxy and player against the local servers.

**Code:** `vsslicer/modules/camera-extension/` (module: `camera-extension`, layer: `n/a (integration tests)`)

## Acceptance criteria

- [ ] MJPEG and snapshot-only cameras show frames; killing the server shows the error state and restarting recovers
- [ ] Wrong credentials show the auth error; open/close 20 times leaves no sockets in the agent

## Tasks

- [ ] Write the fixtures
- [ ] Write the scenarios

## Progress

Not started.
