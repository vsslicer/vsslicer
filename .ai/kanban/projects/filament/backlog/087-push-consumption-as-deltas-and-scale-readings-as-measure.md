---
id: 87
title: Push consumption as deltas and scale readings as measure
type: feature
priority: P2
effort: M
model: opus
area: [spoolman]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [86]
created: 2026-10-25
---

Bookings go out as `PUT /spool/{id}/use {use_weight}` deltas with an idempotency key in `extra`; scale readings go as `PUT /spool/{id}/measure`.

**Code:** `vsslicer/modules/filament-spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] Two-client test: Spoolman receives `use` from VSSlicer and from a second simulated client and both deltas are in the final `used_weight` (catches absolute overwrite)
- [ ] The same booking pushed twice is applied once (idempotency key)

## Tasks

- [ ] Write delta push
- [ ] Write measure push
- [ ] Two-client test

## Progress

Not started.
