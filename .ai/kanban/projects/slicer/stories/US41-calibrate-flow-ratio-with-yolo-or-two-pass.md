---
id: US41
title: "Calibrate the flow ratio with YOLO or two-pass"
status: reviewed
epic: VSS:E62
---

As a user tuning a filament, I want flow-ratio tests (YOLO and two-pass) that sweep the ratio per block, so that I can pick the best surface and store the ratio.

## Acceptance criteria

- [ ] Both flow variants generate their model and sweep; the parser detects the intended flow factor per block in the G-code of every supported firmware (oracle: the sweep definition)
- [ ] Two-pass flow starts its second sweep around the first pass's pick, and the pick maps to `filament_flow_ratio` through the write-back rules of US47
- [ ] A test per firmware (Klipper, Marlin, RRF, Bambu) shows the firmware's own command or a refusal that names the reason (US48)

## Out of scope

- Per-AMS-slot flow tables on the printer (PRN)
