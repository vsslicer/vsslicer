---
id: US19
title: "Resolved values for sample printer, nozzle, material and process tuples match the native rules"
status: reviewed
epic: VSS:E12
---

A maintainer trusts the importers because 20 tuples per ecosystem, including the H2C 0.4 nozzle with Bambu PLA Basic, resolve to the same values the native slicer would compute.

## Acceptance criteria

- [ ] At least 20 tuples per ecosystem equal the oracle (upstream CLI export where it works, otherwise hand-checked expectations citing `profiles.md` lines)
- [ ] The oracle spike records whether each CLI prints a resolved config
- [ ] Embedded 3MF config blobs (Orca `project_settings.config`, PrusaSlicer `Slic3r_PE.config`) convert to entities through the registered importers (blobs read via `@vsslicer/3mf`)
- [ ] Fixtures only; no hardware (D5)

## Out of scope

- Writing profiles into 3MF projects.
