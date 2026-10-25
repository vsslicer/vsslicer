---
id: 89
title: Write the Moonraker REST and JSON-RPC WebSocket client
type: feature
priority: P0
effort: M
model: sonnet
area: [moonraker]
story: US19
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [88, 87]
created: 2026-10-25
---

REST calls and the WebSocket with `printer.objects.subscribe`, timeouts and reconnect.

**Code:** `vsslicer/modules/printer-moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] Against recorded sessions: subscribe delivers status deltas; every request has a timeout; reconnect resubscribes
- [ ] Hung request does not block other calls

## Tasks

- [ ] REST client
- [ ] WS client and subscribe
- [ ] Reconnect tests

## Progress

Not started.
