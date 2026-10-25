---
id: US55
title: "Group filaments to nozzles on a dual-nozzle printer"
status: reviewed
epic: VSS:E63
---

As a dual-nozzle printer owner, I want to map filaments to nozzles by hand or let the slicer group them, so that tool changes follow my plan.

## Acceptance criteria

- [ ] `filament_map` and `filament_map_mode` are editable per plate (manual or automatic)
- [ ] A manual map is honoured in the tool changes of the G-code (effect test)
- [ ] In automatic mode the grouping the engine chose is read back from the output and shown; it matches Orca's grouping on fixtures
- [ ] A spike records what the H2C's nozzle arrangement means for `filament_map`

## Out of scope

