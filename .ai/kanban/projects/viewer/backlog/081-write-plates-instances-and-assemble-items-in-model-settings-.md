---
id: 81
title: "Write plates, instances and assemble items in model_settings.config"
type: feature
priority: P1
effort: M
model: opus
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [80, 23]
created: 2026-10-25
---

Writes the plate records, instance-to-plate assignment and assemble items. Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/core/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Plates, plate names and instance assignment match the reader goldens on the Bambu and Orca fixtures after a read, write and read
- [ ] A plate with no objects is written and read back
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Plate records
- [ ] Instances and assemble items
- [ ] Round-trip tests

## Progress

Not started.
