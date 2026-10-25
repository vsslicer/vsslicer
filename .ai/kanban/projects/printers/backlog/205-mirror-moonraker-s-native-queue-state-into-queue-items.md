---
id: 205
title: "Mirror Moonraker's native queue state into queue items"
type: feature
priority: P2
effort: S
model: sonnet
area: [fleet]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [202]
created: 2026-10-25
---

A pure mapping from native queue states and events to item states, with the native queue winning on disagreement.

**Code:** `vsslicer/modules/fleet-queue/src/domain/...` (module: `fleet-queue`, layer: `domain`)

## Acceptance criteria

- [ ] Table test native to item state; a disagreement fixture resolves to the native state

## Tasks

- [ ] Mapping
- [ ] Tests

## Progress

Not started.
