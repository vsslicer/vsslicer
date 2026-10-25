---
id: US43
title: "See an A1 or P1 style pushed-frame camera"
status: reviewed
epic: VSS:E38
---

As a user of a Bambu A1 or P1, I want the camera that pushes JPEG frames on port 6000 to play in the panel, so that those printers are watchable too.

## Acceptance criteria

- [ ] The `bambu-jpeg` source authenticates with the 80-byte packet, parses framed JPEGs and reconnects after a drop
- [ ] Model selection chooses `frames` for A1/P1 and `rtsp` for X1, P2S and H2 from the MQTT `ipcam` state
- [ ] A wrong access code surfaces as an auth-failure state
- [ ] Passes the camera contract against the fake port-6000 TLS server replaying recorded frames and plays in the panel; no A1/P1 hardware (D5)

## Out of scope

- RTSPS playback (US44)
