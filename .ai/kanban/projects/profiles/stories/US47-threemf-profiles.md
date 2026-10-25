---
id: US47
title: "A user imports the profiles embedded in a 3MF project"
status: reviewed
epic: VSS:E18
---

A user opening a 3MF made in Orca or PrusaSlicer imports its embedded process, filaments and printer settings as entities.

## Acceptance criteria

- [ ] A 3MF from E8's fixture set with Orca `project_settings.config` imports its process and filaments; one with `Slic3r_PE.config` imports through the Prusa dialect
- [ ] A 3MF with no embedded config returns an empty result and an info diagnostic

## Out of scope

- Writing profiles into 3MF projects (E27 and VWR).
