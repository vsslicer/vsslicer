---
id: US39
title: "A new user picks a model, nozzle and material and gets a resolved printer instance"
status: reviewed
epic: VSS:E17
---

A user with no installed slicer picks vendor, printer model, nozzle per toolhead, surface, feeder and materials and ends with a `printer_instance` whose resolved process matches the native result.

## Acceptance criteria

- [ ] For a Prusa, an Orca-vendor, a Bambu and a Cura fixture the steps produce an instance whose `resolve` equals the E13 tuple oracle
- [ ] The material step lists exactly the compatible materials (a 0.6 mm profile is never offered for a 0.4 mm nozzle); a dual-nozzle model asks per toolhead

## Out of scope

- Calibration; discovery itself.
