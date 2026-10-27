---
id: 193
title: Implement history and native queue in the fake adapter
type: feature
priority: P2
effort: S
model: sonnet
area: [api]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [192]
created: 2026-10-25
---

The fake adapter keeps an in-memory job history and native queue, with change events.

**Code:** `vsslicer/modules/common/printer-api/src/adapters/...` (module: `printer-api`, layer: `adapters`)

## Acceptance criteria

- [ ] Contract kit passes against the fake with both flags on and off

## Tasks

- [ ] Fake queue
- [ ] Fake history
- [ ] Kit run

## Progress

Not started.
