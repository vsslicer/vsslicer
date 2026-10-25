---
id: 4
title: Define the normalised PrinterStatus
type: feature
priority: P0
effort: M
model: opus
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [2]
created: 2026-10-25
---

The status every adapter maps into, designed with the hardest case (Bambu AMS and HMS) in view.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] State enum `idle|printing|paused|error|busy|offline` plus the vendor state string; temperatures per heater; job (file, progress, remaining time); file position (`byteOffset`, optional `layer`, `percent`); `materials[]` (tray, type, colour, remain); `notifications[]` (code, severity, message, link)
- [ ] Types accommodate an H2C dual-nozzle shape (several toolheads and extruders) in a fixture, checked by a type test
- [ ] Immutable value objects with a `merge` helper for partial pushes (property test: merging full over full is identity)

## Tasks

- [ ] Write the types
- [ ] Write the merge helper
- [ ] Type and property tests

## Progress

Not started.
