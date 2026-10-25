---
id: 42
title: Detect a spool falling below the low threshold
type: feature
priority: P2
effort: S
model: sonnet
area: [consumption]
story: US20
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [40]
created: 2026-10-25
---

After a booking, emit a low-remaining signal when remaining weight crosses the threshold downwards; once per crossing.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] A booking that crosses the threshold emits one signal; a second booking below it emits none; a rise above and a new fall emits again

## Tasks

- [ ] Write the detector
- [ ] Tests

## Progress

Not started.
