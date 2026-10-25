---
id: 2
title: Feature inventory: PrusaSlicer and SuperSlicer
type: spike
priority: P0
effort: L
area: [slicer]
milestone: R1
created: 2026-10-25
---

Every user-facing slicing and model-prep feature of PrusaSlicer and SuperSlicer, grounded in their settings definitions and GUI code.

Report: `docs/research/features-prusaslicer-superslicer.md`. Notes: `.reference/notes/VSS-2-features-prusaslicer-superslicer.md`.

## Acceptance criteria

- [ ] Every setting category and setting (print, filament, printer, SLA) listed from `PrintConfig.cpp` with type and short meaning, grouped as the GUI groups them; SuperSlicer additions marked
- [ ] Model-prep tools inventoried: cut, boolean/CSG, mesh repair (Netfabb/Windows and built-in), supports/seam/fuzzy-skin/multimaterial painting, modifiers and modifier meshes, variable layer height, text/SVG emboss, measure tool
- [ ] Arrange, per-object/per-region settings, sequential printing, wipe tower and multimaterial (MMU) handling, G-code post-processing scripts and custom G-code placeholders (the placeholder parser) described
- [ ] Calibration and helper tools, SLA pipeline (if present) and export formats (3MF, STL, OBJ, AMF, G-code, bgcode) described
- [ ] Origin of each feature family stated (Slic3r / PrusaSlicer / SuperSlicer) so later cards don't double count
- [ ] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [ ] Enumerate settings from `src/libslic3r/PrintConfig.cpp` (and SuperSlicer's) with a script if useful; put the raw dump in notes
- [ ] Walk `src/slic3r/GUI/` for tools and gizmos
- [ ] Diff SuperSlicer's additions against PrusaSlicer
- [ ] Write the report with a comparison table

## Progress

Not started.
