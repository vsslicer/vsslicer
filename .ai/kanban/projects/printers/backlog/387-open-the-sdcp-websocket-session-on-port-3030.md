---
id: 387
title: Open the SDCP WebSocket session on port 3030
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [385]
created: 2026-10-25
---

WebSocket client for `ws://IP:3030/websocket`: subscribes to status and attributes topics, sends requests with ids and waits for the matching response, reconnects with backoff.

**Code:** `vsslicer/modules/printer/unofficial-sdcp/src/adapters/...` (module: `printer-unofficial-sdcp`, layer: `adapters`)

## Acceptance criteria

- [ ] The replay harness drives connect, status push, attributes and a request/response pair; a dropped socket reconnects and resumes status
- [ ] A request without a response times out with `timeout`

## Tasks

- [ ] Client
- [ ] Request correlation
- [ ] Reconnect
- [ ] Tests

## Progress

Not started.
