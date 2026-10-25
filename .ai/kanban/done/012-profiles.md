---
id: 12
title: Printer, process and material profiles
type: spike
priority: P0
effort: L
area: [profiles]
milestone: R1
owner: worker-opus
created: 2026-10-25
---

Profile formats across slicers, their inheritance rules, where vendor profiles live and under what licence, and a unified schema for us.

Report: `docs/research/profiles.md`. Notes: `.reference/notes/VSS-12-profiles.md`.

## Acceptance criteria

- [x] PrusaSlicer ini bundles documented: `PrusaResearch.ini` structure, `inherits`, `*common*` sections, vendor index/update mechanism, `compatible_printers_condition` expressions, physical printers
- [x] OrcaSlicer/Bambu Studio JSON profiles documented: `profiles/<vendor>/*.json`, `inherits`, `instantiation`, `filament_vendor`, machine/process/filament split, `.orca_printer` and `.orca_filament` bundles, user presets and sync
- [x] Cura documented: `definitions/*.def.json` inheritance, `extruders/`, `variants/`, `quality/` and `intent/`, `setting_version`, machine instances
- [x] Nozzle/toolhead modelling compared (variants vs printer-per-nozzle vs nozzle fields)
- [x] Vendor profile repos and their licences checked (PrusaSlicer-settings, Orca `resources/profiles`, Bambu `resources/profiles`, Cura `resources/`, fdm_materials); what we may redistribute
- [x] A unified profile schema proposal: entities (printer, nozzle/toolhead, material, process), inheritance, compatibility conditions, and a mapping table from each slicer's keys with lossy spots marked
- [x] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [x] Read `Preset.cpp`/`PresetBundle.cpp` in PrusaSlicer and Orca, `ContainerRegistry`/`MachineManager` in Cura
- [x] Sample vendor profiles; check LICENSE files
- [x] Write the report

## Progress

Done. PrusaSlicer INI bundles (2.9.6 sparse clone b028299) and the 3.0 YAML presets, Orca/Bambu JSON profiles and bundles, Cura definitions/variants/quality/intent, nozzle modelling comparison, vendor repo licences, unified schema with a 56-key mapping table; PrusaSlicer-settings a40f669 and fdm_materials 0c05969 cloned. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: current Prusa profile repos have no LICENSE file; whether AGPL covers profile data needs an owner decision; third-party bundle upstream licences unassessed.
