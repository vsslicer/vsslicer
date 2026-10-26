---
id: 24
title: Read Bambu and Orca layer data and cut information
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [22]
created: 2026-10-25
---

Reads `custom_gcode_per_layer.xml`, `layer_config_ranges.xml`, `layer_heights_profile.txt` and `cut_information.xml` into the Project; unknown attributes stay raw.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Each file on the fixtures yields the golden structure; a missing file is fine
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Four readers
- [ ] Golden checks

## Progress

Not started.
