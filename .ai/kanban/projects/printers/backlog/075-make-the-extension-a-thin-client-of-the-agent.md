---
id: 75
title: Make the extension a thin client of the agent
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP30"
depends_on: [73, 24, 74, PLT-79]
created: 2026-10-25
---

Spawn or connect to the agent with `AgentClient`, route registry calls through it, answer secret requests from SecretStorage; the `PrinterRegistry` API stays the same.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] Registry calls work unchanged through the agent (the ext integration suite passes with the agent on)
- [ ] Only started on request of this extension; the client refuses to start in a remote extension host with a clear message

## Tasks

- [ ] Client wiring
- [ ] Secret answers
- [ ] Remote-host guard

## Progress

Not started.
