---
id: US15
title: "Imported per-nozzle printer presets become one model with nozzles and overrides"
status: reviewed
epic: VSS:E12
---

A user importing a printer that has one preset per nozzle size sees one printer model with its nozzles, and Prusa `printer_notes` keyword tests become tags.

## Acceptance criteria

- [ ] MK4S 0.4/0.6 and an Orca 0.2/0.4/0.6 printer each become one `printer_model` and its `nozzle` entities; resolving model plus nozzle equals the original preset
- [ ] `printer_notes` keyword tests are tagged through the E11 table; an unknown keyword gives a diagnostic
- [ ] The native form of each original preset stays attached

## Out of scope

- Exporting back to per-nozzle presets beyond what the stored native form allows (E13).
