---
id: 88
title: Pull changes and reconcile periodically
type: feature
priority: P2
effort: M
model: opus
area: [spoolman]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP19"
depends_on: [84, 86]
created: 2026-10-25
---

Apply change events and a periodic full reconcile; `used_weight` changes made by other clients arrive as `extrusion` events marked external.

**Code:** `vsslicer/modules/filament-spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] Contract test: a `use` made by a second client arrives locally as an external `extrusion` event and `used_weight` agrees
- [ ] A missed event is repaired by the next reconcile

## Tasks

- [ ] Write the apply
- [ ] Write the reconcile
- [ ] Contract tests

## Progress

Not started.
