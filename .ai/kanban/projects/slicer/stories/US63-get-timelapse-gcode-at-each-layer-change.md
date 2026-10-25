---
id: US63
title: "Get timelapse G-code at each layer change"
status: reviewed
epic: VSS:E64
---

As a user with a timelapse profile, I want the timelapse G-code at every layer change, so that the printer takes its frames.

## Acceptance criteria

- [ ] `time_lapse_gcode` and `timelapse_type` pass through for profiles that set them and appear at each layer change in the output (effect test)
- [ ] For Cura, which has no engine key, a built-in step offers the TimeLapse behaviour and runs only when no engine key exists
- [ ] Placeholders in the template are kept unchanged

## Out of scope

- Timelapse retrieval from printers (PRN)
