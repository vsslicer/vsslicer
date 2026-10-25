---
id: US42
title: "Calibrate pressure advance with line, pattern or tower"
status: reviewed
epic: VSS:E62
---

As a user of a Klipper, Marlin, RRF or Bambu printer, I want pressure advance tests (line, pattern and tower), so that I can find K for a filament and store it.

## Acceptance criteria

- [ ] The PA tower sweeps the firmware's PA command per layer (`SET_PRESSURE_ADVANCE`, `M900`, `M572`); the PA line and pattern paths are generated and ported from OrcaSlicer `calib.cpp` with provenance lines (D2)
- [ ] The parser detects the intended PA value per block or per line group for each firmware; a test per firmware and generator
- [ ] The pick maps to `pressure_advance` of the material through US47
- [ ] Adaptive PA (`adaptive_pressure_advance_model`) is not written by these tests; it only passes through (US49)

## Out of scope

- Bambu per-AMS-slot K tables (PRN)
