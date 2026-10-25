---
id: 3
title: Feature inventory: Bambu Studio and OrcaSlicer
type: spike
priority: P0
effort: L
area: [slicer]
milestone: R1
created: 2026-10-25
---

Every user-facing feature of Bambu Studio and OrcaSlicer, grounded in their settings definitions and GUI code, with what each added over PrusaSlicer.

Report: `docs/research/features-bambustudio-orcaslicer.md`. Notes: `.reference/notes/VSS-3-features-bambustudio-orcaslicer.md`.

## Acceptance criteria

- [ ] Every setting category and setting (process, filament, printer) listed from `PrintConfig.cpp` with type and meaning; Bambu Studio vs OrcaSlicer vs PrusaSlicer-inherited marked
- [ ] Multi-plate model (plates, plate settings, per-plate slicing, plate-level G-code) explained with code references
- [ ] Model-prep tools inventoried: cut, boolean, mesh repair, painting (support/seam/colour/multimaterial), modifiers, variable layer height, text/SVG, measure, auto-orientation, arrange
- [ ] Calibration tools (flow, pressure/linear advance, temperature towers, retraction, tolerance, VFA, max flowrate) described with how results feed back into profiles
- [ ] Multimaterial: AMS/filament mapping, flush volumes, prime tower, filament change G-code; device/printer panel features (device tab, print queue, camera) summarised
- [ ] G-code post-processing, custom G-code placeholders, export formats (3MF with embedded G-code, `.gcode.3mf`) described
- [ ] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [ ] Enumerate settings from both `PrintConfig.cpp` files, diff against PrusaSlicer's
- [ ] Walk GUI for plates, gizmos, calibration (`src/slic3r/GUI/Calibration*`), device panel
- [ ] Write the report with comparison tables

## Progress

Not started.
