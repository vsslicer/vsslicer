---
id: 166
title: Add queue methods and the follow topic to the printer protocol
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US31
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [165, 63, PLT-72]
created: 2026-10-25
---

`queue.add/cancel/retry/list/dismiss` and the `printer.follow` topic in the catalogue.

**Code:** `vsslicer/modules/printer-agent/src/domain/...` (module: `printer-agent`, layer: `domain`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] Schemas and regenerated JSON Schema checked in; property tests reject invalid params

## Tasks

- [ ] Schemas
- [ ] Property tests

## Progress

Not started.
