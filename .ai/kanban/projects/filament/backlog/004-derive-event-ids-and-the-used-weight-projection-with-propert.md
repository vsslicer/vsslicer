---
id: 4
title: Derive event ids and the used-weight projection with property tests
type: feature
priority: P1
effort: M
model: opus
area: [model]
story: US2
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [2, 3]
created: 2026-10-25
---

Event id = hash(source, printer, job, spool, tool); used weight is a fold over events, with `scale` corrections that keep `used = sum(events)`. The invariant core of the inventory.

**Code:** `vsslicer/modules/filament/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Property tests (fast-check): for any sequence of book, measure, duplicate and replayed events, `spool.used_weight == sum(events)` and remaining = initial - used
- [ ] A duplicate event id is ignored (catches double booking on redelivered job ends)
- [ ] A scale reading (absolute gross weight) produces a `scale` correction event whose grams make the sum match the reading

## Tasks

- [ ] Write the id hash
- [ ] Write the projection
- [ ] Write the scale-correction rule
- [ ] Property tests

## Progress

Not started.
