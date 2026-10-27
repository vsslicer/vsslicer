---
id: 55
title: Implement `AgentServer` dispatch with schema validation and namespaced registration
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US43
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [53]
created: 2026-10-25
---

The server core: a `Connection` port (send/receive JSON-RPC messages), handler registration per method, validation of params against the schema before the handler runs, and mapping thrown errors to the error model.

**Code:** `vsslicer/modules/common/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] Invalid params return `InvalidParams` without calling the handler; unknown method returns `MethodNotFound`; handler throw returns an error with no stack trace in the response
- [ ] A handler registered for a namespace method receives typed params and a context (connection id, `AbortSignal`)
- [ ] Verified over an in-process fake `Connection`; no sockets in this card

## Tasks

- [ ] Define the `Connection` port and the dispatcher
- [ ] Implement validation and error mapping
- [ ] Unit tests

## Progress

Not started.
