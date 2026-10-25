---
id: 23
title: Read Bambu and Orca plates and slice info
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US5
milestone: "VSS:M2"
depends_on: [22]
created: 2026-10-25
---

Reads plates from `model_settings.config` and `plate_N.json`, and slice time, weight and filament from `slice_info.config`, with the plate image and G-code part names.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Plate list, object-to-plate assignment, thumbnail and G-code part names, and slice time and weight match the golden on the Bambu and Orca fixtures
- [ ] A plate with no slice info is reported as unsliced, not an error
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Plate metadata
- [ ] slice_info.config
- [ ] Golden checks

## Progress

Not started.
