---
id: 40
title: "Book a job end to assigned spools, with flags and settings"
type: feature
priority: P1
effort: L
model: opus
area: [consumption]
story: US13
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [36, 37, 38, 39]
created: 2026-10-25
---

The `BookingService`: for a `JobEnd`, collect the source observations per tool, apply the rules, book to the spools in the assigned slots and store the observations and flags. Honours `filament.booking.<adapter>` and an external-booking switch per printer.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Reconciliation tests on recorded job ends: Moonraker and Bambu fixtures produce the expected events and flags; redelivered job ends book once
- [ ] Multi-tool jobs book per tool (catches everything booked to spool 0)
- [ ] Booking off for an adapter writes no new events; `setExternalBooking(printerId, true)` makes extrusion booking skip that printer (used by E45)

## Tasks

- [ ] Write the service
- [ ] Per-tool booking
- [ ] Settings and the switch
- [ ] Reconciliation tests

## Progress

Not started.
