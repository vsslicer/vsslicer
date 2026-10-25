---
id: US13
title: "Job ends are detected once from printer feedback"
status: reviewed
epic: VSS:E42
---

As a printer owner, I want a finished, cancelled or failed job on any printer the suite knows to produce one job-end record, so that each job is booked exactly once even when events are redelivered.

## Acceptance criteria

- [ ] A redelivered job end (daemon reconnect, two windows) books once (event-id idempotency)
- [ ] Per-adapter booking is behind `filament.booking.<adapter>` (default on); turning it off stops new events and keeps old ones
- [ ] Booking is skipped for a printer whose own Spoolman component is active

## Out of scope

- Spoolman as a target (E45)
