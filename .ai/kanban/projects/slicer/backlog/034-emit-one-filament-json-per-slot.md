---
id: 34
title: Emit one filament JSON per slot
type: feature
priority: P0
effort: M
model: sonnet
area: [orca]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [31, 7, PRF-135]
created: 2026-10-25
---

Writes a filament preset per material slot in plate order, so multi-material plates get the right filament per extruder.

**Code:** `vsslicer/modules/slicer/orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] A two-slot fixture gives two files in slot order; one slot gives one
- [ ] Slot count must match the plate's filament count or a typed bad-input error is raised
- [ ] Snapshot per slot

## Tasks

- [ ] Slot mapping
- [ ] Write filament presets
- [ ] Snapshots

## Progress

Not started.
