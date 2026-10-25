---
id: US11
title: "A user imports PrusaSlicer and SuperSlicer bundles and user presets"
status: reviewed
epic: VSS:E12
---

A user who owns PrusaSlicer or SuperSlicer profiles gets their printers, filaments and prints as unified entities, with the native form kept beside each, without retyping a setting.

## Acceptance criteria

- [ ] Golden counts for `PrusaResearch.ini@b028299`: 1 vendor, 35 printer models, 238 printers, 633 prints, 6 069 filaments; every abstract section removed after flattening
- [ ] SuperSlicer INI imports through the same dialect with its 356 extra keys mapped or listed native-only
- [ ] Every imported entity validates against the schema; every native key is mapped or listed native-only in the diagnostics
- [ ] Cycle, unknown parent and malformed INI line each give a diagnostic with file and line and leave other entities importable

## Out of scope

- Persisting results (E13); UI commands (E14).
