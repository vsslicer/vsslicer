---
id: 190
title: Write the picked value to a new user preset through ProfileStore
type: feature
priority: P2
effort: M
model: sonnet
area: [tasks, calibration]
story: US47
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [189, 147, PRF-140, PRF-144]
created: 2026-10-25
---

Applies the one-key patch of the plan: saves a new user preset by default or updates the existing one, and keeps what is needed to undo.

**Code:** `vsslicer/modules/apps/slicer/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] Exactly one key differs between the original and the written preset for every test in the catalogue (store diff test)
- [ ] Undo restores the previous preset, or deletes the new one, and a second undo is refused
- [ ] The written preset exports through the native exporters of PRF for each ecosystem with the key in its native name (round trip)

## Tasks

- [ ] Write-back use case
- [ ] Undo record
- [ ] Native export round trip
- [ ] Tests

## Progress

Not started.
