---
id: US10
title: "Nozzles, materials and multi-tool printers are expressible in the schema"
status: reviewed
epic: VSS:E11
---

A developer modelling a printer expresses per-nozzle presets as `printer_model` + `nozzle` + `overrides`, materials with their ids and costs, and Prusa XL 2T, Orca IDEX and H2C dual-extruder machines with per-extruder values and no positional arrays.

## Acceptance criteria

- [ ] A per-nozzle Prusa printer preset is expressed as `printer_model` + `nozzle` + `overrides` and validates
- [ ] `material` carries type, diameter, density, cost, temperatures, flow and `external_ids` (Cura GUID, Bambu and Orca filament ids, Prusa name)
- [ ] XL 2T, IDEX and H2C dual-extruder fixtures validate and keep per-extruder values; a positional array fails
- [ ] Verified on fixtures only (D5)

## Out of scope

- Importing these printers from native files (E12).
