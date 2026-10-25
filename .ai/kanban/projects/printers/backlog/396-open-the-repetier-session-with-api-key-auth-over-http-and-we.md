---
id: 396
title: Open the Repetier session with API-key auth over HTTP and WebSocket
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [395]
created: 2026-10-25
---

HTTP actions at `/printer/api/<slug>?a=<action>&data=<json>` and the WebSocket on port 3344 for events, authenticated with the `x-api-key` header (never in the query), choosing the printer slug from `listPrinter`.

**Code:** `vsslicer/modules/printer-unofficial-repetier/src/adapters/...` (module: `printer-unofficial-repetier`, layer: `adapters`)

## Acceptance criteria

- [ ] The replay harness runs connect, state, temperature events and a command; a wrong key maps to `auth`
- [ ] The key is never written to a URL or log (test over captured requests)
- [ ] `/printer/info` is not used to fetch a key; the user supplies it

## Tasks

- [ ] HTTP client
- [ ] WebSocket events
- [ ] Auth
- [ ] Tests

## Progress

Not started.
