---
id: US40
title: "Print a temperature tower and find the best temperature"
status: reviewed
epic: VSS:E62
---

As a user tuning a new filament, I want a temperature tower generated for my printer and sliced like any plate, so that I can see which temperature prints best.

## Acceptance criteria

- [ ] A "Calibration: Temperature tower" command generates the tower model and its sweep, slices it through the selected engine (Orca and CuraEngine) and opens the preview
- [ ] `@vsslicer/gcode` detects the intended nozzle temperature per block in the generated G-code; the oracle is the sweep definition, and a regression test pins the layer offset (Orca `floor(z-0.4)` style off-by-one)
- [ ] The sweep is applied by the post-processing step at layer changes (`M104`/`M109`), and the spike result on sweep by post-processing versus engine-native modifiers is recorded before the generators are built
- [ ] The picked block writes `nozzle_temperature` of the material through the write-back rules of US47
- [ ] The command is behind the `vsslicer.slicer.calibration` flag

## Out of scope

- Printer-side automatic calibration over MQTT (PRN, P3)
- Wizards that drive the printer's own routines
