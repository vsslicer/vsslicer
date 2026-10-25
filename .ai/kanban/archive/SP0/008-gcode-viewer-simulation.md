---
id: 8
title: G-code viewer and toolhead simulation
type: spike
priority: P0
effort: L
area: [gcode]
milestone: R1
sprint: SP0
owner: worker-opus
created: 2026-10-25
---

What it takes to render sliced output and simulate the toolhead with firmware-accurate timing.

Report: `docs/research/gcode-viewer-simulation.md`. Notes: `.reference/notes/VSS-8-gcode-viewer-simulation.md`.

## Acceptance criteria

- [x] G-code flavours compared (Marlin, Klipper, RepRapFirmware, Bambu, Prusa buddy): dialect differences, metadata comments each slicer emits, thumbnails, object labels
- [x] Binary G-code (bgcode) format documented: blocks, compression, checksums, libbgcode and its licence
- [x] Arc moves (G2/G3, G5) and how viewers linearise them
- [x] Firmware motion planning documented for time estimation and simulation: trapezoidal/S-curve acceleration, junction deviation vs square corner velocity, lookahead, input shaping, pressure advance; what each firmware exposes in config
- [x] Existing viewers and estimators analysed: PrusaSlicer `GCodeProcessor`/`GCodeViewer`, OrcaSlicer preview, gcode-preview (JS), Mainsail/Fluidd viewers, Klipper estimator (Rust) and its accuracy claims; licences
- [x] Rendering approaches for a webview compared: line/tube geometry, instanced segments, GPU buffers, layer scrubbing, feature colouring; memory for 50–500 MB G-code
- [x] Recommendation: parse where, simulate how, render how; what we reimplement vs reuse

## Tasks

- [x] Read `GCodeProcessor.cpp` and `GCodeViewer.cpp` in PrusaSlicer/Orca; libbgcode
- [x] Clone gcode-preview, klipper_estimator, Mainsail/Fluidd viewer code; read Klipper/Marlin motion docs
- [x] Write the report

## Progress

Done. Flavours and slicer metadata, bgcode (libbgcode), arcs, motion planning (trapezoid, junction deviation vs SCV, lookahead, input shaping, pressure advance) verified against klipper `toolhead.py` and Marlin `planner.cpp`, existing viewers/estimators with licences, webview rendering and memory approaches, recommendation. Flags that klipper_estimator's MIT planner is a near line-by-line translation of GPL Klipper code: reimplement from Kinematics.md and use the estimator only as an oracle. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: RRF motion details, Bambu private M-codes, estimator accuracy (unmeasured).
