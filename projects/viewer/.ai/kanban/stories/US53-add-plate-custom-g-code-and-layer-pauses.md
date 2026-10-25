---
id: US53
title: "Add plate custom G-code and layer pauses, colour changes and custom G-code"
status: reviewed
epic: VSS:E34
---

As a user, I want custom G-code per plate and entries at layer heights (pause, colour change, tool change, custom), so that I can plan a multicolour or paused print.

## Acceptance criteria

- [ ] Entries added in the editor are stored per plate in `custom_gcode_per_layer.xml` and the sliced G-code contains them at the right layer of the right plate only (Orca CLI oracle)
- [ ] Plate custom G-code appears in that plate's G-code only
- [ ] A height not on a layer boundary snaps to the nearest layer and says so
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Interactive height-range tool (E54)
