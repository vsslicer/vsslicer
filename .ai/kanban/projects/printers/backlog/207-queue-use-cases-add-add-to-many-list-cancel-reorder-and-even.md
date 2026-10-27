---
id: 207
title: "Queue use cases: add, add to many, list, cancel, reorder and events"
type: feature
priority: P2
effort: M
model: sonnet
area: [fleet]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP36"
depends_on: [204, 205, 206]
created: 2026-10-25
---

The `Queue` service the agent hosts: `add`, `addToMany` (one item per selected printer, each checked), `list`, `cancel`, `retry`, `reorder` and an event stream.

**Code:** `vsslicer/modules/printer/fleet-queue/src/application/...` (module: `fleet-queue`, layer: `application`)

## Acceptance criteria

- [ ] `addToMany` over fixture printers gives one item per compatible printer and a reasoned refusal for the others
- [ ] Events emitted for every change (test)

## Tasks

- [ ] Service
- [ ] Fan-out
- [ ] Tests

## Progress

Not started.
