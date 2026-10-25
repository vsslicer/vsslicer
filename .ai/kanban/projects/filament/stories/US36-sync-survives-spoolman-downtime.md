---
id: US36
title: "Sync survives Spoolman downtime"
status: reviewed
epic: VSS:E45
---

As a user whose Spoolman is sometimes off, I want pushes queued while it is unreachable and replayed in order, so that no booking is lost or duplicated.

## Acceptance criteria

- [ ] Spoolman stopped mid-session, three bookings queued, restarted: the queue replays once in order; no duplicate `use` calls (idempotency key in `extra`)
- [ ] Unreachable server, 404 spool and a rejected write each surface in the status item and output channel

## Out of scope

- Multi-user conflict resolution beyond last-writer-wins
