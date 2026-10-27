---
id: 90
title: Queue pushes while Spoolman is unreachable and replay them in order
type: feature
priority: P2
effort: M
model: opus
area: [spoolman]
story: US36
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [87]
created: 2026-10-25
---

A persisted outbound queue replayed in order when the server returns; never duplicates.

**Code:** `vsslicer/modules/filament/spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] Spoolman stopped mid-session, three bookings queued, restarted: the queue replays once in order; no duplicate `use` calls (idempotency key in `extra`)
- [ ] The queue survives a restart of the process

## Tasks

- [ ] Write the queue
- [ ] Replay
- [ ] Stop-start test

## Progress

Not started.
