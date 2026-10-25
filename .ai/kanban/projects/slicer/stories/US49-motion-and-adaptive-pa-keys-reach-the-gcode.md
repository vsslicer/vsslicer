---
id: US49
title: "My input shaping, junction deviation and adaptive PA settings reach the G-code"
status: reviewed
epic: VSS:E62
---

As a user with an imported profile, I want input shaping, junction deviation and adaptive PA keys to pass through to the engine, so that the G-code carries my settings.

## Acceptance criteria

- [ ] The capability tables of Orca and CuraEngine carry `input_shaping_*`, junction deviation or jerk and `adaptive_pressure_advance_model` entries (supported, renamed or unsupported, each reviewed)
- [ ] An effect test per supporting engine shows the key changes the G-code; an unsupported entry is asserted
- [ ] A set key that the engine cannot apply produces the unsupported-key warning of US27

## Out of scope

- Writing these keys from the Calibration command (US44, US47)
