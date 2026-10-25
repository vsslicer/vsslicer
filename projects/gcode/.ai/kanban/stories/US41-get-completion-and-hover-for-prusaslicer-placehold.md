---
id: US41
title: "Get completion and hover for PrusaSlicer placeholders"
status: reviewed
epic: VSS:E50
---

As a user who writes custom G-code in a PrusaSlicer or SuperSlicer profile, I want the same completion and hover for the placeholders PrusaSlicer fills in, so that Prusa profiles are as well supported as Orca ones.

## Acceptance criteria

- [ ] Every placeholder in the Prusa catalogue (from `PrusaSlicer@30ef591`, the legacy `PrintConfig.cpp` `s_CustomGcodeSpecificPlaceholders` and its definitions) completes and hovers in its template kinds
- [ ] Template kinds use PrusaSlicer's native key names (`start_filament_gcode`, `toolchange_gcode`, `color_change_gcode` and the rest) and map to the canonical profile keys from `profile-api`

## Out of scope

- Cura `{setting}` substitution beyond completion of setting names (out of scope in the epic).
