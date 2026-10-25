---
id: 3
title: Feature inventory: Bambu Studio and OrcaSlicer
type: spike
priority: P0
effort: L
area: [slicer]
milestone: R1
owner: worker-opus
created: 2026-10-25
---

Every user-facing feature of Bambu Studio and OrcaSlicer, grounded in their settings definitions and GUI code, with what each added over PrusaSlicer.

Report: `docs/research/features-bambustudio-orcaslicer.md`. Notes: `.reference/notes/VSS-3-features-bambustudio-orcaslicer.md`.

## Acceptance criteria

- [x] Every setting category and setting (process, filament, printer) listed from `PrintConfig.cpp` with type and meaning; Bambu Studio vs OrcaSlicer vs PrusaSlicer-inherited marked
- [x] Multi-plate model (plates, plate settings, per-plate slicing, plate-level G-code) explained with code references
- [x] Model-prep tools inventoried: cut, boolean, mesh repair, painting (support/seam/colour/multimaterial), modifiers, variable layer height, text/SVG, measure, auto-orientation, arrange
- [x] Calibration tools (flow, pressure/linear advance, temperature towers, retraction, tolerance, VFA, max flowrate) described with how results feed back into profiles
- [x] Multimaterial: AMS/filament mapping, flush volumes, prime tower, filament change G-code; device/printer panel features (device tab, print queue, camera) summarised
- [x] G-code post-processing, custom G-code placeholders, export formats (3MF with embedded G-code, `.gcode.3mf`) described
- [x] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [x] Enumerate settings from both `PrintConfig.cpp` files, diff against PrusaSlicer's
- [x] Walk GUI for plates, gizmos, calibration (`src/slic3r/GUI/Calibration*`), device panel
- [x] Write the report with comparison tables

## Progress

Done. Three-way settings inventory (Prusa legacy 386 / Bambu 615 / Orca 804 keys, script-checked complete), plates, model-prep tools, calibration tools and their feedback into profiles, AMS/flush/prime tower, device panel, post-processing and `.gcode.3mf` export, all cited to 79df7ae / 09aa0114. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: Bambu-vs-Orca origin per key unverified (shallow clones); enum values and defaults not extracted; two loop-built key sets named by pattern only.
