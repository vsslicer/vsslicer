---
id: 83
title: "Write the layer and cut files: custom G-code per layer, layer ranges, layer heights, cut information"
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
depends_on: [78, 24]
created: 2026-10-25
---

Writes `custom_gcode_per_layer.xml`, `layer_config_ranges.xml`, `layer_heights_profile.txt` and `cut_information.xml` when the model holds that data. Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Each file read from the fixtures and written back parses to the same structure
- [ ] A file is absent from the output when the model holds no such data
- [ ] Unknown attributes kept raw by the reader are written back
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Four writers
- [ ] Absent-when-empty rule
- [ ] Round-trip tests

## Progress

Not started.
