---
id: 75
title: Add the in-memory transport and fake daemon
type: feature
priority: P1
effort: M
model: sonnet
area: [agent-protocol]
story: US48
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [58, 59]
created: 2026-10-25
---

`@vsslicer/agent-protocol/testkit` exports an in-memory transport pair and a `FakeDaemon` that scripts replies per method and pushes topic notifications, running the real `AgentServer` dispatch so schemas are enforced.

**Code:** `vsslicer/modules/common/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] An `AgentClient` over the in-memory pair completes `initialize`, a scripted request and a subscription with pushed notifications
- [ ] The fake rejects a scripted reply that does not match the method's result schema (a fake cannot drift)
- [ ] The testkit entry imports no `vscode` and no socket code

## Tasks

- [ ] Implement the transport pair and fake daemon
- [ ] Export the subpath and add a type test

## Progress

Not started.
