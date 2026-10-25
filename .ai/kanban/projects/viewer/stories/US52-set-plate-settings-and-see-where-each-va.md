---
id: US52
title: "Set plate settings and see where each value comes from"
status: reviewed
epic: VSS:E34
---

As a user, I want to set bed type, print sequence, spiral mode and filament order per plate and see the layering global, plate, object, part for every value, so that I know why a value applies.

## Acceptance criteria

- [ ] Bed type, print sequence, spiral mode, filament order and maps are set per plate by undoable commands and saved in the plate config
- [ ] The override form shows the source of each value: global, plate, object or part
- [ ] A plate setting appears in that plate's sliced G-code only (Orca CLI oracle)
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Filament-to-extruder mapping UI for multi-material (SLC)
