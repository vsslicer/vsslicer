---
id: 265
title: Open the A1/P1 frame source with reconnect and auth errors
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, bambu]
story: US43
milestone: "VSS:M4"
depends_on: [264, 263, 246]
created: 2026-10-25
---

The `frames` `CameraSource` over TLS TCP 6000: connect, authenticate, yield JPEG frames, reconnect with backoff.

**Code:** `vsslicer/modules/camera-bambu/src/adapters/...` (module: `camera-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] The camera-api contract kit passes against the fake server (snapshot = first frame, live frames, reconnect after restart, wrong access code = auth-failure state)
- [ ] The printer's self-signed certificate is accepted only for this connection; socket closes when the viewer leaves (socket count test)
- [ ] A1/P1 frame source verified on the fake server only (D5)

## Tasks

- [ ] Write the TLS client and frame stream
- [ ] Write reconnect and error mapping
- [ ] Run the contract kit

## Progress

Not started.
