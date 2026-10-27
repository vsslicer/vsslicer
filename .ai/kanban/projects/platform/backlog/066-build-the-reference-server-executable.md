---
id: 66
title: Build the reference server executable
type: feature
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US47
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [58, 63, 65]
created: 2026-10-25
---

A runnable server (`dist/reference-server.js`) wiring `AgentServer`, the core handlers, the transport, the token file and the lock together. Used by tests, by the spawn test and as the conformance target. E22's daemon is the real server.

**Code:** `vsslicer/modules/common/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] Started with a runtime dir it listens, writes the token, takes the lock, and answers `initialize` and `ping` from a client
- [ ] `shutdown` stops it and removes socket, token and lock
- [ ] It prints a readiness line on stdout that the spawning client waits for

## Tasks

- [ ] Write the entry point and wiring
- [ ] Smoke test as a child process

## Progress

Not started.
