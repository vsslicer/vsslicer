---
id: 125
title: Run discovery in the agent
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon, discovery]
story: US23
milestone: "VSS:M3"
sprint: "VSS:SP30"
depends_on: [124, 73]
created: 2026-10-25
---

Expose `printer.discover` in the agent so discovery runs on the UI machine.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] The method streams probed results to the caller and stops on cancel (fake discoverers)
- [ ] Method schema added to the printer catalogue; JSON Schema regenerated

## Tasks

- [ ] Method handler
- [ ] Schema
- [ ] Tests

## Progress

Not started.
