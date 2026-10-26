---
id: 71
title: "Test token, permissions and version skew"
type: chore
priority: P1
effort: S
model: opus
area: [daemon]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP29"
depends_on: [70, PLT-79]
created: 2026-10-25
---

Security and compatibility tests on the real agent.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] No token / wrong token refused; owner-only file modes asserted on Linux and macOS
- [ ] A client one major version ahead or behind negotiates or gets the restart message (version skew test)

## Tasks

- [ ] Security tests
- [ ] Skew tests

## Progress

Not started.
