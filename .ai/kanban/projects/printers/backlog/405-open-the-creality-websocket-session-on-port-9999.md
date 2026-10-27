---
id: 405
title: Open the Creality WebSocket session on port 9999
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [404]
created: 2026-10-25
---

WebSocket client that polls `get` for status (the protocol has no push we rely on), correlates `set` replies, and reconnects with backoff.

**Code:** `vsslicer/modules/printer/unofficial-creality/src/adapters/...` (module: `printer-unofficial-creality`, layer: `adapters`)

## Acceptance criteria

- [ ] The replay harness runs connect, polling, a `set` and a dropped socket that reconnects
- [ ] A silent socket gives `timeout`; a refused connection `unreachable`

## Tasks

- [ ] Client
- [ ] Polling
- [ ] Reconnect
- [ ] Tests

## Progress

Not started.
