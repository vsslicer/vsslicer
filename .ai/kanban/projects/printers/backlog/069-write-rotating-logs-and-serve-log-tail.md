---
id: 69
title: Write rotating logs and serve log.tail
type: feature
priority: P2
effort: S
model: sonnet
area: [daemon]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP29"
depends_on: [62, PLT-72]
created: 2026-10-25
---

A rotating file log, shown in the window's output channel on request.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] Rotation by size keeps N files; `log.tail` returns the last lines; secrets are never logged (redaction test)

## Tasks

- [ ] Rotating logger
- [ ] log.tail
- [ ] Tests

## Progress

Not started.
