---
id: US14
title: "A Prusa 3.0 early adopter imports the YAML preset tree"
status: reviewed
epic: VSS:E12
---

A user trying PrusaSlicer 3.0 imports its YAML vendor and preset trees behind an experimental flag pinned to one commit.

## Acceptance criteria

- [ ] Golden counts at `@30ef591`: 288 filament, 13 print, 11 printer, 12 tool presets; `vendor.yaml` 17 printers, 32 printer_configs, 10 tools, 3 feeders, 6 sheets
- [ ] Without the experimental flag the reader returns a diagnostic and no entities
- [ ] The tests are tagged so a format change shows as a failing pinned test

## Out of scope

- Following later 3.0 changes.
