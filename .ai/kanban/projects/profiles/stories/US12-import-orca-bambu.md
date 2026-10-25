---
id: US12
title: "A user imports Orca and Bambu Studio profiles including the H2C"
status: reviewed
epic: VSS:E12
---

A user of Orca or Bambu Studio gets vendor trees and their own presets as unified entities, including the H2C and H2D extruder-variant arrays as keyed per-extruder values.

## Acceptance criteria

- [ ] Golden counts: Orca@09aa0114 70 vendors plus OrcaFilamentLibrary; Bambu@79df7ae 12 vendors including the 11 `Bambu Lab H2C` machine files
- [ ] Resolution order parent, then includes, then own keys is proven on a fixture; `nil` falls through
- [ ] Orca `user/<id>/` presets with `.info` sidecars import with parent links
- [ ] Invalid JSON, unknown `type` and missing include give diagnostics and other entities still import

## Out of scope

- `.orca_*` and `.bbscfg` bundles (E18).
