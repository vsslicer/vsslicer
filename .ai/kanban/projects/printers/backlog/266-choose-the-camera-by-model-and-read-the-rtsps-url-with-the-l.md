---
id: 266
title: Choose the camera by model and read the RTSPS URL with the Liveview hint
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, bambu]
story: US43
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [262, 261, 246, 46, 334]
created: 2026-10-25
---

Pick `frames` for A1/P1 and `rtsp` for X1, P2S and H2 (H2C) from the printer model and the MQTT `ipcam` state; when `rtsp_url` reads `disable`, report the `liveview-disabled` state with the 'turn on LAN Mode Liveview' hint.

**Code:** `vsslicer/modules/camera-bambu/src/application/...` (module: `camera-bambu`, layer: `application`)

## Acceptance criteria

- [ ] Table-driven test over models and ipcam states from the recorded H2C session gives the expected descriptor or hint
- [ ] The RTSPS URL carries no access code in logs or error text (log redaction test)
- [ ] Model table cites the spike findings; an unknown model gets snapshot-less 'unsupported' state, not a crash

## Tasks

- [ ] Write the selector
- [ ] Write the hint state
- [ ] Write table tests

## Progress

Not started.
