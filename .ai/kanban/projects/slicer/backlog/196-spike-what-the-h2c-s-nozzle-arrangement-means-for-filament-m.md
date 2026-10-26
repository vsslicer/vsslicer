---
id: 196
title: "Spike: what the H2C's nozzle arrangement means for `filament_map`"
type: spike
priority: P2
effort: M
model: opus
area: [multimaterial]
story: US55
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [195, PRF-145, PRN-46]
created: 2026-10-25
---

Confirms on the printer and in Orca's H2C machine profile how many nozzles the H2C class has, how `filament_map` and `filament_map_mode` index them, and whether Orca's automatic grouping is right for the H2C.

**Code:** `vsslicer/modules/multimaterial/` (module: `multimaterial`, layer: n/a (spike))

## Acceptance criteria

- [ ] A note in `docs/research/` states the nozzle count and the index meaning, citing the Orca machine profile and the printer's own report (firmware recorded)
- [ ] The note lists the `filament_map_mode` values and what each does on a two-colour fixture sliced by the pinned Orca
- [ ] The decision on whether our own grouping algorithm is needed is stated

## Tasks

- [ ] Read the H2C machine profile
- [ ] Slice a two-colour fixture in each mode
- [ ] Check against the printer
- [ ] Write the note

## Progress

Not started.
