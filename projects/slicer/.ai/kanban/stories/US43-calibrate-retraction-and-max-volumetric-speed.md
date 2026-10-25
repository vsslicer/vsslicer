---
id: US43
title: "Calibrate retraction and maximum volumetric speed"
status: reviewed
epic: VSS:E62
---

As a user tuning a filament, I want a retraction tower and a maximum volumetric speed test, so that I can store the best retraction length and flow limit.

## Acceptance criteria

- [ ] The retraction tower sweeps `retraction_length` per block; the parser detects the intended retraction per block, and a regression test pins the off-by-one layer offset
- [ ] The volumetric speed test ramps feed rate per layer so the parser detects the intended flow per block; picking a block maps to `filament_max_volumetric_speed`
- [ ] Retraction writes `retraction_length`; both write through US47
- [ ] A test per firmware shows the firmware's own command (`G10`/`M207` style per flavour) or a named refusal

## Out of scope

