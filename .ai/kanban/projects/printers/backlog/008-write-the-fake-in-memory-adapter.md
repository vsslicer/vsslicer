---
id: 8
title: Write the fake in-memory adapter
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [6]
created: 2026-10-25
---

A controllable adapter for contract-kit, extension and agent tests, with scripted failures and a disconnect fixture.

**Code:** `vsslicer/modules/printer-api/src/adapters/fake/` (module: `printer-api`, layer: `adapters`)

## Acceptance criteria

- [ ] The fake supports push and poll modes, scripted status sequences, every `PrinterError` kind, upload with progress and a fake server that counts open connections, and a disconnect/reconnect fixture
- [ ] Exported from `@vsslicer/printer-api/testing`
- [ ] The fake passes the contract kit (once it exists) and is the adapter used by every extension integration test

## Tasks

- [ ] Write the fake
- [ ] Write the connection counter
- [ ] Unit tests

## Progress

Not started.
