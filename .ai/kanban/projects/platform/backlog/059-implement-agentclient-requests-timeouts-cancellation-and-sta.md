---
id: 59
title: "Implement `AgentClient` requests, timeouts, cancellation and state events"
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US44
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [53]
created: 2026-10-25
---

Client core over a `Transport` port: typed `request`, per-request timeout, cancellation via `AbortSignal` sending `$/cancelRequest`, and `connected`/`disconnected` events. No reconnect yet.

**Code:** `vsslicer/modules/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] Typed `request` resolves with the validated result; an error response becomes the matching `AgentError`
- [ ] Timeout rejects with `Timeout`; aborting the signal sends `$/cancelRequest` and rejects with `Cancelled`
- [ ] On transport close every pending request rejects with a named disconnect error and `disconnected` is emitted once (no hanging promise, test)

## Tasks

- [ ] Define the `Transport` port and client state machine
- [ ] Implement timeout and cancel
- [ ] Unit tests with a fake transport and fake clock

## Progress

Not started.
