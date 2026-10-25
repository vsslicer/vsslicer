---
id: E62
title: Generate calibration prints and write the picked value back into the profile
status: draft
initiative: I10
project: SLC
order: 6
depends_on: [E26, E27, E29, E30, E13, E66, E28, E30]
rows: ["§6 Temperature tower", "§6 Flow, pressure advance, retraction, max volumetric speed", "§6 Motion tests (VFA, input shaping, cornering)", "§6 Static test models (cube, tolerance, bed levelling, ironing patterns)", "§2 Input shaping and junction deviation emission, adaptive PA"]
---

Calibration prints in VS Code: temperature, flow ratio, pressure advance, retraction, max volumetric speed, VFA, input shaping and cornering tests, plus the static test models. Each test is a model plus a per-layer (or per-block) parameter sweep (`features-bambustudio-orcaslicer.md` §4); after printing, the user picks the best block in the preview and VSSlicer writes the value into the material or printer profile. That write-back is the improvement over every slicer except Bambu's wizards. It is for anyone tuning a new filament or printer.

## Scope

In:
- Generators in `vsslicer.slicer`: a test model (bundled data, or generated geometry for PA line and pattern) plus a sweep, sliced through the normal engine path (E26, E27), with the sweep applied by a post-processing step at layer changes (E29's step runner): `M104`/`M109` for temperature, `SET_PRESSURE_ADVANCE`/`M900` per firmware for PA, retraction length, outer-wall speed for VFA and max volumetric speed, `SET_INPUT_SHAPER` or `M593` for input shaping, `SET_VELOCITY_LIMIT`/`M205` for junction deviation or jerk.
- PA line and pattern paths and the sweep formulas may be ported from OrcaSlicer `calib.cpp`/`GCode.cpp` (AGPL-3.0, D2) with provenance lines; the roadmap's clean-room rule no longer applies.
- Static test models (cube, tolerance, bed levelling, ironing patterns) as data; Orca's bundled models only after a per-file licence check (BO Licence notes).
- Pick-and-write-back: a webview or quick pick that maps the chosen block to its value (layer ranges come from the parser) and writes it to the profile through `ProfileStore` (E13), as a new user preset or an update, with undo.
- §2 Input shaping and junction deviation emission, adaptive PA: emission keys (`input_shaping_*`, `adaptive_pressure_advance_model`) added to the capability table (E30) and set by the motion tests' write-back.

Out: printer-side automatic calibration over MQTT (PRN, P3), Bambu's per-AMS-slot K tables (PRN), wizards that drive the printer's own routines.

## Feature-matrix rows

- §6 Temperature tower (P2): sweep detected per block; value written to `nozzle_temperature` of the material.
- §6 Flow, pressure advance, retraction, max volumetric speed (P2): YOLO and two-pass flow, PA line/pattern/tower, retraction tower, MVS; each writes its key (`filament_flow_ratio`, `pressure_advance`, `retraction_length`, `filament_max_volumetric_speed`).
- §6 Motion tests (VFA, input shaping, cornering) (P2): VFA writes a resonance-avoidance band; input shaping and cornering write printer keys.
- §6 Static test models (P2): models available from a "Calibration" command and sliced like any plate.
- §2 Input shaping and junction deviation emission, adaptive PA (P2): keys pass through to Orca and are covered by an effect test.

## Acceptance criteria

- [ ] For each generator, `@vsslicer/gcode` detects the intended parameter per layer or block in the generated G-code (oracle: the sweep definition; regression: off-by-one layer offset as in Orca's `floor(z-0.4)` retraction formula)
- [ ] Firmware variants (Klipper, Marlin, RRF, Bambu) emit their own commands; a test per firmware and generator
- [ ] Write-back changes exactly one key in the target profile and is undoable; round trip through PRF's native export is checked
- [ ] Generators refuse a printer whose firmware lacks the command (for example input shaping on Bambu) with a message naming the reason
- [ ] On the H2C: temperature tower, flow and PA tests printed once each, firmware recorded; motion tests are fixtures only (D5: no Klipper hardware)

## Dependencies

- Needs E26, E27, E29 (post-processing step runner), E30 (capability table to extend), E13 (profile write API), E66 (plate from generated model), E28 (sweep detection), E30 (preview where the user picks the block).
- Exposes `Calibration.run(test, params)` and the sweep definitions for reuse by PRN if printer-side calibration is reopened.

## Risks and spikes

- Spike: sweep by post-processing versus engine-native modifiers (layer-range modifiers in the 3MF). Post-processing is engine-independent but fights engine temperature commands; the spike slices a tower both ways on Orca and CuraEngine.
- Risk: E13 may expose `resolve` without a write API; needs a `ProfileStore.update` (coordinator to confirm with PRF).
- Risk: epic size near the six-sprint limit; split point if needed: "sweep towers" (temperature, retraction, MVS, VFA) and "path generators" (PA line and pattern, flow).

## Eng review

- Scope challenge: all generators share one sweep engine, one pick UI and one write-back; splitting by test would triplicate those. The split point above is recorded in case sprints overrun.
- Tests: parser-detected sweeps are deterministic; hardware results are judgement and recorded only as notes.
- Blast radius: a wrong write-back silently changes later prints, so it writes a new user preset by default and shows a diff.
- Reversibility: undo plus the preset diff; feature flag `vsslicer.slicer.calibration`.
