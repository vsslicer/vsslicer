---
id: US2
title: "Spool usage is always the sum of an append-only event log"
status: reviewed
epic: VSS:E40
---

As a spool owner, I want every gram booked, measured or corrected to be an event in an append-only log, so that a spool's used weight is always derivable and never drifts from its history.

## Acceptance criteria

- [ ] Property tests: for any sequence of book, measure, duplicate and replayed events, `used_weight == sum(events)` and remaining = initial - used
- [ ] Replaying the log from empty reproduces the snapshot byte for byte
- [ ] A duplicate event id is ignored
- [ ] A scale reading is an absolute gross weight recorded as a `scale` correction event so the sum still holds

## Out of scope

- UI, importers, printer feedback
