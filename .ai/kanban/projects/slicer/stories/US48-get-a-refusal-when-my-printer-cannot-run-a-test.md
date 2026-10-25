---
id: US48
title: "Get a clear refusal when my printer cannot run a test"
status: reviewed
epic: VSS:E62
---

As a user, I want a calibration to refuse a printer whose firmware lacks the command, so that I do not waste a print.

## Acceptance criteria

- [ ] A table maps each parameter to the command of Klipper, Marlin, RRF and Bambu; a missing command refuses with a message naming the firmware, the parameter and the missing command (for example input shaping on Bambu)
- [ ] One test per firmware and generator covers either the emitted command or the refusal
- [ ] The refusal appears as a notification before any slicing starts

## Out of scope

