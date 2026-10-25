---
id: 2
title: Feature inventory: PrusaSlicer and SuperSlicer
type: spike
priority: P0
effort: L
area: [slicer]
milestone: R1
owner: worker-opus
created: 2026-10-25
---

Every user-facing slicing and model-prep feature of PrusaSlicer and SuperSlicer, grounded in their settings definitions and GUI code.

Report: `docs/research/features-prusaslicer-superslicer.md`. Notes: `.reference/notes/VSS-2-features-prusaslicer-superslicer.md`.

## Acceptance criteria

- [x] Every setting category and setting (print, filament, printer, SLA) listed from `PrintConfig.cpp` with type and short meaning, grouped as the GUI groups them; SuperSlicer additions marked
- [x] Model-prep tools inventoried: cut, boolean/CSG, mesh repair (Netfabb/Windows and built-in), supports/seam/fuzzy-skin/multimaterial painting, modifiers and modifier meshes, variable layer height, text/SVG emboss, measure tool
- [x] Arrange, per-object/per-region settings, sequential printing, wipe tower and multimaterial (MMU) handling, G-code post-processing scripts and custom G-code placeholders (the placeholder parser) described
- [x] Calibration and helper tools, SLA pipeline (if present) and export formats (3MF, STL, OBJ, AMF, G-code, bgcode) described
- [x] Origin of each feature family stated (Slic3r / PrusaSlicer / SuperSlicer) so later cards don't double count
- [x] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [x] Enumerate settings from `src/libslic3r/PrintConfig.cpp` (and SuperSlicer's) with a script if useful; put the raw dump in notes
- [x] Walk `src/slic3r/GUI/` for tools and gizmos
- [x] Diff SuperSlicer's additions against PrusaSlicer
- [x] Write the report with a comparison table

## Progress

Done. Every setting of PrusaSlicer (30ef591, 3.0.0-alpha12 `slic3r-domain` definitions plus legacy `PrintConfig.cpp`) and SuperSlicer (1f3d287) listed by GUI group with the 356 SuperSlicer-only keys marked; model-prep tools, arrange, per-object settings, wipe tower/MMU, placeholder parser, post-processing, calibration, SLA and exports covered with origins. The report separates code 3.0 builds from unbuilt 2.9 leftovers. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: a few pre-2.3 feature origins and 3.0's replacements for the G-code editor, wizard and firmware dialog are marked unverified.
