---
id: 74
title: "Handle a tag payload: match or create the spool and observe consumed weight"
type: feature
priority: P2
effort: M
model: sonnet
area: [tags]
story: US32
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [73, 70, PRN-320]
created: 2026-10-25
---

A payload from a printer connector becomes a match-or-create decision through the same flow as Bambu trays, and the consumed weight is recorded as an observation compared with bookings.

UNRESOLVED: needs printer-api: a capability flag and an event carrying tag payload bytes (the spike states the shape).

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Fixture payloads create or match spools through the shared flow; a malformed payload rejects that tag only and never touches the store
- [ ] The consumed weight is stored as an observation and flagged on disagreement through the E42 rule

## Tasks

- [ ] Write the handler
- [ ] Fixture tests

## Progress

Not started.
