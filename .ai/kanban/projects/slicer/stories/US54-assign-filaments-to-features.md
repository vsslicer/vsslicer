---
id: US54
title: "Assign filaments to features"
status: reviewed
epic: VSS:E63
---

As a multi-material user, I want to say which filament prints walls, infill, support and adhesion, so that special features use the right material.

## Acceptance criteria

- [ ] Orca `*_filament_id` keys and Cura support and adhesion extruder settings are editable, with the keys taken from each engine's capability table
- [ ] Tool numbers per role in the parsed G-code match the assignment, for Orca and CuraEngine (effect test)
- [ ] An engine that cannot honour an assignment shows a warning naming the key

## Out of scope

- Multi-tool presets (PRF)
