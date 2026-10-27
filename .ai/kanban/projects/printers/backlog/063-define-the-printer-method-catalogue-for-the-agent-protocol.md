---
id: 63
title: Define the printer method catalogue for the agent protocol
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [62, 14, PLT-72]
created: 2026-10-25
---

The `printer.*` methods and topics on top of `@vsslicer/agent-protocol`: session open/close, status subscription, job commands, upload streaming by local path, adapter loading, secret requests back to the window.

**Code:** `vsslicer/modules/printer/agent/src/domain/...` (module: `printer-agent`, layer: `domain`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] Schemas (TypeBox) for each method with params, result and error kinds; JSON Schema generated and checked in; CI fails on drift
- [ ] Upload passes a local path, never bytes; status notifications carry sequence numbers
- [ ] Property test: random params per method return `InvalidParams` and never crash the handler

## Tasks

- [ ] Method schemas
- [ ] Generated JSON Schema
- [ ] Property tests

## Progress

Not started.
