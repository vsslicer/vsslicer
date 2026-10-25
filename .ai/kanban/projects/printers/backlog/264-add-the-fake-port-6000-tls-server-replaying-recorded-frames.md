---
id: 264
title: Add the fake port-6000 TLS server replaying recorded frames
type: chore
priority: P1
effort: M
model: sonnet
area: [camera, bambu]
story: US43
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [263, PLT-13]
created: 2026-10-25
---

A TLS server with a self-signed certificate that checks the auth packet and replays frames, as the A1/P1 camera does.

**Code:** `vsslicer/modules/camera-bambu/` (module: `camera-bambu`, layer: `n/a (test kit)`)

## Acceptance criteria

- [ ] Accepts a correct auth packet and streams the recorded frames; closes the connection on a wrong access code
- [ ] Can be stopped and restarted for the reconnect test
- [ ] Frames stored with PROVENANCE.md under the size cap

## Tasks

- [ ] Write the server
- [ ] Add frames and provenance
- [ ] Write the self-test

## Progress

Not started.
