---
id: 51
title: Define the error model and stable `data.kind` strings
type: feature
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US43
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [49]
created: 2026-10-25
---

The fixed set of application error codes with stable `data.kind` strings, shared by server and client. Pure code, verified by unit tests.

**Code:** `vsslicer/modules/agent-protocol/src/domain/...` (module: `agent-protocol`, layer: `domain`)

## Acceptance criteria

- [ ] `Unauthorized`, `NotFound`, `Busy`, `Timeout`, `AdapterError`, `Cancelled`, `AgentVersionMismatch` map to a fixed code range and kind; a test pins the table so a change fails
- [ ] JSON-RPC standard codes (`ParseError`, `InvalidRequest`, `MethodNotFound`, `InvalidParams`, `InternalError`) are included with their kinds
- [ ] `AgentError` carries code, kind, message and optional data, and serialises/deserialises losslessly

## Tasks

- [ ] Write the error table and `AgentError`
- [ ] Write the pinning test

## Progress

Not started.
