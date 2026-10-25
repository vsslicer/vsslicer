---
id: US44
title: "Watch the H2C live in VS Code"
status: reviewed
epic: VSS:E38
---

As the owner of a Bambu H2C, I want its RTSPS camera to play live in VS Code, so that I can watch my prints from the slicer.

## Acceptance criteria

- [ ] An optional go2rtc sidecar is downloaded on explicit request from its GitHub release with a pinned version and SHA-256; a wrong checksum refuses to run
- [ ] The sidecar is bound to 127.0.0.1 with `api.local_auth`, exits with the agent, and re-serves the stream as MJPEG or MSE through the proxy
- [ ] The player plays MSE in a `<video>`; without go2rtc, a snapshot shows if the printer offers one, with an explanation
- [ ] With LAN Mode Liveview off the "turn on LAN Mode Liveview" hint shows
- [ ] On the H2C (firmware recorded): live view with Liveview on; glass-to-glass latency and bandwidth recorded in `docs/` with date
- [ ] The H2C camera path spike is written up first (RTSPS URL, Developer Mode, codec, go2rtc)

## Out of scope

- Cloud relays (TUTK/Agora), recording
- WebRTC (US45)
