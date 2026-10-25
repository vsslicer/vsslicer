---
id: US47
title: "Write the picked value back into my profile"
status: reviewed
epic: VSS:E62
---

As a user, I want the picked value stored in my material or printer profile as a new preset, so that later prints use it and I can undo it.

## Acceptance criteria

- [ ] Write-back changes exactly one key in the target profile; the default target is a new user preset, an update of the existing one is a choice
- [ ] A diff of the preset is shown before the write and the write is undoable
- [ ] The written preset round-trips through the native export of PRF (checked per ecosystem for the keys of every generator)
- [ ] The keys are `nozzle_temperature`, `filament_flow_ratio`, `pressure_advance`, `retraction_length`, `filament_max_volumetric_speed`, the VFA speed and the printer's shaper and cornering keys
- [ ] The whole feature is behind the flag `vsslicer.slicer.calibration`

## Out of scope

- Bulk apply to several profiles
