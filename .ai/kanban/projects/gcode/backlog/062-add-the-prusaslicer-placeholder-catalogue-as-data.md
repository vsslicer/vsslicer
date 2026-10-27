---
id: 62
title: Add the PrusaSlicer placeholder catalogue as data
type: feature
priority: P2
effort: S
model: sonnet
area: [language]
story: US41
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [60]
created: 2026-10-25
---

Runs the generator on `PrusaSlicer@30ef591` and commits `prusa.json`. Ported as data from PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/PrintConfig.cpp:6414-6468 (AGPL-3.0, D2): the file carries the notice and a `Ported from` line with the repo, commit and path.

**Code:** `vsslicer/modules/core/gcode-templates/src/domain/catalogue/data/` (module: `gcode-templates`, layer: `domain`)

## Acceptance criteria

- [ ] The eight kinds of the source (`start_filament_gcode`, `end_filament_gcode`, `end_gcode`, `before_layer_gcode`, `layer_gcode`, `toolchange_gcode`, `color_change_gcode`, `pause_print_gcode`) carry exactly the source's placeholder lists
- [ ] Kinds without an entry in the map (start_gcode and similar) are listed as `no specific placeholders` so they still get option variables
- [ ] The licence check passes

## Tasks

- [ ] Run generator
- [ ] Add notices
- [ ] Count tests

## Progress

Not started.
