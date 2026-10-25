---
id: US41
title: "Camera traffic goes through a safe loopback proxy"
status: reviewed
epic: VSS:E38
---

As a user watching a printer camera, I want all camera traffic to go through a loopback proxy in the agent, so that printer credentials and self-signed TLS never reach the webview and nothing else on my network can use the stream.

## Acceptance criteria

- [ ] The agent serves `/camera/<id>/stream` and `/snapshot` on 127.0.0.1, random port, per-session token in the path, adding the printer credentials upstream
- [ ] Token required, loopback bind only, CORS not opened, and the stream closes when the webview closes (no leaked sockets after 20 open/close cycles)
- [ ] WebSocket and POST forwarding reaches registered upstreams only
- [ ] A stuck camera cannot block printer status
- [ ] The camera plays from a Remote-SSH workspace (proxy on the UI machine; manual check recorded)

## Out of scope

- go2rtc sidecar (US44)
- WebRTC signalling specifics (US45)
