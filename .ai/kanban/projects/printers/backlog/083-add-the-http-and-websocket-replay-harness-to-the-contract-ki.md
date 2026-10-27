---
id: 83
title: Add the HTTP and WebSocket replay harness to the contract kit
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US24
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [14]
created: 2026-10-25
---

A shared recorded-session replay server (HTTP plus WebSocket/SockJS frames) used by the four open connectors.

**Code:** `vsslicer/modules/common/printer-api/src/adapters/testing/` (module: `printer-api`, layer: `adapters`)

## Acceptance criteria

- [ ] Replays a recorded session file (request match, response, timed WS frames) and fails on an unexpected request; failure injection for 4xx, 5xx, timeout and mid-stream close
- [ ] Exported from `@vsslicer/printer-api/testing`; documented

## Tasks

- [ ] Session file format
- [ ] Replay server
- [ ] Failure injection and tests

## Progress

Not started.
