---
id: US19
title: "Usage without a spool is never lost"
status: reviewed
epic: VSS:E42
---

As a user who forgot to assign a spool, I want the usage booked to an unassigned bucket per printer with one warning, so that nothing is dropped and I can reassign later.

## Acceptance criteria

- [ ] Unassigned tool usage lands in the bucket and raises one warning per job with an "Assign spool" action
- [ ] Reassigning moves the event to the chosen spool

## Out of scope

- Spool picker UI (E43)
