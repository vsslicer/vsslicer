---
id: 249
title: Serve the camera proxy on loopback with a per-session token
type: feature
priority: P1
effort: M
model: opus
area: [camera, daemon]
story: US41
milestone: "VSS:M4"
depends_on: [247]
created: 2026-10-25
---

The HTTP server on 127.0.0.1 and a random port with a per-session token in the path, serving `/camera/<id>/stream` and `/camera/<id>/snapshot`; security-sensitive.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] Binds 127.0.0.1 only (test asserts the bound address and a connection from a non-loopback address is impossible)
- [ ] A request without or with a wrong token gets 404 and no upstream request is made; no CORS headers are sent
- [ ] Token and port are random per agent session and appear in no log line

## Tasks

- [ ] Write the server and token check
- [ ] Return no CORS headers and no directory listing
- [ ] Write the unit tests

## Progress

Not started.
