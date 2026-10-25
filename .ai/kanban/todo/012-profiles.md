---
id: 12
title: Printer, process and material profiles
type: spike
priority: P0
effort: L
area: [profiles]
milestone: R1
created: 2026-10-25
---

Profile formats across slicers, their inheritance rules, where vendor profiles live and under what licence, and a unified schema for us.

Report: `docs/research/profiles.md`. Notes: `.reference/notes/VSS-12-profiles.md`.

## Acceptance criteria

- [ ] PrusaSlicer ini bundles documented: `PrusaResearch.ini` structure, `inherits`, `*common*` sections, vendor index/update mechanism, `compatible_printers_condition` expressions, physical printers
- [ ] OrcaSlicer/Bambu Studio JSON profiles documented: `profiles/<vendor>/*.json`, `inherits`, `instantiation`, `filament_vendor`, machine/process/filament split, `.orca_printer` and `.orca_filament` bundles, user presets and sync
- [ ] Cura documented: `definitions/*.def.json` inheritance, `extruders/`, `variants/`, `quality/` and `intent/`, `setting_version`, machine instances
- [ ] Nozzle/toolhead modelling compared (variants vs printer-per-nozzle vs nozzle fields)
- [ ] Vendor profile repos and their licences checked (PrusaSlicer-settings, Orca `resources/profiles`, Bambu `resources/profiles`, Cura `resources/`, fdm_materials); what we may redistribute
- [ ] A unified profile schema proposal: entities (printer, nozzle/toolhead, material, process), inheritance, compatibility conditions, and a mapping table from each slicer's keys with lossy spots marked
- [ ] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [ ] Read `Preset.cpp`/`PresetBundle.cpp` in PrusaSlicer and Orca, `ContainerRegistry`/`MachineManager` in Cura
- [ ] Sample vendor profiles; check LICENSE files
- [ ] Write the report

## Progress

Not started.
