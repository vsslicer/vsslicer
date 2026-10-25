---
id: 61
title: Add the Orca and Bambu placeholder catalogue as data
type: feature
priority: P2
effort: M
model: sonnet
area: [language]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [60]
created: 2026-10-25
---

Runs the generator on `OrcaSlicer@09aa0114` and commits the result under `src/domain/catalogue/data/orca.json` with reviewed labels and tooltips. Ported as data from OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:13656-13793 (AGPL-3.0, D2): the file carries the notice and a `Ported from` line with the repo, commit and path.

**Code:** `vsslicer/modules/gcode-templates/src/domain/catalogue/data/` (module: `gcode-templates`, layer: `domain`)

## Acceptance criteria

- [ ] Every template kind of the Orca map is present (machine start/end, layer change, before layer change, time-lapse, change filament, pause, custom, extrusion-role change, filament start/end and the rest) with the placeholder lists the source gives, e.g. `change_filament_gcode` carries `next_extruder` and `toolchange_z`-class keys
- [ ] A count test pins the number of kinds and placeholder links against the source; the licence check passes on the notice and `Ported from` lines
- [ ] A kind with an empty list in the source (machine pause, custom) is kept with no placeholders, not dropped

## Tasks

- [ ] Run generator
- [ ] Review text
- [ ] Add notices
- [ ] Count tests

## Progress

Not started.
