---
id: US44
title: "Tune VFA, input shaping and cornering"
status: reviewed
epic: VSS:E62
---

As a Klipper or Marlin user, I want VFA, input shaping and junction deviation tests, so that I can avoid resonance speeds and store shaper and cornering values.

## Acceptance criteria

- [ ] VFA sweeps outer-wall speed per layer and the pick writes a resonance-avoidance speed; input shaping sweeps `SET_INPUT_SHAPER` or `M593`, cornering sweeps `SET_VELOCITY_LIMIT` or `M205`
- [ ] The parser detects the intended parameter per block for each generator and firmware (oracle: the sweep definition)
- [ ] Input shaping and cornering write printer keys through US47 (`input_shaping_*`, the junction deviation or jerk key of the flavour)
- [ ] On the H2C these tests are fixtures only (D5: no Klipper hardware)

## Out of scope

- Running the accelerometer measurement itself
