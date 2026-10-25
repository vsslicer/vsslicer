---
id: US45
title: "Print static test models from the Calibration command"
status: reviewed
epic: VSS:E62
---

As a user, I want a cube, tolerance test, bed levelling test and ironing patterns available from the Calibration command, so that I can slice and print them like any plate.

## Acceptance criteria

- [ ] The Calibration command lists the static models; choosing one produces a plate sliced and previewed through the normal engine path
- [ ] Every shipped model has a recorded licence; Orca's bundled models are shipped only after a per-file licence check
- [ ] The models ship as data in the module, not in the extension code

## Out of scope

- A model editor or parametric models beyond the four listed families
