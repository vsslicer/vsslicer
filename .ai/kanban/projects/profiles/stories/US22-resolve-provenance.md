---
id: US22
title: "A slicer adapter resolves a profile and sees where every value came from"
status: reviewed
epic: VSS:E13
---

A slicer adapter or the form calls `resolve(printerInstance, material[], process)` and gets the unified values with a provenance trail, plus the compatible materials and processes for a printer.

## Acceptance criteria

- [ ] `resolve` for the E12 tuple fixtures equals the oracle, including the H2C 0.4 nozzle + Bambu PLA Basic + 0.20 mm Standard tuple, with provenance per key
- [ ] `compatibleMaterials` and `compatibleProcesses` follow the evaluator (a Prusa `nozzle_diameter[0]!=0.6` case)
- [ ] 1 000 resolutions over the full Orca tree index stay under 5 ms per call on CI
- [ ] Fixtures only (D5)

## Out of scope

- Producing engine input (E27).
