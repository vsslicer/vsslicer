---
id: US51
title: "Get flush volumes computed from my filament colours"
status: reviewed
epic: VSS:E63
---

As an AMS or MMU user, I want the flush matrix computed from my filament colours, so that colour changes use as little filament as needed.

## Acceptance criteria

- [ ] The flush calculator is a port of `OrcaSlicer@09aa0114:src/libslic3r/FlushVolCalc.cpp` with provenance, the 20000 mm3 cap and a multiplier; the cap follows the selected engine (Orca 20000, Bambu-style 900)
- [ ] The matrix equals the pinned Orca's for every fixture colour set (oracle: Orca's own `project_settings.config` after recalculation)
- [ ] The matrix recalculates when a filament or colour changes, and manually edited cells survive the recalculation
- [ ] `change_filament_gcode` placeholder names stay unchanged
- [ ] The calculator is a library other modules can call (PRN send-time remapping)

## Out of scope

- AMS slot mapping at send (PRN)
