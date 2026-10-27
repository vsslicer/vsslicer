---
id: 36
title: "Assign, move and clear slots as events and expose the slot map"
type: feature
priority: P1
effort: M
model: sonnet
area: [consumption]
story: US12
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [35]
created: 2026-10-25
---

Slot changes are log events (so the snapshot stays rebuildable); the slot map is exposed through `Inventory`.

**Code:** `vsslicer/modules/filament/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Assign, move and clear survive a replay from empty
- [ ] The slot map reflects the last event per slot; the same event replayed twice changes nothing

## Tasks

- [ ] Write the events
- [ ] Write the use cases
- [ ] Replay tests

## Progress

Not started.
