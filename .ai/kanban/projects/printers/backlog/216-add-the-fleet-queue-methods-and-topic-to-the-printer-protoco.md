---
id: 216
title: Add the fleet queue methods and topic to the printer protocol
type: feature
priority: P2
effort: S
model: sonnet
area: [daemon, fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP36"
depends_on: [215]
created: 2026-10-25
---

`fleet.queue.add/addMany/list/cancel/retry/reorder`, `fleet.facts.set` and the `fleet.queue.changed` topic.

**Code:** `vsslicer/modules/printer/agent/src/domain/...` (module: `printer-agent`, layer: `domain`)

## Acceptance criteria

- [ ] Schemas and regenerated JSON Schema checked in; property tests reject invalid params

## Tasks

- [ ] Schemas
- [ ] Property tests

## Progress

Not started.
