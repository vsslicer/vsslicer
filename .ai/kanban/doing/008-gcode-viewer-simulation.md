---
id: 8
title: G-code viewer and toolhead simulation
type: spike
priority: P0
effort: L
area: [gcode]
milestone: R1
owner: worker-opus
created: 2026-10-25
---

What it takes to render sliced output and simulate the toolhead with firmware-accurate timing.

Report: `docs/research/gcode-viewer-simulation.md`. Notes: `.reference/notes/VSS-8-gcode-viewer-simulation.md`.

## Acceptance criteria

- [ ] G-code flavours compared (Marlin, Klipper, RepRapFirmware, Bambu, Prusa buddy): dialect differences, metadata comments each slicer emits, thumbnails, object labels
- [ ] Binary G-code (bgcode) format documented: blocks, compression, checksums, libbgcode and its licence
- [ ] Arc moves (G2/G3, G5) and how viewers linearise them
- [ ] Firmware motion planning documented for time estimation and simulation: trapezoidal/S-curve acceleration, junction deviation vs square corner velocity, lookahead, input shaping, pressure advance; what each firmware exposes in config
- [ ] Existing viewers and estimators analysed: PrusaSlicer `GCodeProcessor`/`GCodeViewer`, OrcaSlicer preview, gcode-preview (JS), Mainsail/Fluidd viewers, Klipper estimator (Rust) and its accuracy claims; licences
- [ ] Rendering approaches for a webview compared: line/tube geometry, instanced segments, GPU buffers, layer scrubbing, feature colouring; memory for 50–500 MB G-code
- [ ] Recommendation: parse where, simulate how, render how; what we reimplement vs reuse

## Tasks

- [ ] Read `GCodeProcessor.cpp` and `GCodeViewer.cpp` in PrusaSlicer/Orca; libbgcode
- [ ] Clone gcode-preview, klipper_estimator, Mainsail/Fluidd viewer code; read Klipper/Marlin motion docs
- [ ] Write the report

## Progress

Not started.
