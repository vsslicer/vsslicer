---
id: 47
title: Wire printer sessions to booking and add the warnings
type: feature
priority: P1
effort: M
model: sonnet
area: [consumption, ui]
story: US13
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [16, 46, PRN-28]
created: 2026-10-25
---

Subscribe to the printers extension's registry (PRN-28 exports), pass sessions to the tracker, expose `filament.booking.<adapter>` settings and show warnings with "Assign spool" and "Enter usage manually" actions.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] An integration test with the fake printer adapter ends a job and a booked event appears on the assigned spool; a second end with the same job id books nothing
- [ ] The unassigned warning appears once per job with an "Assign spool" action; a missing-data warning has "Enter usage manually"
- [ ] Disabling `filament.booking.<adapter>` stops new events

## Tasks

- [ ] Registry wiring
- [ ] Settings
- [ ] Warnings and actions
- [ ] Integration test

## Progress

Not started.
