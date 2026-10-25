---
id: 252
title: "Test the proxy: token, loopback bind, no CORS and no leaked sockets"
type: chore
priority: P1
effort: S
model: sonnet
area: [camera, daemon]
story: US41
milestone: "VSS:M4"
depends_on: [250, 251]
created: 2026-10-25
---

The cross-cutting proxy proofs from the E38 criteria, run against the real server.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] Token required on every route; CORS not opened (no `Access-Control-Allow-*`, preflight refused)
- [ ] 20 open/close cycles of stream, WebSocket and snapshot leave no open sockets or timers (handle count before and after)
- [ ] The proxy stays up when one camera upstream hangs

## Tasks

- [ ] Write the token and CORS tests
- [ ] Write the 20-cycle leak test

## Progress

Not started.
