---
id: 60
title: Implement the client handshake and `AgentVersionMismatch` surfacing
type: feature
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US42
milestone: "VSS:M3"
depends_on: [59]
created: 2026-10-25
---

On connect the client sends `initialize` with its version, name and capabilities and token, exposes the server's version and capabilities, and raises a typed `AgentVersionMismatch` for presentation to show.

**Code:** `vsslicer/modules/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] After connect `client.serverInfo` holds the server version and capabilities
- [ ] A mismatch response rejects `connect()` with `AgentVersionMismatch` carrying both versions and does not auto-retry
- [ ] `Unauthorized` on connect rejects with that kind and is not retried

## Tasks

- [ ] Implement the handshake
- [ ] Unit tests with a fake server transport

## Progress

Not started.
